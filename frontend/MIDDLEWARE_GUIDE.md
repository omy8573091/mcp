# Middleware Guide

## Overview

This guide covers the comprehensive middleware system implemented for the GRC Document Management System. The middleware provides essential functionality including error handling, subscription management, authentication, logging, performance monitoring, validation, caching, analytics, security, and rate limiting.

## Middleware Architecture

### Core Middleware Stack

```typescript
// Middleware execution order
[
  errorMiddleware,           // Error handling and recovery
  authMiddleware,           // Authentication and authorization
  subscriptionMiddleware,   // Subscription-based access control
  performanceMiddleware,    // Performance monitoring
  loggingMiddleware,        // Comprehensive logging
  validationMiddleware,     // Input validation and sanitization
  cacheMiddleware,         // Caching and optimization
  analyticsMiddleware,     // User behavior tracking
  securityMiddleware,      // Security and threat detection
  rateLimitMiddleware,     // Rate limiting and throttling
]
```

## 1. Error Middleware

### Purpose
Handles errors across the application, provides error recovery, and manages error notifications.

### Features
- **Global Error Handling**: Catches and processes all Redux action errors
- **Error Recovery**: Automatic retry for recoverable errors
- **Error Notifications**: User-friendly error messages
- **Error Logging**: Comprehensive error tracking and reporting
- **Error Boundaries**: React error boundary integration

### Usage
```typescript
// Error middleware is automatically applied
// Errors are handled and logged automatically

// Custom error handling
const handleError = (error: Error) => {
  // Error is automatically logged and user is notified
  console.log('Error handled:', error.message);
};
```

### Error Types
- **Network Errors**: Connection issues, timeouts
- **Server Errors**: 5xx HTTP status codes
- **Validation Errors**: Input validation failures
- **Authentication Errors**: Login/authorization issues
- **Authorization Errors**: Permission denied
- **Rate Limit Errors**: Too many requests

## 2. Subscription Middleware

### Purpose
Manages subscription-based access control, feature gating, and usage limits.

### Features
- **Subscription Tiers**: Free, Basic, Standard, Pro, Enterprise
- **Feature Gating**: Component access based on subscription
- **Usage Limits**: Document, user, and storage limits
- **Upgrade Prompts**: User-friendly upgrade suggestions
- **Usage Tracking**: Real-time usage monitoring

### Subscription Tiers

#### Free Tier
- 10 documents
- 100MB storage
- 1 user
- Basic features only

#### Basic Tier
- 100 documents
- 1GB storage
- 5 users
- Document editing
- Basic analytics

#### Standard Tier
- 1,000 documents
- 10GB storage
- 25 users
- Advanced search
- API access
- Audit logs
- Bulk operations

#### Pro Tier
- 10,000 documents
- 100GB storage
- 100 users
- Custom branding
- Priority support
- SSO integration
- Custom integrations

#### Enterprise Tier
- Unlimited documents
- Unlimited storage
- Unlimited users
- All features
- Dedicated support
- Custom development

### Usage
```typescript
// Using subscription hooks
const { hasFeature, canAccessFeature, checkLimit } = useSubscription();

// Check feature access
if (hasFeature('advanced_search')) {
  // Show advanced search
}

// Check usage limits
if (checkLimit('maxDocuments')) {
  // Allow document creation
}

// Using subscription gate component
<SubscriptionGate requiredTier="pro" requiredFeature="custom_branding">
  <CustomBrandingComponent />
</SubscriptionGate>

// Using HOC
const ProFeature = withSubscription(MyComponent, {
  requiredTier: 'pro',
  upgradePrompt: UpgradePrompt,
});
```

## 3. Authentication Middleware

### Purpose
Handles authentication state, token management, and route protection.

### Features
- **Token Management**: JWT token handling and refresh
- **Route Protection**: Automatic route access control
- **Permission Checking**: Role and permission-based access
- **Session Management**: User session handling
- **Auto-logout**: Automatic logout on token expiry

### Usage
```typescript
// Using authentication hooks
const { login, logout, hasPermission, hasRole } = useAuth();

// Check permissions
if (hasPermission('admin')) {
  // Show admin features
}

// Check roles
if (hasRole('admin')) {
  // Show admin panel
}

// Using permission-based components
const AdminFeature = withPermission(AdminComponent, 'admin');
const AdminPanel = withRole(AdminPanelComponent, ['admin', 'super_admin']);
```

## 4. Logging Middleware

### Purpose
Comprehensive logging system for debugging, monitoring, and analytics.

### Features
- **Action Logging**: Redux action tracking
- **Performance Logging**: Performance metrics
- **Error Logging**: Error tracking and reporting
- **User Action Logging**: User behavior tracking
- **Audit Logging**: Security and compliance logging

### Log Levels
- **DEBUG**: Development debugging
- **INFO**: General information
- **WARN**: Warning messages
- **ERROR**: Error conditions

### Usage
```typescript
// Using logger hook
const { debug, info, warn, error } = useLogger();

// Log messages
debug('Component mounted', { component: 'MyComponent' });
info('User action', { action: 'document_upload' });
warn('Performance warning', { duration: '150ms' });
error('API error', { error: errorMessage });

// Component lifecycle logging
useComponentLogging('MyComponent');
```

## 5. Performance Middleware

### Purpose
Monitors and optimizes application performance.

### Features
- **Performance Metrics**: Action duration tracking
- **Memory Monitoring**: Memory usage tracking
- **Bundle Size Monitoring**: Bundle size tracking
- **Render Performance**: Component render time
- **Memory Leak Detection**: Automatic leak detection

