'use client';

import React, { forwardRef, useState, useEffect } from 'react';
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
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Search,
  Clear,
  CheckCircle,
  Error,
  Warning,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '../../core/utils';
import { ValidationUtils } from '../../core/validation/utils';
import type { BaseComponentProps, A11yProps } from '../../core/types';

// Validation state types
export type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

export interface ValidationConfig {
  schema: z.ZodSchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  showValidationIcon?: boolean;
  showValidationMessage?: boolean;
  customErrorMessage?: string;
}

export interface ValidatedInputProps extends Omit<TextFieldProps, 'size'>, BaseComponentProps, A11yProps {
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  loading?: boolean;
  
  // Validation properties
  validationConfig?: ValidationConfig;
  validationState?: ValidationState;
  validationMessage?: string;
  showValidationIcon?: boolean;
  showValidationMessage?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  
  // Real-time validation
  onValidationChange?: (isValid: boolean, message?: string) => void;
  onValidationComplete?: (result: { isValid: boolean; data?: any; errors?: string[] }) => void;
}

const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(({
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
  
  // Validation properties
  validationConfig,
  validationState = 'idle',
  validationMessage,
  showValidationIcon = true,
  showValidationMessage = true,
  validateOnChange = true,
  validateOnBlur = true,
  debounceMs = 300,
  
  // Real-time validation
  onValidationChange,
  onValidationComplete,
  
  ...props
}, ref) => {
  const [internalValidationState, setInternalValidationState] = useState<ValidationState>('idle');
  const [internalValidationMessage, setInternalValidationMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const isPassword = props.type === 'password';
  const currentValidationState = validationState !== 'idle' ? validationState : internalValidationState;
  const currentValidationMessage = validationMessage || internalValidationMessage;

  // Validation function
  const validateValue = React.useCallback(async (value: any) => {
    if (!validationConfig?.schema) return;
    
    setIsValidating(true);
    
    try {
      const result = ValidationUtils.validateValue(validationConfig.schema, value);
      
      if (result.isValid) {
        setInternalValidationState('valid');
        setInternalValidationMessage('');
        onValidationChange?.(true);
        onValidationComplete?.({ isValid: true, data: result.data });
      } else {
        setInternalValidationState('invalid');
        const errorMessage = validationConfig.customErrorMessage || ValidationUtils.getFirstError(result.errors) || 'Invalid value';
        setInternalValidationMessage(errorMessage);
        onValidationChange?.(false, errorMessage);
        onValidationComplete?.({ isValid: false, errors: result.errors });
      }
    } catch (error) {
      setInternalValidationState('invalid');
      setInternalValidationMessage('Validation failed');
      onValidationChange?.(false, 'Validation failed');
      onValidationComplete?.({ isValid: false, errors: ['Validation failed'] });
    } finally {
      setIsValidating(false);
    }
  }, [validationConfig, onValidationChange, onValidationComplete]);

  // Debounced validation
  const debouncedValidate = React.useMemo(() => {
    return ValidationUtils.debounce(validateValue, debounceMs);
  }, [validateValue, debounceMs]);

  // Handle value changes
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    if (validateOnChange && validationConfig) {
      debouncedValidate(value);
    }
    
    props.onChange?.(event);
  };

  // Handle blur events
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (validateOnBlur && validationConfig) {
      validateValue(event.target.value);
    }
    
    props.onBlur?.(event);
  };

  // Handle clear
  const handleClear = () => {
    setInternalValidationState('idle');
    setInternalValidationMessage('');
    onValidationChange?.(true);
    onClear?.();
  };

  // Handle password toggle
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Get input props
  const getInputProps = () => {
    const inputProps: any = {};

    if (leftIcon) {
      inputProps.startAdornment = (
        <InputAdornment position="start">
          {leftIcon}
        </InputAdornment>
      );
    }

    if (rightIcon || clearable || isPassword || loading || showValidationIcon) {
      const endAdornments = [];

      if (loading || isValidating) {
        endAdornments.push(
          <InputAdornment key="loading" position="end">
            <CircularProgress size={20} />
          </InputAdornment>
        );
      }

      if (showValidationIcon && currentValidationState === 'valid') {
        endAdornments.push(
          <InputAdornment key="valid" position="end">
            <CheckCircle color="success" fontSize="small" />
          </InputAdornment>
        );
      }

      if (showValidationIcon && currentValidationState === 'invalid') {
        endAdornments.push(
          <InputAdornment key="invalid" position="end">
            <Error color="error" fontSize="small" />
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

  // Get validation color
  const getValidationColor = () => {
    switch (currentValidationState) {
      case 'valid':
        return 'success';
      case 'invalid':
        return 'error';
      case 'validating':
        return 'warning';
      default:
        return undefined;
    }
  };

  // Get helper text
  const getHelperText = () => {
    if (currentValidationState === 'invalid' && showValidationMessage && currentValidationMessage) {
      return currentValidationMessage;
    }
    return helperText;
  };

  return (
    <div className="validated-input-container">
      <TextField
        ref={ref}
        className={cn(
          'validated-input',
          `validated-input--${variant}`,
          `validated-input--${size}`,
          {
            'validated-input--error': error || currentValidationState === 'invalid',
            'validated-input--valid': currentValidationState === 'valid',
            'validated-input--loading': loading || isValidating,
          },
          className
        )}
        variant={variant}
        size={size === 'xs' ? 'small' : size === 'lg' ? 'medium' : 'small'}
        error={error || currentValidationState === 'invalid'}
        helperText={getHelperText()}
        InputProps={getInputProps()}
        type={isPassword && showPassword ? 'text' : props.type}
        data-testid={testId}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
      
      {showValidationMessage && currentValidationState === 'invalid' && currentValidationMessage && (
        <Alert severity="error" className="mt-2">
          <AlertTitle>Validation Error</AlertTitle>
          {currentValidationMessage}
        </Alert>
      )}
    </div>
  );
});

ValidatedInput.displayName = 'ValidatedInput';

// Validated Search Input Component
export interface ValidatedSearchInputProps extends Omit<ValidatedInputProps, 'type' | 'leftIcon'> {
  onSearch?: (value: string) => void;
  searchIcon?: React.ReactNode;
  placeholder?: string;
}

export const ValidatedSearchInput = forwardRef<HTMLInputElement, ValidatedSearchInputProps>(({
  onSearch,
  searchIcon = <Search />,
  placeholder = 'Search...',
  clearable = true,
  validationConfig,
  ...props
}, ref) => {
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && onSearch) {
      onSearch((event.target as HTMLInputElement).value);
    }
  };

  return (
    <ValidatedInput
      ref={ref}
      type="text"
      leftIcon={searchIcon}
      placeholder={placeholder}
      clearable={clearable}
      onKeyPress={handleKeyPress}
      validationConfig={validationConfig}
      {...props}
    />
  );
});

ValidatedSearchInput.displayName = 'ValidatedSearchInput';

// Validated Select Input Component
export interface ValidatedSelectInputProps extends BaseComponentProps, A11yProps {
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
  
  // Validation properties
  validationConfig?: ValidationConfig;
  validationState?: ValidationState;
  validationMessage?: string;
  showValidationIcon?: boolean;
  showValidationMessage?: boolean;
}

export const ValidatedSelectInput: React.FC<ValidatedSelectInputProps> = ({
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
  
  // Validation properties
  validationConfig,
  validationState = 'idle',
  validationMessage,
  showValidationIcon = true,
  showValidationMessage = true,
  
  ...props
}) => {
  const [internalValidationState, setInternalValidationState] = useState<ValidationState>('idle');
  const [internalValidationMessage, setInternalValidationMessage] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);

  const currentValidationState = validationState !== 'idle' ? validationState : internalValidationState;
  const currentValidationMessage = validationMessage || internalValidationMessage;

  // Validation function
  const validateValue = React.useCallback(async (value: any) => {
    if (!validationConfig?.schema) return;
    
    setIsValidating(true);
    
    try {
      const result = ValidationUtils.validateValue(validationConfig.schema, value);
      
      if (result.isValid) {
        setInternalValidationState('valid');
        setInternalValidationMessage('');
      } else {
        setInternalValidationState('invalid');
        const errorMessage = validationConfig.customErrorMessage || ValidationUtils.getFirstError(result.errors) || 'Invalid value';
        setInternalValidationMessage(errorMessage);
      }
    } catch (error) {
      setInternalValidationState('invalid');
      setInternalValidationMessage('Validation failed');
    } finally {
      setIsValidating(false);
    }
  }, [validationConfig]);

  // Handle value changes
  const handleChange = (event: any) => {
    const newValue = event.target.value;
    onChange(newValue);
    
    if (validationConfig) {
      validateValue(newValue);
    }
  };

  // Get validation color
  const getValidationColor = () => {
    switch (currentValidationState) {
      case 'valid':
        return 'success';
      case 'invalid':
        return 'error';
      case 'validating':
        return 'warning';
      default:
        return undefined;
    }
  };

  // Get helper text
  const getHelperText = () => {
    if (currentValidationState === 'invalid' && showValidationMessage && currentValidationMessage) {
      return currentValidationMessage;
    }
    return helperText;
  };

  return (
    <div className="validated-select-container">
      <FormControl
        className={cn(
          'validated-select',
          `validated-select--${variant}`,
          `validated-select--${size}`,
          {
            'validated-select--error': error || currentValidationState === 'invalid',
            'validated-select--valid': currentValidationState === 'valid',
            'validated-select--loading': isValidating,
          },
          className
        )}
        variant={variant}
        size={size === 'xs' ? 'small' : size === 'lg' ? 'medium' : 'small'}
        error={error || currentValidationState === 'invalid'}
        disabled={disabled}
        required={required}
        fullWidth
        data-testid={testId}
      >
        {label && <InputLabel>{label}</InputLabel>}
        <Select
          value={value}
          onChange={handleChange}
          label={label}
          multiple={multiple}
          displayEmpty={!label}
          endAdornment={
            showValidationIcon && currentValidationState === 'valid' ? (
              <CheckCircle color="success" fontSize="small" />
            ) : showValidationIcon && currentValidationState === 'invalid' ? (
              <Error color="error" fontSize="small" />
            ) : isValidating ? (
              <CircularProgress size={20} />
            ) : undefined
          }
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
        {getHelperText() && <FormHelperText>{getHelperText()}</FormHelperText>}
      </FormControl>
      
      {showValidationMessage && currentValidationState === 'invalid' && currentValidationMessage && (
        <Alert severity="error" className="mt-2">
          <AlertTitle>Validation Error</AlertTitle>
          {currentValidationMessage}
        </Alert>
      )}
    </div>
  );
};

