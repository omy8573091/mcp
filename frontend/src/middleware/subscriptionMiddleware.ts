import { Middleware } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Subscription types
export type SubscriptionTier = 'free' | 'basic' | 'standard' | 'pro' | 'enterprise';

export interface SubscriptionLimits {
  maxDocuments: number;
  maxStorage: number; // in MB
  maxUsers: number;
  maxApiCalls: number;
  maxExports: number;
  advancedFeatures: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  sso: boolean;
  auditLogs: boolean;
  customIntegrations: boolean;
}

export interface Subscription {
  tier: SubscriptionTier;
  limits: SubscriptionLimits;
  expiresAt: string;
  isActive: boolean;
  features: string[];
}

// Subscription limits by tier
export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxDocuments: 10,
    maxStorage: 100,
    maxUsers: 1,
    maxApiCalls: 100,
    maxExports: 5,
    advancedFeatures: false,
    prioritySupport: false,
    customBranding: false,
    apiAccess: false,
    sso: false,
    auditLogs: false,
    customIntegrations: false,
  },
  basic: {
    maxDocuments: 100,
    maxStorage: 1000,
    maxUsers: 5,
    maxApiCalls: 1000,
    maxExports: 50,
    advancedFeatures: false,
    prioritySupport: false,
    customBranding: false,
    apiAccess: false,
    sso: false,
    auditLogs: false,
    customIntegrations: false,
  },
  standard: {
    maxDocuments: 1000,
    maxStorage: 10000,
    maxUsers: 25,
    maxApiCalls: 10000,
    maxExports: 500,
    advancedFeatures: true,
    prioritySupport: false,
    customBranding: false,
    apiAccess: true,
    sso: false,
    auditLogs: true,
    customIntegrations: false,
  },
  pro: {
    maxDocuments: 10000,
    maxStorage: 100000,
    maxUsers: 100,
    maxApiCalls: 100000,
    maxExports: 5000,
    advancedFeatures: true,
    prioritySupport: true,
    customBranding: true,
    apiAccess: true,
    sso: true,
    auditLogs: true,
    customIntegrations: true,
  },
  enterprise: {
    maxDocuments: -1, // unlimited
    maxStorage: -1, // unlimited
    maxUsers: -1, // unlimited
    maxApiCalls: -1, // unlimited
    maxExports: -1, // unlimited
    advancedFeatures: true,
    prioritySupport: true,
    customBranding: true,
    apiAccess: true,
    sso: true,
    auditLogs: true,
    customIntegrations: true,
  },
};

// Feature flags by subscription tier
export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, string[]> = {
  free: [
    'document_upload',
    'basic_search',
    'document_view',
    'basic_export',
  ],
  basic: [
    'document_upload',
    'basic_search',
    'document_view',
    'basic_export',
    'document_edit',
    'basic_analytics',
  ],
  standard: [
    'document_upload',
    'advanced_search',
    'document_view',
    'document_edit',
    'advanced_export',
    'advanced_analytics',
    'api_access',
    'audit_logs',
    'bulk_operations',
    'workflow_automation',
  ],
  pro: [
    'document_upload',
    'advanced_search',
    'document_view',
    'document_edit',
    'advanced_export',
    'advanced_analytics',
    'api_access',
    'audit_logs',
    'bulk_operations',
    'workflow_automation',
    'custom_branding',
    'priority_support',
    'sso',
    'custom_integrations',
    'advanced_security',
  ],
  enterprise: [
    'document_upload',
    'advanced_search',
    'document_view',
    'document_edit',
    'advanced_export',
    'advanced_analytics',
    'api_access',
    'audit_logs',
    'bulk_operations',
    'workflow_automation',
    'custom_branding',
    'priority_support',
    'sso',
    'custom_integrations',
    'advanced_security',
    'unlimited_storage',
    'unlimited_users',
    'dedicated_support',
    'custom_development',
  ],
};

