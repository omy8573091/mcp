// Validation System Exports
// Comprehensive input validation system using Zod and React Hook Form

// Types
export type {
  ValidationResult,
  FieldValidationResult,
} from './utils';

// Schemas
export {
  validationSchemas,
  createCustomValidator,
  asyncEmailSchema,
  asyncUsernameSchema,
} from './schemas';

// Hooks
export {
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
  validationHooks,
} from './hooks';

// Utilities
export {
  ValidationUtils,
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
} from './utils';

// Components
export {
  ValidatedInput,
  ValidatedSearchInput,
  ValidatedSelectInput,
  ValidatedTextarea,
} from '../../design-system/components/ValidatedInput';

export {
  ValidatedForm,
  FormField,
  FormSection,
  FormActions,
} from '../../design-system/components/ValidatedForm';

// Validation configuration helpers
export const createValidationConfig = (
  schema: any,
  options?: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    debounceMs?: number;
    showValidationIcon?: boolean;
    showValidationMessage?: boolean;
    customErrorMessage?: string;
  }
) => ({
  schema,
  validateOnChange: true,
  validateOnBlur: true,
  debounceMs: 300,
  showValidationIcon: true,
  showValidationMessage: true,
  ...options,
});

// Common validation configurations
export const commonValidationConfigs = {
  email: createValidationConfig(validationSchemas.email),
  password: createValidationConfig(validationSchemas.password),
  documentTitle: createValidationConfig(validationSchemas.documentTitle),
  documentDescription: createValidationConfig(validationSchemas.documentDescription),
  phone: createValidationConfig(validationSchemas.phone),
  url: createValidationConfig(validationSchemas.url),
  username: createValidationConfig(validationSchemas.username),
  firstName: createValidationConfig(validationSchemas.firstName),
  lastName: createValidationConfig(validationSchemas.lastName),
  searchQuery: createValidationConfig(validationSchemas.searchQuery),
  documentType: createValidationConfig(validationSchemas.documentType),
  documentCategory: createValidationConfig(validationSchemas.documentCategory),
  documentPriority: createValidationConfig(validationSchemas.documentPriority),
};

// Validation presets for common use cases
export const validationPresets = {
  // Form presets
  loginForm: {
    email: commonValidationConfigs.email,
    password: createValidationConfig(validationSchemas.password, {
      customErrorMessage: 'Password is required',
    }),
  },
  
  registerForm: {
    firstName: commonValidationConfigs.firstName,
    lastName: commonValidationConfigs.lastName,
    email: commonValidationConfigs.email,
    username: commonValidationConfigs.username,
    password: commonValidationConfigs.password,
  },
  
  documentUpload: {
    title: commonValidationConfigs.documentTitle,
    description: commonValidationConfigs.documentDescription,
    type: commonValidationConfigs.documentType,
    category: commonValidationConfigs.documentCategory,
    priority: commonValidationConfigs.documentPriority,
  },
  
  userSettings: {
    firstName: commonValidationConfigs.firstName,
    lastName: commonValidationConfigs.lastName,
    email: commonValidationConfigs.email,
    phone: commonValidationConfigs.phone,
  },
  
  searchForm: {
    query: commonValidationConfigs.searchQuery,
  },
  
  riskAssessment: {
    title: createValidationConfig(validationSchemas.riskAssessment.shape.title),
    description: createValidationConfig(validationSchemas.riskAssessment.shape.description),
    riskLevel: createValidationConfig(validationSchemas.riskAssessment.shape.riskLevel),
    category: createValidationConfig(validationSchemas.riskAssessment.shape.category),
    impact: createValidationConfig(validationSchemas.riskAssessment.shape.impact),
    probability: createValidationConfig(validationSchemas.riskAssessment.shape.probability),
  },
};

// Validation middleware for forms
export const createFormValidation = <T extends Record<string, any>>(
  schema: any,
  options?: {
    mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
    reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
    defaultValues?: Partial<T>;
  }
) => {
  return {
    schema,
    resolver: zodResolver(schema),
    mode: options?.mode || 'onChange',
    reValidateMode: options?.reValidateMode || 'onChange',
    defaultValues: options?.defaultValues,
  };
};

// Validation helpers for specific scenarios
export const validationHelpers = {
  // File validation
  validateFile: (file: File, options?: { maxSize?: number; allowedTypes?: string[] }) => {
    const maxSize = options?.maxSize || 50 * 1024 * 1024; // 50MB
    const allowedTypes = options?.allowedTypes || [
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
    
    const sizeValidation = ValidationUtils.validateFileSize(file, maxSize);
    const typeValidation = ValidationUtils.validateFileType(file, allowedTypes);
    
    return {
      isValid: sizeValidation.isValid && typeValidation.isValid,
      errors: [
        ...(sizeValidation.error ? [sizeValidation.error] : []),
        ...(typeValidation.error ? [typeValidation.error] : []),
      ],
    };
  },
  
  // Password strength validation
  validatePassword: (password: string) => {
    return ValidationUtils.validatePasswordStrength(password);
  },
  
  // Email validation
  validateEmail: (email: string) => {
    return ValidationUtils.isValidEmail(email);
  },
  
  // Phone validation
  validatePhone: (phone: string) => {
    return ValidationUtils.isValidPhone(phone);
  },
  
  // URL validation
  validateUrl: (url: string) => {
    return ValidationUtils.isValidUrl(url);
  },
  
  // Date range validation
  validateDateRange: (startDate: string, endDate: string) => {
    return ValidationUtils.validateDateRange(startDate, endDate);
  },
  
  // Number range validation
  validateNumberRange: (min: number, max: number) => {
    return ValidationUtils.validateNumberRange(min, max);
  },
};

// Export all validation schemas for easy access
export const schemas = validationSchemas;

// Default export
export default {
  // Schemas
  schemas: validationSchemas,
  
  // Hooks
  hooks: validationHooks,
  
  // Utilities
  utils: ValidationUtils,
  
  // Components
  components: {
    ValidatedInput,
    ValidatedSearchInput,
    ValidatedSelectInput,
    ValidatedTextarea,
    ValidatedForm,
    FormField,
    FormSection,
    FormActions,
  },
  
  // Configuration helpers
  createValidationConfig,
  commonValidationConfigs,
  validationPresets,
  createFormValidation,
  validationHelpers,
  
  // Re-export everything for convenience
  ...validationSchemas,
  ...validationHooks,
  ValidationUtils,
};
