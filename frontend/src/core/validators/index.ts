import { z } from 'zod';
import { VALIDATION } from '../constants';

// Base validation schemas
export const baseSchemas = {
  id: z.string().uuid('Invalid ID format'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number'),
  url: z.string().url('Invalid URL format'),
  date: z.string().datetime('Invalid date format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  strongPassword: z.string().regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    'Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character'
  ),
};

// Document validation schemas
export const documentSchemas = {
  title: z.string()
    .min(1, 'Title is required')
    .max(VALIDATION.maxTitleLength, `Title must be less than ${VALIDATION.maxTitleLength} characters`),
  
  description: z.string()
    .max(VALIDATION.maxDescriptionLength, `Description must be less than ${VALIDATION.maxDescriptionLength} characters`)
    .optional(),
  
  filename: z.string()
    .min(1, 'Filename is required')
    .regex(/^[^<>:"/\\|?*]+$/, 'Invalid filename characters'),
  
  fileSize: z.number()
    .min(1, 'File size must be greater than 0')
    .max(VALIDATION.maxFileSize, `File size must be less than ${VALIDATION.maxFileSize / (1024 * 1024)}MB`),
  
  fileType: z.enum(VALIDATION.allowedFileTypes as [string, ...string[]], {
    errorMap: () => ({ message: `File type must be one of: ${VALIDATION.allowedFileTypes.join(', ')}` })
  }),
  
  documentType: z.enum(['POLICY', 'PROCEDURE', 'CONTROL', 'RISK_ASSESSMENT', 'AUDIT_REPORT', 'COMPLIANCE_REPORT', 'TRAINING_MATERIAL', 'OTHER']),
  
  framework: z.enum(['SOX', 'GDPR', 'ISO27001', 'NIST', 'COSO', 'PCI_DSS', 'HIPAA', 'FISMA']),
  
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  
  status: z.enum(['draft', 'pending_review', 'approved', 'rejected', 'archived']),
  
  complianceScore: z.number()
    .min(0, 'Compliance score must be between 0 and 1')
    .max(1, 'Compliance score must be between 0 and 1'),
};

// Form validation schemas
export const formSchemas = {
  login: z.object({
    email: baseSchemas.email,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),
  
  register: z.object({
    email: baseSchemas.email,
    password: baseSchemas.strongPassword,
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
  
  documentUpload: z.object({
    title: documentSchemas.title,
    description: documentSchemas.description,
    documentType: documentSchemas.documentType,
    framework: documentSchemas.framework,
    riskLevel: documentSchemas.riskLevel,
    tags: z.array(z.string()).optional(),
    isPublic: z.boolean().optional(),
  }),
  
  documentSearch: z.object({
    query: z.string().min(1, 'Search query is required'),
    filters: z.object({
      documentType: documentSchemas.documentType.optional(),
      framework: documentSchemas.framework.optional(),
      riskLevel: documentSchemas.riskLevel.optional(),
      status: documentSchemas.status.optional(),
      dateRange: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
      }).optional(),
    }).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
  
  profile: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: baseSchemas.email,
    phone: baseSchemas.phone.optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    preferences: z.object({
      theme: z.enum(['light', 'dark', 'system']),
      language: z.string(),
      notifications: z.boolean(),
    }).optional(),
  }),
  
  settings: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    language: z.string(),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
    }),
    privacy: z.object({
      profileVisibility: z.enum(['public', 'private', 'friends']),
      dataSharing: z.boolean(),
    }),
  }),
};

// API validation schemas
export const apiSchemas = {
  pagination: z.object({
    page: z.number().int().min(1, 'Page must be greater than 0'),
    limit: z.number().int().min(1, 'Limit must be greater than 0').max(1000, 'Limit must be less than 1000'),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
  
  filter: z.object({
    search: z.string().optional(),
    filters: z.record(z.any()).optional(),
    dateRange: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
  }),
  
  idParam: z.object({
    id: baseSchemas.id,
  }),
};

// Custom validation functions
export const customValidators = {
  fileSize: (maxSize: number = VALIDATION.maxFileSize) => (file: File) => {
    if (file.size > maxSize) {
      return `File size must be less than ${maxSize / (1024 * 1024)}MB`;
    }
    return null;
  },
  
  fileType: (allowedTypes: string[] = VALIDATION.allowedFileTypes) => (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedTypes.includes(extension)) {
      return `File type must be one of: ${allowedTypes.join(', ')}`;
    }
    return null;
  },
  
  dateRange: (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return 'End date must be after start date';
    }
    return null;
  },
  
  uniqueEmail: async (email: string) => {
    // This would typically make an API call to check if email exists
    // For now, we'll simulate it
    return new Promise<null | string>((resolve) => {
      setTimeout(() => {
        // Simulate email check
        if (email === 'test@example.com') {
          resolve('Email already exists');
        } else {
          resolve(null);
        }
      }, 1000);
    });
  },
  
  passwordStrength: (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    
    if (score < 3) {
      return 'Password is too weak';
    }
    if (score < 5) {
      return 'Password could be stronger';
    }
    return null;
  },
};

// Validation helper functions
export const validationHelpers = {
  validateSchema: <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } => {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(err => err.message),
        };
      }
      return {
        success: false,
        errors: ['Validation failed'],
      };
    }
  },
  
  validateField: <T>(schema: z.ZodSchema<T>, value: unknown): { success: boolean; error?: string } => {
    try {
      schema.parse(value);
      return { success: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: error.errors[0]?.message || 'Invalid value',
        };
      }
      return {
        success: false,
        error: 'Validation failed',
      };
    }
  },
  
  getFieldError: (errors: Record<string, string[]>, fieldName: string): string | undefined => {
    return errors[fieldName]?.[0];
  },
  
  hasFieldError: (errors: Record<string, string[]>, fieldName: string): boolean => {
    return Boolean(errors[fieldName]?.length);
  },
};

// Export all schemas and validators
export const validators = {
  base: baseSchemas,
  document: documentSchemas,
  form: formSchemas,
  api: apiSchemas,
  custom: customValidators,
  helpers: validationHelpers,
};
