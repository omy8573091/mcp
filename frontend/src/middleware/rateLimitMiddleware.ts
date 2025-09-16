import { Middleware } from '@reduxjs/toolkit';
import { logger } from './loggingMiddleware';

// Rate limiting middleware
export const rateLimitMiddleware: Middleware = (store) => (next) => (action) => {
  const rateLimitKey = getRateLimitKey(action.type);
  const limit = getRateLimit(action.type);
  
  if (limit && !checkRateLimit(rateLimitKey, limit)) {
    logger.warn('Rate limit exceeded', {
      action: action.type,
      limit,
      timestamp: new Date().toISOString(),
    });
    
    return next({
      type: 'rateLimit/exceeded',
      payload: {
        action: action.type,
        limit,
        message: 'Rate limit exceeded. Please try again later.',
      },
    });
  }
  
  return next(action);
};

// Get rate limit key
const getRateLimitKey = (actionType: string): string => {
  return `rate_limit_${actionType}`;
};

// Get rate limit for action
const getRateLimit = (actionType: string): { count: number; window: number } | null => {
  const limits: Record<string, { count: number; window: number }> = {
    'documents/upload': { count: 10, window: 60000 }, // 10 uploads per minute
    'documents/create': { count: 20, window: 60000 }, // 20 creates per minute
    'users/invite': { count: 5, window: 60000 }, // 5 invites per minute
    'auth/login': { count: 5, window: 300000 }, // 5 logins per 5 minutes
    'auth/register': { count: 3, window: 300000 }, // 3 registrations per 5 minutes
  };
  
  return limits[actionType] || null;
};

// Check rate limit
const checkRateLimit = (key: string, limit: { count: number; window: number }): boolean => {
  const now = Date.now();
  const windowStart = now - limit.window;
  
  // Get existing requests
  const requests = JSON.parse(localStorage.getItem(key) || '[]');
  
  // Filter requests within the window
  const validRequests = requests.filter((timestamp: number) => timestamp > windowStart);
  
  // Check if limit is exceeded
  if (validRequests.length >= limit.count) {
    return false;
  }
  
  // Add current request
  validRequests.push(now);
  localStorage.setItem(key, JSON.stringify(validRequests));
  
  return true;
};
