'use client';

import React, { forwardRef } from 'react';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Search,
  Clear,
  Lock,
} from '@mui/icons-material';
import { cn } from '../../core/utils';
import { 
  ProtectedComponent,
  FeatureGate,
  PermissionGate,
  SubscriptionGate,
  AccessButton,
} from '../../core/rbac/components';
import type { 
  BaseComponentProps, 
  A11yProps,
  Permission,
  Feature,
  SubscriptionTier,
  UserRole,
} from '../../core/types';

export interface RBACInputProps extends Omit<TextFieldProps, 'size'>, BaseComponentProps, A11yProps {
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  loading?: boolean;
  
  // RBAC Properties
  requiredPermissions?: Permission[];
  requiredFeatures?: Feature[];
  requiredSubscription?: SubscriptionTier;
  requiredRole?: UserRole;
  showUpgrade?: boolean;
  fallbackMessage?: string;
}

const RBACInput = forwardRef<HTMLInputElement, RBACInputProps>(({
  className,
  variant = 'outlined',
  size = 'md',
  leftIcon,
  rightIcon,
  clearable = false,
  onClear,
  loading = false,
  error,
  helperText,
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
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = props.type === 'password';

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  const getInputProps = () => {
    const inputProps: any = {};

    if (leftIcon) {
      inputProps.startAdornment = (
        <InputAdornment position="start">
          {leftIcon}
        </InputAdornment>
      );
    }

    if (rightIcon || clearable || isPassword || loading) {
      const endAdornments = [];

      if (loading) {
        endAdornments.push(
          <InputAdornment key="loading" position="end">
            <div className="grc-input__loading" />
          </InputAdornment>
        );
      }

      if (isPassword) {
        endAdornments.push(
          <InputAdornment key="password" position="end">
            <IconButton
              onClick={handleTogglePassword}
              edge="end"
              size="small"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        );
      }

      if (clearable && props.value) {
        endAdornments.push(
          <InputAdornment key="clear" position="end">
            <IconButton
              onClick={handleClear}
              edge="end"
              size="small"
            >
              <Clear />
            </IconButton>
          </InputAdornment>
        );
      }

      if (rightIcon) {
        endAdornments.push(
          <InputAdornment key="right" position="end">
            {rightIcon}
          </InputAdornment>
        );
      }

      if (endAdornments.length > 0) {
        inputProps.endAdornment = endAdornments;
      }
    }

    return inputProps;
  };

  const InputComponent = (
    <TextField
      ref={ref}
      className={cn(
        'grc-input',
        `grc-input--${variant}`,
        `grc-input--${size}`,
        {
          'grc-input--error': error,
          'grc-input--loading': loading,
        },
        className
      )}
      variant={variant}
      size={size === 'xs' ? 'small' : size === 'lg' ? 'medium' : 'small'}
      error={error}
      helperText={helperText}
      InputProps={getInputProps()}
      type={isPassword && showPassword ? 'text' : props.type}
      data-testid={testId}
      {...props}
    />
  );

  // If no RBAC requirements, return the input directly
  if (requiredPermissions.length === 0 && 
      requiredFeatures.length === 0 && 
      !requiredSubscription && 
      !requiredRole) {
    return InputComponent;
  }

  // Wrap with RBAC protection
  return (
    <ProtectedComponent
      requiredPermissions={requiredPermissions}
      requiredFeatures={requiredFeatures}
      requiredSubscription={requiredSubscription}
      requiredRole={requiredRole}
      showUpgrade={showUpgrade}
      fallbackMessage={fallbackMessage || 'This input field requires additional permissions.'}
    >
      {InputComponent}
    </ProtectedComponent>
  );
});

RBACInput.displayName = 'RBACInput';

// RBAC Search Input Component
export interface RBACSearchInputProps extends Omit<RBACInputProps, 'type' | 'leftIcon'> {
  onSearch?: (value: string) => void;
  searchIcon?: React.ReactNode;
  placeholder?: string;
}

export const RBACSearchInput = forwardRef<HTMLInputElement, RBACSearchInputProps>(({
  onSearch,
  searchIcon = <Search />,
  placeholder = 'Search...',
  clearable = true,
  requiredPermissions = ['search:basic'],
  requiredFeatures = ['ai_search'],
  ...props
}, ref) => {
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && onSearch) {
      onSearch((event.target as HTMLInputElement).value);
    }
  };

  return (
    <RBACInput
      ref={ref}
      type="text"
      leftIcon={searchIcon}
      placeholder={placeholder}
      clearable={clearable}
      onKeyPress={handleKeyPress}
      requiredPermissions={requiredPermissions}
      requiredFeatures={requiredFeatures}
      fallbackMessage="Search functionality requires a higher subscription tier."
      {...props}
    />
  );
});

RBACSearchInput.displayName = 'RBACSearchInput';

