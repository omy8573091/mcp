import type { Meta, StoryObj } from '@storybook/react'
import { ValidatedInput, ValidatedSearchInput, ValidatedSelectInput, ValidatedTextarea } from './ValidatedInput'
import { validationSchemas } from '../../core/validation/schemas'
import { z } from 'zod'

const meta: Meta<typeof ValidatedInput> = {
  title: 'Validation/ValidatedInput',
  component: ValidatedInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Input component with built-in validation using Zod schemas. Supports real-time validation, custom error messages, and validation states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['outlined', 'filled', 'standard'],
      description: 'Input variant style',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Input size',
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'Input type',
    },
    clearable: {
      control: { type: 'boolean' },
      description: 'Show clear button when input has value',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Show loading state',
    },
    showValidationIcon: {
      control: { type: 'boolean' },
      description: 'Show validation icon',
    },
    showValidationMessage: {
      control: { type: 'boolean' },
      description: 'Show validation message',
    },
    validateOnChange: {
      control: { type: 'boolean' },
      description: 'Validate on value change',
    },
    validateOnBlur: {
      control: { type: 'boolean' },
      description: 'Validate on blur',
    },
    debounceMs: {
      control: { type: 'number' },
      description: 'Debounce delay for validation',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Basic validation examples
export const EmailValidation: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email...',
    validationConfig: {
      schema: validationSchemas.email,
      validateOnChange: true,
      validateOnBlur: true,
      showValidationIcon: true,
      showValidationMessage: true,
    },
  },
  render: (args) => (
    <div className="w-80">
      <ValidatedInput {...args} />
    </div>
  ),
}

export const PasswordValidation: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password...',
    validationConfig: {
      schema: validationSchemas.password,
      validateOnChange: true,
      validateOnBlur: true,
      showValidationIcon: true,
      showValidationMessage: true,
    },
  },
  render: (args) => (
    <div className="w-80">
      <ValidatedInput {...args} />
    </div>
  ),
}

export const DocumentTitleValidation: Story = {
  args: {
    placeholder: 'Enter document title...',
    validationConfig: {
      schema: validationSchemas.documentTitle,
      validateOnChange: true,
      validateOnBlur: true,
      showValidationIcon: true,
      showValidationMessage: true,
    },
  },
  render: (args) => (
    <div className="w-80">
      <ValidatedInput {...args} />
    </div>
  ),
}

export const PhoneValidation: Story = {
  args: {
    type: 'tel',
    placeholder: 'Enter phone number...',
    validationConfig: {
      schema: validationSchemas.phone,
      validateOnChange: true,
      validateOnBlur: true,
      showValidationIcon: true,
      showValidationMessage: true,
    },
  },
  render: (args) => (
    <div className="w-80">
      <ValidatedInput {...args} />
    </div>
  ),
}

export const URLValidation: Story = {
  args: {
    type: 'url',
    placeholder: 'Enter website URL...',
    validationConfig: {
      schema: validationSchemas.url,
      validateOnChange: true,
      validateOnBlur: true,
      showValidationIcon: true,
      showValidationMessage: true,
    },
  },
  render: (args) => (
    <div className="w-80">
      <ValidatedInput {...args} />
    </div>
  ),
}

// Search input validation
export const SearchValidation: Story = {
  args: {
    placeholder: 'Search documents...',
    validationConfig: {
      schema: validationSchemas.searchQuery,
      validateOnChange: true,
      validateOnBlur: true,
      showValidationIcon: true,
      showValidationMessage: true,
    },
  },
  render: (args) => (
    <div className="w-80">
      <ValidatedSearchInput {...args} />
    </div>
  ),
}

// Select input validation
export const SelectValidation: Story = {
  args: {
    label: 'Document Type',
    placeholder: 'Select document type...',
    options: [
      { value: 'pdf', label: 'PDF Document' },
      { value: 'docx', label: 'Word Document' },
      { value: 'xlsx', label: 'Excel Spreadsheet' },
      { value: 'txt', label: 'Text File' },
    ],
    validationConfig: {
      schema: validationSchemas.documentType,
      validateOnChange: true,
      validateOnBlur: true,
      showValidationIcon: true,
      showValidationMessage: true,
    },
  },
  render: (args) => (
    <div className="w-80">
      <ValidatedSelectInput {...args} />
    </div>
  ),
}

