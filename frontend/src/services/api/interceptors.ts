import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { config } from '../../core/config';
import { storageUtils } from '../../core/utils';
import { STORAGE_KEYS } from '../../core/constants';
import { ErrorFactory, errorUtils } from '../../core/errors';

// Request interceptor types
export interface RequestInterceptor {
  onFulfilled?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
  onRejected?: (error: any) => any;
}

// Response interceptor types
export interface ResponseInterceptor {
  onFulfilled?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  onRejected?: (error: AxiosError) => any;
}

// Authentication interceptor
export const authInterceptor: RequestInterceptor = {
  onFulfilled: (config) => {
    const authData = storageUtils.get(STORAGE_KEYS.auth);
    if (authData?.token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${authData.token}`;
    }
    return config;
  },
  onRejected: (error) => {
    errorUtils.logError(error);
    return Promise.reject(error);
  },
};

// Request ID interceptor
export const requestIdInterceptor: RequestInterceptor = {
  onFulfilled: (config) => {
    config.headers = config.headers || {};
    config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return config;
  },
};

// Timestamp interceptor
export const timestampInterceptor: RequestInterceptor = {
  onFulfilled: (config) => {
    config.headers = config.headers || {};
    config.headers['X-Timestamp'] = new Date().toISOString();
    return config;
  },
};

// Logging interceptor
export const loggingInterceptor: RequestInterceptor = {
  onFulfilled: (config) => {
    if (config.env.isDevelopment) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        headers: config.headers,
        data: config.data,
        params: config.params,
      });
    }
    return config;
  },
  onRejected: (error) => {
    if (config.env.isDevelopment) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  },
};

// Response logging interceptor
export const responseLoggingInterceptor: ResponseInterceptor = {
  onFulfilled: (response) => {
    if (config.env.isDevelopment) {
      console.log('✅ API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        data: response.data,
        headers: response.headers,
      });
    }
    return response;
  },
  onRejected: (error) => {
    if (config.env.isDevelopment) {
      console.error('❌ Response Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        data: error.response?.data,
        message: error.message,
      });
    }
    return Promise.reject(error);
  },
};

// Error handling interceptor
export const errorHandlingInterceptor: ResponseInterceptor = {
  onRejected: async (error: AxiosError) => {
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

    const { status, data } = error.response;
    let apiError: Error;

    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        apiError = ErrorFactory.createValidationError(
          (data as any)?.message || 'Bad request'
        );
        break;
      case 401:
        // Clear stored auth data
        storageUtils.remove(STORAGE_KEYS.auth);
        
        // Redirect to login if not already there
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = config.routing.routes.login;
        }

        apiError = ErrorFactory.createAuthenticationError(
          (data as any)?.message || 'Authentication required'
        );
        break;
      case 403:
        apiError = ErrorFactory.createAuthorizationError(
          (data as any)?.message || 'Insufficient permissions'
        );
        break;
      case 404:
        apiError = ErrorFactory.createNotFoundError(
          (data as any)?.message || 'Resource not found'
        );
        break;
      case 408:
        apiError = ErrorFactory.createTimeoutError();
        break;
      case 409:
        apiError = new Error('Conflict');
        apiError.name = 'ConflictError';
        break;
      case 429:
        apiError = new Error('Rate limit exceeded');
        apiError.name = 'RateLimitError';
        break;
      case 500:
        apiError = ErrorFactory.createServerError(
          (data as any)?.message || 'Internal server error'
        );
        break;
      case 502:
        apiError = ErrorFactory.createExternalServiceError(
          (data as any)?.message || 'Bad gateway'
        );
        break;
      case 503:
        apiError = ErrorFactory.createServerError(
          (data as any)?.message || 'Service unavailable'
        );
        break;
      default:
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
  },
};

// Retry interceptor
export const retryInterceptor: ResponseInterceptor = {
  onRejected: async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean; _retryCount?: number };

    // Only retry on network errors or 5xx errors
    if (!originalRequest._retry && (
      !error.response || 
      (error.response.status >= 500 && error.response.status < 600)
    )) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      // Limit retry attempts
      if (originalRequest._retryCount <= config.api.retryAttempts) {
        const delay = config.api.retryDelay * Math.pow(2, originalRequest._retryCount - 1);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the request
        return Promise.resolve();
      }
    }

    return Promise.reject(error);
  },
};

// Cache interceptor
export const cacheInterceptor: RequestInterceptor = {
  onFulfilled: (config) => {
    // Add cache control headers for GET requests
    if (config.method === 'get') {
      config.headers = config.headers || {};
      
      // Set cache control based on endpoint
      if (config.url?.includes('/dashboard')) {
        config.headers['Cache-Control'] = 'max-age=30'; // 30 seconds
      } else if (config.url?.includes('/documents')) {
        config.headers['Cache-Control'] = 'max-age=120'; // 2 minutes
      } else {
        config.headers['Cache-Control'] = 'max-age=300'; // 5 minutes
      }
    }
    
    return config;
  },
};

// Performance monitoring interceptor
export const performanceInterceptor: RequestInterceptor = {
  onFulfilled: (config) => {
    config.metadata = config.metadata || {};
    config.metadata.startTime = performance.now();
    return config;
  },
};

export const performanceResponseInterceptor: ResponseInterceptor = {
  onFulfilled: (response) => {
    const startTime = response.config.metadata?.startTime;
    if (startTime) {
      const duration = performance.now() - startTime;
      
      if (config.env.isDevelopment) {
        console.log(`⏱️ API Request Duration: ${duration.toFixed(2)}ms`, {
          url: response.config.url,
          method: response.config.method,
        });
      }

      // Log slow requests
      if (duration > 5000) { // 5 seconds
        console.warn(`🐌 Slow API Request: ${duration.toFixed(2)}ms`, {
          url: response.config.url,
          method: response.config.method,
        });
      }
    }
    return response;
  },
};

// Request transformation interceptor
export const requestTransformInterceptor: RequestInterceptor = {
  onFulfilled: (config) => {
    // Transform request data if needed
    if (config.data && typeof config.data === 'object') {
      // Remove undefined values
      config.data = JSON.parse(JSON.stringify(config.data));
    }
    
    return config;
  },
};

// Response transformation interceptor
export const responseTransformInterceptor: ResponseInterceptor = {
  onFulfilled: (response) => {
    // Transform response data if needed
    if (response.data && typeof response.data === 'object') {
      // Add metadata
      response.data._metadata = {
        timestamp: new Date().toISOString(),
        requestId: response.config.headers['X-Request-ID'],
        duration: response.config.metadata?.startTime ? 
          performance.now() - response.config.metadata.startTime : undefined,
      };
    }
    
    return response;
  },
};

// Security interceptor
export const securityInterceptor: RequestInterceptor = {
  onFulfilled: (config) => {
    // Add security headers
    config.headers = config.headers || {};
    config.headers['X-Content-Type-Options'] = 'nosniff';
    config.headers['X-Frame-Options'] = 'DENY';
    config.headers['X-XSS-Protection'] = '1; mode=block';
    
    return config;
  },
};

// All interceptors
export const requestInterceptors = [
  authInterceptor,
  requestIdInterceptor,
  timestampInterceptor,
  loggingInterceptor,
  cacheInterceptor,
  performanceInterceptor,
  requestTransformInterceptor,
  securityInterceptor,
];

export const responseInterceptors = [
  responseLoggingInterceptor,
  performanceResponseInterceptor,
  responseTransformInterceptor,
  retryInterceptor,
  errorHandlingInterceptor,
];
