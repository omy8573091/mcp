# Validation System Documentation

## Overview

The validation system provides comprehensive input validation using Zod schemas and React Hook Form. It offers real-time validation, custom error messages, validation states, and seamless integration with the RBAC system.

## Architecture

### Core Components

1. **Schemas** (`schemas.ts`)
   - Zod-based validation schemas for all input types
   - Pre-built schemas for common use cases
   - Custom validation rules and async validation

2. **Hooks** (`hooks.ts`)
   - React Hook Form integration
   - Custom validation hooks
   - Real-time and async validation support

3. **Utilities** (`utils.ts`)
   - Validation helper functions
   - Error handling and formatting
   - Custom validation rules

4. **Components** (`ValidatedInput.tsx`, `ValidatedForm.tsx`)
   - Validation-enhanced input components
   - Form validation with multi-step support
   - Real-time validation feedback

## Validation Schemas

### Base Schemas

#### Email Validation
```typescript
import { validationSchemas } from '../core/validation';

const emailSchema = validationSchemas.email;
// Validates: required, format, max length
```

#### Password Validation
```typescript
const passwordSchema = validationSchemas.password;
// Validates: min 8 chars, uppercase, lowercase, number, special char
```

#### Phone Validation
```typescript
const phoneSchema = validationSchemas.phone;
// Validates: international format
```

#### URL Validation
```typescript
const urlSchema = validationSchemas.url;
// Validates: proper URL format
```

### Document Schemas

#### Document Title
```typescript
const documentTitleSchema = validationSchemas.documentTitle;
// Validates: required, max 200 chars, alphanumeric + punctuation
```

#### Document Description
```typescript
const documentDescriptionSchema = validationSchemas.documentDescription;
// Validates: max 1000 chars, optional
```

#### Document Type
```typescript
const documentTypeSchema = validationSchemas.documentType;
// Validates: enum (pdf, docx, xlsx, pptx, txt, csv, image, other)
```

#### Document Category
```typescript
const documentCategorySchema = validationSchemas.documentCategory;
// Validates: enum (policy, procedure, guideline, form, template, report, contract, agreement, certificate, other)
```

#### Document Priority
```typescript
const documentPrioritySchema = validationSchemas.documentPriority;
// Validates: enum (low, medium, high, critical)
```

### User Schemas

#### Name Validation
```typescript
const firstNameSchema = validationSchemas.firstName;
const lastNameSchema = validationSchemas.lastName;
// Validates: required, max 50 chars, letters + spaces + hyphens + apostrophes
```

#### Username Validation
```typescript
const usernameSchema = validationSchemas.username;
// Validates: 3-30 chars, alphanumeric + underscores
```

#### Role Validation
```typescript
const roleSchema = validationSchemas.role;
// Validates: enum (admin, manager, analyst, viewer, guest)
```

#### Subscription Validation
```typescript
const subscriptionSchema = validationSchemas.subscription;
// Validates: enum (free, basic, standard, pro, enterprise)
```

### Form Schemas

#### Login Form
```typescript
const loginFormSchema = validationSchemas.loginForm;
// Validates: email + password + rememberMe
```

#### Register Form
```typescript
const registerFormSchema = validationSchemas.registerForm;
// Validates: firstName + lastName + email + username + password + confirmPassword + acceptTerms
// Includes password confirmation validation
```

#### Password Reset
```typescript
const resetPasswordSchema = validationSchemas.resetPassword;
// Validates: password + confirmPassword + token
```

### Advanced Schemas

#### File Upload
```typescript
const fileUploadSchema = validationSchemas.fileUpload;
// Validates: file size, type, title, description, category, priority
```

#### Bulk Upload
```typescript
const bulkUploadSchema = validationSchemas.bulkUpload;
// Validates: multiple files, default settings
```

#### Risk Assessment
```typescript
const riskAssessmentSchema = validationSchemas.riskAssessment;
// Validates: title, description, risk level, category, impact, probability, mitigation, owner
```

#### Date Range
```typescript
const dateRangeSchema = validationSchemas.dateRange;
// Validates: start date, end date, date order
```

