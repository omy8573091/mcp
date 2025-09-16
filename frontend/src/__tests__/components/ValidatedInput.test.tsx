import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import {
  ValidatedInput,
  ValidatedSearchInput,
  ValidatedSelectInput,
  ValidatedTextarea,
  ValidationState,
} from '../../design-system/components/ValidatedInput';

// Mock MUI components
jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  TextField: ({ children, ...props }: any) => (
    <div data-testid="textfield" {...props}>
      {children}
    </div>
  ),
  InputAdornment: ({ children, ...props }: any) => (
    <div data-testid="input-adornment" {...props}>
      {children}
    </div>
  ),
  IconButton: ({ children, onClick, ...props }: any) => (
    <button data-testid="icon-button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
  FormControl: ({ children, ...props }: any) => (
    <div data-testid="form-control" {...props}>
      {children}
    </div>
  ),
  InputLabel: ({ children, ...props }: any) => (
    <label data-testid="input-label" {...props}>
      {children}
    </label>
  ),
  Select: ({ children, ...props }: any) => (
    <select data-testid="select" {...props}>
      {children}
    </select>
  ),
  MenuItem: ({ children, ...props }: any) => (
    <option data-testid="menu-item" {...props}>
      {children}
    </option>
  ),
  FormHelperText: ({ children, ...props }: any) => (
    <div data-testid="form-helper-text" {...props}>
      {children}
    </div>
  ),
  Alert: ({ children, ...props }: any) => (
    <div data-testid="alert" {...props}>
      {children}
    </div>
  ),
  AlertTitle: ({ children, ...props }: any) => (
    <div data-testid="alert-title" {...props}>
      {children}
    </div>
  ),
  CircularProgress: (props: any) => (
    <div data-testid="circular-progress" {...props} />
  ),
}));

// Mock MUI icons
jest.mock('@mui/icons-material', () => ({
  Visibility: () => <span data-testid="visibility-icon">👁️</span>,
  VisibilityOff: () => <span data-testid="visibility-off-icon">🙈</span>,
  Search: () => <span data-testid="search-icon">🔍</span>,
  Clear: () => <span data-testid="clear-icon">❌</span>,
  CheckCircle: () => <span data-testid="check-circle-icon">✅</span>,
  Error: () => <span data-testid="error-icon">❌</span>,
  Warning: () => <span data-testid="warning-icon">⚠️</span>,
}));

// Mock validation utils
jest.mock('../../core/validation/utils', () => ({
  ValidationUtils: {
    validateValue: jest.fn(),
    getFirstError: jest.fn(),
    debounce: jest.fn((fn) => fn),
  },
}));

// Mock utils
jest.mock('../../core/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => 
    classes.filter(Boolean).join(' '),
}));

