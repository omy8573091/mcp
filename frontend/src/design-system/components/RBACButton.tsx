'use client';

import React, { forwardRef } from 'react';
import { Button, ButtonProps, IconButton, IconButtonProps } from '@mui/material';
import { cn } from '../../core/utils';
import { 
  ProtectedComponent,
  FeatureGate,
  PermissionGate,
  SubscriptionGate,
  AccessButton,
  AccessIndicator,
} from '../../core/rbac/components';
import type { 
  BaseComponentProps, 
  A11yProps,
  Permission,
  Feature,
  SubscriptionTier,
  UserRole,
} from '../../core/types';

export interface RBACButtonProps extends Omit<ButtonProps, 'size'>, BaseComponentProps, A11yProps {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  loading?: boolean;
  iconOnly?: boolean;
  
  // RBAC Properties
  requiredPermissions?: Permission[];
  requiredFeatures?: Feature[];
  requiredSubscription?: SubscriptionTier;
  requiredRole?: UserRole;
  showUpgrade?: boolean;
  fallbackMessage?: string;
  showAccessIndicator?: boolean;
}

const RBACButton = forwardRef<HTMLButtonElement, RBACButtonProps>(({
  className,
  variant = 'contained',
  size = 'md',
  color = 'primary',
  loading = false,
  iconOnly = false,
  children,
  disabled,
  testId,
  
  // RBAC Properties
  requiredPermissions = [],
  requiredFeatures = [],
  requiredSubscription,
  requiredRole,
  showUpgrade = true,
  fallbackMessage,
  showAccessIndicator = false,
  
  ...props
}, ref) => {
  const getSizeProps = () => {
    switch (size) {
      case 'xs':
        return { size: 'small' as const, sx: { minWidth: iconOnly ? 24 : 'auto', height: 24 } };
      case 'sm':
        return { size: 'small' as const, sx: { minWidth: iconOnly ? 32 : 'auto', height: 32 } };
      case 'md':
        return { size: 'medium' as const, sx: { minWidth: iconOnly ? 40 : 'auto', height: 40 } };
      case 'lg':
        return { size: 'large' as const, sx: { minWidth: iconOnly ? 48 : 'auto', height: 48 } };
      case 'xl':
        return { size: 'large' as const, sx: { minWidth: iconOnly ? 56 : 'auto', height: 56 } };
      default:
        return { size: 'medium' as const };
    }
  };

  const ButtonComponent = (
    <Button
      ref={ref}
      className={cn(
        'grc-button',
        `grc-button--${variant}`,
        `grc-button--${size}`,
        `grc-button--${color}`,
        {
          'grc-button--loading': loading,
          'grc-button--icon-only': iconOnly,
        },
        className
      )}
      variant={variant}
      color={color}
      disabled={disabled || loading}
      data-testid={testId}
      {...getSizeProps()}
      {...props}
    >
      {loading && (
        <div className="grc-button__loading mr-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        </div>
      )}
      {children}
    </Button>
  );

  // If no RBAC requirements, return the button directly
  if (requiredPermissions.length === 0 && 
      requiredFeatures.length === 0 && 
      !requiredSubscription && 
      !requiredRole) {
    return (
      <div className="relative">
        {ButtonComponent}
        {showAccessIndicator && (
          <AccessIndicator
            className="absolute -top-1 -right-1"
            requiredPermissions={requiredPermissions}
            requiredFeatures={requiredFeatures}
            requiredSubscription={requiredSubscription}
            requiredRole={requiredRole}
          />
        )}
      </div>
    );
  }

  // Wrap with RBAC protection
  return (
    <ProtectedComponent
      requiredPermissions={requiredPermissions}
      requiredFeatures={requiredFeatures}
      requiredSubscription={requiredSubscription}
      requiredRole={requiredRole}
      showUpgrade={showUpgrade}
      fallbackMessage={fallbackMessage || 'This action requires additional permissions.'}
    >
      <div className="relative">
        {ButtonComponent}
        {showAccessIndicator && (
          <AccessIndicator
            className="absolute -top-1 -right-1"
            requiredPermissions={requiredPermissions}
            requiredFeatures={requiredFeatures}
            requiredSubscription={requiredSubscription}
            requiredRole={requiredRole}
          />
        )}
      </div>
    </ProtectedComponent>
  );
});

RBACButton.displayName = 'RBACButton';

// RBAC Icon Button Component
export interface RBACIconButtonProps extends Omit<IconButtonProps, 'size'>, BaseComponentProps, A11yProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  
  // RBAC Properties
  requiredPermissions?: Permission[];
  requiredFeatures?: Feature[];
  requiredSubscription?: SubscriptionTier;
  requiredRole?: UserRole;
  showUpgrade?: boolean;
  fallbackMessage?: string;
}

