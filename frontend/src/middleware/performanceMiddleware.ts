import { Middleware } from '@reduxjs/toolkit';
import { logger } from './loggingMiddleware';

// Performance metrics interface
export interface PerformanceMetrics {
  action: string;
  duration: number;
  timestamp: string;
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
  renderTime?: number;
  bundleSize?: number;
}

// Performance monitoring middleware
export const performanceMiddleware: Middleware = (store) => (next) => (action) => {
  const startTime = performance.now();
  const startMemory = performance.memory?.usedJSHeapSize || 0;
  
  const result = next(action);
  
  const endTime = performance.now();
  const endMemory = performance.memory?.usedJSHeapSize || 0;
  const duration = endTime - startTime;
  const memoryDelta = endMemory - startMemory;

  // Collect performance metrics
  const metrics: PerformanceMetrics = {
    action: action.type,
    duration,
    timestamp: new Date().toISOString(),
    memoryUsage: performance.memory ? {
      used: endMemory,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
    } : undefined,
  };

  // Log performance metrics
  if (duration > 100) {
    logger.warn('Slow action detected', metrics);
  } else if (duration > 50) {
    logger.info('Performance warning', metrics);
  }

  // Log memory usage
  if (memoryDelta > 1024 * 1024) { // 1MB
    logger.warn('High memory usage', {
      ...metrics,
      memoryDelta: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`,
    });
  }

  // Store metrics for analysis
  storePerformanceMetrics(metrics);

  return result;
};

// Performance metrics storage
const performanceMetrics: PerformanceMetrics[] = [];
const MAX_METRICS = 1000;

const storePerformanceMetrics = (metrics: PerformanceMetrics) => {
  performanceMetrics.push(metrics);
  
  if (performanceMetrics.length > MAX_METRICS) {
    performanceMetrics.shift();
  }
};

// Get performance statistics
export const getPerformanceStats = () => {
  const now = Date.now();
  const last5Minutes = performanceMetrics.filter(
    m => now - new Date(m.timestamp).getTime() < 5 * 60 * 1000
  );
  
  const lastHour = performanceMetrics.filter(
    m => now - new Date(m.timestamp).getTime() < 60 * 60 * 1000
  );

  return {
    last5Minutes: {
      count: last5Minutes.length,
      averageDuration: last5Minutes.reduce((sum, m) => sum + m.duration, 0) / last5Minutes.length,
      slowActions: last5Minutes.filter(m => m.duration > 100).length,
    },
    lastHour: {
      count: lastHour.length,
      averageDuration: lastHour.reduce((sum, m) => sum + m.duration, 0) / lastHour.length,
      slowActions: lastHour.filter(m => m.duration > 100).length,
    },
    total: {
      count: performanceMetrics.length,
      averageDuration: performanceMetrics.reduce((sum, m) => sum + m.duration, 0) / performanceMetrics.length,
      slowActions: performanceMetrics.filter(m => m.duration > 100).length,
    },
  };
};

// Bundle size monitoring
export const bundleSizeMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === 'app/initialized') {
    // Measure bundle size
    const bundleSize = measureBundleSize();
    
    logger.info('Bundle size measured', {
      bundleSize: `${(bundleSize / 1024).toFixed(2)}KB`,
      timestamp: new Date().toISOString(),
    });
  }

  return next(action);
};

// Measure bundle size
const measureBundleSize = (): number => {
  let totalSize = 0;
  
  // Get all script tags
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && src.includes('_next/static')) {
      // This is a Next.js chunk
      totalSize += estimateScriptSize(src);
    }
  });
  
  return totalSize;
};

// Estimate script size (this is a simplified approach)
const estimateScriptSize = (src: string): number => {
  // In a real implementation, you would fetch the script and measure its size
  // For now, we'll use a placeholder
  return 0;
};

// Render performance monitoring
export const renderPerformanceMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type.startsWith('ui/')) {
    const startTime = performance.now();
    
    const result = next(action);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    if (renderTime > 16) { // 60fps threshold
      logger.warn('Slow render detected', {
        action: action.type,
        renderTime: `${renderTime.toFixed(2)}ms`,
        timestamp: new Date().toISOString(),
      });
    }

    return result;
  }

  return next(action);
};

// Memory leak detection
export const memoryLeakMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === 'app/initialized') {
    // Start memory monitoring
    startMemoryMonitoring();
  }

  return next(action);
};

// Memory monitoring
let memoryMonitoringInterval: NodeJS.Timeout | null = null;
let previousMemoryUsage = 0;
let memoryIncreaseCount = 0;

const startMemoryMonitoring = () => {
  if (memoryMonitoringInterval) {
    clearInterval(memoryMonitoringInterval);
  }

  memoryMonitoringInterval = setInterval(() => {
    if (performance.memory) {
      const currentMemory = performance.memory.usedJSHeapSize;
      
      if (currentMemory > previousMemoryUsage) {
        memoryIncreaseCount++;
        
        if (memoryIncreaseCount > 10) {
          logger.warn('Potential memory leak detected', {
            currentMemory: `${(currentMemory / 1024 / 1024).toFixed(2)}MB`,
            previousMemory: `${(previousMemoryUsage / 1024 / 1024).toFixed(2)}MB`,
            increaseCount: memoryIncreaseCount,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        memoryIncreaseCount = 0;
      }
      
      previousMemoryUsage = currentMemory;
    }
  }, 30000); // Check every 30 seconds
};

// Stop memory monitoring
export const stopMemoryMonitoring = () => {
  if (memoryMonitoringInterval) {
    clearInterval(memoryMonitoringInterval);
    memoryMonitoringInterval = null;
  }
};

// Performance optimization suggestions
export const getPerformanceSuggestions = () => {
  const stats = getPerformanceStats();
  const suggestions: string[] = [];

  if (stats.last5Minutes.averageDuration > 100) {
    suggestions.push('Consider optimizing slow actions with memoization or lazy loading');
  }

  if (stats.last5Minutes.slowActions > 5) {
    suggestions.push('Multiple slow actions detected. Consider code splitting or performance optimization');
  }

  if (performance.memory && performance.memory.usedJSHeapSize > performance.memory.jsHeapSizeLimit * 0.8) {
    suggestions.push('High memory usage detected. Consider implementing cleanup or reducing memory footprint');
  }

  return suggestions;
};

// Performance monitoring hook
export const usePerformanceMonitoring = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    logger.info('Performance monitoring started', { component: componentName });
  }, [componentName]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    logger.info('Performance monitoring stopped', { component: componentName });
  }, [componentName]);

  const getMetrics = useCallback(() => {
    return performanceMetrics.filter(m => m.action.includes(componentName));
  }, [componentName]);

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        setMetrics(getMetrics());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isMonitoring, getMetrics]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getMetrics,
  };
};

// Performance dashboard data
export const getPerformanceDashboardData = () => {
  const stats = getPerformanceStats();
  const suggestions = getPerformanceSuggestions();
  
  return {
    stats,
    suggestions,
    memoryUsage: performance.memory ? {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
      percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100,
    } : null,
    bundleSize: measureBundleSize(),
    timestamp: new Date().toISOString(),
  };
};
