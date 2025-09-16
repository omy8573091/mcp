'use client';

import { useForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCallback, useMemo } from 'react';
import { validationSchemas, ValidationSchemas } from './schemas';

// Generic validation hook
export function useValidation<T extends z.ZodSchema>(
  schema: T,
  options?: UseFormProps<z.infer<T>>
): UseFormReturn<z.infer<T>> {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    ...options,
  });
}

// Specific validation hooks for common schemas
export function useEmailValidation() {
  return useValidation(validationSchemas.email);
}

export function usePasswordValidation() {
  return useValidation(validationSchemas.password);
}

export function useDocumentValidation() {
  return useValidation(validationSchemas.fileUpload);
}

export function useUserSettingsValidation() {
  return useValidation(validationSchemas.userSettings);
}

export function useLoginValidation() {
  return useValidation(validationSchemas.loginForm);
}

export function useRegisterValidation() {
  return useValidation(validationSchemas.registerForm);
}

export function useSearchValidation() {
  return useValidation(validationSchemas.searchQuery);
}

export function useRiskAssessmentValidation() {
  return useValidation(validationSchemas.riskAssessment);
}

// Custom validation hook with async support
export function useAsyncValidation<T extends z.ZodSchema>(
  schema: T,
  options?: UseFormProps<z.infer<T>> & {
    asyncValidation?: {
      field: string;
      validator: (value: any) => Promise<boolean>;
      message: string;
    };
  }
) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    ...options,
  });

  const validateAsync = useCallback(async (field: string, value: any) => {
    if (options?.asyncValidation && options.asyncValidation.field === field) {
      try {
        const isValid = await options.asyncValidation.validator(value);
        if (!isValid) {
          form.setError(field, {
            type: 'manual',
            message: options.asyncValidation.message,
          });
        } else {
          form.clearErrors(field);
        }
      } catch (error) {
        form.setError(field, {
          type: 'manual',
          message: 'Validation failed. Please try again.',
        });
      }
    }
  }, [form, options?.asyncValidation]);

  return {
    ...form,
    validateAsync,
  };
}

// Real-time validation hook
export function useRealTimeValidation<T extends z.ZodSchema>(
  schema: T,
  debounceMs: number = 300
) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const debouncedValidate = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    
    return (field: keyof z.infer<T>, value: any) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        form.trigger(field);
      }, debounceMs);
    };
  }, [form, debounceMs]);

  return {
    ...form,
    debouncedValidate,
  };
}

// Field-specific validation hooks
export function useFieldValidation<T extends z.ZodSchema>(
  schema: T,
  fieldName: keyof z.infer<T>
) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const validateField = useCallback((value: any) => {
    return form.trigger(fieldName);
  }, [form, fieldName]);

  const getFieldError = useCallback(() => {
    return form.formState.errors[fieldName];
  }, [form.formState.errors, fieldName]);

  const clearFieldError = useCallback(() => {
    form.clearErrors(fieldName);
  }, [form, fieldName]);

  return {
    validateField,
    getFieldError,
    clearFieldError,
    fieldError: getFieldError(),
    isFieldValid: !getFieldError(),
  };
}

// Conditional validation hook
export function useConditionalValidation<T extends z.ZodSchema>(
  schema: T,
  condition: (data: z.infer<T>) => boolean
) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const shouldValidate = useCallback((data: z.infer<T>) => {
    return condition(data);
  }, [condition]);

  const validateConditionally = useCallback((data: z.infer<T>) => {
    if (shouldValidate(data)) {
      return form.trigger();
    }
    return Promise.resolve(true);
  }, [form, shouldValidate]);

  return {
    ...form,
    shouldValidate,
    validateConditionally,
  };
}

// Multi-step form validation hook
export function useMultiStepValidation<T extends Record<string, z.ZodSchema>>(
  schemas: T,
  currentStep: keyof T
) {
  const currentSchema = schemas[currentStep];
  const form = useForm<z.infer<typeof currentSchema>>({
    resolver: zodResolver(currentSchema),
    mode: 'onChange',
  });

  const validateStep = useCallback(async () => {
    return form.trigger();
  }, [form]);

  const isStepValid = useMemo(() => {
    return Object.keys(form.formState.errors).length === 0;
  }, [form.formState.errors]);

  return {
    ...form,
    validateStep,
    isStepValid,
    currentSchema,
  };
}

// File validation hook
export function useFileValidation(options?: {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}) {
  const defaultOptions = {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    maxFiles: 1,
  };

  const config = { ...defaultOptions, ...options };

  const validateFile = useCallback((file: File) => {
    const errors: string[] = [];

    if (file.size > config.maxSize) {
      errors.push(`File size must be less than ${Math.round(config.maxSize / 1024 / 1024)}MB`);
    }

    if (!config.allowedTypes.includes(file.type)) {
      errors.push('File type not supported');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [config]);

  const validateFiles = useCallback((files: File[]) => {
    if (files.length > config.maxFiles) {
      return {
        isValid: false,
        errors: [`Maximum ${config.maxFiles} file(s) allowed`],
      };
    }

    const allErrors: string[] = [];
    files.forEach((file, index) => {
      const validation = validateFile(file);
      if (!validation.isValid) {
        allErrors.push(`File ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }, [config, validateFile]);

  return {
    validateFile,
    validateFiles,
    config,
  };
}

// Custom validation rules hook
export function useCustomValidation() {
  const createRule = useCallback((
    validator: (value: any) => boolean,
    message: string
  ) => {
    return {
      validate: validator,
      message,
    };
  }, []);

  const createAsyncRule = useCallback((
    validator: (value: any) => Promise<boolean>,
    message: string
  ) => {
    return {
      validate: validator,
      message,
    };
  }, []);

  const createConditionalRule = useCallback((
    condition: (value: any, formData: any) => boolean,
    validator: (value: any) => boolean,
    message: string
  ) => {
    return {
      validate: (value: any, formData: any) => {
        if (condition(value, formData)) {
          return validator(value);
        }
        return true;
      },
      message,
    };
  }, []);

  return {
    createRule,
    createAsyncRule,
    createConditionalRule,
  };
}

// Validation state hook
export function useValidationState<T extends z.ZodSchema>(schema: T) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const validationState = useMemo(() => {
    const { errors, isValid, isDirty, isSubmitting } = form.formState;
    
    return {
      hasErrors: Object.keys(errors).length > 0,
      errorCount: Object.keys(errors).length,
      isValid,
      isDirty,
      isSubmitting,
      errors,
      isFormValid: isValid && isDirty,
    };
  }, [form.formState]);

  return {
    ...form,
    validationState,
  };
}

// Export all hooks
export const validationHooks = {
  useValidation,
  useEmailValidation,
  usePasswordValidation,
  useDocumentValidation,
  useUserSettingsValidation,
  useLoginValidation,
  useRegisterValidation,
  useSearchValidation,
  useRiskAssessmentValidation,
  useAsyncValidation,
  useRealTimeValidation,
  useFieldValidation,
  useConditionalValidation,
  useMultiStepValidation,
  useFileValidation,
  useCustomValidation,
  useValidationState,
};
