import { useState, useCallback, useRef, useEffect } from 'react';
import { z } from 'zod';
import { validationHelpers } from '../core/validators';

interface FormField<T = any> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

interface FormState<T extends Record<string, any>> {
  values: T;
  errors: Record<keyof T, string | null>;
  touched: Record<keyof T, boolean>;
  dirty: Record<keyof T, boolean>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
}

interface FormActions<T extends Record<string, any>> {
  setValue: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string | null) => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: Partial<Record<keyof T, string | null>>) => void;
  reset: (values?: Partial<T>) => void;
  validate: () => boolean;
  validateField: (field: keyof T) => boolean;
  submit: () => Promise<void>;
}

interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  validationSchema?: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  resetOnSubmit?: boolean;
  onError?: (errors: Record<keyof T, string | null>) => void;
  onSuccess?: (values: T) => void;
}

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): FormState<T> & FormActions<T> {
  const {
    initialValues,
    validationSchema,
    onSubmit,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    resetOnSubmit = false,
    onError,
    onSuccess,
  } = options;

  const [state, setState] = useState<FormState<T>>(() => ({
    values: { ...initialValues },
    errors: {} as Record<keyof T, string | null>,
    touched: {} as Record<keyof T, boolean>,
    dirty: {} as Record<keyof T, boolean>,
    isValid: true,
    isDirty: false,
    isSubmitting: false,
    isSubmitted: false,
  }));

  const initialValuesRef = useRef(initialValues);
  const validationSchemaRef = useRef(validationSchema);

  // Update refs when props change
  useEffect(() => {
    initialValuesRef.current = initialValues;
    validationSchemaRef.current = validationSchema;
  }, [initialValues, validationSchema]);

  const validateField = useCallback((field: keyof T): boolean => {
    if (!validationSchemaRef.current) return true;

    const fieldSchema = validationSchemaRef.current.shape?.[field as string];
    if (!fieldSchema) return true;

    const result = validationHelpers.validateField(fieldSchema, state.values[field]);
    
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: result.error || null,
      },
    }));

    return result.success;
  }, [state.values]);

  const validate = useCallback((): boolean => {
    if (!validationSchemaRef.current) return true;

    const result = validationHelpers.validateSchema(validationSchemaRef.current, state.values);
    
    setState(prev => ({
      ...prev,
      errors: result.errors ? 
        result.errors.reduce((acc, error, index) => {
          const field = Object.keys(validationSchemaRef.current!.shape)[index];
          acc[field as keyof T] = error;
          return acc;
        }, {} as Record<keyof T, string | null>) :
        {} as Record<keyof T, string | null>,
      isValid: result.success,
    }));

    if (!result.success) {
      onError?.(state.errors);
    }

    return result.success;
  }, [state.values, state.errors, onError]);

  const setValue = useCallback((field: keyof T, value: any) => {
    setState(prev => {
      const newValues = { ...prev.values, [field]: value };
      const newDirty = { ...prev.dirty, [field]: value !== initialValuesRef.current[field] };
      
      return {
        ...prev,
        values: newValues,
        dirty: newDirty,
        isDirty: Object.values(newDirty).some(Boolean),
      };
    });

    if (validateOnChange) {
      validateField(field);
    }
  }, [validateOnChange, validateField]);

  const setError = useCallback((field: keyof T, error: string | null) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error,
      },
    }));
  }, []);

  const setTouched = useCallback((field: keyof T, touched: boolean = true) => {
    setState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [field]: touched,
      },
    }));

    if (validateOnBlur && touched) {
      validateField(field);
    }
  }, [validateOnBlur, validateField]);

  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => {
      const newValues = { ...prev.values, ...values };
      const newDirty = { ...prev.dirty };
      
      Object.keys(values).forEach(key => {
        newDirty[key as keyof T] = values[key as keyof T] !== initialValuesRef.current[key as keyof T];
      });

      return {
        ...prev,
        values: newValues,
        dirty: newDirty,
        isDirty: Object.values(newDirty).some(Boolean),
      };
    });

    if (validateOnChange) {
      validate();
    }
  }, [validateOnChange, validate]);

  const setErrors = useCallback((errors: Partial<Record<keyof T, string | null>>) => {
    setState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        ...errors,
      },
    }));
  }, []);

  const reset = useCallback((values?: Partial<T>) => {
    const resetValues = values ? { ...initialValuesRef.current, ...values } : initialValuesRef.current;
    
    setState({
      values: resetValues,
      errors: {} as Record<keyof T, string | null>,
      touched: {} as Record<keyof T, boolean>,
      dirty: {} as Record<keyof T, boolean>,
      isValid: true,
      isDirty: false,
      isSubmitting: false,
      isSubmitted: false,
    });
  }, []);

  const submit = useCallback(async () => {
    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      if (validateOnSubmit && !validate()) {
        setState(prev => ({ ...prev, isSubmitting: false }));
        return;
      }

      await onSubmit(state.values);
      
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        isSubmitted: true,
      }));

      onSuccess?.(state.values);

      if (resetOnSubmit) {
        reset();
      }
    } catch (error) {
      setState(prev => ({ ...prev, isSubmitting: false }));
      throw error;
    }
  }, [state.values, validateOnSubmit, validate, onSubmit, onSuccess, resetOnSubmit, reset]);

  return {
    ...state,
    setValue,
    setError,
    setTouched,
    setValues,
    setErrors,
    reset,
    validate,
    validateField,
    submit,
  };
}

// Hook for form field
export function useFormField<T extends Record<string, any>>(
  form: FormState<T> & FormActions<T>,
  field: keyof T
) {
  const value = form.values[field];
  const error = form.errors[field];
  const touched = form.touched[field];
  const dirty = form.dirty[field];

  const setValue = useCallback((value: any) => {
    form.setValue(field, value);
  }, [form, field]);

  const setError = useCallback((error: string | null) => {
    form.setError(field, error);
  }, [form, field]);

  const setTouched = useCallback((touched: boolean = true) => {
    form.setTouched(field, touched);
  }, [form, field]);

  const validate = useCallback(() => {
    return form.validateField(field);
  }, [form, field]);

  return {
    value,
    error,
    touched,
    dirty,
    setValue,
    setError,
    setTouched,
    validate,
    hasError: Boolean(error && touched),
    isDirty: dirty,
    isTouched: touched,
  };
}

// Hook for form validation
export function useFormValidation<T extends Record<string, any>>(
  form: FormState<T> & FormActions<T>
) {
  const hasErrors = Object.values(form.errors).some(Boolean);
  const hasTouchedErrors = Object.keys(form.errors).some(
    key => form.errors[key as keyof T] && form.touched[key as keyof T]
  );

  const getFieldError = useCallback((field: keyof T) => {
    return form.errors[field];
  }, [form.errors]);

  const hasFieldError = useCallback((field: keyof T) => {
    return Boolean(form.errors[field] && form.touched[field]);
  }, [form.errors, form.touched]);

  const clearFieldError = useCallback((field: keyof T) => {
    form.setError(field, null);
  }, [form]);

  const clearAllErrors = useCallback(() => {
    const clearedErrors = Object.keys(form.errors).reduce((acc, key) => {
      acc[key as keyof T] = null;
      return acc;
    }, {} as Record<keyof T, string | null>);
    
    form.setErrors(clearedErrors);
  }, [form]);

  return {
    hasErrors,
    hasTouchedErrors,
    getFieldError,
    hasFieldError,
    clearFieldError,
    clearAllErrors,
    isValid: form.isValid,
    isDirty: form.isDirty,
  };
}