// Subscription middleware
export const subscriptionMiddleware: Middleware = (store) => (next) => (action) => {
  const state = store.getState() as RootState;
  const subscription = state.auth?.user?.subscription;
  
  if (!subscription || !subscription.isActive) {
    // Handle actions that require active subscription
    if (requiresSubscription(action.type)) {
      return next({
        type: 'subscription/insufficient',
        payload: {
          action: action.type,
          message: 'Active subscription required',
        },
      });
    }
  }
  
  // Check feature access
  if (requiresFeature(action.type)) {
    const requiredFeature = getRequiredFeature(action.type);
    if (requiredFeature && !hasFeature(subscription, requiredFeature)) {
      return next({
        type: 'subscription/feature_denied',
        payload: {
          action: action.type,
          feature: requiredFeature,
          message: `Feature '${requiredFeature}' not available in your subscription`,
        },
      });
    }
  }
  
  // Check limits
  if (hasLimit(action.type)) {
    const limit = getLimit(action.type);
    if (limit && !checkLimit(state, subscription, limit)) {
      return next({
        type: 'subscription/limit_exceeded',
        payload: {
          action: action.type,
          limit,
          message: `Limit exceeded for ${limit}`,
        },
      });
    }
  }
  
  return next(action);
};

// Helper functions
const requiresSubscription = (actionType: string): boolean => {
  const protectedActions = [
    'documents/upload',
    'documents/create',
    'documents/update',
    'documents/delete',
    'documents/export',
    'analytics/get',
    'users/invite',
  ];
  
  return protectedActions.some(action => actionType.includes(action));
};

const requiresFeature = (actionType: string): boolean => {
  const featureActions = [
    'documents/advanced_search',
    'documents/bulk_operations',
    'analytics/advanced',
    'workflow/automation',
    'integrations/custom',
    'branding/custom',
  ];
  
  return featureActions.some(action => actionType.includes(action));
};

const getRequiredFeature = (actionType: string): string | null => {
  const featureMap: Record<string, string> = {
    'documents/advanced_search': 'advanced_search',
    'documents/bulk_operations': 'bulk_operations',
    'analytics/advanced': 'advanced_analytics',
    'workflow/automation': 'workflow_automation',
    'integrations/custom': 'custom_integrations',
    'branding/custom': 'custom_branding',
  };
  
  for (const [action, feature] of Object.entries(featureMap)) {
    if (actionType.includes(action)) {
      return feature;
    }
  }
  
  return null;
};

const hasFeature = (subscription: Subscription | null, feature: string): boolean => {
  if (!subscription) return false;
  return subscription.features.includes(feature);
};

const hasLimit = (actionType: string): boolean => {
  const limitActions = [
    'documents/upload',
    'documents/create',
    'users/invite',
    'exports/create',
    'api/call',
  ];
  
  return limitActions.some(action => actionType.includes(action));
};

const getLimit = (actionType: string): string | null => {
  const limitMap: Record<string, string> = {
    'documents/upload': 'maxDocuments',
    'documents/create': 'maxDocuments',
    'users/invite': 'maxUsers',
    'exports/create': 'maxExports',
    'api/call': 'maxApiCalls',
  };
  
  for (const [action, limit] of Object.entries(limitMap)) {
    if (actionType.includes(action)) {
      return limit;
    }
  }
  
  return null;
};

const checkLimit = (state: RootState, subscription: Subscription, limit: string): boolean => {
  const limits = SUBSCRIPTION_LIMITS[subscription.tier];
  const limitValue = limits[limit as keyof SubscriptionLimits];
  
  if (limitValue === -1) return true; // unlimited
  
  // Get current usage from state
  const currentUsage = getCurrentUsage(state, limit);
  
  return currentUsage < limitValue;
};

const getCurrentUsage = (state: RootState, limit: string): number => {
  switch (limit) {
    case 'maxDocuments':
      return state.documents?.documents?.length || 0;
    case 'maxUsers':
      return state.users?.users?.length || 0;
    case 'maxExports':
      return state.exports?.exports?.length || 0;
    case 'maxApiCalls':
      return state.api?.calls?.length || 0;
    default:
      return 0;
  }
};

// Selectors for subscription state
export const selectSubscription = (state: RootState) => state.auth?.user?.subscription;

export const selectSubscriptionTier = createSelector(
  [selectSubscription],
  (subscription) => subscription?.tier || 'free'
);

export const selectSubscriptionLimits = createSelector(
  [selectSubscriptionTier],
  (tier) => SUBSCRIPTION_LIMITS[tier]
);

export const selectSubscriptionFeatures = createSelector(
  [selectSubscriptionTier],
  (tier) => SUBSCRIPTION_FEATURES[tier]
);

