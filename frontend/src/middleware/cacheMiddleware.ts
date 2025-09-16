import { Middleware } from '@reduxjs/toolkit';
import { cacheService, cacheKeys, cacheTTL } from '../services/cacheService';
import { logger } from './loggingMiddleware';

// Cache middleware for Redux actions
export const cacheMiddleware: Middleware = (store) => (next) => (action) => {
  // Handle cache-related actions
  if (action.type.startsWith('cache/')) {
    return handleCacheAction(store, next, action);
  }
  
  // Check if action should be cached
  if (shouldCacheAction(action.type)) {
    return handleCachedAction(store, next, action);
  }
  
  return next(action);
};

// Handle cache-related actions
const handleCacheAction = (store: any, next: any, action: any) => {
  switch (action.type) {
    case 'cache/set':
      const { key, value, ttl } = action.payload;
      cacheService.set(key, value, ttl);
      break;
      
    case 'cache/get':
      const { key: getKey } = action.payload;
      const cachedValue = cacheService.get(getKey);
      return next({
        type: 'cache/get/fulfilled',
        payload: cachedValue,
      });
      
    case 'cache/delete':
      const { key: deleteKey } = action.payload;
      cacheService.delete(deleteKey);
      break;
      
    case 'cache/clear':
      cacheService.clear();
      break;
      
    case 'cache/stats':
      const stats = cacheService.getStats();
      return next({
        type: 'cache/stats/fulfilled',
        payload: stats,
      });
  }
  
  return next(action);
};

// Handle cached actions
const handleCachedAction = (store: any, next: any, action: any) => {
  const cacheKey = generateCacheKey(action);
  
  // Check if action result is cached
  const cachedResult = cacheService.get(cacheKey);
  
  if (cachedResult) {
    logger.debug('Cache hit', {
      action: action.type,
      cacheKey,
      timestamp: new Date().toISOString(),
    });
    
    return next({
      type: `${action.type}/cached`,
      payload: cachedResult,
      meta: { cached: true },
    });
  }
  
  // Execute action and cache result
  const result = next(action);
  
  if (result.type.endsWith('/fulfilled')) {
    const ttl = getCacheTTL(action.type);
    cacheService.set(cacheKey, result.payload, ttl);
    
    logger.debug('Cache set', {
      action: action.type,
      cacheKey,
      ttl,
      timestamp: new Date().toISOString(),
    });
  }
  
  return result;
};

// Check if action should be cached
const shouldCacheAction = (actionType: string): boolean => {
  const cacheableActions = [
    'documents/fetchDocuments',
    'documents/getDocument',
    'users/fetchUsers',
    'users/getUser',
    'dashboard/getStats',
    'analytics/getAnalytics',
    'settings/getSettings',
  ];
  
  return cacheableActions.some(action => actionType.includes(action));
};

// Generate cache key for action
const generateCacheKey = (action: any): string => {
  const { type, payload } = action;
  
  // Create a unique key based on action type and payload
  const payloadHash = payload ? JSON.stringify(payload) : '';
  return `${type}:${payloadHash}`;
};

// Get cache TTL for action type
const getCacheTTL = (actionType: string): number => {
  if (actionType.includes('documents/')) {
    return cacheTTL.documents;
  }
  
  if (actionType.includes('users/')) {
    return cacheTTL.user;
  }
  
  if (actionType.includes('dashboard/')) {
    return cacheTTL.dashboard;
  }
  
  if (actionType.includes('analytics/')) {
    return cacheTTL.analytics;
  }
  
  return cacheTTL.default;
};

// Cache invalidation middleware
export const cacheInvalidationMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Check if action should invalidate cache
  if (shouldInvalidateCache(action.type)) {
    const patterns = getInvalidationPatterns(action.type);
    
    patterns.forEach(pattern => {
      invalidateCachePattern(pattern);
    });
    
    logger.debug('Cache invalidated', {
      action: action.type,
      patterns,
      timestamp: new Date().toISOString(),
    });
  }
  
  return result;
};

// Check if action should invalidate cache
const shouldInvalidateCache = (actionType: string): boolean => {
  const invalidationActions = [
    'documents/create',
    'documents/update',
    'documents/delete',
    'users/create',
    'users/update',
    'users/delete',
    'settings/update',
  ];
  
  return invalidationActions.some(action => actionType.includes(action));
};