describe('ValidatedInput', () => {
  const defaultProps = {
    placeholder: 'Test input',
  };

  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<ValidatedInput {...defaultProps} />);
      expect(screen.getByTestId('textfield')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(<ValidatedInput placeholder="Custom placeholder" />);
      expect(screen.getByTestId('textfield')).toHaveAttribute('placeholder', 'Custom placeholder');
    });

    it('renders with all variants', () => {
      const variants = ['outlined', 'filled', 'standard'] as const;
      
      variants.forEach(variant => {
        const { unmount } = render(
          <ValidatedInput variant={variant} placeholder="Test" />
        );
        expect(screen.getByTestId('textfield')).toHaveClass(`validated-input--${variant}`);
        unmount();
      });
    });

    it('renders with all sizes', () => {
      const sizes = ['xs', 'sm', 'md', 'lg'] as const;
      
      sizes.forEach(size => {
        const { unmount } = render(
          <ValidatedInput size={size} placeholder="Test" />
        );
        expect(screen.getByTestId('textfield')).toHaveClass(`validated-input--${size}`);
        unmount();
      });
    });

    it('applies custom className', () => {
      render(<ValidatedInput className="custom-class" placeholder="Test" />);
      expect(screen.getByTestId('textfield')).toHaveClass('custom-class');
    });
  });

  describe('Icon Support', () => {
    const TestIcon = () => <span data-testid="test-icon">🔍</span>;

    it('renders left icon', () => {
      render(<ValidatedInput leftIcon={<TestIcon />} placeholder="Test" />);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders right icon', () => {
      render(<ValidatedInput rightIcon={<TestIcon />} placeholder="Test" />);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('renders both left and right icons', () => {
      render(
        <ValidatedInput 
          leftIcon={<TestIcon />} 
          rightIcon={<TestIcon />} 
          placeholder="Test" 
        />
      );
      const icons = screen.getAllByTestId('test-icon');
      expect(icons).toHaveLength(2);
    });
  });

  describe('Clearable Functionality', () => {
    it('shows clear button when clearable and has value', () => {
      render(<ValidatedInput clearable value="test value" placeholder="Test" />);
      expect(screen.getByTestId('clear-icon')).toBeInTheDocument();
    });

    it('hides clear button when no value', () => {
      render(<ValidatedInput clearable value="" placeholder="Test" />);
      expect(screen.queryByTestId('clear-icon')).not.toBeInTheDocument();
    });

    it('calls onClear when clear button is clicked', async () => {
      const onClear = jest.fn();
      render(
        <ValidatedInput 
          clearable 
          value="test value" 
          onClear={onClear}
          placeholder="Test" 
        />
      );
      
      const clearButton = screen.getByTestId('icon-button');
      await userEvent.click(clearButton);
      
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('resets validation state when cleared', async () => {
      const onValidationChange = jest.fn();
      render(
        <ValidatedInput 
          clearable 
          value="test value" 
          onValidationChange={onValidationChange}
          placeholder="Test" 
        />
      );
      
      const clearButton = screen.getByTestId('icon-button');
      await userEvent.click(clearButton);
      
      expect(onValidationChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Password Field', () => {
    it('shows password toggle button for password type', () => {
      render(<ValidatedInput type="password" placeholder="Password" />);
      expect(screen.getByTestId('visibility-icon')).toBeInTheDocument();
    });

    it('toggles password visibility when clicked', async () => {
      render(<ValidatedInput type="password" placeholder="Password" />);
      
      const toggleButton = screen.getByTestId('icon-button');
      await userEvent.click(toggleButton);
      
      expect(screen.getByTestId('visibility-off-icon')).toBeInTheDocument();
    });

    it('changes input type when password is toggled', async () => {
      render(<ValidatedInput type="password" placeholder="Password" />);
      
      const toggleButton = screen.getByTestId('icon-button');
      await userEvent.click(toggleButton);
      
      // The input type should change from password to text
      expect(screen.getByTestId('textfield')).toHaveAttribute('type', 'text');
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator when loading', () => {
      render(<ValidatedInput loading placeholder="Test" />);
      expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    });

    it('shows loading indicator when validating', () => {
      const { ValidationUtils } = require('../../core/validation/utils');
      ValidationUtils.validateValue.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ isValid: true }), 100))
      );

      render(
        <ValidatedInput 
          validationConfig={{ schema: z.string() }}
          placeholder="Test" 
        />
      );
      
      // Trigger validation
      const input = screen.getByTestId('textfield');
      fireEvent.change(input, { target: { value: 'test' } });
      
      expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
    });
  });

  describe('Validation States', () => {
    const emailSchema = z.string().email('Invalid email');

    beforeEach(() => {
      const { ValidationUtils } = require('../../core/validation/utils');
      ValidationUtils.validateValue.mockClear();
      ValidationUtils.getFirstError.mockClear();
    });

    it('shows valid state with check icon', async () => {
      const { ValidationUtils } = require('../../core/validation/utils');
      ValidationUtils.validateValue.mockResolvedValue({ isValid: true, data: 'test@example.com' });

      render(
        <ValidatedInput 
          validationConfig={{ schema: emailSchema }}
          placeholder="Email" 
        />
      );
      
      const input = screen.getByTestId('textfield');
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
      });
    });

    it('shows invalid state with error icon', async () => {
      const { ValidationUtils } = require('../../core/validation/utils');
      ValidationUtils.validateValue.mockResolvedValue({ 
        isValid: false, 
        errors: ['Invalid email'] 
      });
      ValidationUtils.getFirstError.mockReturnValue('Invalid email');

      render(
        <ValidatedInput 
          validationConfig={{ schema: emailSchema }}
          placeholder="Email" 
        />
      );
      
      const input = screen.getByTestId('textfield');
      fireEvent.change(input, { target: { value: 'invalid-email' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('error-icon')).toBeInTheDocument();
      });
    });

    it('shows validation message when invalid', async () => {
      const { ValidationUtils } = require('../../core/validation/utils');
      ValidationUtils.validateValue.mockResolvedValue({ 
        isValid: false, 
        errors: ['Invalid email'] 
      });
      ValidationUtils.getFirstError.mockReturnValue('Invalid email');

      render(
        <ValidatedInput 
          validationConfig={{ schema: emailSchema }}
          placeholder="Email" 
        />
      );
      
      const input = screen.getByTestId('textfield');
      fireEvent.change(input, { target: { value: 'invalid-email' } });
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email')).toBeInTheDocument();
      });
    });

    it('calls onValidationChange when validation state changes', async () => {
      const onValidationChange = jest.fn();
      const { ValidationUtils } = require('../../core/validation/utils');
      ValidationUtils.validateValue.mockResolvedValue({ isValid: true });

      render(
        <ValidatedInput 
          validationConfig={{ schema: emailSchema }}
          onValidationChange={onValidationChange}
          placeholder="Email" 
        />
      );
      
      const input = screen.getByTestId('textfield');
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      
      await waitFor(() => {
        expect(onValidationChange).toHaveBeenCalledWith(true);
      });
    });

    it('calls onValidationComplete with validation result', async () => {
      const onValidationComplete = jest.fn();
      const { ValidationUtils } = require('../../core/validation/utils');
      ValidationUtils.validateValue.mockResolvedValue({ 
        isValid: true, 
        data: 'test@example.com' 
      });

      render(
        <ValidatedInput 
          validationConfig={{ schema: emailSchema }}
          onValidationComplete={onValidationComplete}
          placeholder="Email" 
        />
      );
      
      const input = screen.getByTestId('textfield');
      fireEvent.change(input, { target: { value: 'test@example.com' } });
      
      await waitFor(() => {
        expect(onValidationComplete).toHaveBeenCalledWith({
          isValid: true,
          data: 'test@example.com'
        });
      });
    });

    it('uses custom error message when provided', async () => {
      const { ValidationUtils } = require('../../core/validation/utils');
      ValidationUtils.validateValue.mockResolvedValue({ 
        isValid: false, 
        errors: ['Invalid email'] 
      });

      render(
        <ValidatedInput 
          validationConfig={{ 
            schema: emailSchema,
            customErrorMessage: 'Please enter a valid email address'
          }}
          placeholder="Email" 
        />
      );
      
      const input = screen.getByTestId('textfield');
      fireEvent.change(input, { target: { value: 'invalid-email' } });
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });
  });

  describe('Event Handling', () => {
    it('calls onChange when value changes', async () => {
      const onChange = jest.fn();
      render(<ValidatedInput onChange={onChange} placeholder="Test" />);
      
      const input = screen.getByTestId('textfield');
      fireEvent.change(input, { target: { value: 'new value' } });
      
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when input loses focus', async () => {
      const onBlur = jest.fn();
      render(<ValidatedInput onBlur={onBlur} placeholder="Test" />);
      
      const input = screen.getByTestId('textfield');
      fireEvent.blur(input);
      
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('validates on change when validateOnChange is true', async () => {
      const { ValidationUtils } = require('../../core/validation/utils');
      ValidationUtils.validateValue.mockResolvedValue({ isValid: true });

      render(
        <ValidatedInput 
          validationConfig={{ schema: z.string() }}
          validateOnChange={true}
          placeholder="Test" 
        />
      );
      
      const input = screen.getByTestId('textfield');
      fireEvent.change(input, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(ValidationUtils.validateValue).toHaveBeenCalledWith(
          expect.any(Object),
          'test'
        );
      });
    });

    it('validates on blur when validateOnBlur is true', async () => {
      const { ValidationUtils } = require('../../core/validation/utils');
      ValidationUtils.validateValue.mockResolvedValue({ isValid: true });

      render(
        <ValidatedInput 
          validationConfig={{ schema: z.string() }}
          validateOnBlur={true}
          placeholder="Test" 
        />
      );
      
      const input = screen.getByTestId('textfield');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(ValidationUtils.validateValue).toHaveBeenCalledWith(
          expect.any(Object),
          ''
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper test id', () => {
      render(<ValidatedInput testId="test-input" placeholder="Test" />);
      expect(screen.getByTestId('test-input')).toBeInTheDocument();
    });

    it('shows error state for screen readers', async () => {
      const { ValidationUtils } = require('../../core/validation/utils');
      ValidationUtils.validateValue.mockResolvedValue({ 
        isValid: false, 
        errors: ['Invalid input'] 
      });
      ValidationUtils.getFirstError.mockReturnValue('Invalid input');

      render(
        <ValidatedInput 
          validationConfig={{ schema: z.string() }}
          placeholder="Test" 
        />
      );
      
      const input = screen.getByTestId('textfield');
      fireEvent.change(input, { target: { value: 'invalid' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('textfield')).toHaveClass('validated-input--error');
      });
    });
  });
});

