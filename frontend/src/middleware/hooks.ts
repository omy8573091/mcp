import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { RootState, AppDispatch } from './store';

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Middleware-specific hooks
export const useSubscription = () => {
  const subscription = useAppSelector(state => state.auth?.user?.subscription);
  const limits = useAppSelector(state => state.subscription?.limits);
  const features = useAppSelector(state => state.subscription?.features);
  
  const hasFeature = (feature: string) => {
    return features?.includes(feature) || false;
  };
  
  const canAccessFeature = (feature: string) => {
    return hasFeature(feature);
  };
  
  const checkLimit = (limit: string) => {
    const limitValue = limits?.[limit];
    if (limitValue === -1) return true; // unlimited
    
    // Get current usage from state
    const currentUsage = getCurrentUsage(limit);
    return currentUsage < limitValue;
  };
  
  return {
    subscription,
    limits,
    features,
    hasFeature,
    canAccessFeature,
    checkLimit,
    isActive: subscription?.isActive || false,
    tier: subscription?.tier || 'free',
  };
};

// Get current usage for limit checking
const getCurrentUsage = (limit: string): number => {
  // This would be implemented based on your state structure
  switch (limit) {
    case 'maxDocuments':
      return 0; // Get from state
    case 'maxUsers':
      return 0; // Get from state
    case 'maxStorage':
      return 0; // Get from state
    default:
      return 0;
  }
};
