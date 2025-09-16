'use client';

import React, { forwardRef } from 'react';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { cn } from '../../core/utils';
import type { BaseComponentProps, A11yProps } from '../../core/types';
import { ProtectedComponent } from '../../core/rbac/components';
import type { Permission, Feature, SubscriptionTier, UserRole } from '../../core/rbac/types';

export interface ButtonProps extends Omit<MuiButtonProps, 'color' | 'size'>, BaseComponentProps, A11yProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  tooltip?: string;
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
  
  // RBAC Properties
  requiredPermissions?: Permission[];
  requiredFeatures?: Feature[];
  requiredSubscription?: SubscriptionTier;
  requiredRole?: UserRole;
  showUpgrade?: boolean;
  fallbackMessage?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  tooltip,
  tooltipPlacement = 'top',
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
  const buttonElement = (
    <MuiButton
      ref={ref}
      className={cn(
        'grc-button',
        `grc-button--${variant}`,
        `grc-button--${size}`,
        {
          'grc-button--loading': loading,
          'grc-button--full-width': fullWidth,
        },
        className
      )}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      data-testid={testId}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={size === 'xs' ? 12 : size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
          className="grc-button__loading"
        />
      )}
      
      {!loading && leftIcon && (
        <span className="grc-button__left-icon">
          {leftIcon}
        </span>
      )}
      
      <span className="grc-button__content">
        {loading && loadingText ? loadingText : children}
      </span>
      
      {!loading && rightIcon && (
        <span className="grc-button__right-icon">
          {rightIcon}
        </span>
      )}
    </MuiButton>
  );

  const wrappedButton = tooltip ? (
    <Tooltip title={tooltip} placement={tooltipPlacement}>
      {buttonElement}
    </Tooltip>
  ) : buttonElement;

  // If no RBAC requirements, return the button directly
  if (requiredPermissions.length === 0 && 
      requiredFeatures.length === 0 && 
      !requiredSubscription && 
      !requiredRole) {
    return wrappedButton;
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
      {wrappedButton}
    </ProtectedComponent>
  );
});

Button.displayName = 'Button';

// Button Group Component
export interface ButtonGroupProps extends BaseComponentProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className,
  orientation = 'horizontal',
  spacing = 'sm',
  variant = 'contained',
  size = 'md',
  fullWidth = false,
  testId,
}) => {
  return (
    <div
      className={cn(
        'grc-button-group',
        `grc-button-group--${orientation}`,
        `grc-button-group--spacing-${spacing}`,
        {
          'grc-button-group--full-width': fullWidth,
        },
        className
      )}
      data-testid={testId}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            variant,
            size,
            fullWidth: fullWidth && orientation === 'vertical',
          });
        }
        return child;
      })}
    </div>
  );
};

// Icon Button Component
export interface IconButtonProps extends Omit<MuiButtonProps, 'color' | 'size'>, BaseComponentProps, A11yProps {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  tooltip?: string;
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  tooltip,
  tooltipPlacement = 'top',
  disabled,
  testId,
  ...props
}, ref) => {
  const buttonElement = (
    <MuiButton
      ref={ref}
      className={cn(
        'grc-icon-button',
        `grc-icon-button--${variant}`,
        `grc-icon-button--${size}`,
        {
          'grc-icon-button--loading': loading,
        },
        className
      )}
      disabled={disabled || loading}
      data-testid={testId}
      {...props}
    >
      {loading ? (
        <CircularProgress
          size={size === 'xs' ? 12 : size === 'sm' ? 16 : size === 'lg' ? 24 : 20}
          className="grc-icon-button__loading"
        />
      ) : (
        <span className="grc-icon-button__icon">
          {icon}
        </span>
      )}
    </MuiButton>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement={tooltipPlacement}>
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
});

IconButton.displayName = 'IconButton';

// Floating Action Button Component
export interface FabProps extends Omit<MuiButtonProps, 'color' | 'size'>, BaseComponentProps, A11yProps {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  tooltip?: string;
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
}

export const Fab = forwardRef<HTMLButtonElement, FabProps>(({
  icon,
  className,
  variant = 'primary',
  size = 'medium',
  position = 'bottom-right',
  tooltip,
  tooltipPlacement = 'left',
  testId,
  ...props
}, ref) => {
  const buttonElement = (
    <MuiButton
      ref={ref}
      className={cn(
        'grc-fab',
        `grc-fab--${variant}`,
        `grc-fab--${size}`,
        `grc-fab--${position}`,
        className
      )}
      data-testid={testId}
      {...props}
    >
      <span className="grc-fab__icon">
        {icon}
      </span>
    </MuiButton>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement={tooltipPlacement}>
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
});

Fab.displayName = 'Fab';

export default Button;