describe('ValidatedSearchInput', () => {
  it('renders with search icon', () => {
    render(<ValidatedSearchInput placeholder="Search..." />);
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('calls onSearch when Enter is pressed', async () => {
    const onSearch = jest.fn();
    render(<ValidatedSearchInput onSearch={onSearch} placeholder="Search..." />);
    
    const input = screen.getByTestId('textfield');
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
    
    expect(onSearch).toHaveBeenCalledWith('');
  });

  it('is clearable by default', () => {
    render(<ValidatedSearchInput value="test" placeholder="Search..." />);
    expect(screen.getByTestId('clear-icon')).toBeInTheDocument();
  });
});

describe('ValidatedSelectInput', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3', disabled: true },
  ];

  it('renders with options', () => {
    render(
      <ValidatedSelectInput
        value=""
        onChange={jest.fn()}
        options={options}
        placeholder="Select option"
      />
    );
    
    expect(screen.getByTestId('select')).toBeInTheDocument();
    expect(screen.getAllByTestId('menu-item')).toHaveLength(4); // 3 options + placeholder
  });

  it('calls onChange when selection changes', async () => {
    const onChange = jest.fn();
    render(
      <ValidatedSelectInput
        value=""
        onChange={onChange}
        options={options}
        placeholder="Select option"
      />
    );
    
    const select = screen.getByTestId('select');
    fireEvent.change(select, { target: { value: 'option1' } });
    
    expect(onChange).toHaveBeenCalledWith('option1');
  });

  it('shows validation state', async () => {
    const { ValidationUtils } = require('../../core/validation/utils');
    ValidationUtils.validateValue.mockResolvedValue({ isValid: true });

    render(
      <ValidatedSelectInput
        value="option1"
        onChange={jest.fn()}
        options={options}
        validationConfig={{ schema: z.string() }}
        placeholder="Select option"
      />
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    });
  });

  it('supports multiple selection', () => {
    render(
      <ValidatedSelectInput
        value={[]}
        onChange={jest.fn()}
        options={options}
        multiple
        placeholder="Select options"
      />
    );
    
    const select = screen.getByTestId('select');
    expect(select).toHaveAttribute('multiple');
  });
});

