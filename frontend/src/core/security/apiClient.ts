'use client';

// Secure API Client
// Provides secure API communication with built-in security measures

import { clientSecurityManager, secureApiCall } from './middleware';
import { securityManager, SecurityEventType } from './index';

// API Client configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  security: {
    enableCSRF: boolean;
    enableRateLimit: boolean;
    enableRequestSigning: boolean;
    enableInputValidation: boolean;
  };
  headers: Record<string, string>;
}

// Default API client configuration
export const defaultApiClientConfig: ApiClientConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  security: {
    enableCSRF: true,
    enableRateLimit: true,
    enableRequestSigning: true,
    enableInputValidation: true,
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// API Response interface
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  success: boolean;
  error?: string;
  message?: string;
}

// API Error interface
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
  timestamp: string;
}

// Secure API Client class
export class SecureApiClient {
  private config: ApiClientConfig;
  private requestQueue: Map<string, Promise<any>> = new Map();
  private requestHistory: Array<{ url: string; timestamp: number; success: boolean }> = [];

  constructor(config: ApiClientConfig = defaultApiClientConfig) {
    this.config = config;
    this.cleanupRequestHistory();
  }

  // Generic request method
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    const requestId = this.generateRequestId();

    // Check for duplicate requests
    if (this.requestQueue.has(requestId)) {
      return this.requestQueue.get(requestId)!;
    }

    // Create request promise
    const requestPromise = this.executeRequest<T>(method, url, data, options, requestId);
    this.requestQueue.set(requestId, requestPromise);

    try {
      const response = await requestPromise;
      this.requestHistory.push({ url, timestamp: Date.now(), success: true });
      return response;
    } catch (error) {
      this.requestHistory.push({ url, timestamp: Date.now(), success: false });
      throw error;
    } finally {
      this.requestQueue.delete(requestId);
    }
  }

  // Execute the actual request
  private async executeRequest<T>(
    method: string,
    url: string,
    data?: any,
    options: RequestInit = {},
    requestId: string
  ): Promise<ApiResponse<T>> {
    // Validate URL
    if (!clientSecurityManager.validateURL(url)) {
      throw new Error('Invalid or blocked URL');
    }

    // Sanitize input data
    if (data && this.config.security.enableInputValidation) {
      data = this.sanitizeRequestData(data);
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      ...options,
      headers: {
        ...this.config.headers,
        ...options.headers,
        'X-Request-ID': requestId,
        'X-Client-Timestamp': Date.now().toString(),
      },
    };

    // Add request body
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(data);
    }

    // Add query parameters for GET requests
    if (data && method === 'GET') {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      }
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Execute request with retries
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const response = await this.executeWithTimeout(url, requestOptions);
        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (this.shouldNotRetry(error as Error)) {
          break;
        }

        // Wait before retry
        if (attempt < this.config.retries) {
          await this.delay(this.config.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError || new Error('Request failed');
  }

  // Execute request with timeout
  private async executeWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await clientSecurityManager.secureRequest(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Handle API response
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let data: T;
    try {
      data = await response.json();
    } catch (error) {
      data = {} as T;
    }

    const apiResponse: ApiResponse<T> = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers,
      success: response.ok,
    };

    if (!response.ok) {
      const error: ApiError = {
        message: data?.message || response.statusText || 'Request failed',
        status: response.status,
        code: data?.code,
        details: data?.details,
        timestamp: new Date().toISOString(),
      };

      // Log security events for certain error types
      if (response.status === 403) {
        securityManager.logSecurityEvent(SecurityEventType.CSRF_ATTEMPT, 'high', {
          status: response.status,
          message: error.message,
        });
      } else if (response.status === 429) {
        securityManager.logSecurityEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, 'medium', {
          status: response.status,
          message: error.message,
        });
      }

      throw error;
    }

    return apiResponse;
  }

  // Sanitize request data
  private sanitizeRequestData(data: any): any {
    if (typeof data === 'string') {
      return clientSecurityManager.sanitizeInput(data);
    } else if (Array.isArray(data)) {
      return data.map(item => this.sanitizeRequestData(item));
    } else if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeRequestData(value);
      }
      return sanitized;
    }
    return data;
  }

  // Check if error should not be retried
  private shouldNotRetry(error: Error): boolean {
    // Don't retry on client errors (4xx) except 429 (rate limit)
    if (error.message.includes('400') || 
        error.message.includes('401') || 
        error.message.includes('403') || 
        error.message.includes('404')) {
      return true;
    }

    // Don't retry on network errors
    if (error.name === 'AbortError' || error.message.includes('NetworkError')) {
      return true;
    }

    return false;
  }

  // Generate unique request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Delay utility
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cleanup request history
  private cleanupRequestHistory(): void {
    setInterval(() => {
      const cutoff = Date.now() - 3600000; // 1 hour
      this.requestHistory = this.requestHistory.filter(
        entry => entry.timestamp > cutoff
      );
    }, 300000); // Run every 5 minutes
  }

  // Public API methods
  async get<T>(endpoint: string, params?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, params, options);
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  // Upload file with security
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: any,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    // Validate file
    if (!this.validateFile(file)) {
      throw new Error('Invalid file');
    }

    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      for (const [key, value] of Object.entries(additionalData)) {
        formData.append(key, String(value));
      }
    }

    const url = `${this.config.baseURL}${endpoint}`;
    const requestId = this.generateRequestId();

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({
              data,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: {},
              success: true,
            });
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('POST', url);
      
      // Add security headers
      xhr.setRequestHeader('X-Request-ID', requestId);
      xhr.setRequestHeader('X-Client-Timestamp', Date.now().toString());
      
      // Add CSRF token
      const csrfToken = clientSecurityManager.getCSRFToken();
      if (csrfToken) {
        xhr.setRequestHeader('X-CSRF-Token', csrfToken);
      }

      xhr.send(formData);
    });
  }

  // Validate file
  private validateFile(file: File): boolean {
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return false;
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    return allowedTypes.includes(file.type);
  }

  // Get request statistics
  getRequestStats(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    successRate: number;
  } {
    const total = this.requestHistory.length;
    const successful = this.requestHistory.filter(entry => entry.success).length;
    const failed = total - successful;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    return {
      totalRequests: total,
      successfulRequests: successful,
      failedRequests: failed,
      successRate,
    };
  }

  // Clear request history
  clearRequestHistory(): void {
    this.requestHistory = [];
  }
}