#### Number Range
```typescript
const numberRangeSchema = validationSchemas.numberRange;
// Validates: min value, max value, range order
```

## Validation Hooks

### Basic Validation Hook
```typescript
import { useValidation } from '../core/validation';

function MyComponent() {
  const form = useValidation(validationSchemas.email, {
    mode: 'onChange',
    defaultValues: { email: '' }
  });
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      {form.formState.errors.email && (
        <span>{form.formState.errors.email.message}</span>
      )}
    </form>
  );
}
```

### Specific Validation Hooks
```typescript
import { 
  useEmailValidation,
  usePasswordValidation,
  useDocumentValidation,
  useLoginValidation,
  useRegisterValidation
} from '../core/validation';

// Email validation
const emailForm = useEmailValidation();

// Password validation
const passwordForm = usePasswordValidation();

// Document validation
const documentForm = useDocumentValidation();

// Login form validation
const loginForm = useLoginValidation();

// Register form validation
const registerForm = useRegisterValidation();
```

### Async Validation Hook
```typescript
import { useAsyncValidation } from '../core/validation';

function MyComponent() {
  const form = useAsyncValidation(validationSchemas.email, {
    asyncValidation: {
      field: 'email',
      validator: async (email) => {
        const response = await fetch(`/api/check-email?email=${email}`);
        const data = await response.json();
        return !data.exists;
      },
      message: 'Email already exists'
    }
  });
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('email')} />
      {form.formState.errors.email && (
        <span>{form.formState.errors.email.message}</span>
      )}
    </form>
  );
}
```

### Real-time Validation Hook
```typescript
import { useRealTimeValidation } from '../core/validation';

function MyComponent() {
  const form = useRealTimeValidation(validationSchemas.documentTitle, 500);
  
  const handleChange = (event) => {
    form.debouncedValidate('title', event.target.value);
  };
  
  return (
    <input 
      {...form.register('title')}
      onChange={handleChange}
    />
  );
}
```

### Field-specific Validation Hook
```typescript
import { useFieldValidation } from '../core/validation';

function MyComponent() {
  const { validateField, getFieldError, clearFieldError, fieldError, isFieldValid } = 
    useFieldValidation(validationSchemas.documentTitle, 'title');
  
  return (
    <div>
      <input onBlur={() => validateField(value)} />
      {fieldError && <span>{fieldError.message}</span>}
    </div>
  );
}
```

### Multi-step Validation Hook
```typescript
import { useMultiStepValidation } from '../core/validation';

function MyComponent() {
  const schemas = {
    step1: validationSchemas.firstName,
    step2: validationSchemas.lastName,
    step3: validationSchemas.email,
  };
  
  const form = useMultiStepValidation(schemas, 'step1');
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('firstName')} />
      <button onClick={form.validateStep}>Validate Step</button>
    </form>
  );
}
```

### File Validation Hook
```typescript
import { useFileValidation } from '../core/validation';

function MyComponent() {
  const { validateFile, validateFiles, config } = useFileValidation({
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/jpeg'],
    maxFiles: 5
  });
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const result = validateFile(file);
    
    if (!result.isValid) {
      console.error('Validation errors:', result.errors);
    }
  };
  
  return <input type="file" onChange={handleFileChange} />;
}
```

## Validation Components

### ValidatedInput Component
```typescript
import { ValidatedInput } from '../design-system/components/ValidatedInput';
import { validationSchemas } from '../core/validation';

function MyComponent() {
  return (
    <ValidatedInput
      placeholder="Enter your email"
      type="email"
      validationConfig={{
        schema: validationSchemas.email,
        validateOnChange: true,
        validateOnBlur: true,
        showValidationIcon: true,
        showValidationMessage: true,
      }}
      onValidationChange={(isValid, message) => {
        console.log('Validation changed:', { isValid, message });
      }}
    />
  );
}
```