export const selectHasFeature = createSelector(
  [selectSubscription, (state: RootState, feature: string) => feature],
  (subscription, feature) => subscription?.features?.includes(feature) || false
);

export const selectCanAccessFeature = createSelector(
  [selectSubscriptionFeatures, (state: RootState, feature: string) => feature],
  (features, feature) => features.includes(feature)
);

export const selectUsageStats = createSelector(
  [selectSubscriptionLimits, (state: RootState) => state],
  (limits, state) => ({
    documents: {
      current: state.documents?.documents?.length || 0,
      limit: limits.maxDocuments,
      percentage: limits.maxDocuments === -1 ? 0 : 
        ((state.documents?.documents?.length || 0) / limits.maxDocuments) * 100,
    },
    users: {
      current: state.users?.users?.length || 0,
      limit: limits.maxUsers,
      percentage: limits.maxUsers === -1 ? 0 : 
        ((state.users?.users?.length || 0) / limits.maxUsers) * 100,
    },
    storage: {
      current: state.storage?.used || 0,
      limit: limits.maxStorage,
      percentage: limits.maxStorage === -1 ? 0 : 
        (state.storage?.used || 0) / limits.maxStorage * 100,
    },
  })
);

// HOC for subscription-based component access
export const withSubscription = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requiredTier?: SubscriptionTier;
    requiredFeature?: string;
    fallback?: React.ComponentType<P>;
    upgradePrompt?: React.ComponentType<P>;
  }
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const subscription = useAppSelector(selectSubscription);
    const hasFeature = useAppSelector(state => 
      selectHasFeature(state, options.requiredFeature || '')
    );
    
    // Check tier requirement
    if (options.requiredTier && subscription) {
      const tierOrder = ['free', 'basic', 'standard', 'pro', 'enterprise'];
      const currentTierIndex = tierOrder.indexOf(subscription.tier);
      const requiredTierIndex = tierOrder.indexOf(options.requiredTier);
      
      if (currentTierIndex < requiredTierIndex) {
        if (options.upgradePrompt) {
          return <options.upgradePrompt {...props} ref={ref} />;
        }
        return null;
      }
    }
    
    // Check feature requirement
    if (options.requiredFeature && !hasFeature) {
      if (options.upgradePrompt) {
        return <options.upgradePrompt {...props} ref={ref} />;
      }
      return null;
    }
    
    // Check if subscription is active
    if (!subscription?.isActive) {
      if (options.fallback) {
        return <options.fallback {...props} ref={ref} />;
      }
      return null;
    }
    
    return <Component {...props} ref={ref} />;
  });
};

// Hook for subscription access
export const useSubscription = () => {
  const subscription = useAppSelector(selectSubscription);
  const limits = useAppSelector(selectSubscriptionLimits);
  const features = useAppSelector(selectSubscriptionFeatures);
  const usageStats = useAppSelector(selectUsageStats);
  
  const hasFeature = useCallback((feature: string) => {
    return features.includes(feature);
  }, [features]);
  
  const canAccessFeature = useCallback((feature: string) => {
    return hasFeature(feature);
  }, [hasFeature]);
  
  const checkLimit = useCallback((limit: keyof SubscriptionLimits) => {
    const limitValue = limits[limit];
    if (limitValue === -1) return true; // unlimited
    
    const currentUsage = getCurrentUsageFromStats(usageStats, limit);
    return currentUsage < limitValue;
  }, [limits, usageStats]);
  
  const getUsagePercentage = useCallback((limit: keyof SubscriptionLimits) => {
    const limitValue = limits[limit];
    if (limitValue === -1) return 0; // unlimited
    
    const currentUsage = getCurrentUsageFromStats(usageStats, limit);
    return (currentUsage / limitValue) * 100;
  }, [limits, usageStats]);
  
  return {
    subscription,
    limits,
    features,
    usageStats,
    hasFeature,
    canAccessFeature,
    checkLimit,
    getUsagePercentage,
    isActive: subscription?.isActive || false,
    tier: subscription?.tier || 'free',
  };
};

// Helper function to get current usage from stats
const getCurrentUsageFromStats = (usageStats: any, limit: keyof SubscriptionLimits): number => {
  switch (limit) {
    case 'maxDocuments':
      return usageStats.documents.current;
    case 'maxUsers':
      return usageStats.users.current;
    case 'maxStorage':
      return usageStats.storage.current;
    default:
      return 0;
  }
};
