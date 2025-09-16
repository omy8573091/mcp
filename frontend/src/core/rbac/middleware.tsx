'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useRBAC } from './context';
import {
  Permission,
  Feature,
  SubscriptionTier,
  UserRole,
} from './types';

// Route protection middleware
export interface RouteProtectionProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredFeatures?: Feature[];
  requiredSubscription?: SubscriptionTier;
  requiredRole?: UserRole;
  redirectTo?: string;
  fallbackComponent?: React.ComponentType;
  showUpgrade?: boolean;
}

export const RouteProtection: React.FC<RouteProtectionProps> = ({
  children,
  requiredPermissions = [],
  requiredFeatures = [],
  requiredSubscription,
  requiredRole,
  redirectTo = '/',
  fallbackComponent: FallbackComponent,
  showUpgrade = true,
}) => {
  const { canAccess, user } = useRBAC();
  const router = useRouter();

  const hasAccess = canAccess({
    requiredPermissions,
    requiredFeatures,
    requiredSubscription,
    requiredRole,
  });

  React.useEffect(() => {
    if (!hasAccess && redirectTo) {
      router.push(redirectTo);
    }
  }, [hasAccess, redirectTo, router]);

  if (!hasAccess) {
    if (FallbackComponent) {
      return <FallbackComponent />;
    }

    if (showUpgrade) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Access Restricted
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have permission to access this page. Please upgrade your subscription or contact your administrator.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/upgrade')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade Subscription
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
};

// Higher-order component for route protection
export function withRouteProtection<P extends object>(
  Component: React.ComponentType<P>,
  protectionConfig: Omit<RouteProtectionProps, 'children'>
) {
  const ProtectedComponent: React.FC<P> = (props) => (
    <RouteProtection {...protectionConfig}>
      <Component {...props} />
    </RouteProtection>
  );

  ProtectedComponent.displayName = `withRouteProtection(${Component.displayName || Component.name})`;

  return ProtectedComponent;
}

// Hook for checking route access
export const useRouteAccess = (config: {
  requiredPermissions?: Permission[];
  requiredFeatures?: Feature[];
  requiredSubscription?: SubscriptionTier;
  requiredRole?: UserRole;
}) => {
  const { canAccess } = useRBAC();

  return canAccess(config);
};

// Route guard component for Next.js pages
export const PageGuard: React.FC<{
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredFeatures?: Feature[];
  requiredSubscription?: SubscriptionTier;
  requiredRole?: UserRole;
  loadingComponent?: React.ComponentType;
}> = ({
  children,
  requiredPermissions = [],
  requiredFeatures = [],
  requiredSubscription,
  requiredRole,
  loadingComponent: LoadingComponent,
}) => {
  const { canAccess, user } = useRBAC();

  // Show loading while user data is being fetched
  if (!user) {
    return LoadingComponent ? <LoadingComponent /> : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasAccess = canAccess({
    requiredPermissions,
    requiredFeatures,
    requiredSubscription,
    requiredRole,
  });

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have the required permissions to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Subscription-based route protection
export const SubscriptionRoute: React.FC<{
  children: React.ReactNode;
  tier: SubscriptionTier;
  fallbackComponent?: React.ComponentType;
}> = ({ children, tier, fallbackComponent: FallbackComponent }) => {
  const { hasSubscription } = useRBAC();

  if (!hasSubscription(tier)) {
    return FallbackComponent ? <FallbackComponent /> : (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Upgrade Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This feature requires a {tier} subscription or higher.
          </p>
          <button
            onClick={() => window.location.href = '/upgrade'}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upgrade to {tier}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Role-based route protection
export const RoleRoute: React.FC<{
  children: React.ReactNode;
  role: UserRole;
  fallbackComponent?: React.ComponentType;
}> = ({ children, role, fallbackComponent: FallbackComponent }) => {
  const { hasRole } = useRBAC();

  if (!hasRole(role)) {
    return FallbackComponent ? <FallbackComponent /> : (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Insufficient Permissions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This page requires {role} role or higher.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Feature-based route protection
export const FeatureRoute: React.FC<{
  children: React.ReactNode;
  feature: Feature;
  fallbackComponent?: React.ComponentType;
}> = ({ children, feature, fallbackComponent: FallbackComponent }) => {
  const { hasFeature } = useRBAC();

  if (!hasFeature(feature)) {
    return FallbackComponent ? <FallbackComponent /> : (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Feature Not Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The {feature.replace(/_/g, ' ')} feature is not available in your current plan.
          </p>
          <button
            onClick={() => window.location.href = '/upgrade'}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
