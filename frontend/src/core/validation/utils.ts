import { z } from 'zod';
import { FieldError, FieldErrors } from 'react-hook-form';

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: any;
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

// Validation utilities
export class ValidationUtils {
  // Validate a single value against a schema
  static validateValue<T>(
    schema: z.ZodSchema<T>,
    value: unknown
  ): ValidationResult {
    try {
      const data = schema.parse(value);
      return {
        isValid: true,
        errors: [],
        data,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(err => err.message),
        };
      }
      return {
        isValid: false,
        errors: ['Validation failed'],
      };
    }
  }

  // Validate multiple values against a schema
  static validateValues<T>(
    schema: z.ZodSchema<T>,
    values: Record<string, unknown>
  ): ValidationResult {
    try {
      const data = schema.parse(values);
      return {
        isValid: true,
        errors: [],
        data,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(err => err.message),
        };
      }
      return {
        isValid: false,
        errors: ['Validation failed'],
      };
    }
  }

  // Safe parse with custom error handling
  static safeParse<T>(
    schema: z.ZodSchema<T>,
    value: unknown
  ): { success: true; data: T } | { success: false; error: string } {
    const result = schema.safeParse(value);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    const errorMessage = result.error.errors
      .map(err => err.message)
      .join(', ');
    
    return { success: false, error: errorMessage };
  }

  // Get first error message from validation result
  static getFirstError(errors: string[]): string | undefined {
    return errors.length > 0 ? errors[0] : undefined;
  }

  // Check if a field has errors
  static hasFieldError(fieldErrors: FieldErrors, fieldName: string): boolean {
    return !!fieldErrors[fieldName];
  }

  // Get field error message
  static getFieldErrorMessage(fieldErrors: FieldErrors, fieldName: string): string | undefined {
    const error = fieldErrors[fieldName];
    return error?.message;
  }

  // Format validation errors for display
  static formatErrors(errors: FieldErrors): Record<string, string> {
    const formatted: Record<string, string> = {};
    
    Object.keys(errors).forEach(key => {
      const error = errors[key];
      if (error?.message) {
        formatted[key] = error.message;
      }
    });
    
    return formatted;
  }

  // Create a custom error message
  static createErrorMessage(field: string, message: string): FieldError {
    return {
      type: 'manual',
      message,
    };
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone number format
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
  }

  // Validate URL format
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validate password strength
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one lowercase letter');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one uppercase letter');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one number');
    }

    if (/[@$!%*?&]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one special character');
    }

    return {
      isValid: score >= 4,
      score,
      feedback,
    };
  }

  // Validate file size
  static validateFileSize(file: File, maxSize: number): FieldValidationResult {
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
      };
    }
    return { isValid: true };
  }

  // Validate file type
  static validateFileType(file: File, allowedTypes: string[]): FieldValidationResult {
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not supported',
      };
    }
    return { isValid: true };
  }

  // Validate date range
  static validateDateRange(startDate: string, endDate: string): FieldValidationResult {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return {
        isValid: false,
        error: 'End date must be after start date',
      };
    }
    return { isValid: true };
  }

  // Validate number range
  static validateNumberRange(min: number, max: number): FieldValidationResult {
    if (min > max) {
      return {
        isValid: false,
        error: 'Maximum value must be greater than or equal to minimum value',
      };
    }
    return { isValid: true };
  }

  // Debounce validation
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle validation
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Create validation rules
  static createValidationRule(
    validator: (value: any) => boolean,
    message: string
  ) {
    return {
      validate: validator,
      message,
    };
  }

  // Create async validation rule
  static createAsyncValidationRule(
    validator: (value: any) => Promise<boolean>,
    message: string
  ) {
    return {
      validate: validator,
      message,
    };
  }

  // Create conditional validation rule
  static createConditionalValidationRule(
    condition: (value: any, formData: any) => boolean,
    validator: (value: any) => boolean,
    message: string
  ) {
    return {
      validate: (value: any, formData: any) => {
        if (condition(value, formData)) {
          return validator(value);
        }
        return true;
      },
      message,
    };
  }

  // Sanitize input
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  // Normalize input
  static normalizeInput(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' '); // Replace multiple spaces with single space
  }

  // Format validation error for display
  static formatValidationError(error: z.ZodError): string {
    return error.errors
      .map(err => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
        return `${path}${err.message}`;
      })
      .join(', ');
  }

  // Get validation error by field path
  static getErrorByPath(error: z.ZodError, path: string[]): z.ZodIssue | undefined {
    return error.errors.find(err => 
      err.path.length === path.length && 
      err.path.every((segment, index) => segment === path[index])
    );
  }

  // Check if validation error is for specific field
  static isFieldError(error: z.ZodError, fieldName: string): boolean {
    return error.errors.some(err => 
      err.path.length === 1 && err.path[0] === fieldName
    );
  }

  // Merge validation errors
  static mergeErrors(...errors: FieldErrors[]): FieldErrors {
    const merged: FieldErrors = {};
    
    errors.forEach(errorObj => {
      Object.keys(errorObj).forEach(key => {
        if (errorObj[key]) {
          merged[key] = errorObj[key];
        }
      });
    });
    
    return merged;
  }

  // Clear validation errors
  static clearErrors(errors: FieldErrors, fields?: string[]): FieldErrors {
    if (!fields) {
      return {};
    }
    
    const cleared = { ...errors };
    fields.forEach(field => {
      delete cleared[field];
    });
    
    return cleared;
  }

  // Validate nested object
  static validateNestedObject<T>(
    schema: z.ZodSchema<T>,
    data: any,
    path: string[] = []
  ): ValidationResult {
    try {
      const result = schema.parse(data);
      return {
        isValid: true,
        errors: [],
        data: result,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => {
          const fullPath = [...path, ...err.path].join('.');
          return `${fullPath}: ${err.message}`;
        });
        
        return {
          isValid: false,
          errors,
        };
      }
      
      return {
        isValid: false,
        errors: ['Validation failed'],
      };
    }
  }

  // Create validation summary
  static createValidationSummary(errors: FieldErrors): {
    totalErrors: number;
    fieldErrors: Record<string, string>;
    hasErrors: boolean;
  } {
    const fieldErrors = this.formatErrors(errors);
    const totalErrors = Object.keys(fieldErrors).length;
    
    return {
      totalErrors,
      fieldErrors,
      hasErrors: totalErrors > 0,
    };
  }
}

// Export utility functions
export const {
  validateValue,
  validateValues,
  safeParse,
  getFirstError,
  hasFieldError,
  getFieldErrorMessage,
  formatErrors,
  createErrorMessage,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  validatePasswordStrength,
  validateFileSize,
  validateFileType,
  validateDateRange,
  validateNumberRange,
  debounce,
  throttle,
  createValidationRule,
  createAsyncValidationRule,
  createConditionalValidationRule,
  sanitizeInput,
  normalizeInput,
  formatValidationError,
  getErrorByPath,
  isFieldError,
  mergeErrors,
  clearErrors,
  validateNestedObject,
  createValidationSummary,
} = ValidationUtils;