### ValidatedSearchInput Component
```typescript
import { ValidatedSearchInput } from '../design-system/components/ValidatedInput';

function MyComponent() {
  return (
    <ValidatedSearchInput
      placeholder="Search documents..."
      validationConfig={{
        schema: validationSchemas.searchQuery,
        validateOnChange: true,
        showValidationIcon: true,
      }}
      onSearch={(query) => {
        console.log('Search query:', query);
      }}
    />
  );
}
```

### ValidatedSelectInput Component
```typescript
import { ValidatedSelectInput } from '../design-system/components/ValidatedInput';

function MyComponent() {
  return (
    <ValidatedSelectInput
      label="Document Type"
      placeholder="Select document type"
      options={[
        { value: 'pdf', label: 'PDF Document' },
        { value: 'docx', label: 'Word Document' },
        { value: 'xlsx', label: 'Excel Spreadsheet' },
      ]}
      validationConfig={{
        schema: validationSchemas.documentType,
        validateOnChange: true,
        showValidationIcon: true,
      }}
    />
  );
}
```

### ValidatedTextarea Component
```typescript
import { ValidatedTextarea } from '../design-system/components/ValidatedInput';

function MyComponent() {
  return (
    <ValidatedTextarea
      placeholder="Enter description..."
      rows={4}
      validationConfig={{
        schema: validationSchemas.documentDescription,
        validateOnChange: true,
        showValidationIcon: true,
      }}
    />
  );
}
```

### ValidatedForm Component
```typescript
import { ValidatedForm } from '../design-system/components/ValidatedForm';
import { validationSchemas } from '../core/validation';

function MyComponent() {
  const handleSubmit = async (data) => {
    console.log('Form data:', data);
    // Handle form submission
  };
  
  return (
    <ValidatedForm
      schema={validationSchemas.registerForm}
      onSubmit={handleSubmit}
      showValidationSummary={true}
      showFieldErrors={true}
      showSubmitButton={true}
      submitButtonText="Register"
    >
      <ValidatedInput
        name="firstName"
        placeholder="First Name"
        validationConfig={{
          schema: validationSchemas.firstName,
          validateOnChange: true,
        }}
      />
      <ValidatedInput
        name="lastName"
        placeholder="Last Name"
        validationConfig={{
          schema: validationSchemas.lastName,
          validateOnChange: true,
        }}
      />
      <ValidatedInput
        name="email"
        type="email"
        placeholder="Email"
        validationConfig={{
          schema: validationSchemas.email,
          validateOnChange: true,
        }}
      />
    </ValidatedForm>
  );
}
```

### Multi-step Form
```typescript
import { ValidatedForm } from '../design-system/components/ValidatedForm';

function MyComponent() {
  const steps = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Enter your personal details',
      schema: validationSchemas.firstName,
      component: PersonalInfoStep,
    },
    {
      id: 'contact',
      title: 'Contact Information',
      description: 'Enter your contact details',
      schema: validationSchemas.email,
      component: ContactInfoStep,
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Set your preferences',
      schema: validationSchemas.userSettings,
      component: PreferencesStep,
    },
  ];
  
  return (
    <ValidatedForm
      schema={validationSchemas.registerForm}
      onSubmit={handleSubmit}
      steps={steps}
      currentStep={0}
      onStepChange={(step) => console.log('Step changed:', step)}
    />
  );
}
```

## Validation Utilities