// Global API client instance
export const apiClient = new SecureApiClient();

// API client hooks for React components
export const useApiClient = () => {
  return {
    get: <T>(endpoint: string, params?: any, options?: RequestInit) =>
      apiClient.get<T>(endpoint, params, options),
    post: <T>(endpoint: string, data?: any, options?: RequestInit) =>
      apiClient.post<T>(endpoint, data, options),
    put: <T>(endpoint: string, data?: any, options?: RequestInit) =>
      apiClient.put<T>(endpoint, data, options),
    patch: <T>(endpoint: string, data?: any, options?: RequestInit) =>
      apiClient.patch<T>(endpoint, data, options),
    delete: <T>(endpoint: string, options?: RequestInit) =>
      apiClient.delete<T>(endpoint, options),
    uploadFile: <T>(
      endpoint: string,
      file: File,
      additionalData?: any,
      onProgress?: (progress: number) => void
    ) => apiClient.uploadFile<T>(endpoint, file, additionalData, onProgress),
    getStats: () => apiClient.getRequestStats(),
  };
};

// API endpoints
export const apiEndpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
  },

  // User management
  users: {
    list: '/users',
    create: '/users',
    get: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
    profile: '/users/profile',
    updateProfile: '/users/profile',
    changePassword: '/users/change-password',
    uploadAvatar: '/users/avatar',
  },

  // Documents
  documents: {
    list: '/documents',
    create: '/documents',
    get: (id: string) => `/documents/${id}`,
    update: (id: string) => `/documents/${id}`,
    delete: (id: string) => `/documents/${id}`,
    upload: '/documents/upload',
    download: (id: string) => `/documents/${id}/download`,
    search: '/documents/search',
    categorize: '/documents/categorize',
    analyze: '/documents/analyze',
  },

  // Search
  search: {
    query: '/search',
    suggestions: '/search/suggestions',
    history: '/search/history',
    clearHistory: '/search/history/clear',
  },

  // Analytics
  analytics: {
    overview: '/analytics/overview',
    documents: '/analytics/documents',
    users: '/analytics/users',
    compliance: '/analytics/compliance',
    performance: '/analytics/performance',
  },

  // Compliance
  compliance: {
    frameworks: '/compliance/frameworks',
    assessments: '/compliance/assessments',
    risks: '/compliance/risks',
    reports: '/compliance/reports',
  },

  // Settings
  settings: {
    user: '/settings/user',
    organization: '/settings/organization',
    security: '/settings/security',
    integrations: '/settings/integrations',
  },

  // Security
  security: {
    events: '/security/events',
    csrfToken: '/security/csrf-token',
    auditLogs: '/security/audit-logs',
    blockedIPs: '/security/blocked-ips',
  },
};

export default apiClient;
