import { Middleware } from '@reduxjs/toolkit';
import { z } from 'zod';
import { validationHelpers } from '../core/validators';
import { ErrorFactory } from '../core/errors';
import { logger } from './loggingMiddleware';

// Validation schemas for different action types
const validationSchemas: Record<string, z.ZodSchema> = {
  'documents/create': z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    documentType: z.enum(['POLICY', 'PROCEDURE', 'CONTROL', 'RISK_ASSESSMENT', 'AUDIT_REPORT']),
    framework: z.enum(['SOX', 'GDPR', 'ISO27001', 'NIST', 'COSO']),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  }),
  
  'documents/update': z.object({
    id: z.string().uuid('Invalid document ID'),
    title: z.string().min(1, 'Title is required').optional(),
    description: z.string().optional(),
    documentType: z.enum(['POLICY', 'PROCEDURE', 'CONTROL', 'RISK_ASSESSMENT', 'AUDIT_REPORT']).optional(),
    framework: z.enum(['SOX', 'GDPR', 'ISO27001', 'NIST', 'COSO']).optional(),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  }),
  
  'users/create': z.object({
    email: z.string().email('Invalid email format'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    role: z.enum(['admin', 'user', 'viewer']),
  }),
  
  'users/update': z.object({
    id: z.string().uuid('Invalid user ID'),
    email: z.string().email('Invalid email format').optional(),
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    role: z.enum(['admin', 'user', 'viewer']).optional(),
  }),
  
  'auth/login': z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),
  
  'auth/register': z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
  
  'settings/update': z.object({
    theme: z.enum(['light', 'dark', 'system']),
    language: z.string().min(2, 'Language code is required'),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
    }),
  }),
  
  'profile/update': z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  }),
};

// Validation middleware
export const validationMiddleware: Middleware = (store) => (next) => (action) => {
  // Check if action has validation schema
  const schema = validationSchemas[action.type];
  
  if (schema && action.payload) {
    // Validate payload
    const result = validationHelpers.validateSchema(schema, action.payload);
    
    if (!result.success) {
      // Validation failed
      const validationError = ErrorFactory.createValidationError(
        'Validation failed',
        undefined,
        { errors: result.errors }
      );
      
      logger.warn('Validation failed', {
        action: action.type,
        errors: result.errors,
        payload: action.payload,
        timestamp: new Date().toISOString(),
      });
      
      return next({
        type: `${action.type}/validationFailed`,
        payload: {
          originalAction: action,
          errors: result.errors,
          validationError,
        },
      });
    }
    
    // Validation passed, continue with action
    logger.debug('Validation passed', {
      action: action.type,
      timestamp: new Date().toISOString(),
    });
  }
  
  return next(action);
};

// Field validation middleware
export const fieldValidationMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type.endsWith('/fieldValidation')) {
    const { field, value, schema } = action.payload;
    
    if (schema) {
      const result = validationHelpers.validateField(schema, value);
      
      if (!result.success) {
        return next({
          type: `${action.type}/failed`,
          payload: {
            field,
            error: result.error,
          },
        });
      }
    }
  }
  
  return next(action);
};

// Sanitization middleware
export const sanitizationMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.payload && typeof action.payload === 'object') {
    const sanitizedPayload = sanitizePayload(action.payload);
    
    if (sanitizedPayload !== action.payload) {
      logger.info('Payload sanitized', {
        action: action.type,
        originalPayload: action.payload,
        sanitizedPayload,
        timestamp: new Date().toISOString(),
      });
      
      return next({
        ...action,
        payload: sanitizedPayload,
      });
    }
  }
  
  return next(action);
};

// Sanitize payload
const sanitizePayload = (payload: any): any => {
  if (typeof payload === 'string') {
    return sanitizeString(payload);
  }
  
  if (Array.isArray(payload)) {
    return payload.map(sanitizePayload);
  }
  
  if (payload && typeof payload === 'object') {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(payload)) {
      sanitized[key] = sanitizePayload(value);
    }
    
    return sanitized;
  }
  
  return payload;
};

// Sanitize string
const sanitizeString = (str: string): string => {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// Input validation middleware
export const inputValidationMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type.startsWith('input/')) {
    const { field, value, rules } = action.payload;
    
    // Apply validation rules
    const errors: string[] = [];
    
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push(`${field} is required`);
    }
    
    if (rules.minLength && value && value.toString().length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
    }
    
    if (rules.maxLength && value && value.toString().length > rules.maxLength) {
      errors.push(`${field} must be less than ${rules.maxLength} characters`);
    }
    
    if (rules.pattern && value && !rules.pattern.test(value.toString())) {
      errors.push(`${field} format is invalid`);
    }
    
    if (rules.email && value && !isValidEmail(value.toString())) {
      errors.push(`${field} must be a valid email address`);
    }
    
    if (rules.url && value && !isValidUrl(value.toString())) {
      errors.push(`${field} must be a valid URL`);
    }
    
    if (rules.phone && value && !isValidPhone(value.toString())) {
      errors.push(`${field} must be a valid phone number`);
    }
    
    if (errors.length > 0) {
      return next({
        type: `${action.type}/validationFailed`,
        payload: {
          field,
          errors,
        },
      });
    }
  }
  
  return next(action);
};

// Validation helper functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// File validation middleware
export const fileValidationMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === 'files/upload') {
    const { file, maxSize, allowedTypes } = action.payload;
    
    const errors: string[] = [];
    
    // Check file size
    if (maxSize && file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }
    
    // Check file type
    if (allowedTypes && allowedTypes.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
      }
    }
    
    // Check file name
    if (file.name.length > 255) {
      errors.push('File name must be less than 255 characters');
    }
    
    // Check for dangerous file types
    const dangerousTypes = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension && dangerousTypes.includes(fileExtension)) {
      errors.push('File type is not allowed for security reasons');
    }
    
    if (errors.length > 0) {
      return next({
        type: 'files/upload/validationFailed',
        payload: {
          file: file.name,
          errors,
        },
      });
    }
  }
  
  return next(action);
};

// Custom validation middleware
export const customValidationMiddleware = (customValidators: Record<string, (value: any) => string | null>) => {
  return (store: any) => (next: any) => (action: any) => {
    if (action.type.startsWith('custom/')) {
      const { field, value, validator } = action.payload;
      
      if (customValidators[validator]) {
        const error = customValidators[validator](value);
        
        if (error) {
          return next({
            type: `${action.type}/validationFailed`,
            payload: {
              field,
              error,
            },
          });
        }
      }
    }
    
    return next(action);
  };
};

// Validation state middleware
export const validationStateMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type.endsWith('/validationFailed')) {
    // Update validation state
    const { field, errors } = action.payload;
    
    return next({
      type: 'validation/setFieldError',
      payload: {
        field,
        errors: Array.isArray(errors) ? errors : [errors],
      },
    });
  }
  
  if (action.type.endsWith('/validationPassed')) {
    // Clear validation state
    const { field } = action.payload;
    
    return next({
      type: 'validation/clearFieldError',
      payload: { field },
    });
  }
  
  return next(action);
};

// Validation summary middleware
export const validationSummaryMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === 'validation/validateAll') {
    const state = store.getState();
    const validationState = state.validation || {};
    
    const hasErrors = Object.keys(validationState).some(field => 
      validationState[field] && validationState[field].length > 0
    );
    
    return next({
      type: 'validation/setValidationSummary',
      payload: {
        isValid: !hasErrors,
        errors: validationState,
      },
    });
  }
  
  return next(action);
};
