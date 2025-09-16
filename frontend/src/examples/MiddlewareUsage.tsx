'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '../middleware/hooks';
import { useSubscription } from '../middleware/hooks';
import { useAuth } from '../middleware/hooks';
import { useLogger } from '../middleware/hooks';
import { SubscriptionGate, FeatureGate, UpgradePrompt } from '../middleware/components';

// Example component showing middleware usage
export const MiddlewareUsageExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const { hasFeature, canAccessFeature, checkLimit } = useSubscription();
  const { hasPermission, hasRole } = useAuth();
  const { info, warn, error } = useLogger();
  
  // Example: Check subscription features
  const handleAdvancedSearch = () => {
    if (hasFeature('advanced_search')) {
      info('Advanced search accessed', { feature: 'advanced_search' });
      // Perform advanced search
    } else {
      warn('Advanced search not available', { subscription: 'insufficient' });
    }
  };
  
  // Example: Check permissions
  const handleAdminAction = () => {
    if (hasPermission('admin')) {
      info('Admin action performed', { action: 'admin_action' });
      // Perform admin action
    } else {
      error('Admin permission required', { action: 'admin_action' });
    }
  };
  
  // Example: Check usage limits
  const handleDocumentUpload = () => {
    if (checkLimit('maxDocuments')) {
      info('Document upload allowed', { limit: 'maxDocuments' });
      // Upload document
    } else {
      warn('Document limit exceeded', { limit: 'maxDocuments' });
    }
  };
  
  return (
    <div>
      <h2>Middleware Usage Examples</h2>
      
      {/* Subscription-based access */}
      <SubscriptionGate requiredTier="pro" requiredFeature="custom_branding">
        <div>
          <h3>Pro Feature</h3>
          <p>This content is only visible to Pro subscribers.</p>
        </div>
      </SubscriptionGate>
      
      {/* Feature-based access */}
      <FeatureGate feature="advanced_search">
        <div>
          <h3>Advanced Search</h3>
          <button onClick={handleAdvancedSearch}>
            Use Advanced Search
          </button>
        </div>
      </FeatureGate>
      
      {/* Permission-based access */}
      {hasRole('admin') && (
        <div>
          <h3>Admin Panel</h3>
          <button onClick={handleAdminAction}>
            Admin Action
          </button>
        </div>
      )}
      
      {/* Usage limit checking */}
      <div>
        <h3>Document Upload</h3>
        <button onClick={handleDocumentUpload}>
          Upload Document
        </button>
      </div>
      
      {/* Upgrade prompt example */}
      <SubscriptionGate 
        requiredTier="standard" 
        upgradePrompt={<UpgradePrompt requiredTier="standard" />}
      >
        <div>
          <h3>Standard Feature</h3>
          <p>This content requires Standard subscription.</p>
        </div>
      </SubscriptionGate>
    </div>
  );
};

// Example: Using middleware with HOCs
export const withMiddlewareExample = () => {
  // Example component that requires Pro subscription
  const ProFeature = withSubscription(MyComponent, {
    requiredTier: 'pro',
    upgradePrompt: UpgradePrompt,
  });
  
  // Example component that requires specific feature
  const AdvancedFeature = withFeature(MyComponent, 'advanced_analytics', {
    showUpgradePrompt: true,
  });
  
  // Example component that requires permission
  const AdminFeature = withPermission(MyComponent, 'admin');
  
  return (
    <div>
      <ProFeature />
      <AdvancedFeature />
      <AdminFeature />
    </div>
  );
};

// Example: Custom middleware usage
export const customMiddlewareExample = () => {
  const dispatch = useAppDispatch();
  
  // Example: Manual cache operations
  const handleCacheOperations = () => {
    // Set cache
    dispatch({
      type: 'cache/set',
      payload: {
        key: 'user_preferences',
        value: { theme: 'dark', language: 'en' },
        ttl: 300000, // 5 minutes
      },
    });
    
    // Get cache
    dispatch({
      type: 'cache/get',
      payload: { key: 'user_preferences' },
    });
    
    // Clear cache
    dispatch({ type: 'cache/clear' });
  };
  
  // Example: Manual validation
  const handleValidation = () => {
    dispatch({
      type: 'validation/validateAll',
    });
  };
  
  // Example: Performance monitoring
  const handlePerformanceMonitoring = () => {
    dispatch({
      type: 'performance/startMonitoring',
    });
  };
  
  return (
    <div>
      <button onClick={handleCacheOperations}>
        Cache Operations
      </button>
      <button onClick={handleValidation}>
        Validate All
      </button>
      <button onClick={handlePerformanceMonitoring}>
        Start Performance Monitoring
      </button>
    </div>
  );
};

// Example: Error handling with middleware
export const errorHandlingExample = () => {
  const dispatch = useAppDispatch();
  
  const handleError = () => {
    // This will be caught by error middleware
    dispatch({
      type: 'documents/upload/rejected',
      payload: new Error('Upload failed'),
    });
  };
  
  const handleRecovery = () => {
    // This will trigger error recovery
    dispatch({
      type: 'documents/upload/retry',
      payload: { file: 'document.pdf' },
    });
  };
  
  return (
    <div>
      <button onClick={handleError}>
        Trigger Error
      </button>
      <button onClick={handleRecovery}>
        Retry Action
      </button>
    </div>
  );
};

// Example: Analytics with middleware
export const analyticsExample = () => {
  const dispatch = useAppDispatch();
  
  const handleAnalytics = () => {
    // This will be tracked by analytics middleware
    dispatch({
      type: 'analytics/trackEvent',
      payload: {
        event: 'button_click',
        properties: {
          button: 'analytics_example',
          page: 'middleware_usage',
        },
      },
    });
  };
  
  return (
    <div>
      <button onClick={handleAnalytics}>
        Track Analytics Event
      </button>
    </div>
  );
};

// Example: Security with middleware
export const securityExample = () => {
  const dispatch = useAppDispatch();
  
  const handleSecurity = () => {
    // This will be blocked by security middleware
    dispatch({
      type: 'documents/create',
      payload: {
        title: '<script>alert("xss")</script>',
        content: 'Malicious content',
      },
    });
  };
  
  return (
    <div>
      <button onClick={handleSecurity}>
        Test Security (Will be blocked)
      </button>
    </div>
  );
};

// Example: Rate limiting with middleware
export const rateLimitExample = () => {
  const dispatch = useAppDispatch();
  
  const handleRateLimit = () => {
    // This will be rate limited
    for (let i = 0; i < 10; i++) {
      dispatch({
        type: 'documents/upload',
        payload: { file: `document${i}.pdf` },
      });
    }
  };
  
  return (
    <div>
      <button onClick={handleRateLimit}>
        Test Rate Limiting
      </button>
    </div>
  );
};