// Validated Textarea Component
export interface ValidatedTextareaProps extends Omit<TextFieldProps, 'multiline' | 'rows'>, BaseComponentProps, A11yProps {
  rows?: number;
  minRows?: number;
  maxRows?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  autoResize?: boolean;
  
  // Validation properties
  validationConfig?: ValidationConfig;
  validationState?: ValidationState;
  validationMessage?: string;
  showValidationIcon?: boolean;
  showValidationMessage?: boolean;
}

export const ValidatedTextarea = forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(({
  className,
  rows = 4,
  minRows,
  maxRows,
  resize = 'vertical',
  autoResize = false,
  testId,
  
  // Validation properties
  validationConfig,
  validationState = 'idle',
  validationMessage,
  showValidationIcon = true,
  showValidationMessage = true,
  
  ...props
}, ref) => {
  const [internalValidationState, setInternalValidationState] = useState<ValidationState>('idle');
  const [internalValidationMessage, setInternalValidationMessage] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);

  const currentValidationState = validationState !== 'idle' ? validationState : internalValidationState;
  const currentValidationMessage = validationMessage || internalValidationMessage;

  // Validation function
  const validateValue = React.useCallback(async (value: any) => {
    if (!validationConfig?.schema) return;
    
    setIsValidating(true);
    
    try {
      const result = ValidationUtils.validateValue(validationConfig.schema, value);
      
      if (result.isValid) {
        setInternalValidationState('valid');
        setInternalValidationMessage('');
      } else {
        setInternalValidationState('invalid');
        const errorMessage = validationConfig.customErrorMessage || ValidationUtils.getFirstError(result.errors) || 'Invalid value';
        setInternalValidationMessage(errorMessage);
      }
    } catch (error) {
      setInternalValidationState('invalid');
      setInternalValidationMessage('Validation failed');
    } finally {
      setIsValidating(false);
    }
  }, [validationConfig]);

  // Handle value changes
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    if (validationConfig) {
      ValidationUtils.debounce(validateValue, 300)(value);
    }
    
    props.onChange?.(event);
  };

  // Get helper text
  const getHelperText = () => {
    if (currentValidationState === 'invalid' && showValidationMessage && currentValidationMessage) {
      return currentValidationMessage;
    }
    return props.helperText;
  };

  return (
    <div className="validated-textarea-container">
      <TextField
        ref={ref}
        className={cn(
          'validated-textarea',
          `validated-textarea--resize-${resize}`,
          {
            'validated-textarea--auto-resize': autoResize,
            'validated-textarea--error': props.error || currentValidationState === 'invalid',
            'validated-textarea--valid': currentValidationState === 'valid',
            'validated-textarea--loading': isValidating,
          },
          className
        )}
        multiline
        rows={autoResize ? undefined : rows}
        minRows={minRows}
        maxRows={maxRows}
        error={props.error || currentValidationState === 'invalid'}
        helperText={getHelperText()}
        data-testid={testId}
        onChange={handleChange}
        {...props}
      />
      
      {showValidationMessage && currentValidationState === 'invalid' && currentValidationMessage && (
        <Alert severity="error" className="mt-2">
          <AlertTitle>Validation Error</AlertTitle>
          {currentValidationMessage}
        </Alert>
      )}
    </div>
  );
});

ValidatedTextarea.displayName = 'ValidatedTextarea';

export default ValidatedInput;
