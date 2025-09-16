// RBAC System Exports
// Role-Based Access Control system for subscription and role-based component access

// Types
export type {
  SubscriptionTier,
  UserRole,
  Permission,
  Feature,
  SubscriptionLimits,
  UserPermissions,
  ComponentAccess,
  RBACContextType,
  RBACProviderProps,
  ProtectedComponentProps,
  FeatureGateProps,
  PermissionGateProps,
  SubscriptionGateProps,
  RoleGateProps,
} from './types';

// Constants
export {
  SUBSCRIPTION_HIERARCHY,
  ROLE_HIERARCHY,
  SUBSCRIPTION_LIMITS,
  ROLE_PERMISSIONS,
} from './types';

// Context and Hooks
export {
  RBACProvider,
  useRBAC,
  usePermission,
  useFeature,
  useRole,
  useSubscription,
  useAccess,
  useLimits,
} from './context';

// Components
export {
  ProtectedComponent,
  FeatureGate,
  PermissionGate,
  SubscriptionGate,
  RoleGate,
  AccessGate,
  ConditionalRender,
  AccessButton,
  AccessLink,
  AccessIndicator,
  UpgradePrompt,
} from './components';

// Middleware
export {
  RouteProtection,
  withRouteProtection,
  useRouteAccess,
  PageGuard,
  SubscriptionRoute,
  RoleRoute,
  FeatureRoute,
} from './middleware';

// Utility functions
export const createUserPermissions = (
  userId: string,
  role: UserRole,
  subscription: SubscriptionTier,
  customPermissions?: Permission[],
  customFeatures?: Feature[]
): UserPermissions => {
  const basePermissions = ROLE_PERMISSIONS[role] || [];
  const baseFeatures = SUBSCRIPTION_LIMITS[subscription]?.features || [];
  
  return {
    userId,
    role,
    subscription,
    permissions: [...basePermissions, ...(customPermissions || [])],
    features: [...baseFeatures, ...(customFeatures || [])],
    limits: SUBSCRIPTION_LIMITS[subscription],
    customPermissions,
  };
};

export const checkPermission = (
  userPermissions: UserPermissions,
  permission: Permission
): boolean => {
  return userPermissions.permissions.includes(permission) ||
         userPermissions.customPermissions?.includes(permission) ||
         false;
};

export const checkFeature = (
  userPermissions: UserPermissions,
  feature: Feature
): boolean => {
  return userPermissions.features.includes(feature);
};

export const checkSubscription = (
  userPermissions: UserPermissions,
  requiredTier: SubscriptionTier
): boolean => {
  const userTierLevel = SUBSCRIPTION_HIERARCHY[userPermissions.subscription];
  const requiredTierLevel = SUBSCRIPTION_HIERARCHY[requiredTier];
  return userTierLevel >= requiredTierLevel;
};

export const checkRole = (
  userPermissions: UserPermissions,
  requiredRole: UserRole
): boolean => {
  const userRoleLevel = ROLE_HIERARCHY[userPermissions.role];
  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];
  return userRoleLevel >= requiredRoleLevel;
};

export const canAccessComponent = (
  userPermissions: UserPermissions,
  access: {
    requiredPermissions?: Permission[];
    requiredFeatures?: Feature[];
    requiredSubscription?: SubscriptionTier;
    requiredRole?: UserRole;
  }
): boolean => {
  // Check permissions
  if (access.requiredPermissions) {
    const hasAllPermissions = access.requiredPermissions.every(permission => 
      checkPermission(userPermissions, permission)
    );
    if (!hasAllPermissions) return false;
  }

  // Check features
  if (access.requiredFeatures) {
    const hasAllFeatures = access.requiredFeatures.every(feature => 
      checkFeature(userPermissions, feature)
    );
    if (!hasAllFeatures) return false;
  }

  // Check subscription
  if (access.requiredSubscription) {
    if (!checkSubscription(userPermissions, access.requiredSubscription)) return false;
  }

  // Check role
  if (access.requiredRole) {
    if (!checkRole(userPermissions, access.requiredRole)) return false;
  }

  return true;
};

// Mock user data for testing
export const mockUsers = {
  freeUser: createUserPermissions('1', 'viewer', 'free'),
  basicUser: createUserPermissions('2', 'analyst', 'basic'),
  standardUser: createUserPermissions('3', 'analyst', 'standard'),
  proUser: createUserPermissions('4', 'manager', 'pro'),
  enterpriseUser: createUserPermissions('5', 'admin', 'enterprise'),
};

// Default export
export default {
  // Types
  types: {
    SubscriptionTier: {} as SubscriptionTier,
    UserRole: {} as UserRole,
    Permission: {} as Permission,
    Feature: {} as Feature,
  },
  
  // Constants
  constants: {
    SUBSCRIPTION_HIERARCHY,
    ROLE_HIERARCHY,
    SUBSCRIPTION_LIMITS,
    ROLE_PERMISSIONS,
  },
  
  // Context
  context: {
    RBACProvider,
    useRBAC,
    usePermission,
    useFeature,
    useRole,
    useSubscription,
    useAccess,
    useLimits,
  },
  
  // Components
  components: {
    ProtectedComponent,
    FeatureGate,
    PermissionGate,
    SubscriptionGate,
    RoleGate,
    AccessGate,
    ConditionalRender,
    AccessButton,
    AccessLink,
    AccessIndicator,
    UpgradePrompt,
  },
  
  // Middleware
  middleware: {
    RouteProtection,
    withRouteProtection,
    useRouteAccess,
    PageGuard,
    SubscriptionRoute,
    RoleRoute,
    FeatureRoute,
  },
  
  // Utilities
  utils: {
    createUserPermissions,
    checkPermission,
    checkFeature,
    checkSubscription,
    checkRole,
    canAccessComponent,
    mockUsers,
  },
};