// Textarea validation
export const TextareaValidation: Story = {
  args: {
    placeholder: 'Enter description...',
    rows: 4,
    validationConfig: {
      schema: validationSchemas.documentDescription,
      validateOnChange: true,
      validateOnBlur: true,
      showValidationIcon: true,
      showValidationMessage: true,
    },
  },
  render: (args) => (
    <div className="w-80">
      <ValidatedTextarea {...args} />
    </div>
  ),
}

// Custom validation with custom error message
export const CustomValidation: Story = {
  args: {
    placeholder: 'Enter username...',
    validationConfig: {
      schema: validationSchemas.username,
      validateOnChange: true,
      validateOnBlur: true,
      showValidationIcon: true,
      showValidationMessage: true,
      customErrorMessage: 'Username must be unique and contain only letters, numbers, and underscores.',
    },
  },
  render: (args) => (
    <div className="w-80">
      <ValidatedInput {...args} />
    </div>
  ),
}

// Real-time validation with debouncing
export const RealTimeValidation: Story = {
  args: {
    placeholder: 'Type to see real-time validation...',
    validationConfig: {
      schema: validationSchemas.documentTitle,
      validateOnChange: true,
      validateOnBlur: true,
      showValidationIcon: true,
      showValidationMessage: true,
    },
    debounceMs: 500,
  },
  render: (args) => (
    <div className="w-80">
      <ValidatedInput {...args} />
    </div>
  ),
}

// Validation states
export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div>
        <h3 className="text-lg font-semibold mb-2">Idle State</h3>
        <ValidatedInput
          placeholder="No validation configured"
          validationState="idle"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Validating State</h3>
        <ValidatedInput
          placeholder="Validating..."
          validationState="validating"
          validationMessage="Checking availability..."
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Valid State</h3>
        <ValidatedInput
          placeholder="Valid input"
          validationState="valid"
          validationMessage="Input is valid"
          defaultValue="valid@example.com"
        />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Invalid State</h3>
        <ValidatedInput
          placeholder="Invalid input"
          validationState="invalid"
          validationMessage="Please enter a valid email address"
          defaultValue="invalid-email"
        />
      </div>
    </div>
  ),
}

// Different sizes
export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <h3 className="text-sm font-medium mb-2">Extra Small</h3>
        <ValidatedInput
          size="xs"
          placeholder="Extra small input"
          validationConfig={{
            schema: validationSchemas.documentTitle,
            showValidationIcon: true,
          }}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Small</h3>
        <ValidatedInput
          size="sm"
          placeholder="Small input"
          validationConfig={{
            schema: validationSchemas.documentTitle,
            showValidationIcon: true,
          }}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Medium</h3>
        <ValidatedInput
          size="md"
          placeholder="Medium input"
          validationConfig={{
            schema: validationSchemas.documentTitle,
            showValidationIcon: true,
          }}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Large</h3>
        <ValidatedInput
          size="lg"
          placeholder="Large input"
          validationConfig={{
            schema: validationSchemas.documentTitle,
            showValidationIcon: true,
          }}
        />
      </div>
    </div>
  ),
}

// Different variants
export const DifferentVariants: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <h3 className="text-sm font-medium mb-2">Outlined</h3>
        <ValidatedInput
          variant="outlined"
          placeholder="Outlined input"
          validationConfig={{
            schema: validationSchemas.documentTitle,
            showValidationIcon: true,
          }}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Filled</h3>
        <ValidatedInput
          variant="filled"
          placeholder="Filled input"
          validationConfig={{
            schema: validationSchemas.documentTitle,
            showValidationIcon: true,
          }}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Standard</h3>
        <ValidatedInput
          variant="standard"
          placeholder="Standard input"
          validationConfig={{
            schema: validationSchemas.documentTitle,
            showValidationIcon: true,
          }}
        />
      </div>
    </div>
  ),
}