// RBAC Select Input Component
export interface RBACSelectInputProps extends BaseComponentProps, A11yProps {
  label?: string;
  value: any;
  onChange: (value: any) => void;
  options: Array<{ value: any; label: string; disabled?: boolean }>;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled' | 'standard';
  
  // RBAC Properties
  requiredPermissions?: Permission[];
  requiredFeatures?: Feature[];
  requiredSubscription?: SubscriptionTier;
  requiredRole?: UserRole;
  showUpgrade?: boolean;
  fallbackMessage?: string;
}

export const RBACSelectInput: React.FC<RBACSelectInputProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  helperText,
  disabled,
  required,
  multiple = false,
  size = 'md',
  variant = 'outlined',
  className,
  testId,
  
  // RBAC Properties
  requiredPermissions = [],
  requiredFeatures = [],
  requiredSubscription,
  requiredRole,
  showUpgrade = true,
  fallbackMessage,
  
  ...props
}) => {
  const SelectComponent = (
    <FormControl
      className={cn(
        'grc-select',
        `grc-select--${variant}`,
        `grc-select--${size}`,
        {
          'grc-select--error': error,
        },
        className
      )}
      variant={variant}
      size={size === 'xs' ? 'small' : size === 'lg' ? 'medium' : 'small'}
      error={error}
      disabled={disabled}
      required={required}
      fullWidth
      data-testid={testId}
    >
      {label && <InputLabel>{label}</InputLabel>}
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label={label}
        multiple={multiple}
        displayEmpty={!label}
        {...props}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );

  // If no RBAC requirements, return the select directly
  if (requiredPermissions.length === 0 && 
      requiredFeatures.length === 0 && 
      !requiredSubscription && 
      !requiredRole) {
    return SelectComponent;
  }

  // Wrap with RBAC protection
  return (
    <ProtectedComponent
      requiredPermissions={requiredPermissions}
      requiredFeatures={requiredFeatures}
      requiredSubscription={requiredSubscription}
      requiredRole={requiredRole}
      showUpgrade={showUpgrade}
      fallbackMessage={fallbackMessage || 'This select field requires additional permissions.'}
    >
      {SelectComponent}
    </ProtectedComponent>
  );
};

// RBAC Textarea Component
export interface RBACTextareaProps extends Omit<TextFieldProps, 'multiline' | 'rows'>, BaseComponentProps, A11yProps {
  rows?: number;
  minRows?: number;
  maxRows?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  autoResize?: boolean;
  
  // RBAC Properties
  requiredPermissions?: Permission[];
  requiredFeatures?: Feature[];
  requiredSubscription?: SubscriptionTier;
  requiredRole?: UserRole;
  showUpgrade?: boolean;
  fallbackMessage?: string;
}

export const RBACTextarea = forwardRef<HTMLTextAreaElement, RBACTextareaProps>(({
  className,
  rows = 4,
  minRows,
  maxRows,
  resize = 'vertical',
  autoResize = false,
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
  const TextareaComponent = (
    <TextField
      ref={ref}
      className={cn(
        'grc-textarea',
        `grc-textarea--resize-${resize}`,
        {
          'grc-textarea--auto-resize': autoResize,
        },
        className
      )}
      multiline
      rows={autoResize ? undefined : rows}
      minRows={minRows}
      maxRows={maxRows}
      data-testid={testId}
      {...props}
    />
  );

  // If no RBAC requirements, return the textarea directly
  if (requiredPermissions.length === 0 && 
      requiredFeatures.length === 0 && 
      !requiredSubscription && 
      !requiredRole) {
    return TextareaComponent;
  }

  // Wrap with RBAC protection
  return (
    <ProtectedComponent
      requiredPermissions={requiredPermissions}
      requiredFeatures={requiredFeatures}
      requiredSubscription={requiredSubscription}
      requiredRole={requiredRole}
      showUpgrade={showUpgrade}
      fallbackMessage={fallbackMessage || 'This textarea requires additional permissions.'}
    >
      {TextareaComponent}
    </ProtectedComponent>
  );
});

RBACTextarea.displayName = 'RBACTextarea';

// Advanced Input with AI Features (requires higher subscription)
export const AIEnhancedInput: React.FC<RBACInputProps> = (props) => {
  return (
    <FeatureGate
      feature="ai_search"
      fallback={
        <div className="relative">
          <RBACInput
            {...props}
            rightIcon={<Lock />}
            disabled
            placeholder="AI features require Pro subscription"
          />
          <div className="absolute inset-0 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              AI features locked
            </span>
          </div>
        </div>
      }
    >
      <RBACInput
        {...props}
        requiredFeatures={['ai_search']}
        requiredSubscription="pro"
        fallbackMessage="AI-enhanced input requires Pro subscription or higher."
      />
    </FeatureGate>
  );
};

export default RBACInput;
