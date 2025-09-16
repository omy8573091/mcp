import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { config } from '../../core/config';
import { ErrorFactory, errorUtils } from '../../core/errors';
import { storageUtils } from '../../core/utils';
import { STORAGE_KEYS } from '../../core/constants';
import type { ApiResponse } from '../../core/types';

// Create axios instance with default configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: config.api.baseUrl,
    timeout: config.api.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add authentication token
      const authData = storageUtils.get(STORAGE_KEYS.auth);
      if (authData?.token) {
        config.headers.Authorization = `Bearer ${authData.token}`;
      }

      // Add request ID for tracking
      config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Add timestamp
      config.headers['X-Timestamp'] = new Date().toISOString();

      // Log request in development
      if (config.env.isDevelopment) {
        console.log('API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: config.headers,
          data: config.data,
        });
      }

      return config;
    },
    (error) => {
      errorUtils.logError(error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response in development
      if (config.env.isDevelopment) {
        console.log('API Response:', {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          headers: response.headers,
        });
      }

      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // Handle network errors
      if (!error.response) {
        const networkError = ErrorFactory.createNetworkError(
          error.message || 'Network error occurred',
          originalRequest?.url
        );
        errorUtils.logError(networkError);
        return Promise.reject(networkError);
      }

      // Handle HTTP errors
      const { status, data } = error.response;
      let apiError: Error;

      // Handle authentication errors
      if (status === 401) {
        // Clear stored auth data
        storageUtils.remove(STORAGE_KEYS.auth);
        
        // Redirect to login if not already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = config.routing.routes.login;
        }

        apiError = ErrorFactory.createAuthenticationError(
          (data as any)?.message || 'Authentication required'
        );
      } else if (status === 403) {
        apiError = ErrorFactory.createAuthorizationError(
          (data as any)?.message || 'Insufficient permissions'
        );
      } else if (status === 404) {
        apiError = ErrorFactory.createNotFoundError(
          (data as any)?.message || 'Resource not found'
        );
      } else if (status === 429) {
        apiError = new Error('Rate limit exceeded');
        apiError.name = 'RateLimitError';
      } else if (status >= 500) {
        apiError = ErrorFactory.createServerError(
          (data as any)?.message || 'Server error occurred'
        );
      } else {
        apiError = ErrorFactory.fromHttpStatus(status, (data as any)?.message);
      }

      // Add request context to error
      (apiError as any).request = {
        url: originalRequest?.url,
        method: originalRequest?.method,
        headers: originalRequest?.headers,
        data: originalRequest?.data,
      };

      (apiError as any).response = {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data,
      };

      errorUtils.logError(apiError);
      return Promise.reject(apiError);
    }
  );

  return client;
};

// Create the main API client
export const apiClient = createApiClient();

// API client methods with proper typing
export const api = {
  // GET request
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiClient.get<ApiResponse<T>>(url, config).then(response => response.data);
  },

  // POST request
  post: <T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiClient.post<ApiResponse<T>>(url, data, config).then(response => response.data);
  },

  // PUT request
  put: <T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiClient.put<ApiResponse<T>>(url, data, config).then(response => response.data);
  },

  // PATCH request
  patch: <T = any, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiClient.patch<ApiResponse<T>>(url, data, config).then(response => response.data);
  },

  // DELETE request
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return apiClient.delete<ApiResponse<T>>(url, config).then(response => response.data);
  },

  // HEAD request
  head: (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
    return apiClient.head(url, config);
  },

  // OPTIONS request
  options: (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
    return apiClient.options(url, config);
  },

  // Upload file
  upload: <T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }).then(response => response.data);
  },

  // Download file
  download: (url: string, filename?: string): Promise<void> => {
    return apiClient.get(url, {
      responseType: 'blob',
    }).then(response => {
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    });
  },

  // Batch requests
  batch: <T = any>(requests: Array<() => Promise<ApiResponse<T>>>): Promise<ApiResponse<T>[]> => {
    return Promise.all(requests.map(request => request()));
  },

  // Cancel request
  cancel: (requestId: string) => {
    // Implementation for canceling requests
    // This would require maintaining a map of request IDs to cancel tokens
  },
};

// Request cancellation
class RequestCanceller {
  private cancelTokens = new Map<string, AbortController>();

  createCancelToken(requestId: string): AbortSignal {
    const controller = new AbortController();
    this.cancelTokens.set(requestId, controller);
    return controller.signal;
  }

  cancel(requestId: string): boolean {
    const controller = this.cancelTokens.get(requestId);
    if (controller) {
      controller.abort();
      this.cancelTokens.delete(requestId);
      return true;
    }
    return false;
  }

  cancelAll(): void {
    this.cancelTokens.forEach(controller => controller.abort());
    this.cancelTokens.clear();
  }
}

export const requestCanceller = new RequestCanceller();

// API client configuration
export const configureApiClient = (options: {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}) => {
  if (options.baseURL) {
    apiClient.defaults.baseURL = options.baseURL;
  }
  if (options.timeout) {
    apiClient.defaults.timeout = options.timeout;
  }
  if (options.headers) {
    Object.assign(apiClient.defaults.headers, options.headers);
  }
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health');
    return response.status === 200;
  } catch {
    return false;
  }
};

// API status
export const getApiStatus = async () => {
  try {
    const response = await apiClient.get('/status');
    return response.data;
  } catch (error) {
    throw ErrorFactory.createServerError('Unable to get API status');
  }
};

export default apiClient;