// Form example
export const FormExample: Story = {
  render: () => (
    <form className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-2">Email Address</label>
        <ValidatedInput
          type="email"
          placeholder="Enter your email"
          validationConfig={{
            schema: validationSchemas.email,
            validateOnChange: true,
            validateOnBlur: true,
            showValidationIcon: true,
            showValidationMessage: true,
          }}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Password</label>
        <ValidatedInput
          type="password"
          placeholder="Enter your password"
          validationConfig={{
            schema: validationSchemas.password,
            validateOnChange: true,
            validateOnBlur: true,
            showValidationIcon: true,
            showValidationMessage: true,
          }}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Document Title</label>
        <ValidatedInput
          placeholder="Enter document title"
          validationConfig={{
            schema: validationSchemas.documentTitle,
            validateOnChange: true,
            validateOnBlur: true,
            showValidationIcon: true,
            showValidationMessage: true,
          }}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Document Type</label>
        <ValidatedSelectInput
          placeholder="Select document type"
          options={[
            { value: 'pdf', label: 'PDF Document' },
            { value: 'docx', label: 'Word Document' },
            { value: 'xlsx', label: 'Excel Spreadsheet' },
            { value: 'txt', label: 'Text File' },
          ]}
          validationConfig={{
            schema: validationSchemas.documentType,
            validateOnChange: true,
            validateOnBlur: true,
            showValidationIcon: true,
            showValidationMessage: true,
          }}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <ValidatedTextarea
          placeholder="Enter description"
          rows={3}
          validationConfig={{
            schema: validationSchemas.documentDescription,
            validateOnChange: true,
            validateOnBlur: true,
            showValidationIcon: true,
            showValidationMessage: true,
          }}
        />
      </div>
      
      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Submit Form
      </button>
    </form>
  ),
}

// Interactive validation
export const InteractiveValidation: Story = {
  args: {
    placeholder: 'Try typing invalid characters...',
    validationConfig: {
      schema: validationSchemas.documentTitle,
      validateOnChange: true,
      validateOnBlur: true,
      showValidationIcon: true,
      showValidationMessage: true,
    },
    onValidationChange: (isValid, message) => {
      console.log('Validation changed:', { isValid, message });
    },
    onValidationComplete: (result) => {
      console.log('Validation complete:', result);
    },
  },
  render: (args) => (
    <div className="w-80">
      <ValidatedInput {...args} />
      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">
          Open the browser console to see validation events.
        </p>
      </div>
    </div>
  ),
}

// Loading states
export const LoadingStates: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <h3 className="text-sm font-medium mb-2">Loading Input</h3>
        <ValidatedInput
          placeholder="Loading..."
          loading={true}
          validationConfig={{
            schema: validationSchemas.documentTitle,
            showValidationIcon: true,
          }}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Validating State</h3>
        <ValidatedInput
          placeholder="Validating..."
          validationState="validating"
          validationMessage="Checking availability..."
          validationConfig={{
            schema: validationSchemas.documentTitle,
            showValidationIcon: true,
          }}
        />
      </div>
    </div>
  ),
}

// Clearable input
export const ClearableInput: Story = {
  args: {
    placeholder: 'Type something and clear it...',
    clearable: true,
    defaultValue: 'Some text to clear',
    validationConfig: {
      schema: validationSchemas.documentTitle,
      validateOnChange: true,
      validateOnBlur: true,
      showValidationIcon: true,
      showValidationMessage: true,
    },
  },
  render: (args) => (
    <div className="w-80">
      <ValidatedInput {...args} />
    </div>
  ),
}

// Password with toggle
export const PasswordToggle: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
    validationConfig: {
      schema: validationSchemas.password,
      validateOnChange: true,
      validateOnBlur: true,
      showValidationIcon: true,
      showValidationMessage: true,
    },
  },
  render: (args) => (
    <div className="w-80">
      <ValidatedInput {...args} />
    </div>
  ),
}