### Usage
```typescript
// Using performance monitoring
const { metrics, startMonitoring, stopMonitoring } = usePerformanceMonitoring('MyComponent');

// Start monitoring
startMonitoring();

// Get performance stats
const stats = getPerformanceStats();
console.log('Performance stats:', stats);

// Get performance suggestions
const suggestions = getPerformanceSuggestions();
console.log('Optimization suggestions:', suggestions);
```

## 6. Validation Middleware

### Purpose
Input validation, sanitization, and data integrity.

### Features
- **Schema Validation**: Zod-based validation
- **Field Validation**: Individual field validation
- **Sanitization**: XSS and injection prevention
- **File Validation**: File upload validation
- **Custom Validation**: Business-specific validation

### Usage
```typescript
// Validation schemas are automatically applied
// Custom validation
const customValidators = {
  email: (value: string) => {
    if (!value.includes('@')) return 'Invalid email';
    return null;
  },
};

// Using validation middleware
const validationMiddleware = customValidationMiddleware(customValidators);
```

## 7. Cache Middleware

### Purpose
Caching system for improved performance and reduced API calls.

### Features
- **Action Caching**: Redux action result caching
- **Cache Invalidation**: Smart cache invalidation
- **Cache Warming**: Proactive cache population
- **Cache Statistics**: Cache performance metrics
- **Cache Persistence**: Persistent cache storage

### Usage
```typescript
// Cache is automatically managed
// Manual cache operations
dispatch({ type: 'cache/set', payload: { key: 'data', value: data, ttl: 300000 } });
dispatch({ type: 'cache/get', payload: { key: 'data' } });
dispatch({ type: 'cache/delete', payload: { key: 'data' } });
dispatch({ type: 'cache/clear' });
```

## 8. Analytics Middleware

### Purpose
User behavior tracking and analytics.

### Features
- **Event Tracking**: User action tracking
- **Performance Analytics**: Performance metrics
- **Error Analytics**: Error tracking
- **Conversion Tracking**: Goal tracking
- **A/B Testing**: Experiment tracking

### Usage
```typescript
// Analytics are automatically tracked
// Manual event tracking
const event = {
  event: 'custom_event',
  properties: { custom_property: 'value' },
};

trackEvent(event);

// A/B testing
const variant = getABTestVariant('button_color', ['blue', 'green'], 'blue');
```

## 9. Security Middleware

### Purpose
Security monitoring and threat detection.

### Features
- **Suspicious Pattern Detection**: Malicious input detection
- **Payload Sanitization**: XSS prevention
- **Security Logging**: Security event tracking
- **Threat Blocking**: Automatic threat blocking

### Usage
```typescript
// Security is automatically applied
// Suspicious actions are automatically blocked
// Payloads are automatically sanitized
```

## 10. Rate Limit Middleware

### Purpose
Rate limiting and request throttling.

### Features
- **Action-based Rate Limiting**: Per-action rate limits
- **Time Window Management**: Sliding window rate limiting
- **Rate Limit Exceeded Handling**: Graceful rate limit handling
- **Rate Limit Statistics**: Rate limit metrics

### Usage
```typescript
// Rate limits are automatically applied
// Rate limit exceeded actions are automatically blocked
// Rate limit statistics are automatically tracked
```

## Middleware Configuration

### Store Configuration
```typescript
import { store, persistor } from './middleware/store';

// Store is configured with all middleware
// Persistence is automatically handled
```

### Environment Configuration
```typescript
// Environment-specific middleware configuration
const middlewareConfig = {
  development: {
    logging: { level: 'debug' },
    performance: { monitoring: true },
    analytics: { tracking: false },
  },
  production: {
    logging: { level: 'error' },
    performance: { monitoring: true },
    analytics: { tracking: true },
  },
};
```

## Best Practices

### 1. Middleware Order
- Keep error middleware first
- Place security middleware early
- Put performance middleware after core functionality
- Place analytics middleware last

### 2. Error Handling
- Always handle errors gracefully
- Provide user-friendly error messages
- Log errors for debugging
- Implement error recovery where possible

### 3. Performance
- Monitor performance metrics
- Optimize slow actions
- Use caching effectively
- Implement lazy loading

### 4. Security
- Validate all inputs
- Sanitize user data
- Monitor for suspicious patterns
- Implement proper authentication

### 5. Analytics
- Track important user actions
- Monitor performance metrics
- Track errors and issues
- Use A/B testing for optimization

## Troubleshooting

### Common Issues

#### 1. Middleware Not Working
- Check middleware order
- Verify middleware configuration
- Check for conflicting middleware

#### 2. Performance Issues
- Monitor performance metrics
- Check for memory leaks
- Optimize slow actions
- Review cache configuration

#### 3. Security Issues
- Check security middleware configuration
- Verify input validation
- Monitor security logs
- Review rate limiting

#### 4. Analytics Issues
- Check analytics configuration
- Verify event tracking
- Monitor analytics logs
- Review A/B testing setup

## Conclusion

The middleware system provides a comprehensive foundation for building robust, secure, and performant applications. By following the guidelines and best practices outlined in this guide, developers can effectively utilize the middleware system to enhance their applications.

The middleware system is designed to be:
- **Modular**: Each middleware has a specific purpose
- **Configurable**: Easy to configure and customize
- **Extensible**: Easy to add new middleware
- **Performant**: Optimized for production use
- **Secure**: Built-in security features
- **Maintainable**: Clean and well-documented code
