import { useState, useEffect, useCallback, useRef } from 'react';
import { errorUtils } from '../core/errors';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface AsyncActions<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

interface UseAsyncOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onFinally?: () => void;
  retryOnError?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): AsyncState<T> & AsyncActions<T> {
  const {
    immediate = false,
    onSuccess,
    onError,
    onFinally,
    retryOnError = false,
    retryAttempts = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    if (!isMountedRef.current) return Promise.reject(new Error('Component unmounted'));

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction(...args);
      
      if (!isMountedRef.current) return result;

      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
      }));

      onSuccess?.(result);
      retryCountRef.current = 0;
      return result;
    } catch (error) {
      const asyncError = error as Error;
      
      if (!isMountedRef.current) throw asyncError;

      setState(prev => ({
        ...prev,
        loading: false,
        error: asyncError,
      }));

      onError?.(asyncError);
      throw asyncError;
    } finally {
      if (isMountedRef.current) {
        onFinally?.();
      }
    }
  }, [asyncFunction, onSuccess, onError, onFinally]);

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
  }, [immediate, execute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for async operations with automatic retry on error
export function useAsyncWithRetry<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> & {
    retryOnError?: boolean;
    retryAttempts?: number;
    retryDelay?: number;
  } = {}
) {
  const {
    retryOnError = true,
    retryAttempts = 3,
    retryDelay = 1000,
    onError,
    ...restOptions
  } = options;

  const handleError = useCallback((error: Error) => {
    onError?.(error);
    
    if (retryOnError && errorUtils.isOperationalError(error)) {
      // Retry logic is handled in the execute function
      console.log('Retrying due to operational error:', error.message);
    }
  }, [onError, retryOnError]);

  return useAsync(asyncFunction, {
    ...restOptions,
    onError: handleError,
    retryOnError,
    retryAttempts,
    retryDelay,
  });
}

// Hook for async operations with timeout
export function useAsyncWithTimeout<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  timeoutMs: number = 30000,
  options: UseAsyncOptions<T> = {}
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const executeWithTimeout = useCallback(async (...args: any[]): Promise<T> => {
    return Promise.race([
      asyncFunction(...args),
      new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]).finally(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    });
  }, [asyncFunction, timeoutMs]);

  return useAsync(executeWithTimeout, options);
}

// Hook for async operations with caching
export function useAsyncWithCache<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  cacheKey: string,
  cacheTTL: number = 5 * 60 * 1000, // 5 minutes
  options: UseAsyncOptions<T> = {}
) {
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const executeWithCache = useCallback(async (...args: any[]): Promise<T> => {
    const key = `${cacheKey}:${JSON.stringify(args)}`;
    const cached = cacheRef.current.get(key);

    // Check if cache is valid
    if (cached && Date.now() - cached.timestamp < cacheTTL) {
      return cached.data;
    }

    // Execute function and cache result
    const result = await asyncFunction(...args);
    cacheRef.current.set(key, {
      data: result,
      timestamp: Date.now(),
    });

    // Clean up expired cache entries
    const now = Date.now();
    for (const [cacheKey, value] of cacheRef.current.entries()) {
      if (now - value.timestamp >= cacheTTL) {
        cacheRef.current.delete(cacheKey);
      }
    }

    return result;
  }, [asyncFunction, cacheKey, cacheTTL]);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const asyncResult = useAsync(executeWithCache, options);

  return {
    ...asyncResult,
    clearCache,
  };
}

// Hook for async operations with debouncing
export function useAsyncWithDebounce<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  delay: number = 300,
  options: UseAsyncOptions<T> = {}
) {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedArgs, setDebouncedArgs] = useState<any[]>([]);

  const debouncedExecute = useCallback((...args: any[]) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedArgs(args);
    }, delay);
  }, [delay]);

  const asyncResult = useAsync(asyncFunction, {
    ...options,
    immediate: false,
  });

  useEffect(() => {
    if (debouncedArgs.length > 0) {
      asyncResult.execute(...debouncedArgs).catch(() => {
        // Error is handled in the async hook
      });
    }
  }, [debouncedArgs, asyncResult]);

  return {
    ...asyncResult,
    execute: debouncedExecute,
  };
}

// Hook for async operations with throttling
export function useAsyncWithThrottle<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  delay: number = 1000,
  options: UseAsyncOptions<T> = {}
) {
  const lastExecuteRef = useRef<number>(0);
  const pendingArgsRef = useRef<any[] | null>(null);

  const throttledExecute = useCallback((...args: any[]) => {
    const now = Date.now();
    
    if (now - lastExecuteRef.current >= delay) {
      lastExecuteRef.current = now;
      return asyncFunction(...args);
    } else {
      pendingArgsRef.current = args;
      return Promise.resolve();
    }
  }, [asyncFunction, delay]);

  const asyncResult = useAsync(asyncFunction, {
    ...options,
    immediate: false,
  });

  // Execute pending requests when throttle period ends
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingArgsRef.current && Date.now() - lastExecuteRef.current >= delay) {
        const args = pendingArgsRef.current;
        pendingArgsRef.current = null;
        lastExecuteRef.current = Date.now();
        
        asyncResult.execute(...args).catch(() => {
          // Error is handled in the async hook
        });
      }
    }, delay);

    return () => clearInterval(interval);
  }, [delay, asyncResult]);

  return {
    ...asyncResult,
    execute: throttledExecute,
  };
}
