// RBAC Types and Interfaces
// Role-Based Access Control system for subscription and role-based component access

export type SubscriptionTier = 'free' | 'basic' | 'standard' | 'pro' | 'enterprise';

export type UserRole = 
  | 'admin' 
  | 'manager' 
  | 'analyst' 
  | 'viewer' 
  | 'guest';

export type Permission = 
  // Document permissions
  | 'documents:read'
  | 'documents:write'
  | 'documents:delete'
  | 'documents:share'
  | 'documents:export'
  
  // Upload permissions
  | 'upload:files'
  | 'upload:bulk'
  | 'upload:api'
  
  // Search permissions
  | 'search:basic'
  | 'search:advanced'
  | 'search:ai'
  | 'search:history'
  
  // Analytics permissions
  | 'analytics:view'
  | 'analytics:export'
  | 'analytics:custom'
  
  // Compliance permissions
  | 'compliance:view'
  | 'compliance:manage'
  | 'compliance:reports'
  
  // Risk permissions
  | 'risk:view'
  | 'risk:assess'
  | 'risk:manage'
  
  // User management permissions
  | 'users:view'
  | 'users:manage'
  | 'users:invite'
  
  // Settings permissions
  | 'settings:view'
  | 'settings:manage'
  | 'settings:integrations'
  
  // API permissions
  | 'api:read'
  | 'api:write'
  | 'api:admin';

export type Feature = 
  | 'document_upload'
  | 'ai_search'
  | 'advanced_analytics'
  | 'compliance_reports'
  | 'risk_assessment'
  | 'user_management'
  | 'api_access'
  | 'custom_branding'
  | 'priority_support'
  | 'sso_integration'
  | 'audit_logs'
  | 'data_export'
  | 'bulk_operations'
  | 'workflow_automation'
  | 'custom_fields';

export interface SubscriptionLimits {
  maxDocuments: number;
  maxUsers: number;
  maxStorage: number; // in GB
  maxApiCalls: number;
  maxExports: number;
  retentionDays: number;
  features: Feature[];
}

export interface UserPermissions {
  userId: string;
  role: UserRole;
  subscription: SubscriptionTier;
  permissions: Permission[];
  features: Feature[];
  limits: SubscriptionLimits;
  customPermissions?: Permission[];
  expiresAt?: Date;
}

export interface ComponentAccess {
  component: string;
  requiredPermissions: Permission[];
  requiredFeatures: Feature[];
  requiredSubscription?: SubscriptionTier;
  requiredRole?: UserRole;
  fallbackComponent?: React.ComponentType;
  fallbackMessage?: string;
}

export interface RBACContextType {
  user: UserPermissions | null;
  hasPermission: (permission: Permission) => boolean;
  hasFeature: (feature: Feature) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasSubscription: (tier: SubscriptionTier) => boolean;
  canAccess: (access: ComponentAccess) => boolean;
  isWithinLimits: (limit: keyof SubscriptionLimits, current: number) => boolean;
  getRemainingLimit: (limit: keyof SubscriptionLimits, current: number) => number;
  checkAccess: (component: string) => boolean;
}

export interface RBACProviderProps {
  children: React.ReactNode;
  user?: UserPermissions | null;
}

export interface ProtectedComponentProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredFeatures?: Feature[];
  requiredSubscription?: SubscriptionTier;
  requiredRole?: UserRole;
  fallbackComponent?: React.ComponentType;
  fallbackMessage?: string;
  showUpgrade?: boolean;
  className?: string;
}

