import { Middleware } from '@reduxjs/toolkit';
import { config } from '../core/config';

// Logging levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Log entry interface
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: any;
  userId?: string;
  sessionId?: string;
  action?: string;
  duration?: number;
}

// Logger class
class Logger {
  private sessionId: string;
  private userId?: string;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;
  private flushInterval = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private stopFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private createLogEntry(level: LogLevel, message: string, context?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId: this.userId,
      sessionId: this.sessionId,
    };
  }

  private addToBuffer(entry: LogEntry) {
    this.logBuffer.push(entry);
    
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  private async flush() {
    if (this.logBuffer.length === 0) return;

    const logs = [...this.logBuffer];
    this.logBuffer = [];

    try {
      if (config.env.isProduction) {
        await this.sendToLogService(logs);
      } else {
        this.logToConsole(logs);
      }
    } catch (error) {
      console.error('Failed to flush logs:', error);
      // Re-add logs to buffer if sending failed
      this.logBuffer.unshift(...logs);
    }
  }

  private logToConsole(logs: LogEntry[]) {
    logs.forEach(log => {
      const { level, message, timestamp, context } = log;
      const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(logMessage, context);
          break;
        case LogLevel.INFO:
          console.info(logMessage, context);
          break;
        case LogLevel.WARN:
          console.warn(logMessage, context);
          break;
        case LogLevel.ERROR:
          console.error(logMessage, context);
          break;
      }
    });
  }

  private async sendToLogService(logs: LogEntry[]) {
    // In a real application, you would send this to a logging service
    // like LogRocket, Sentry, or a custom logging endpoint
    console.log('Sending logs to service:', logs);
  }

  debug(message: string, context?: any) {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.addToBuffer(entry);
  }

  info(message: string, context?: any) {
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.addToBuffer(entry);
  }

  warn(message: string, context?: any) {
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.addToBuffer(entry);
  }

  error(message: string, context?: any) {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context);
    this.addToBuffer(entry);
  }

  destroy() {
    this.stopFlushTimer();
    this.flush();
  }
}

// Global logger instance
export const logger = new Logger();

// Redux logging middleware
export const loggingMiddleware: Middleware = (store) => (next) => (action) => {
  const startTime = performance.now();
  
  // Log action start
  logger.debug('Action started', {
    action: action.type,
    payload: action.payload,
    timestamp: new Date().toISOString(),
  });

  const result = next(action);

  const endTime = performance.now();
  const duration = endTime - startTime;

  // Log action completion
  logger.info('Action completed', {
    action: action.type,
    duration: `${duration.toFixed(2)}ms`,
    timestamp: new Date().toISOString(),
  });

  // Log slow actions
  if (duration > 100) {
    logger.warn('Slow action detected', {
      action: action.type,
      duration: `${duration.toFixed(2)}ms`,
      threshold: '100ms',
    });
  }

  return result;
};

// API logging middleware
export const apiLoggingMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type.includes('/api/')) {
    const startTime = performance.now();
    
    logger.info('API request started', {
      action: action.type,
      url: action.meta?.arg?.url,
      method: action.meta?.arg?.method,
      timestamp: new Date().toISOString(),
    });

    const result = next(action);

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (action.type.endsWith('/fulfilled')) {
      logger.info('API request completed', {
        action: action.type,
        duration: `${duration.toFixed(2)}ms`,
        status: 'success',
        timestamp: new Date().toISOString(),
      });
    } else if (action.type.endsWith('/rejected')) {
      logger.error('API request failed', {
        action: action.type,
        duration: `${duration.toFixed(2)}ms`,
        error: action.payload,
        timestamp: new Date().toISOString(),
      });
    }

    return result;
  }

  return next(action);
};

