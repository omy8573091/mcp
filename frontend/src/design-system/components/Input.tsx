'use client';

import React, { forwardRef, useState } from 'react';
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
  OutlinedInput,
  InputBase,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Search,
  Clear,
} from '@mui/icons-material';
import { cn } from '../../core/utils';
import type { BaseComponentProps, A11yProps } from '../../core/types';
import { ProtectedComponent } from '../../core/rbac/components';
import type { Permission, Feature, SubscriptionTier, UserRole } from '../../core/rbac/types';

export interface InputProps extends Omit<TextFieldProps, 'size'>, BaseComponentProps, A11yProps {
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

const Input = forwardRef<HTMLInputElement, InputProps>(({
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
  const [showPassword, setShowPassword] = useState(false);
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

  const inputElement = (
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
    return inputElement;
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
      {inputElement}
    </ProtectedComponent>
  );
});

Input.displayName = 'Input';

// Search Input Component
export interface SearchInputProps extends Omit<InputProps, 'type' | 'leftIcon'> {
  onSearch?: (value: string) => void;
  searchIcon?: React.ReactNode;
  placeholder?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  onSearch,
  searchIcon = <Search />,
  placeholder = 'Search...',
  clearable = true,
  ...props
}, ref) => {
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && onSearch) {
      onSearch((event.target as HTMLInputElement).value);
    }
  };

  return (
    <Input
      ref={ref}
      type="text"
      leftIcon={searchIcon}
      placeholder={placeholder}
      clearable={clearable}
      onKeyPress={handleKeyPress}
      {...props}
    />
  );
});

SearchInput.displayName = 'SearchInput';

// Select Input Component
export interface SelectInputProps extends BaseComponentProps, A11yProps {
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
}

export const SelectInput: React.FC<SelectInputProps> = ({
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
  ...props
}) => {
  return (
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
};

// Textarea Component
export interface TextareaProps extends Omit<TextFieldProps, 'multiline' | 'rows'>, BaseComponentProps, A11yProps {
  rows?: number;
  minRows?: number;
  maxRows?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
  rows = 4,
  minRows,
  maxRows,
  resize = 'vertical',
  autoResize = false,
  testId,
  ...props
}, ref) => {
  return (
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
});

Textarea.displayName = 'Textarea';

export default Input;