### ValidationUtils Class
```typescript
import { ValidationUtils } from '../core/validation';

// Validate a single value
const result = ValidationUtils.validateValue(validationSchemas.email, 'test@example.com');
console.log(result.isValid); // true
console.log(result.errors); // []

// Validate multiple values
const formData = { email: 'test@example.com', password: 'password123' };
const result = ValidationUtils.validateValues(validationSchemas.loginForm, formData);

// Safe parse with error handling
const result = ValidationUtils.safeParse(validationSchemas.email, 'invalid-email');
if (result.success) {
  console.log('Valid email:', result.data);
} else {
  console.log('Error:', result.error);
}

// Check field errors
const hasError = ValidationUtils.hasFieldError(formState.errors, 'email');
const errorMessage = ValidationUtils.getFieldErrorMessage(formState.errors, 'email');

// Format errors for display
const formattedErrors = ValidationUtils.formatErrors(formState.errors);

// Password strength validation
const strength = ValidationUtils.validatePasswordStrength('password123');
console.log(strength.isValid); // true
console.log(strength.score); // 4
console.log(strength.feedback); // []

// File validation
const fileResult = ValidationUtils.validateFileSize(file, 50 * 1024 * 1024);
const typeResult = ValidationUtils.validateFileType(file, ['application/pdf']);

// Date range validation
const dateResult = ValidationUtils.validateDateRange('2024-01-01', '2024-12-31');

// Number range validation
const numberResult = ValidationUtils.validateNumberRange(10, 100);

// Create custom validation rules
const customRule = ValidationUtils.createValidationRule(
  (value) => value.length >= 5,
  'Value must be at least 5 characters'
);

// Create async validation rules
const asyncRule = ValidationUtils.createAsyncValidationRule(
  async (value) => {
    const response = await fetch(`/api/check-value?value=${value}`);
    const data = await response.json();
    return !data.exists;
  },
  'Value already exists'
);

// Create conditional validation rules
const conditionalRule = ValidationUtils.createConditionalValidationRule(
  (value, formData) => formData.type === 'premium',
  (value) => value.length >= 10,
  'Premium accounts require longer values'
);

// Sanitize input
const sanitized = ValidationUtils.sanitizeInput('<script>alert("xss")</script>');

// Normalize input
const normalized = ValidationUtils.normalizeInput('  HELLO   WORLD  ');

// Format validation error
const error = new z.ZodError([{ message: 'Invalid email', path: ['email'] }]);
const formatted = ValidationUtils.formatValidationError(error);

// Get error by path
const pathError = ValidationUtils.getErrorByPath(error, ['email']);

// Check if error is for specific field
const isEmailError = ValidationUtils.isFieldError(error, 'email');

// Merge validation errors
const merged = ValidationUtils.mergeErrors(errors1, errors2);

// Clear specific errors
const cleared = ValidationUtils.clearErrors(errors, ['email', 'password']);

// Validate nested object
const nestedResult = ValidationUtils.validateNestedObject(
  validationSchemas.userSettings,
  userData,
  ['user', 'settings']
);

// Create validation summary
const summary = ValidationUtils.createValidationSummary(formState.errors);
console.log(summary.totalErrors); // 2
console.log(summary.fieldErrors); // { email: 'Invalid email', password: 'Too short' }
console.log(summary.hasErrors); // true
```

## Integration with RBAC

### RBAC + Validation Components
```typescript
import { ValidatedInput } from '../design-system/components/ValidatedInput';
import { validationSchemas } from '../core/validation';

function MyComponent() {
  return (
    <ValidatedInput
      placeholder="Enter document title"
      validationConfig={{
        schema: validationSchemas.documentTitle,
        validateOnChange: true,
        showValidationIcon: true,
      }}
      // RBAC properties
      requiredPermissions={['documents:write']}
      requiredFeatures={['document_upload']}
      requiredSubscription="basic"
      fallbackMessage="Document creation requires Basic subscription or higher."
    />
  );
}
```

### RBAC + Validation Forms
```typescript
import { ValidatedForm } from '../design-system/components/ValidatedForm';
import { validationSchemas } from '../core/validation';

function MyComponent() {
  return (
    <ValidatedForm
      schema={validationSchemas.fileUpload}
      onSubmit={handleSubmit}
      // RBAC properties
      requiredPermissions={['upload:files']}
      requiredFeatures={['document_upload']}
      requiredSubscription="basic"
    >
      <ValidatedInput
        name="title"
        placeholder="Document Title"
        validationConfig={{
          schema: validationSchemas.documentTitle,
          validateOnChange: true,
        }}
      />
    </ValidatedForm>
  );
}
```

## Best Practices

### 1. Schema Design
- Use descriptive error messages
- Provide helpful validation feedback
- Consider user experience in validation rules
- Use appropriate validation timing (onChange vs onBlur)

