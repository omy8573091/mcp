'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  ExpandMore,
  ExpandLess,
  BugReport,
  Home,
} from '@mui/icons-material';
import { ErrorFactory, errorUtils } from '../core/errors';
import { config } from '../core/config';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  showDetails: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  maxRetries?: number;
  showDetails?: boolean;
  level?: 'page' | 'component' | 'feature';
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  errorId: string;
  retryCount: number;
  onRetry: () => void;
  onReport: () => void;
  onGoHome: () => void;
  showDetails: boolean;
  onToggleDetails: () => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      showDetails: props.showDetails ?? false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    this.setState({
      error,
      errorInfo,
    });

    // Log error
    errorUtils.logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name,
      errorId: this.state.errorId,
      retryCount: this.state.retryCount,
    });

    // Call custom error handler
    onError?.(error, errorInfo);

    // Report error in production
    if (config.env.isProduction) {
      this.reportError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to an error reporting service
    // like Sentry, LogRocket, or Bugsnag
    console.error('Error reported to monitoring service:', {
      error: errorUtils.formatError(error),
      errorInfo,
      errorId: this.state.errorId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));

    // Call custom retry handler
    this.props.onRetry?.();

    // Auto-retry with exponential backoff
    if (retryCount < maxRetries - 1) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      this.retryTimeoutId = setTimeout(() => {
        this.setState({ hasError: false });
      }, delay);
    }
  };

  private handleReport = () => {
    const { error, errorInfo, errorId } = this.state;
    if (error && errorInfo) {
      this.reportError(error, errorInfo);
    }
  };

  private handleGoHome = () => {
    window.location.href = config.routing.routes.home;
  };

  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    const { children, fallback: FallbackComponent, level = 'component' } = this.props;
    const { hasError, error, errorInfo, errorId, retryCount, showDetails } = this.state;

    if (hasError && error) {
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo!}
            errorId={errorId}
            retryCount={retryCount}
            onRetry={this.handleRetry}
            onReport={this.handleReport}
            onGoHome={this.handleGoHome}
            showDetails={showDetails}
            onToggleDetails={this.toggleDetails}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo!}
          errorId={errorId}
          retryCount={retryCount}
          onRetry={this.handleRetry}
          onReport={this.handleReport}
          onGoHome={this.handleGoHome}
          showDetails={showDetails}
          onToggleDetails={this.toggleDetails}
          level={level}
        />
      );
    }

    return children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps & { level: string }> = ({
  error,
  errorInfo,
  errorId,
  retryCount,
  onRetry,
  onReport,
  onGoHome,
  showDetails,
  onToggleDetails,
  level,
}) => {
  const errorCode = errorUtils.getErrorCode(error);
  const isOperational = errorUtils.isOperationalError(error);
  const maxRetries = 3;

  const getErrorTitle = () => {
    switch (errorCode) {
      case 'NETWORK_ERROR':
        return 'Connection Error';
      case 'VALIDATION_ERROR':
        return 'Validation Error';
      case 'AUTHENTICATION_ERROR':
        return 'Authentication Required';
      case 'AUTHORIZATION_ERROR':
        return 'Access Denied';
      case 'NOT_FOUND_ERROR':
        return 'Not Found';
      case 'SERVER_ERROR':
        return 'Server Error';
      default:
        return 'Something went wrong';
    }
  };

  const getErrorMessage = () => {
    if (level === 'page') {
      return 'We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.';
    }
    
    if (level === 'feature') {
      return 'This feature is temporarily unavailable. Please try again later.';
    }
    
    return 'This component encountered an error and could not be displayed.';
  };

  const getErrorSeverity = () => {
    if (isOperational) return 'warning';
    if (level === 'page') return 'error';
    return 'info';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Alert severity={getErrorSeverity()} sx={{ mb: 2 }}>
        <AlertTitle>{getErrorTitle()}</AlertTitle>
        {getErrorMessage()}
      </Alert>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <ErrorOutline color="error" />
              <Typography variant="h6">
                {getErrorTitle()}
              </Typography>
              <Chip
                label={errorCode}
                size="small"
                color={isOperational ? 'warning' : 'error'}
                variant="outlined"
              />
            </Box>

            <Typography variant="body2" color="textSecondary">
              {error.message}
            </Typography>

            {retryCount > 0 && (
              <Typography variant="caption" color="textSecondary">
                Retry attempt: {retryCount}/{maxRetries}
              </Typography>
            )}

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={onRetry}
                disabled={retryCount >= maxRetries}
                size="small"
              >
                {retryCount >= maxRetries ? 'Max Retries Reached' : 'Try Again'}
              </Button>

              {level === 'page' && (
                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={onGoHome}
                  size="small"
                >
                  Go Home
                </Button>
              )}

              {config.env.isProduction && (
                <Button
                  variant="outlined"
                  startIcon={<BugReport />}
                  onClick={onReport}
                  size="small"
                >
                  Report Issue
                </Button>
              )}
            </Stack>

            {config.env.isDevelopment && (
              <>
                <Box>
                  <Button
                    startIcon={showDetails ? <ExpandLess /> : <ExpandMore />}
                    onClick={onToggleDetails}
                    size="small"
                  >
                    {showDetails ? 'Hide' : 'Show'} Details
                  </Button>
                </Box>

                <Collapse in={showDetails}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Error Details
                    </Typography>
                    <Typography variant="caption" component="pre" sx={{ 
                      backgroundColor: 'grey.100',
                      p: 1,
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                    }}>
                      {error.stack}
                    </Typography>

                    {errorInfo && (
                      <>
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                          Component Stack
                        </Typography>
                        <Typography variant="caption" component="pre" sx={{ 
                          backgroundColor: 'grey.100',
                          p: 1,
                          borderRadius: 1,
                          overflow: 'auto',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                        }}>
                          {errorInfo.componentStack}
                        </Typography>
                      </>
                    )}

                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                      Error ID: {errorId}
                    </Typography>
                  </Box>
                </Collapse>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

// Higher-order component for error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error boundary context
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}

export default ErrorBoundary;