describe('ValidatedTextarea', () => {
  it('renders as multiline input', () => {
    render(<ValidatedTextarea placeholder="Enter text..." />);
    const textarea = screen.getByTestId('textfield');
    expect(textarea).toHaveAttribute('multiline');
  });

  it('renders with specified rows', () => {
    render(<ValidatedTextarea rows={6} placeholder="Enter text..." />);
    const textarea = screen.getByTestId('textfield');
    expect(textarea).toHaveAttribute('rows', '6');
  });

  it('supports auto-resize', () => {
    render(<ValidatedTextarea autoResize placeholder="Enter text..." />);
    const textarea = screen.getByTestId('textfield');
    expect(textarea).toHaveClass('validated-textarea--auto-resize');
  });

  it('applies resize styles', () => {
    render(<ValidatedTextarea resize="horizontal" placeholder="Enter text..." />);
    const textarea = screen.getByTestId('textfield');
    expect(textarea).toHaveClass('validated-textarea--resize-horizontal');
  });

  it('validates textarea content', async () => {
    const { ValidationUtils } = require('../../core/validation/utils');
    ValidationUtils.validateValue.mockResolvedValue({ isValid: true });

    render(
      <ValidatedTextarea 
        validationConfig={{ schema: z.string().min(10) }}
        placeholder="Enter text..." 
      />
    );
    
    const textarea = screen.getByTestId('textfield');
    fireEvent.change(textarea, { target: { value: 'This is a long text' } });
    
    await waitFor(() => {
      expect(ValidationUtils.validateValue).toHaveBeenCalledWith(
        expect.any(Object),
        'This is a long text'
      );
    });
  });
});

describe('Edge Cases and Error Handling', () => {
  it('handles validation errors gracefully', async () => {
    const { ValidationUtils } = require('../../core/validation/utils');
    ValidationUtils.validateValue.mockRejectedValue(new Error('Validation failed'));

    render(
      <ValidatedInput 
        validationConfig={{ schema: z.string() }}
        placeholder="Test" 
      />
    );
    
    const input = screen.getByTestId('textfield');
    fireEvent.change(input, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(screen.getByText('Validation failed')).toBeInTheDocument();
    });
  });

  it('handles missing validation config', () => {
    render(<ValidatedInput placeholder="Test" />);
    expect(screen.getByTestId('textfield')).toBeInTheDocument();
  });

  it('handles empty validation schema', () => {
    render(
      <ValidatedInput 
        validationConfig={{ schema: z.any() }}
        placeholder="Test" 
      />
    );
    expect(screen.getByTestId('textfield')).toBeInTheDocument();
  });

  it('handles rapid value changes', async () => {
    const { ValidationUtils } = require('../../core/validation/utils');
    ValidationUtils.validateValue.mockResolvedValue({ isValid: true });

    render(
      <ValidatedInput 
        validationConfig={{ schema: z.string() }}
        placeholder="Test" 
      />
    );
    
    const input = screen.getByTestId('textfield');
    
    // Simulate rapid typing
    for (let i = 0; i < 5; i++) {
      fireEvent.change(input, { target: { value: `test${i}` } });
    }
    
    await waitFor(() => {
      expect(ValidationUtils.validateValue).toHaveBeenCalled();
    });
  });
});
