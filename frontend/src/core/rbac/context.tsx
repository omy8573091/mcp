'use client';

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import {
  RBACContextType,
  UserPermissions,
  Permission,
  Feature,
  UserRole,
  SubscriptionTier,
  SUBSCRIPTION_LIMITS,
  ROLE_PERMISSIONS,
  SUBSCRIPTION_HIERARCHY,
  ROLE_HIERARCHY,
} from './types';

const RBACContext = createContext<RBACContextType | null>(null);

export interface RBACProviderProps {
  children: React.ReactNode;
  user?: UserPermissions | null;
}

export const RBACProvider: React.FC<RBACProviderProps> = ({ children, user }) => {
  const [currentUser, setCurrentUser] = useState<UserPermissions | null>(user || null);

  // Update user when prop changes
  useEffect(() => {
    setCurrentUser(user || null);
  }, [user]);

  // Check if user has a specific permission
  const hasPermission = useMemo(() => {
    return (permission: Permission): boolean => {
      if (!currentUser) return false;
      
      // Check if user has the permission directly
      if (currentUser.permissions.includes(permission)) return true;
      
      // Check if user has custom permissions
      if (currentUser.customPermissions?.includes(permission)) return true;
      
      // Check role-based permissions
      const rolePermissions = ROLE_PERMISSIONS[currentUser.role] || [];
      return rolePermissions.includes(permission);
    };
  }, [currentUser]);

  // Check if user has a specific feature
  const hasFeature = useMemo(() => {
    return (feature: Feature): boolean => {
      if (!currentUser) return false;
      
      // Check if user has the feature directly
      if (currentUser.features.includes(feature)) return true;
      
      // Check subscription-based features
      const subscriptionFeatures = SUBSCRIPTION_LIMITS[currentUser.subscription]?.features || [];
      return subscriptionFeatures.includes(feature);
    };
  }, [currentUser]);

  // Check if user has a specific role
  const hasRole = useMemo(() => {
    return (role: UserRole): boolean => {
      if (!currentUser) return false;
      return currentUser.role === role;
    };
  }, [currentUser]);

  // Check if user has a specific subscription tier or higher
  const hasSubscription = useMemo(() => {
    return (tier: SubscriptionTier): boolean => {
      if (!currentUser) return false;
      
      const userTierLevel = SUBSCRIPTION_HIERARCHY[currentUser.subscription];
      const requiredTierLevel = SUBSCRIPTION_HIERARCHY[tier];
      
      return userTierLevel >= requiredTierLevel;
    };
  }, [currentUser]);

  // Check if user can access a component based on multiple criteria
  const canAccess = useMemo(() => {
    return (access: {
      requiredPermissions?: Permission[];
      requiredFeatures?: Feature[];
      requiredSubscription?: SubscriptionTier;
      requiredRole?: UserRole;
    }): boolean => {
      if (!currentUser) return false;

      // Check permissions
      if (access.requiredPermissions) {
        const hasAllPermissions = access.requiredPermissions.every(permission => 
          hasPermission(permission)
        );
        if (!hasAllPermissions) return false;
      }

      // Check features
      if (access.requiredFeatures) {
        const hasAllFeatures = access.requiredFeatures.every(feature => 
          hasFeature(feature)
        );
        if (!hasAllFeatures) return false;
      }

      // Check subscription
      if (access.requiredSubscription) {
        if (!hasSubscription(access.requiredSubscription)) return false;
      }

      // Check role
      if (access.requiredRole) {
        const userRoleLevel = ROLE_HIERARCHY[currentUser.role];
        const requiredRoleLevel = ROLE_HIERARCHY[access.requiredRole];
        if (userRoleLevel < requiredRoleLevel) return false;
      }

      return true;
    };
  }, [currentUser, hasPermission, hasFeature, hasSubscription]);

  // Check if user is within limits
  const isWithinLimits = useMemo(() => {
    return (limit: keyof typeof SUBSCRIPTION_LIMITS.free, current: number): boolean => {
      if (!currentUser) return false;
      
      const userLimits = SUBSCRIPTION_LIMITS[currentUser.subscription];
      const limitValue = userLimits[limit];
      
      // -1 means unlimited
      if (limitValue === -1) return true;
      
      return current < limitValue;
    };
  }, [currentUser]);

  // Get remaining limit
  const getRemainingLimit = useMemo(() => {
    return (limit: keyof typeof SUBSCRIPTION_LIMITS.free, current: number): number => {
      if (!currentUser) return 0;
      
      const userLimits = SUBSCRIPTION_LIMITS[currentUser.subscription];
      const limitValue = userLimits[limit];
      
      // -1 means unlimited
      if (limitValue === -1) return Infinity;
      
      return Math.max(0, limitValue - current);
    };
  }, [currentUser]);

  // Check access for a specific component
  const checkAccess = useMemo(() => {
    return (component: string): boolean => {
      if (!currentUser) return false;
      
      // This can be extended with component-specific access rules
      // For now, return true if user exists
      return true;
    };
  }, [currentUser]);

  const contextValue: RBACContextType = useMemo(() => ({
    user: currentUser,
    hasPermission,
    hasFeature,
    hasRole,
    hasSubscription,
    canAccess,
    isWithinLimits,
    getRemainingLimit,
    checkAccess,
  }), [
    currentUser,
    hasPermission,
    hasFeature,
    hasRole,
    hasSubscription,
    canAccess,
    isWithinLimits,
    getRemainingLimit,
    checkAccess,
  ]);

  return (
    <RBACContext.Provider value={contextValue}>
      {children}
    </RBACContext.Provider>
  );
};

// Hook to use RBAC context
export const useRBAC = (): RBACContextType => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};

// Hook to check if user has permission
export const usePermission = (permission: Permission): boolean => {
  const { hasPermission } = useRBAC();
  return hasPermission(permission);
};

// Hook to check if user has feature
export const useFeature = (feature: Feature): boolean => {
  const { hasFeature } = useRBAC();
  return hasFeature(feature);
};

// Hook to check if user has role
export const useRole = (role: UserRole): boolean => {
  const { hasRole } = useRBAC();
  return hasRole(role);
};

// Hook to check if user has subscription
export const useSubscription = (tier: SubscriptionTier): boolean => {
  const { hasSubscription } = useRBAC();
  return hasSubscription(tier);
};

// Hook to check multiple access criteria
export const useAccess = (access: {
  requiredPermissions?: Permission[];
  requiredFeatures?: Feature[];
  requiredSubscription?: SubscriptionTier;
  requiredRole?: UserRole;
}): boolean => {
  const { canAccess } = useRBAC();
  return canAccess(access);
};

// Hook to check limits
export const useLimits = () => {
  const { isWithinLimits, getRemainingLimit } = useRBAC();
  return { isWithinLimits, getRemainingLimit };
};
