'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useForm, FormProvider, UseFormProps, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  AlertTitle,
  CircularProgress,
  Typography,
  Divider,
} from '@mui/material';
import { cn } from '../../core/utils';
import { ValidationUtils } from '../../core/validation/utils';
import type { BaseComponentProps, A11yProps } from '../../core/types';

// Form validation types
export interface FormStep<T extends FieldValues> {
  id: string;
  title: string;
  description?: string;
  schema: z.ZodSchema<T>;
  component: React.ComponentType<{ form: UseFormProps<T> }>;
  validation?: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    debounceMs?: number;
  };
}

export interface ValidatedFormProps<T extends FieldValues> extends BaseComponentProps, A11yProps {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => void | Promise<void>;
  onError?: (errors: any) => void;
  defaultValues?: Partial<T>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
  
  // Multi-step form
  steps?: FormStep<T>[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  allowStepNavigation?: boolean;
  
  // Form behavior
  showValidationSummary?: boolean;
  showFieldErrors?: boolean;
  showSubmitButton?: boolean;
  submitButtonText?: string;
  submitButtonProps?: any;
  resetOnSubmit?: boolean;
  
  // Loading states
  isSubmitting?: boolean;
  isSubmittingText?: string;
  
  // Custom validation
  customValidation?: (data: T) => Promise<{ isValid: boolean; errors?: Record<string, string> }>;
  
  // Form layout
  layout?: 'vertical' | 'horizontal' | 'grid';
  spacing?: number;
  
  // Error handling
  showGlobalErrors?: boolean;
  globalErrorTitle?: string;
  
  // Success handling
  showSuccessMessage?: boolean;
  successMessage?: string;
  
  // Children
  children?: React.ReactNode;
}

export interface ValidatedFormRef<T extends FieldValues> {
  submit: () => void;
  reset: () => void;
  validate: () => Promise<boolean>;
  getValues: () => T;
  setValue: (name: Path<T>, value: any) => void;
  getFieldError: (name: Path<T>) => string | undefined;
  clearErrors: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
}

const ValidatedForm = forwardRef<ValidatedFormRef<any>, ValidatedFormProps<any>>(({
  className,
  schema,
  onSubmit,
  onError,
  defaultValues,
  mode = 'onChange',
  reValidateMode = 'onChange',
  
  // Multi-step form
  steps,
  currentStep = 0,
  onStepChange,
  allowStepNavigation = true,
  
  // Form behavior
  showValidationSummary = true,
  showFieldErrors = true,
  showSubmitButton = true,
  submitButtonText = 'Submit',
  submitButtonProps,
  resetOnSubmit = false,
  
  // Loading states
  isSubmitting = false,
  isSubmittingText = 'Submitting...',
  
  // Custom validation
  customValidation,
  
  // Form layout
  layout = 'vertical',
  spacing = 2,
  
  // Error handling
  showGlobalErrors = true,
  globalErrorTitle = 'Form Validation Errors',
  
  // Success handling
  showSuccessMessage = false,
  successMessage = 'Form submitted successfully!',
  
  // Children
  children,
  
  testId,
  
  ...props
}, ref) => {
  const [activeStep, setActiveStep] = React.useState(currentStep);
  const [globalErrors, setGlobalErrors] = React.useState<string[]>([]);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isCustomValidating, setIsCustomValidating] = React.useState(false);

  // Form setup
  const form = useForm({
    resolver: zodResolver(schema),
    mode,
    reValidateMode,
    defaultValues,
  });

  const { handleSubmit, formState, reset, getValues, setValue, clearErrors, trigger } = form;

  // Expose form methods via ref
  useImperativeHandle(ref, () => ({
    submit: () => handleSubmit(onSubmit, onError)(),
    reset: () => {
      reset();
      setGlobalErrors([]);
      setIsSuccess(false);
    },
    validate: async () => {
      const isValid = await trigger();
      return isValid;
    },
    getValues,
    setValue,
    getFieldError: (name: Path<any>) => {
      const error = formState.errors[name];
      return error?.message;
    },
    clearErrors: () => {
      clearErrors();
      setGlobalErrors([]);
    },
    nextStep: () => {
      if (steps && activeStep < steps.length - 1) {
        const newStep = activeStep + 1;
        setActiveStep(newStep);
        onStepChange?.(newStep);
      }
    },
    previousStep: () => {
      if (activeStep > 0) {
        const newStep = activeStep - 1;
        setActiveStep(newStep);
        onStepChange?.(newStep);
      }
    },
    goToStep: (step: number) => {
      if (steps && step >= 0 && step < steps.length) {
        setActiveStep(step);
        onStepChange?.(step);
      }
    },
  }));

  // Handle form submission
  const handleFormSubmit = async (data: any) => {
    try {
      setGlobalErrors([]);
      setIsSuccess(false);
      
      // Custom validation
      if (customValidation) {
        setIsCustomValidating(true);
        const customResult = await customValidation(data);
        
        if (!customResult.isValid) {
          setGlobalErrors(Object.values(customResult.errors || {}));
          return;
        }
      }
      
      // Submit form
      await onSubmit(data);
      
      // Success handling
      if (resetOnSubmit) {
        reset();
      }
      setIsSuccess(true);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setGlobalErrors(['An error occurred while submitting the form. Please try again.']);
    } finally {
      setIsCustomValidating(false);
    }
  };

  // Handle form errors
  const handleFormError = (errors: any) => {
    console.error('Form validation errors:', errors);
    onError?.(errors);
  };

  // Get validation summary
  const validationSummary = React.useMemo(() => {
    return ValidationUtils.createValidationSummary(formState.errors);
  }, [formState.errors]);

  // Render single-step form
  const renderSingleStepForm = () => (
    <Box
      className={cn(
        'validated-form',
        `validated-form--${layout}`,
        {
          'validated-form--submitting': isSubmitting || isCustomValidating,
        },
        className
      )}
      data-testid={testId}
      sx={{ display: 'flex', flexDirection: 'column', gap: spacing }}
    >
      {/* Global Errors */}
      {showGlobalErrors && globalErrors.length > 0 && (
        <Alert severity="error">
          <AlertTitle>{globalErrorTitle}</AlertTitle>
          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
            {globalErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Success Message */}
      {showSuccessMessage && isSuccess && (
        <Alert severity="success">
          <AlertTitle>Success</AlertTitle>
          {successMessage}
        </Alert>
      )}

      {/* Validation Summary */}
      {showValidationSummary && validationSummary.hasErrors && (
        <Alert severity="warning">
          <AlertTitle>Validation Errors</AlertTitle>
          <Typography variant="body2">
            Please fix {validationSummary.totalErrors} error(s) before submitting.
          </Typography>
        </Alert>
      )}

      {/* Form Content */}
      <FormProvider {...form}>
        {children}
      </FormProvider>

      {/* Submit Button */}
      {showSubmitButton && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || isCustomValidating || !formState.isValid}
            startIcon={
              isSubmitting || isCustomValidating ? (
                <CircularProgress size={20} />
              ) : undefined
            }
            {...submitButtonProps}
          >
            {isSubmitting || isCustomValidating ? isSubmittingText : submitButtonText}
          </Button>
        </Box>
      )}
    </Box>
  );

  // Render multi-step form
  const renderMultiStepForm = () => (
    <Box
      className={cn(
        'validated-form',
        'validated-form--multi-step',
        {
          'validated-form--submitting': isSubmitting || isCustomValidating,
        },
        className
      )}
      data-testid={testId}
    >
      {/* Global Errors */}
      {showGlobalErrors && globalErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>{globalErrorTitle}</AlertTitle>
          <ul style={{ margin: 0, paddingLeft: '1rem' }}>
            {globalErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Success Message */}
      {showSuccessMessage && isSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <AlertTitle>Success</AlertTitle>
          {successMessage}
        </Alert>
      )}

      {/* Stepper */}
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps?.map((step, index) => (
          <Step key={step.id}>
            <StepLabel>
              <Typography variant="h6">{step.title}</Typography>
              {step.description && (
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              )}
            </StepLabel>
            <StepContent>
              <FormProvider {...form}>
                <step.component form={form} />
              </FormProvider>
              
              {/* Step Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  disabled={index === 0}
                  onClick={() => {
                    if (index > 0) {
                      setActiveStep(index - 1);
                      onStepChange?.(index - 1);
                    }
                  }}
                >
                  Previous
                </Button>
                
                {index < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={async () => {
                      const isValid = await trigger();
                      if (isValid) {
                        setActiveStep(index + 1);
                        onStepChange?.(index + 1);
                      }
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || isCustomValidating || !formState.isValid}
                    startIcon={
                      isSubmitting || isCustomValidating ? (
                        <CircularProgress size={20} />
                      ) : undefined
                    }
                    {...submitButtonProps}
                  >
                    {isSubmitting || isCustomValidating ? isSubmittingText : submitButtonText}
                  </Button>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)}>
      {steps && steps.length > 0 ? renderMultiStepForm() : renderSingleStepForm()}
    </form>
  );
});

ValidatedForm.displayName = 'ValidatedForm';

// Form Field Component
export interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  required?: boolean;
  helperText?: string;
  component: React.ComponentType<any>;
  componentProps?: any;
  validation?: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    debounceMs?: number;
  };
}

export function FormField<T extends FieldValues>({
  name,
  label,
  required,
  helperText,
  component: Component,
  componentProps,
  validation,
}: FormFieldProps<T>) {
  return (
    <Component
      name={name}
      label={label}
      required={required}
      helperText={helperText}
      validation={validation}
      {...componentProps}
    />
  );
}

// Form Section Component
export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function FormSection({
  title,
  description,
  children,
  collapsible = false,
  defaultExpanded = true,
}: FormSectionProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  if (collapsible) {
    return (
      <Box sx={{ mb: 3 }}>
        <Button
          onClick={() => setExpanded(!expanded)}
          sx={{ mb: 1, p: 0, textAlign: 'left', justifyContent: 'flex-start' }}
        >
          <Typography variant="h6">{title}</Typography>
        </Button>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
        )}
        {expanded && children}
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      {title && (
        <Typography variant="h6" sx={{ mb: 1 }}>
          {title}
        </Typography>
      )}
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      {children}
    </Box>
  );
}

// Form Actions Component
export interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'space-between';
  spacing?: number;
}

export function FormActions({
  children,
  align = 'right',
  spacing = 2,
}: FormActionsProps) {
  const justifyContent = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
    'space-between': 'space-between',
  }[align];

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent,
        gap: spacing,
        mt: 3,
        pt: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      {children}
    </Box>
  );
}

export default ValidatedForm;
