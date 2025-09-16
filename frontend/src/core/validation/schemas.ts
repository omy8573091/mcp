import { z } from 'zod';

// Base validation schemas
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(
    /^[\+]?[1-9][\d]{0,15}$/,
    'Please enter a valid phone number'
  )
  .optional()
  .or(z.literal(''));

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));

// Document validation schemas
export const documentTitleSchema = z
  .string()
  .min(1, 'Document title is required')
  .max(200, 'Document title must be less than 200 characters')
  .regex(
    /^[a-zA-Z0-9\s\-_.,()]+$/,
    'Document title can only contain letters, numbers, spaces, and basic punctuation'
  );

export const documentDescriptionSchema = z
  .string()
  .max(1000, 'Description must be less than 1000 characters')
  .optional()
  .or(z.literal(''));

export const documentTypeSchema = z.enum([
  'pdf',
  'docx',
  'xlsx',
  'pptx',
  'txt',
  'csv',
  'image',
  'other'
], {
  errorMap: () => ({ message: 'Please select a valid document type' })
});

export const documentCategorySchema = z.enum([
  'policy',
  'procedure',
  'guideline',
  'form',
  'template',
  'report',
  'contract',
  'agreement',
  'certificate',
  'other'
], {
  errorMap: () => ({ message: 'Please select a valid document category' })
});

export const documentPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'critical'
], {
  errorMap: () => ({ message: 'Please select a valid priority level' })
});

// User validation schemas
export const firstNameSchema = z
  .string()
  .min(1, 'First name is required')
  .max(50, 'First name must be less than 50 characters')
  .regex(
    /^[a-zA-Z\s\-']+$/,
    'First name can only contain letters, spaces, hyphens, and apostrophes'
  );

export const lastNameSchema = z
  .string()
  .min(1, 'Last name is required')
  .max(50, 'Last name must be less than 50 characters')
  .regex(
    /^[a-zA-Z\s\-']+$/,
    'Last name can only contain letters, spaces, hyphens, and apostrophes'
  );

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'Username can only contain letters, numbers, and underscores'
  );

export const roleSchema = z.enum([
  'admin',
  'manager',
  'analyst',
  'viewer',
  'guest'
], {
  errorMap: () => ({ message: 'Please select a valid role' })
});

export const subscriptionSchema = z.enum([
  'free',
  'basic',
  'standard',
  'pro',
  'enterprise'
], {
  errorMap: () => ({ message: 'Please select a valid subscription tier' })
});

// Search validation schemas
export const searchQuerySchema = z
  .string()
  .min(1, 'Search query is required')
  .max(500, 'Search query must be less than 500 characters')
  .regex(
    /^[a-zA-Z0-9\s\-_.,()!?]+$/,
    'Search query contains invalid characters'
  );

export const searchFiltersSchema = z.object({
  documentType: documentTypeSchema.optional(),
  category: documentCategorySchema.optional(),
  priority: documentPrioritySchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// File upload validation schemas
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 50 * 1024 * 1024, // 50MB
      'File size must be less than 50MB'
    )
    .refine(
      (file) => {
        const allowedTypes = [
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
        ];
        return allowedTypes.includes(file.type);
      },
      'File type not supported. Please upload PDF, DOCX, XLSX, PPTX, TXT, CSV, or image files.'
    ),
  title: documentTitleSchema,
  description: documentDescriptionSchema,
  category: documentCategorySchema,
  priority: documentPrioritySchema,
  tags: z.array(z.string()).optional(),
});

// Bulk upload validation schema
export const bulkUploadSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(1, 'At least one file is required')
    .max(100, 'Maximum 100 files allowed')
    .refine(
      (files) => files.every(file => file.size <= 50 * 1024 * 1024),
      'All files must be less than 50MB'
    ),
  defaultCategory: documentCategorySchema,
  defaultPriority: documentPrioritySchema,
  defaultTags: z.array(z.string()).optional(),
});

// Settings validation schemas
export const userSettingsSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  timezone: z.string().min(1, 'Timezone is required'),
  language: z.enum(['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar'], {
    errorMap: () => ({ message: 'Please select a valid language' })
  }),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }),
  privacy: z.object({
    profileVisibility: z.enum(['public', 'private', 'team']),
    dataSharing: z.boolean(),
  }),
});

export const organizationSettingsSchema = z.object({
  name: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be less than 100 characters'),
  domain: z
    .string()
    .min(1, 'Domain is required')
    .max(100, 'Domain must be less than 100 characters')
    .regex(
      /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid domain'
    ),
  address: z.object({
    street: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    zipCode: z.string().max(20).optional(),
    country: z.string().max(100).optional(),
  }),
  contact: z.object({
    email: emailSchema,
    phone: phoneSchema,
    website: urlSchema,
  }),
});

// API validation schemas
export const apiKeySchema = z.object({
  name: z
    .string()
    .min(1, 'API key name is required')
    .max(50, 'API key name must be less than 50 characters'),
  permissions: z.array(z.enum([
    'read',
    'write',
    'delete',
    'admin'
  ])).min(1, 'At least one permission is required'),
  expiresAt: z.string().optional(),
});