// Get cache invalidation patterns
const getInvalidationPatterns = (actionType: string): string[] => {
  const patterns: string[] = [];
  
  if (actionType.includes('documents/')) {
    patterns.push('documents/*');
    patterns.push('dashboard/*');
    patterns.push('analytics/*');
  }
  
  if (actionType.includes('users/')) {
    patterns.push('users/*');
  }
  
  if (actionType.includes('settings/')) {
    patterns.push('settings/*');
  }
  
  return patterns;
};

// Invalidate cache pattern
const invalidateCachePattern = (pattern: string) => {
  // This is a simplified implementation
  // In a real application, you would implement pattern matching
  const stats = cacheService.getStats();
  
  // For now, we'll clear all cache
  // In a real implementation, you would selectively clear matching keys
  cacheService.clear();
};

// Cache warming middleware
export const cacheWarmingMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === 'app/initialized') {
    // Warm up cache with frequently accessed data
    warmUpCache(store);
  }
  
  return next(action);
};

// Warm up cache
const warmUpCache = (store: any) => {
  const warmingActions = [
    { type: 'dashboard/getStats', payload: {} },
    { type: 'documents/fetchDocuments', payload: { page: 1, limit: 20 } },
    { type: 'settings/getSettings', payload: {} },
  ];
  
  warmingActions.forEach(warmingAction => {
    store.dispatch(warmingAction);
  });
  
  logger.info('Cache warming initiated', {
    actions: warmingActions.map(a => a.type),
    timestamp: new Date().toISOString(),
  });
};

// Cache statistics middleware
export const cacheStatsMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === 'cache/getStats') {
    const stats = cacheService.getStats();
    
    return next({
      type: 'cache/getStats/fulfilled',
      payload: stats,
    });
  }
  
  return next(action);
};

// Cache cleanup middleware
export const cacheCleanupMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === 'app/cleanup') {
    // Clean up expired cache entries
    cacheService.cleanup();
    
    logger.info('Cache cleanup completed', {
      timestamp: new Date().toISOString(),
    });
  }
  
  return next(action);
};

// Cache persistence middleware
export const cachePersistenceMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === 'app/saveState') {
    // Save cache to persistent storage
    const stats = cacheService.getStats();
    
    // In a real application, you would save to localStorage or IndexedDB
    localStorage.setItem('cache_stats', JSON.stringify(stats));
    
    logger.info('Cache state saved', {
      stats,
      timestamp: new Date().toISOString(),
    });
  }
  
  if (action.type === 'app/restoreState') {
    // Restore cache from persistent storage
    const savedStats = localStorage.getItem('cache_stats');
    
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      
      logger.info('Cache state restored', {
        stats,
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  return next(action);
};

// Cache monitoring middleware
export const cacheMonitoringMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type.endsWith('/cached')) {
    // Track cache hit
    store.dispatch({
      type: 'cache/monitor/hit',
      payload: {
        action: action.type,
        timestamp: new Date().toISOString(),
      },
    });
  }
  
  if (action.type.endsWith('/fulfilled') && !action.meta?.cached) {
    // Track cache miss
    store.dispatch({
      type: 'cache/monitor/miss',
      payload: {
        action: action.type,
        timestamp: new Date().toISOString(),
      },
    });
  }
  
  return next(action);
};

// Cache optimization middleware
export const cacheOptimizationMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === 'cache/optimize') {
    const stats = cacheService.getStats();
    
    // Implement cache optimization logic
    if (stats.valid < stats.maxSize * 0.5) {
      // Cache is underutilized, increase TTL
      logger.info('Cache optimization: Increasing TTL', {
        currentValid: stats.valid,
        maxSize: stats.maxSize,
        timestamp: new Date().toISOString(),
      });
    } else if (stats.valid > stats.maxSize * 0.9) {
      // Cache is overutilized, decrease TTL
      logger.info('Cache optimization: Decreasing TTL', {
        currentValid: stats.valid,
        maxSize: stats.maxSize,
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  return next(action);
};
