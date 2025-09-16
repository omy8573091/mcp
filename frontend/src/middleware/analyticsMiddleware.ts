import { Middleware } from '@reduxjs/toolkit';
import { logger } from './loggingMiddleware';
import { config } from '../core/config';

// Analytics event interface
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
  page?: string;
  referrer?: string;
  userAgent?: string;
}

// Analytics middleware
export const analyticsMiddleware: Middleware = (store) => (next) => (action) => {
  const state = store.getState();
  const userId = state.auth?.user?.id;
  const sessionId = getSessionId();
  
  // Track user actions
  if (shouldTrackAction(action.type)) {
    const event: AnalyticsEvent = {
      event: action.type,
      properties: {
        payload: action.payload,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      userId,
      sessionId,
      page: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    };
    
    trackEvent(event);
  }
  
  // Track page views
  if (action.type === 'router/navigate') {
    const event: AnalyticsEvent = {
      event: 'page_view',
      properties: {
        page: action.payload,
        title: document.title,
      },
      timestamp: new Date().toISOString(),
      userId,
      sessionId,
      page: action.payload,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    };
    
    trackEvent(event);
  }
  
  // Track errors
  if (action.type.endsWith('/rejected')) {
    const event: AnalyticsEvent = {
      event: 'error',
      properties: {
        action: action.type,
        error: action.payload,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      userId,
      sessionId,
      page: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    };
    
    trackEvent(event);
  }
  
  return next(action);
};

// Check if action should be tracked
const shouldTrackAction = (actionType: string): boolean => {
  const trackableActions = [
    'documents/',
    'users/',
    'auth/',
    'settings/',
    'profile/',
    'search/',
    'upload/',
    'export/',
  ];
  
  return trackableActions.some(action => actionType.includes(action));
};

// Get session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  
  return sessionId;
};

// Track event
const trackEvent = (event: AnalyticsEvent) => {
  // Log event in development
  if (config.env.isDevelopment) {
    logger.debug('Analytics event', event);
  }
  
  // Send to analytics service in production
  if (config.env.isProduction) {
    sendToAnalyticsService(event);
  }
  
  // Store event locally for offline analysis
  storeEventLocally(event);
};

// Send to analytics service
const sendToAnalyticsService = async (event: AnalyticsEvent) => {
  try {
    // In a real application, you would send this to an analytics service
    // like Google Analytics, Mixpanel, or Amplitude
    console.log('Sending to analytics service:', event);
    
    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', event.event, {
        event_category: 'user_action',
        event_label: event.properties?.action || event.event,
        value: 1,
        custom_parameters: event.properties,
      });
    }
    
    // Example: Mixpanel
    if (typeof mixpanel !== 'undefined') {
      mixpanel.track(event.event, event.properties);
    }
    
  } catch (error) {
    logger.error('Failed to send analytics event', {
      event,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Store event locally
const storeEventLocally = (event: AnalyticsEvent) => {
  try {
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    events.push(event);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('analytics_events', JSON.stringify(events));
  } catch (error) {
    logger.error('Failed to store analytics event locally', {
      event,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// User behavior tracking middleware
export const userBehaviorMiddleware: Middleware = (store) => (next) => (action) => {
  const state = store.getState();
  const userId = state.auth?.user?.id;
  
  if (userId) {
    // Track user behavior patterns
    trackUserBehavior(action, userId);
  }
  
  return next(action);
};

// Track user behavior
const trackUserBehavior = (action: any, userId: string) => {
  const behavior = {
    userId,
    action: action.type,
    timestamp: new Date().toISOString(),
    page: window.location.pathname,
    timeOnPage: getTimeOnPage(),
    scrollDepth: getScrollDepth(),
    clickCount: getClickCount(),
  };
  
  // Store behavior data
  storeBehaviorData(behavior);
};

// Get time on page
const getTimeOnPage = (): number => {
  const startTime = sessionStorage.getItem('page_start_time');
  if (startTime) {
    return Date.now() - parseInt(startTime);
  }
  return 0;
};

// Get scroll depth
const getScrollDepth = (): number => {
  const scrollDepth = sessionStorage.getItem('scroll_depth');
  return scrollDepth ? parseInt(scrollDepth) : 0;
};

// Get click count
const getClickCount = (): number => {
  const clickCount = sessionStorage.getItem('click_count');
  return clickCount ? parseInt(clickCount) : 0;
};

// Store behavior data
const storeBehaviorData = (behavior: any) => {
  try {
    const behaviors = JSON.parse(localStorage.getItem('user_behaviors') || '[]');
    behaviors.push(behavior);
    
    // Keep only last 50 behaviors
    if (behaviors.length > 50) {
      behaviors.splice(0, behaviors.length - 50);
    }
    
    localStorage.setItem('user_behaviors', JSON.stringify(behaviors));
  } catch (error) {
    logger.error('Failed to store behavior data', {
      behavior,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Performance analytics middleware
export const performanceAnalyticsMiddleware: Middleware = (store) => (next) => (action) => {
  const startTime = performance.now();
  
  const result = next(action);
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Track performance metrics
  if (duration > 100) {
    const event: AnalyticsEvent = {
      event: 'performance_slow_action',
      properties: {
        action: action.type,
        duration: duration,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      page: window.location.pathname,
    };
    
    trackEvent(event);
  }
  
  return result;
};

// Error analytics middleware
export const errorAnalyticsMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type.endsWith('/rejected')) {
    const event: AnalyticsEvent = {
      event: 'error_occurred',
      properties: {
        action: action.type,
        error: action.payload,
        errorMessage: action.payload?.message,
        errorCode: action.payload?.code,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      page: window.location.pathname,
    };
    
    trackEvent(event);
  }
  
  return next(action);
};

// Conversion tracking middleware
export const conversionTrackingMiddleware: Middleware = (store) => (next) => (action) => {
  const conversionActions = [
    'documents/upload',
    'documents/create',
    'users/invite',
    'settings/update',
    'profile/update',
  ];
  
  if (conversionActions.includes(action.type)) {
    const event: AnalyticsEvent = {
      event: 'conversion',
      properties: {
        action: action.type,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      page: window.location.pathname,
    };
    
    trackEvent(event);
  }
  
  return next(action);
};

// A/B testing middleware
export const abTestingMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === 'app/initialized') {
    // Initialize A/B tests
    initializeABTests();
  }
  
  return next(action);
};

// Initialize A/B tests
const initializeABTests = () => {
  const tests = [
    {
      name: 'button_color',
      variants: ['blue', 'green', 'red'],
      defaultVariant: 'blue',
    },
    {
      name: 'layout_style',
      variants: ['grid', 'list', 'card'],
      defaultVariant: 'grid',
    },
  ];
  
  tests.forEach(test => {
    const variant = getABTestVariant(test.name, test.variants, test.defaultVariant);
    setABTestVariant(test.name, variant);
    
    // Track A/B test assignment
    const event: AnalyticsEvent = {
      event: 'ab_test_assigned',
      properties: {
        testName: test.name,
        variant: variant,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
    };
    
    trackEvent(event);
  });
};

// Get A/B test variant
const getABTestVariant = (testName: string, variants: string[], defaultVariant: string): string => {
  const storedVariant = localStorage.getItem(`ab_test_${testName}`);
  
  if (storedVariant && variants.includes(storedVariant)) {
    return storedVariant;
  }
  
  // Assign variant based on user ID or session ID
  const sessionId = getSessionId();
  const hash = hashString(sessionId + testName);
  const variantIndex = hash % variants.length;
  
  return variants[variantIndex];
};

// Set A/B test variant
const setABTestVariant = (testName: string, variant: string) => {
  localStorage.setItem(`ab_test_${testName}`, variant);
};

// Hash string
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Analytics dashboard data
export const getAnalyticsDashboardData = () => {
  const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
  const behaviors = JSON.parse(localStorage.getItem('user_behaviors') || '[]');
  
  return {
    events: events.slice(-50), // Last 50 events
    behaviors: behaviors.slice(-20), // Last 20 behaviors
    sessionId: getSessionId(),
    timestamp: new Date().toISOString(),
  };
};

// Export analytics data
export const exportAnalyticsData = () => {
  const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
  const behaviors = JSON.parse(localStorage.getItem('user_behaviors') || '[]');
  
  const data = {
    events,
    behaviors,
    sessionId: getSessionId(),
    exportTimestamp: new Date().toISOString(),
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `analytics_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
