import { Middleware } from '@reduxjs/toolkit';
import { ErrorFactory, errorUtils } from '../core/errors';
import { config } from '../core/config';

// Error middleware for Redux
export const errorMiddleware: Middleware = (store) => (next) => (action) => {
  try {
    const result = next(action);
    
    // Check if action was rejected
    if (action.type.endsWith('/rejected')) {
      const error = action.payload || action.error;
      
      if (error) {
        // Log error
        errorUtils.logError(error, {
          action: action.type,
          payload: action.payload,
          state: store.getState(),
        });
        
        // Report error in production
        if (config.env.isProduction) {
          reportErrorToService(error, {
            action: action.type,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          });
        }
      }
    }
    
    return result;
  } catch (error) {
    // Handle unexpected errors
    const unexpectedError = ErrorFactory.createUnknownError(
      `Unexpected error in middleware: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    
    errorUtils.logError(unexpectedError, {
      action: action.type,
      originalError: error,
    });
    
    throw unexpectedError;
  }
};

// Error reporting service
const reportErrorToService = async (error: Error, context: any) => {
  try {
    // In a real application, you would send this to an error tracking service
    // like Sentry, LogRocket, or Bugsnag
    console.error('Error reported to monitoring service:', {
      error: errorUtils.formatError(error),
      context,
    });
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError);
  }
};

// Global error handler for unhandled errors
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = ErrorFactory.createUnknownError(
      `Unhandled promise rejection: ${event.reason}`
    );
    
    errorUtils.logError(error, {
      type: 'unhandledrejection',
      reason: event.reason,
      promise: event.promise,
    });
    
    // Report to error service
    if (config.env.isProduction) {
      reportErrorToService(error, {
        type: 'unhandledrejection',
        reason: event.reason,
      });
    }
  });
  
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    const error = ErrorFactory.createUnknownError(
      `Uncaught error: ${event.message}`
    );
    
    errorUtils.logError(error, {
      type: 'uncaught',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
    
    // Report to error service
    if (config.env.isProduction) {
      reportErrorToService(error, {
        type: 'uncaught',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    }
  });
};

// Error boundary middleware for components
export const withErrorBoundary = (
  Component: React.ComponentType<any>,
  errorBoundaryProps?: {
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    level?: 'page' | 'component' | 'feature';
  }
) => {
  return React.forwardRef<any, any>((props, ref) => 
    React.createElement(ErrorBoundary, errorBoundaryProps,
      React.createElement(Component, { ...props, ref })
    )
  );
};

// Error recovery middleware
export const errorRecoveryMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Check for specific error types that can be recovered
  if (action.type.endsWith('/rejected')) {
    const error = action.payload || action.error;
    
    if (error && isRecoverableError(error)) {
      // Attempt automatic recovery
      setTimeout(() => {
        store.dispatch(createRecoveryAction(action));
      }, 1000);
    }
  }
  
  return result;
};

// Check if error is recoverable
const isRecoverableError = (error: any): boolean => {
  const recoverableErrors = [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'SERVER_ERROR',
  ];
  
  return recoverableErrors.includes(error?.code);
};

// Create recovery action
const createRecoveryAction = (originalAction: any) => {
  return {
    type: originalAction.type.replace('/rejected', '/retry'),
    payload: originalAction.meta?.arg,
  };
};

// Error notification middleware
export const errorNotificationMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  
  if (action.type.endsWith('/rejected')) {
    const error = action.payload || action.error;
    
    if (error && shouldShowNotification(error)) {
      // Dispatch notification action
      store.dispatch({
        type: 'notifications/addNotification',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          title: getErrorTitle(error),
          message: getErrorMessage(error),
          duration: getErrorDuration(error),
          actions: getErrorActions(error),
        },
      });
    }
  }
  
  return result;
};

// Helper functions for error notifications
const shouldShowNotification = (error: any): boolean => {
  // Don't show notifications for certain error types
  const silentErrors = ['VALIDATION_ERROR', 'AUTHENTICATION_ERROR'];
  return !silentErrors.includes(error?.code);
};

const getErrorTitle = (error: any): string => {
  const titles = {
    NETWORK_ERROR: 'Connection Error',
    SERVER_ERROR: 'Server Error',
    TIMEOUT_ERROR: 'Request Timeout',
    VALIDATION_ERROR: 'Validation Error',
    AUTHENTICATION_ERROR: 'Authentication Required',
    AUTHORIZATION_ERROR: 'Access Denied',
    NOT_FOUND_ERROR: 'Not Found',
    RATE_LIMIT_ERROR: 'Rate Limit Exceeded',
  };
  
  return titles[error?.code] || 'Error';
};

const getErrorMessage = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  
  const messages = {
    NETWORK_ERROR: 'Please check your internet connection and try again.',
    SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
    TIMEOUT_ERROR: 'The request took too long to complete. Please try again.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    AUTHENTICATION_ERROR: 'Please log in to continue.',
    AUTHORIZATION_ERROR: 'You do not have permission to perform this action.',
    NOT_FOUND_ERROR: 'The requested resource was not found.',
    RATE_LIMIT_ERROR: 'Too many requests. Please wait a moment and try again.',
  };
  
  return messages[error?.code] || 'An unexpected error occurred.';
};

const getErrorDuration = (error: any): number => {
  const durations = {
    NETWORK_ERROR: 5000,
    SERVER_ERROR: 7000,
    TIMEOUT_ERROR: 5000,
    VALIDATION_ERROR: 4000,
    AUTHENTICATION_ERROR: 6000,
    AUTHORIZATION_ERROR: 5000,
    NOT_FOUND_ERROR: 4000,
    RATE_LIMIT_ERROR: 6000,
  };
  
  return durations[error?.code] || 5000;
};

const getErrorActions = (error: any): Array<{ label: string; action: () => void }> => {
  const actions = [];
  
  if (error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT_ERROR') {
    actions.push({
      label: 'Retry',
      action: () => {
        // Retry logic would be implemented here
        window.location.reload();
      },
    });
  }
  
  if (error?.code === 'AUTHENTICATION_ERROR') {
    actions.push({
      label: 'Login',
      action: () => {
        window.location.href = '/login';
      },
    });
  }
  
  return actions;
};