### 2. Component Usage
- Always provide validation configuration
- Use appropriate validation timing
- Show validation feedback clearly
- Handle loading and error states

### 3. Form Management
- Use ValidatedForm for complex forms
- Implement proper error handling
- Provide clear validation summaries
- Handle async validation gracefully

### 4. Performance
- Use debouncing for real-time validation
- Implement proper loading states
- Cache validation results when appropriate
- Optimize validation schemas

### 5. Accessibility
- Provide clear error messages
- Use appropriate ARIA attributes
- Ensure keyboard navigation works
- Test with screen readers

## Testing

### Unit Testing
```typescript
import { ValidationUtils } from '../core/validation';
import { validationSchemas } from '../core/validation';

describe('ValidationUtils', () => {
  test('should validate email correctly', () => {
    const result = ValidationUtils.validateValue(validationSchemas.email, 'test@example.com');
    expect(result.isValid).toBe(true);
  });
  
  test('should reject invalid email', () => {
    const result = ValidationUtils.validateValue(validationSchemas.email, 'invalid-email');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Please enter a valid email address');
  });
});
```

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ValidatedInput } from '../design-system/components/ValidatedInput';
import { validationSchemas } from '../core/validation';

describe('ValidatedInput', () => {
  test('should show validation error for invalid input', async () => {
    render(
      <ValidatedInput
        placeholder="Enter email"
        validationConfig={{
          schema: validationSchemas.email,
          validateOnChange: true,
        }}
      />
    );
    
    const input = screen.getByPlaceholderText('Enter email');
    fireEvent.change(input, { target: { value: 'invalid-email' } });
    
    await screen.findByText('Please enter a valid email address');
  });
});
```

## Migration Guide

### From Basic Inputs to ValidatedInputs
```typescript
// Before
<input 
  type="email" 
  placeholder="Enter email"
  onChange={handleChange}
/>

// After
<ValidatedInput
  type="email"
  placeholder="Enter email"
  validationConfig={{
    schema: validationSchemas.email,
    validateOnChange: true,
    showValidationIcon: true,
  }}
  onChange={handleChange}
/>
```

### From Basic Forms to ValidatedForms
```typescript
// Before
<form onSubmit={handleSubmit}>
  <input name="email" />
  <input name="password" />
  <button type="submit">Submit</button>
</form>

// After
<ValidatedForm
  schema={validationSchemas.loginForm}
  onSubmit={handleSubmit}
  showValidationSummary={true}
>
  <ValidatedInput
    name="email"
    validationConfig={{
      schema: validationSchemas.email,
      validateOnChange: true,
    }}
  />
  <ValidatedInput
    name="password"
    type="password"
    validationConfig={{
      schema: validationSchemas.password,
      validateOnChange: true,
    }}
  />
</ValidatedForm>
```

## Troubleshooting

### Common Issues

1. **Validation not working**: Check if schema is properly imported and configured
2. **Error messages not showing**: Verify `showValidationMessage` is true
3. **Real-time validation not working**: Check `validateOnChange` and `debounceMs` settings
4. **Async validation failing**: Ensure proper error handling in async validators
5. **Form submission issues**: Verify form schema matches input schemas

### Debug Mode
```typescript
import { ValidationUtils } from '../core/validation';

// Enable debug logging
const originalConsoleLog = console.log;
console.log = (...args) => {
  if (args[0]?.includes('validation')) {
    originalConsoleLog(...args);
  }
};

// Test validation
const result = ValidationUtils.validateValue(validationSchemas.email, 'test@example.com');
console.log('Validation result:', result);
```

## Future Enhancements

1. **Visual Validation Feedback**: Enhanced visual indicators for validation states
2. **Custom Validation Rules**: User-defined validation rules
3. **Validation Analytics**: Track validation patterns and errors
4. **Internationalization**: Multi-language validation messages
5. **Validation Caching**: Cache validation results for performance
6. **Advanced File Validation**: More sophisticated file validation rules
7. **Real-time Collaboration**: Shared validation state across users
8. **Validation Templates**: Pre-built validation templates for common scenarios
