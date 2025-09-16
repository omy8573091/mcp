import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppDispatch } from '../store/hooks';
import { apiClient } from '../services/api';
import { errorUtils, ErrorFactory } from '../core/errors';
import { config } from '../core/config';
import type { ApiResponse, PaginationParams, FilterParams } from '../core/types';

interface UseApiOptions<T> {
  immediate?: boolean;
  retryOnError?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onFinally?: () => void;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastFetch: Date | null;
}

interface UseApiActions<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
  retry: () => Promise<T>;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): UseApiState<T> & UseApiActions<T> {
  const {
    immediate = false,
    retryOnError = true,
    retryAttempts = config.api.retryAttempts,
    retryDelay = config.api.retryDelay,
    onSuccess,
    onError,
    onFinally,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
  });

  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiFunction(...args);
      
      if (!response.success) {
        throw ErrorFactory.fromHttpStatus(400, response.error?.message || 'API request failed');
      }

      const data = response.data as T;
      
      setState(prev => ({
        ...prev,
        data,
        loading: false,
        error: null,
        lastFetch: new Date(),
      }));

      onSuccess?.(data);
      return data;
    } catch (error) {
      const apiError = error as Error;
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError,
      }));

      onError?.(apiError);
      throw apiError;
    } finally {
      onFinally?.();
    }
  }, [apiFunction, onSuccess, onError, onFinally]);

  const retry = useCallback(async (): Promise<T> => {
    if (retryCountRef.current >= retryAttempts) {
      throw new Error('Maximum retry attempts reached');
    }

    retryCountRef.current += 1;
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, retryDelay * retryCountRef.current));
    
    return execute();
  }, [execute, retryAttempts, retryDelay]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastFetch: null,
    });
    retryCountRef.current = 0;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute().catch(() => {
        // Error is handled in execute function
      });
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset,
    retry,
  };
}

// Specialized hooks for common API patterns
export function useApiGet<T = any>(
  endpoint: string,
  options: UseApiOptions<T> = {}
) {
  return useApi<T>(
    () => apiClient.get<ApiResponse<T>>(endpoint),
    options
  );
}

export function useApiPost<T = any, D = any>(
  endpoint: string,
  options: UseApiOptions<T> = {}
) {
  return useApi<T>(
    (data: D) => apiClient.post<ApiResponse<T>>(endpoint, data),
    options
  );
}

export function useApiPut<T = any, D = any>(
  endpoint: string,
  options: UseApiOptions<T> = {}
) {
  return useApi<T>(
    (id: string, data: D) => apiClient.put<ApiResponse<T>>(`${endpoint}/${id}`, data),
    options
  );
}

export function useApiDelete<T = any>(
  endpoint: string,
  options: UseApiOptions<T> = {}
) {
  return useApi<T>(
    (id: string) => apiClient.delete<ApiResponse<T>>(`${endpoint}/${id}`),
    options
  );
}

// Paginated API hook
export function usePaginatedApi<T = any>(
  endpoint: string,
  options: UseApiOptions<T[]> & {
    initialParams?: PaginationParams & FilterParams;
  } = {}
) {
  const [params, setParams] = useState<PaginationParams & FilterParams>({
    page: 1,
    limit: config.pagination.defaultPageSize,
    ...options.initialParams,
  });

  const api = useApi<T[]>(
    () => apiClient.get<ApiResponse<T[]>>(endpoint, { params }),
    options
  );

  const loadPage = useCallback((newParams: Partial<PaginationParams & FilterParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const nextPage = useCallback(() => {
    setParams(prev => ({ ...prev, page: prev.page + 1 }));
  }, []);

  const previousPage = useCallback(() => {
    setParams(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }));
  }, []);

  const setPageSize = useCallback((limit: number) => {
    setParams(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const setFilters = useCallback((filters: FilterParams) => {
    setParams(prev => ({ ...prev, ...filters, page: 1 }));
  }, []);

  const resetParams = useCallback(() => {
    setParams({
      page: 1,
      limit: config.pagination.defaultPageSize,
      ...options.initialParams,
    });
  }, [options.initialParams]);

  return {
    ...api,
    params,
    loadPage,
    nextPage,
    previousPage,
    setPageSize,
    setFilters,
    resetParams,
  };
}

// Infinite scroll API hook
export function useInfiniteApi<T = any>(
  endpoint: string,
  options: UseApiOptions<T[]> & {
    initialParams?: FilterParams;
    pageSize?: number;
  } = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [params, setParams] = useState<FilterParams>(options.initialParams || {});

  const api = useApi<T[]>(
    () => apiClient.get<ApiResponse<T[]>>(endpoint, {
      params: {
        ...params,
        page,
        limit: options.pageSize || config.pagination.defaultPageSize,
      },
    }),
    {
      ...options,
      onSuccess: (newData) => {
        if (page === 1) {
          setData(newData);
        } else {
          setData(prev => [...prev, ...newData]);
        }
        setHasMore(newData.length === (options.pageSize || config.pagination.defaultPageSize));
        options.onSuccess?.(newData);
      },
    }
  );

  const loadMore = useCallback(() => {
    if (!api.loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [api.loading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    api.reset();
  }, [api]);

  const setFilters = useCallback((newParams: FilterParams) => {
    setParams(newParams);
    setPage(1);
    setData([]);
    setHasMore(true);
  }, []);

  return {
    ...api,
    data,
    hasMore,
    loadMore,
    reset,
    setFilters,
  };
}
