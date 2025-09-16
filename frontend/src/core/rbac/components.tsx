'use client';

import React from 'react';
import { useRBAC } from './context';
import {
  ProtectedComponentProps,
  FeatureGateProps,
  PermissionGateProps,
  SubscriptionGateProps,
  RoleGateProps,
  Permission,
  Feature,
  UserRole,
  SubscriptionTier,
} from './types';
import { cn } from '../utils';

// Upgrade prompt component
const UpgradePrompt: React.FC<{
  message?: string;
  showUpgrade?: boolean;
  className?: string;
}> = ({ message, showUpgrade = true, className }) => {
  if (!showUpgrade) return null;

  return (
    <div className={cn(
      'flex items-center justify-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800',
      className
    )}>
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Upgrade Required
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {message || 'This feature requires a higher subscription tier.'}
        </p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

// Protected component wrapper
export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  children,
  requiredPermissions = [],
  requiredFeatures = [],
  requiredSubscription,
  requiredRole,
  fallbackComponent: FallbackComponent,
  fallbackMessage,
  showUpgrade = true,
  className,
}) => {
  const { canAccess } = useRBAC();

  const hasAccess = canAccess({
    requiredPermissions,
    requiredFeatures,
    requiredSubscription,
    requiredRole,
  });

  if (hasAccess) {
    return <>{children}</>;
  }

  if (FallbackComponent) {
    return <FallbackComponent />;
  }

  return (
    <UpgradePrompt
      message={fallbackMessage}
      showUpgrade={showUpgrade}
      className={className}
    />
  );
};

// Feature gate component
export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgrade = true,
}) => {
  const { hasFeature } = useRBAC();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <UpgradePrompt
      message={`The ${feature.replace(/_/g, ' ')} feature is not available in your current plan.`}
      showUpgrade={showUpgrade}
    />
  );
};

// Permission gate component
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  children,
  fallback,
  showUpgrade = true,
}) => {
  const { hasPermission } = useRBAC();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <UpgradePrompt
      message={`You don't have permission to ${permission.replace(/:/g, ' ')}.`}
      showUpgrade={showUpgrade}
    />
  );
};

// Subscription gate component
export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  tier,
  children,
  fallback,
  showUpgrade = true,
}) => {
  const { hasSubscription } = useRBAC();

  if (hasSubscription(tier)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <UpgradePrompt
      message={`This feature requires a ${tier} subscription or higher.`}
      showUpgrade={showUpgrade}
    />
  );
};

// Role gate component
export const RoleGate: React.FC<RoleGateProps> = ({
  role,
  children,
  fallback,
  showUpgrade = true,
}) => {
  const { hasRole } = useRBAC();

  if (hasRole(role)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <UpgradePrompt
      message={`This feature requires ${role} role or higher.`}
      showUpgrade={showUpgrade}
    />
  );
};

// Component access wrapper with multiple criteria
export const AccessGate: React.FC<{
  permissions?: Permission[];
  features?: Feature[];
  subscription?: SubscriptionTier;
  role?: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
  className?: string;
}> = ({
  permissions = [],
  features = [],
  subscription,
  role,
  children,
  fallback,
  showUpgrade = true,
  className,
}) => {
  return (
    <ProtectedComponent
      requiredPermissions={permissions}
      requiredFeatures={features}
      requiredSubscription={subscription}
      requiredRole={role}
      fallbackComponent={fallback ? () => <>{fallback}</> : undefined}
      showUpgrade={showUpgrade}
      className={className}
    >
      {children}
    </ProtectedComponent>
  );
};

// Conditional render based on access
export const ConditionalRender: React.FC<{
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ condition, children, fallback }) => {
  if (condition) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
};

// Access-aware button component
export const AccessButton: React.FC<{
  requiredPermissions?: Permission[];
  requiredFeatures?: Feature[];
  requiredSubscription?: SubscriptionTier;
  requiredRole?: UserRole;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}> = ({
  requiredPermissions = [],
  requiredFeatures = [],
  requiredSubscription,
  requiredRole,
  children,
  disabled = false,
  className,
  onClick,
  ...props
}) => {
  const { canAccess } = useRBAC();

  const hasAccess = canAccess({
    requiredPermissions,
    requiredFeatures,
    requiredSubscription,
    requiredRole,
  });

  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg transition-colors',
        {
          'bg-gray-300 text-gray-500 cursor-not-allowed': !hasAccess || disabled,
          'bg-blue-600 text-white hover:bg-blue-700': hasAccess && !disabled,
        },
        className
      )}
      disabled={!hasAccess || disabled}
      onClick={hasAccess ? onClick : undefined}
      {...props}
    >
      {children}
    </button>
  );
};

// Access-aware link component
export const AccessLink: React.FC<{
  requiredPermissions?: Permission[];
  requiredFeatures?: Feature[];
  requiredSubscription?: SubscriptionTier;
  requiredRole?: UserRole;
  children: React.ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}> = ({
  requiredPermissions = [],
  requiredFeatures = [],
  requiredSubscription,
  requiredRole,
  children,
  href,
  className,
  onClick,
  ...props
}) => {
  const { canAccess } = useRBAC();

  const hasAccess = canAccess({
    requiredPermissions,
    requiredFeatures,
    requiredSubscription,
    requiredRole,
  });

  if (!hasAccess) {
    return (
      <span className={cn('text-gray-400 cursor-not-allowed', className)}>
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      className={cn('text-blue-600 hover:text-blue-700', className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </a>
  );
};

// Access indicator component
export const AccessIndicator: React.FC<{
  requiredPermissions?: Permission[];
  requiredFeatures?: Feature[];
  requiredSubscription?: SubscriptionTier;
  requiredRole?: UserRole;
  className?: string;
}> = ({
  requiredPermissions = [],
  requiredFeatures = [],
  requiredSubscription,
  requiredRole,
  className,
}) => {
  const { canAccess } = useRBAC();

  const hasAccess = canAccess({
    requiredPermissions,
    requiredFeatures,
    requiredSubscription,
    requiredRole,
  });

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          hasAccess ? 'bg-green-500' : 'bg-red-500'
        )}
      />
      <span className={cn(
        'text-sm',
        hasAccess ? 'text-green-600' : 'text-red-600'
      )}>
        {hasAccess ? 'Access Granted' : 'Access Denied'}
      </span>
    </div>
  );
};

// Export all components
export {
  UpgradePrompt,
};