export interface FeatureGateProps {
  feature: Feature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export interface PermissionGateProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export interface SubscriptionGateProps {
  tier: SubscriptionTier;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export interface RoleGateProps {
  role: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

// Subscription tier hierarchy (higher number = higher tier)
export const SUBSCRIPTION_HIERARCHY: Record<SubscriptionTier, number> = {
  free: 0,
  basic: 1,
  standard: 2,
  pro: 3,
  enterprise: 4,
};

// Role hierarchy (higher number = higher role)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  viewer: 1,
  analyst: 2,
  manager: 3,
  admin: 4,
};

// Default subscription limits
export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxDocuments: 10,
    maxUsers: 1,
    maxStorage: 1,
    maxApiCalls: 100,
    maxExports: 5,
    retentionDays: 30,
    features: ['document_upload', 'ai_search'],
  },
  basic: {
    maxDocuments: 100,
    maxUsers: 5,
    maxStorage: 10,
    maxApiCalls: 1000,
    maxExports: 50,
    retentionDays: 90,
    features: [
      'document_upload',
      'ai_search',
      'advanced_analytics',
      'compliance_reports',
      'data_export',
    ],
  },
  standard: {
    maxDocuments: 1000,
    maxUsers: 25,
    maxStorage: 100,
    maxApiCalls: 10000,
    maxExports: 500,
    retentionDays: 365,
    features: [
      'document_upload',
      'ai_search',
      'advanced_analytics',
      'compliance_reports',
      'risk_assessment',
      'data_export',
      'bulk_operations',
      'custom_fields',
    ],
  },
  pro: {
    maxDocuments: 10000,
    maxUsers: 100,
    maxStorage: 1000,
    maxApiCalls: 100000,
    maxExports: 5000,
    retentionDays: 1095, // 3 years
    features: [
      'document_upload',
      'ai_search',
      'advanced_analytics',
      'compliance_reports',
      'risk_assessment',
      'user_management',
      'api_access',
      'data_export',
      'bulk_operations',
      'custom_fields',
      'workflow_automation',
      'audit_logs',
    ],
  },
  enterprise: {
    maxDocuments: -1, // unlimited
    maxUsers: -1, // unlimited
    maxStorage: -1, // unlimited
    maxApiCalls: -1, // unlimited
    maxExports: -1, // unlimited
    retentionDays: -1, // unlimited
    features: [
      'document_upload',
      'ai_search',
      'advanced_analytics',
      'compliance_reports',
      'risk_assessment',
      'user_management',
      'api_access',
      'custom_branding',
      'priority_support',
      'sso_integration',
      'data_export',
      'bulk_operations',
      'custom_fields',
      'workflow_automation',
      'audit_logs',
    ],
  },
};

// Role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  guest: [
    'documents:read',
    'search:basic',
  ],
  viewer: [
    'documents:read',
    'search:basic',
    'analytics:view',
    'compliance:view',
    'risk:view',
  ],
  analyst: [
    'documents:read',
    'documents:write',
    'upload:files',
    'search:basic',
    'search:advanced',
    'search:ai',
    'analytics:view',
    'analytics:export',
    'compliance:view',
    'compliance:reports',
    'risk:view',
    'risk:assess',
    'data_export',
  ],
  manager: [
    'documents:read',
    'documents:write',
    'documents:share',
    'upload:files',
    'upload:bulk',
    'search:basic',
    'search:advanced',
    'search:ai',
    'search:history',
    'analytics:view',
    'analytics:export',
    'analytics:custom',
    'compliance:view',
    'compliance:manage',
    'compliance:reports',
    'risk:view',
    'risk:assess',
    'risk:manage',
    'users:view',
    'users:invite',
    'settings:view',
    'data_export',
    'bulk_operations',
  ],
  admin: [
    'documents:read',
    'documents:write',
    'documents:delete',
    'documents:share',
    'documents:export',
    'upload:files',
    'upload:bulk',
    'upload:api',
    'search:basic',
    'search:advanced',
    'search:ai',
    'search:history',
    'analytics:view',
    'analytics:export',
    'analytics:custom',
    'compliance:view',
    'compliance:manage',
    'compliance:reports',
    'risk:view',
    'risk:assess',
    'risk:manage',
    'users:view',
    'users:manage',
    'users:invite',
    'settings:view',
    'settings:manage',
    'settings:integrations',
    'api:read',
    'api:write',
    'api:admin',
    'data_export',
    'bulk_operations',
    'workflow_automation',
    'audit_logs',
  ],
};