export const RBACIconButton = forwardRef<HTMLButtonElement, RBACIconButtonProps>(({
  className,
  size = 'md',
  color = 'primary',
  children,
  disabled,
  testId,
  
  // RBAC Properties
  requiredPermissions = [],
  requiredFeatures = [],
  requiredSubscription,
  requiredRole,
  showUpgrade = true,
  fallbackMessage,
  
  ...props
}, ref) => {
  const getSizeProps = () => {
    switch (size) {
      case 'xs':
        return { sx: { width: 24, height: 24 } };
      case 'sm':
        return { sx: { width: 32, height: 32 } };
      case 'md':
        return { sx: { width: 40, height: 40 } };
      case 'lg':
        return { sx: { width: 48, height: 48 } };
      case 'xl':
        return { sx: { width: 56, height: 56 } };
      default:
        return {};
    }
  };

  const IconButtonComponent = (
    <IconButton
      ref={ref}
      className={cn(
        'grc-icon-button',
        `grc-icon-button--${size}`,
        `grc-icon-button--${color}`,
        className
      )}
      color={color}
      disabled={disabled}
      data-testid={testId}
      {...getSizeProps()}
      {...props}
    >
      {children}
    </IconButton>
  );

  // If no RBAC requirements, return the icon button directly
  if (requiredPermissions.length === 0 && 
      requiredFeatures.length === 0 && 
      !requiredSubscription && 
      !requiredRole) {
    return IconButtonComponent;
  }

  // Wrap with RBAC protection
  return (
    <ProtectedComponent
      requiredPermissions={requiredPermissions}
      requiredFeatures={requiredFeatures}
      requiredSubscription={requiredSubscription}
      requiredRole={requiredRole}
      showUpgrade={showUpgrade}
      fallbackMessage={fallbackMessage || 'This action requires additional permissions.'}
    >
      {IconButtonComponent}
    </ProtectedComponent>
  );
});

RBACIconButton.displayName = 'RBACIconButton';

// Specialized RBAC Buttons for common actions

// Upload Button (requires upload permissions)
export const UploadButton: React.FC<RBACButtonProps> = (props) => {
  return (
    <RBACButton
      {...props}
      requiredPermissions={['upload:files']}
      requiredFeatures={['document_upload']}
      fallbackMessage="File upload requires upload permissions."
    />
  );
};

// Delete Button (requires delete permissions)
export const DeleteButton: React.FC<RBACButtonProps> = (props) => {
  return (
    <RBACButton
      {...props}
      variant="outlined"
      color="error"
      requiredPermissions={['documents:delete']}
      requiredRole="manager"
      fallbackMessage="Delete action requires manager role or higher."
    />
  );
};

// Export Button (requires export permissions)
export const ExportButton: React.FC<RBACButtonProps> = (props) => {
  return (
    <RBACButton
      {...props}
      requiredPermissions={['documents:export']}
      requiredFeatures={['data_export']}
      requiredSubscription="basic"
      fallbackMessage="Export functionality requires Basic subscription or higher."
    />
  );
};

// AI Search Button (requires AI features)
export const AISearchButton: React.FC<RBACButtonProps> = (props) => {
  return (
    <FeatureGate
      feature="ai_search"
      fallback={
        <RBACButton
          {...props}
          disabled
          variant="outlined"
          startIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
        >
          AI Search (Locked)
        </RBACButton>
      }
    >
      <RBACButton
        {...props}
        requiredFeatures={['ai_search']}
        requiredSubscription="pro"
        fallbackMessage="AI search requires Pro subscription or higher."
      />
    </FeatureGate>
  );
};

// Admin Button (requires admin role)
export const AdminButton: React.FC<RBACButtonProps> = (props) => {
  return (
    <RBACButton
      {...props}
      requiredRole="admin"
      fallbackMessage="This action requires admin privileges."
    />
  );
};

// Manager Button (requires manager role or higher)
export const ManagerButton: React.FC<RBACButtonProps> = (props) => {
  return (
    <RBACButton
      {...props}
      requiredRole="manager"
      fallbackMessage="This action requires manager role or higher."
    />
  );
};

// Pro Feature Button (requires Pro subscription)
export const ProFeatureButton: React.FC<RBACButtonProps> = (props) => {
  return (
    <RBACButton
      {...props}
      requiredSubscription="pro"
      fallbackMessage="This feature requires Pro subscription or higher."
    />
  );
};

// Enterprise Feature Button (requires Enterprise subscription)
export const EnterpriseFeatureButton: React.FC<RBACButtonProps> = (props) => {
  return (
    <RBACButton
      {...props}
      requiredSubscription="enterprise"
      fallbackMessage="This feature requires Enterprise subscription."
    />
  );
};

// Bulk Action Button (requires bulk operations feature)
export const BulkActionButton: React.FC<RBACButtonProps> = (props) => {
  return (
    <RBACButton
      {...props}
      requiredFeatures={['bulk_operations']}
      requiredSubscription="standard"
      fallbackMessage="Bulk operations require Standard subscription or higher."
    />
  );
};

// API Access Button (requires API permissions)
export const APIAccessButton: React.FC<RBACButtonProps> = (props) => {
  return (
    <RBACButton
      {...props}
      requiredPermissions={['api:read', 'api:write']}
      requiredFeatures={['api_access']}
      requiredSubscription="pro"
      fallbackMessage="API access requires Pro subscription or higher."
    />
  );
};

// Workflow Button (requires workflow automation)
export const WorkflowButton: React.FC<RBACButtonProps> = (props) => {
  return (
    <RBACButton
      {...props}
      requiredFeatures={['workflow_automation']}
      requiredSubscription="pro"
      fallbackMessage="Workflow automation requires Pro subscription or higher."
    />
  );
};

export default RBACButton;