// Compliance validation schemas
export const complianceFrameworkSchema = z.enum([
  'SOX',
  'GDPR',
  'HIPAA',
  'PCI-DSS',
  'ISO27001',
  'NIST',
  'COBIT',
  'ITIL',
  'other'
], {
  errorMap: () => ({ message: 'Please select a valid compliance framework' })
});

export const riskAssessmentSchema = z.object({
  title: z
    .string()
    .min(1, 'Risk assessment title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: 'Please select a valid risk level' })
  }),
  category: z.enum([
    'operational',
    'financial',
    'strategic',
    'compliance',
    'reputational',
    'technical',
    'other'
  ], {
    errorMap: () => ({ message: 'Please select a valid risk category' })
  }),
  impact: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Please select a valid impact level' })
  }),
  probability: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Please select a valid probability level' })
  }),
  mitigation: z
    .string()
    .max(1000, 'Mitigation plan must be less than 1000 characters')
    .optional(),
  owner: z.string().min(1, 'Risk owner is required'),
  dueDate: z.string().optional(),
});

// Form validation schemas
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const registerFormSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
  token: z.string().min(1, 'Reset token is required'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Advanced validation schemas
export const dateRangeSchema = z.object({
  from: z.string().min(1, 'Start date is required'),
  to: z.string().min(1, 'End date is required'),
}).refine(data => new Date(data.from) <= new Date(data.to), {
  message: "End date must be after start date",
  path: ["to"],
});

export const numberRangeSchema = z.object({
  min: z.number().min(0, 'Minimum value must be 0 or greater'),
  max: z.number().min(0, 'Maximum value must be 0 or greater'),
}).refine(data => data.min <= data.max, {
  message: "Maximum value must be greater than or equal to minimum value",
  path: ["max"],
});

export const conditionalSchema = z.object({
  type: z.enum(['individual', 'organization']),
  individualData: z.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: emailSchema,
  }).optional(),
  organizationData: z.object({
    name: z.string().min(1, 'Organization name is required'),
    domain: z.string().min(1, 'Domain is required'),
    contactEmail: emailSchema,
  }).optional(),
}).refine(data => {
  if (data.type === 'individual') {
    return data.individualData !== undefined;
  }
  if (data.type === 'organization') {
    return data.organizationData !== undefined;
  }
  return false;
}, {
  message: "Required data is missing for the selected type",
  path: ["type"],
});

// Custom validation functions
export const createCustomValidator = <T>(
  schema: z.ZodSchema<T>,
  customMessage?: string
) => {
  return (value: unknown): { isValid: boolean; error?: string } => {
    try {
      schema.parse(value);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          error: customMessage || error.errors[0]?.message || 'Invalid value'
        };
      }
      return {
        isValid: false,
        error: customMessage || 'Validation failed'
      };
    }
  };
};

// Async validation schemas
export const asyncEmailSchema = z
  .string()
  .email()
  .refine(async (email) => {
    // Simulate API call to check if email exists
    const response = await fetch(`/api/check-email?email=${email}`);
    const data = await response.json();
    return !data.exists;
  }, {
    message: "Email already exists"
  });

export const asyncUsernameSchema = z
  .string()
  .min(3)
  .max(30)
  .refine(async (username) => {
    // Simulate API call to check if username exists
    const response = await fetch(`/api/check-username?username=${username}`);
    const data = await response.json();
    return !data.exists;
  }, {
    message: "Username already exists"
  });

// Export all schemas
export const validationSchemas = {
  // Base schemas
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  url: urlSchema,
  
  // Document schemas
  documentTitle: documentTitleSchema,
  documentDescription: documentDescriptionSchema,
  documentType: documentTypeSchema,
  documentCategory: documentCategorySchema,
  documentPriority: documentPrioritySchema,
  
  // User schemas
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  username: usernameSchema,
  role: roleSchema,
  subscription: subscriptionSchema,
  
  // Search schemas
  searchQuery: searchQuerySchema,
  searchFilters: searchFiltersSchema,
  
  // File upload schemas
  fileUpload: fileUploadSchema,
  bulkUpload: bulkUploadSchema,
  
  // Settings schemas
  userSettings: userSettingsSchema,
  organizationSettings: organizationSettingsSchema,
  
  // API schemas
  apiKey: apiKeySchema,
  
  // Compliance schemas
  complianceFramework: complianceFrameworkSchema,
  riskAssessment: riskAssessmentSchema,
  
  // Form schemas
  loginForm: loginFormSchema,
  registerForm: registerFormSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  changePassword: changePasswordSchema,
  
  // Advanced schemas
  dateRange: dateRangeSchema,
  numberRange: numberRangeSchema,
  conditional: conditionalSchema,
  
  // Async schemas
  asyncEmail: asyncEmailSchema,
  asyncUsername: asyncUsernameSchema,
};

export type ValidationSchemas = typeof validationSchemas;
