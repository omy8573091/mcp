'use client';

import React from 'react';
import { useSubscription } from '../hooks';
import { UpgradePrompt } from './UpgradePrompt';

interface FeatureGateProps {
  children: React.ReactNode;
  feature: string;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  children,
  feature,
  fallback,
  showUpgradePrompt = true,
}) => {
  const { canAccessFeature } = useSubscription();
  
  if (!canAccessFeature(feature)) {
    if (showUpgradePrompt) {
      return <UpgradePrompt requiredFeature={feature} />;
    }
    
    return <>{fallback || null}</>;
  }
  
  return <>{children}</>;
};

// HOC for feature-based component access
export const withFeature = <P extends object>(
  Component: React.ComponentType<P>,
  feature: string,
  options?: {
    fallback?: React.ComponentType<P>;
    showUpgradePrompt?: boolean;
  }
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <FeatureGate
      feature={feature}
      fallback={options?.fallback ? <options.fallback {...props} ref={ref} /> : null}
      showUpgradePrompt={options?.showUpgradePrompt}
    >
      <Component {...props} ref={ref} />
    </FeatureGate>
  ));
};