// User action logging middleware
export const userActionLoggingMiddleware: Middleware = (store) => (next) => (action) => {
  const state = store.getState();
  const userId = state.auth?.user?.id;
  
  if (userId) {
    logger.setUserId(userId);
  }

  // Log user actions
  if (isUserAction(action.type)) {
    logger.info('User action', {
      action: action.type,
      userId,
      timestamp: new Date().toISOString(),
      context: {
        payload: action.payload,
        previousState: getRelevantState(state, action.type),
      },
    });
  }

  return next(action);
};

// Check if action is a user action
const isUserAction = (actionType: string): boolean => {
  const userActions = [
    'documents/',
    'users/',
    'settings/',
    'profile/',
    'auth/login',
    'auth/logout',
  ];
  
  return userActions.some(action => actionType.includes(action));
};

// Get relevant state for logging
const getRelevantState = (state: any, actionType: string): any => {
  if (actionType.includes('documents/')) {
    return {
      documentsCount: state.documents?.documents?.length || 0,
      currentPage: state.documents?.pagination?.page || 1,
    };
  }
  
  if (actionType.includes('users/')) {
    return {
      usersCount: state.users?.users?.length || 0,
    };
  }
  
  return {};
};

// Performance logging middleware
export const performanceLoggingMiddleware: Middleware = (store) => (next) => (action) => {
  const startTime = performance.now();
  
  const result = next(action);
  
  const endTime = performance.now();
  const duration = endTime - startTime;

  // Log performance metrics
  if (duration > 50) {
    logger.warn('Performance warning', {
      action: action.type,
      duration: `${duration.toFixed(2)}ms`,
      threshold: '50ms',
      timestamp: new Date().toISOString(),
    });
  }

  // Log memory usage
  if (performance.memory) {
    const memoryUsage = {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
    };
    
    logger.debug('Memory usage', {
      action: action.type,
      memory: memoryUsage,
      timestamp: new Date().toISOString(),
    });
  }

  return result;
};

// Error logging middleware
export const errorLoggingMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type.endsWith('/rejected')) {
    const error = action.payload || action.error;
    
    logger.error('Action failed', {
      action: action.type,
      error: {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
      },
      timestamp: new Date().toISOString(),
      context: {
        payload: action.payload,
        meta: action.meta,
      },
    });
  }

  return next(action);
};

// Audit logging middleware
export const auditLoggingMiddleware: Middleware = (store) => (next) => (action) => {
  const state = store.getState();
  const userId = state.auth?.user?.id;
  
  // Log audit-worthy actions
  if (isAuditAction(action.type)) {
    logger.info('Audit log', {
      action: action.type,
      userId,
      timestamp: new Date().toISOString(),
      details: {
        payload: action.payload,
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
      },
    });
  }

  return next(action);
};

// Check if action should be audited
const isAuditAction = (actionType: string): boolean => {
  const auditActions = [
    'auth/login',
    'auth/logout',
    'documents/delete',
    'documents/update',
    'users/create',
    'users/delete',
    'users/update',
    'settings/update',
    'profile/update',
  ];
  
  return auditActions.includes(actionType);
};

// Component lifecycle logging
export const useComponentLogging = (componentName: string) => {
  useEffect(() => {
    logger.debug('Component mounted', {
      component: componentName,
      timestamp: new Date().toISOString(),
    });

    return () => {
      logger.debug('Component unmounted', {
        component: componentName,
        timestamp: new Date().toISOString(),
      });
    };
  }, [componentName]);
};

// Hook for manual logging
export const useLogger = () => {
  const state = useAppSelector(state => state);
  const userId = state.auth?.user?.id;
  
  useEffect(() => {
    if (userId) {
      logger.setUserId(userId);
    }
  }, [userId]);

  return {
    debug: (message: string, context?: any) => logger.debug(message, context),
    info: (message: string, context?: any) => logger.info(message, context),
    warn: (message: string, context?: any) => logger.warn(message, context),
    error: (message: string, context?: any) => logger.error(message, context),
  };
};

// Cleanup on page unload (only in browser)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    logger.destroy();
  });
}
