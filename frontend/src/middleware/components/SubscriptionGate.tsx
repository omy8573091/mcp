'use client';

import React from 'react';
import { useSubscription } from '../hooks';
import { SubscriptionTier } from '../subscriptionMiddleware';

interface SubscriptionGateProps {
  children: React.ReactNode;
  requiredTier?: SubscriptionTier;
  requiredFeature?: string;
  fallback?: React.ReactNode;
  upgradePrompt?: React.ReactNode;
}

export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  children,
  requiredTier,
  requiredFeature,
  fallback,
  upgradePrompt,
}) => {
  const { subscription, hasFeature, canAccessFeature, isActive } = useSubscription();
  
  // Check if subscription is active
  if (!isActive) {
    return <>{fallback || null}</>;
  }
  
  // Check tier requirement
  if (requiredTier && subscription) {
    const tierOrder = ['free', 'basic', 'standard', 'pro', 'enterprise'];
    const currentTierIndex = tierOrder.indexOf(subscription.tier);
    const requiredTierIndex = tierOrder.indexOf(requiredTier);
    
    if (currentTierIndex < requiredTierIndex) {
      return <>{upgradePrompt || null}</>;
    }
  }
  
  // Check feature requirement
  if (requiredFeature && !canAccessFeature(requiredFeature)) {
    return <>{upgradePrompt || null}</>;
  }
  
  return <>{children}</>;
};

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
  return React.forwardRef<any, P>((props, ref) => (
    <SubscriptionGate
      requiredTier={options.requiredTier}
      requiredFeature={options.requiredFeature}
      fallback={options.fallback ? <options.fallback {...props} ref={ref} /> : null}
      upgradePrompt={options.upgradePrompt ? <options.upgradePrompt {...props} ref={ref} /> : null}
    >
      <Component {...props} ref={ref} />
    </SubscriptionGate>
  ));
};
