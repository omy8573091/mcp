import { ERROR_CODES } from '../constants';

// Base error class
export abstract class BaseError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;
  
  constructor(
    message: string,
    public readonly context?: Record<string, any>,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      stack: this.stack,
    };
  }
}

// Application errors
export class ValidationError extends BaseError {
  readonly code = ERROR_CODES.VALIDATION_ERROR;
  readonly statusCode = 400;
  readonly isOperational = true;
  
  constructor(
    message: string,
    public readonly field?: string,
    context?: Record<string, any>
  ) {
    super(message, { field, ...context });
  }
}

export class AuthenticationError extends BaseError {
  readonly code = ERROR_CODES.AUTHENTICATION_ERROR;
  readonly statusCode = 401;
  readonly isOperational = true;
}

export class AuthorizationError extends BaseError {
  readonly code = ERROR_CODES.AUTHORIZATION_ERROR;
  readonly statusCode = 403;
  readonly isOperational = true;
}

export class NotFoundError extends BaseError {
  readonly code = ERROR_CODES.NOT_FOUND_ERROR;
  readonly statusCode = 404;
  readonly isOperational = true;
}

export class ConflictError extends BaseError {
  readonly code = 'CONFLICT_ERROR';
  readonly statusCode = 409;
  readonly isOperational = true;
}

export class RateLimitError extends BaseError {
  readonly code = 'RATE_LIMIT_ERROR';
  readonly statusCode = 429;
  readonly isOperational = true;
  
  constructor(
    message: string = 'Too many requests',
    public readonly retryAfter?: number,
    context?: Record<string, any>
  ) {
    super(message, { retryAfter, ...context });
  }
}

// Network errors
export class NetworkError extends BaseError {
  readonly code = ERROR_CODES.NETWORK_ERROR;
  readonly statusCode = 0;
  readonly isOperational = true;
  
  constructor(
    message: string = 'Network error occurred',
    public readonly url?: string,
    context?: Record<string, any>
  ) {
    super(message, { url, ...context });
  }
}

export class TimeoutError extends BaseError {
  readonly code = ERROR_CODES.TIMEOUT_ERROR;
  readonly statusCode = 408;
  readonly isOperational = true;
  
  constructor(
    message: string = 'Request timeout',
    public readonly timeout?: number,
    context?: Record<string, any>
  ) {
    super(message, { timeout, ...context });
  }
}

// Server errors
export class ServerError extends BaseError {
  readonly code = ERROR_CODES.SERVER_ERROR;
  readonly statusCode = 500;
  readonly isOperational = false;
}

export class DatabaseError extends BaseError {
  readonly code = 'DATABASE_ERROR';
  readonly statusCode = 500;
  readonly isOperational = false;
}

export class ExternalServiceError extends BaseError {
  readonly code = 'EXTERNAL_SERVICE_ERROR';
  readonly statusCode = 502;
  readonly isOperational = true;
  
  constructor(
    message: string,
    public readonly service?: string,
    context?: Record<string, any>
  ) {
    super(message, { service, ...context });
  }
}

// Client errors
export class ClientError extends BaseError {
  readonly code = 'CLIENT_ERROR';
  readonly statusCode = 400;
  readonly isOperational = true;
}

export class ConfigurationError extends BaseError {
  readonly code = 'CONFIGURATION_ERROR';
  readonly statusCode = 500;
  readonly isOperational = false;
}

// Unknown error
export class UnknownError extends BaseError {
  readonly code = ERROR_CODES.UNKNOWN_ERROR;
  readonly statusCode = 500;
  readonly isOperational = false;
}

// Error factory
export class ErrorFactory {
  static createValidationError(message: string, field?: string, context?: Record<string, any>): ValidationError {
    return new ValidationError(message, field, context);
  }
  
  static createAuthenticationError(message: string = 'Authentication required'): AuthenticationError {
    return new AuthenticationError(message);
  }
  
  static createAuthorizationError(message: string = 'Insufficient permissions'): AuthorizationError {
    return new AuthorizationError(message);
  }
  
  static createNotFoundError(resource: string = 'Resource'): NotFoundError {
    return new NotFoundError(`${resource} not found`);
  }
  
  static createNetworkError(message?: string, url?: string): NetworkError {
    return new NetworkError(message, url);
  }
  
  static createTimeoutError(timeout?: number): TimeoutError {
    return new TimeoutError(undefined, timeout);
  }
  
  static createServerError(message: string = 'Internal server error'): ServerError {
    return new ServerError(message);
  }
  
  static createUnknownError(message: string = 'An unknown error occurred'): UnknownError {
    return new UnknownError(message);
  }
  
  static fromHttpStatus(status: number, message?: string): BaseError {
    switch (status) {
      case 400:
        return new ValidationError(message || 'Bad request');
      case 401:
        return new AuthenticationError(message || 'Unauthorized');
      case 403:
        return new AuthorizationError(message || 'Forbidden');
      case 404:
        return new NotFoundError(message || 'Not found');
      case 408:
        return new TimeoutError(message || 'Request timeout');
      case 409:
        return new ConflictError(message || 'Conflict');
      case 429:
        return new RateLimitError(message || 'Too many requests');
      case 500:
        return new ServerError(message || 'Internal server error');
      case 502:
        return new ExternalServiceError(message || 'Bad gateway');
      case 503:
        return new ServerError(message || 'Service unavailable');
      default:
        return new UnknownError(message || 'Unknown error');
    }
  }
}

// Error handler utilities
export const errorUtils = {
  isOperationalError: (error: Error): boolean => {
    return error instanceof BaseError && error.isOperational;
  },
  
  getErrorCode: (error: Error): string => {
    return error instanceof BaseError ? error.code : ERROR_CODES.UNKNOWN_ERROR;
  },
  
  getStatusCode: (error: Error): number => {
    return error instanceof BaseError ? error.statusCode : 500;
  },
  
  formatError: (error: Error): { code: string; message: string; statusCode: number; context?: any } => {
    if (error instanceof BaseError) {
      return {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        context: error.context,
      };
    }
    
    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: error.message || 'An unknown error occurred',
      statusCode: 500,
    };
  },
  
  logError: (error: Error, context?: Record<string, any>): void => {
    const errorInfo = errorUtils.formatError(error);
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Error occurred:', {
        ...errorInfo,
        context,
        stack: error.stack,
      });
    } else {
      // In production, you would typically send this to a logging service
      console.error('Error occurred:', errorInfo);
    }
  },
  
  handleAsyncError: <T extends any[], R>(
    fn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        errorUtils.logError(error as Error);
        throw error;
      }
    };
  },
  
  handleSyncError: <T extends any[], R>(
    fn: (...args: T) => R
  ) => {
    return (...args: T): R => {
      try {
        return fn(...args);
      } catch (error) {
        errorUtils.logError(error as Error);
        throw error;
      }
    };
  },
};

// Error boundary types
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// Error recovery strategies
export const errorRecovery = {
  retry: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries || !errorUtils.isOperationalError(lastError)) {
          throw lastError;
        }
        
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
    
    throw lastError!;
  },
  
  fallback: <T>(fn: () => Promise<T>, fallbackValue: T): Promise<T> => {
    return fn().catch(() => fallbackValue);
  },
  
  timeout: <T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> => {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new TimeoutError('Operation timeout', timeoutMs)), timeoutMs);
      }),
    ]);
  },
};
