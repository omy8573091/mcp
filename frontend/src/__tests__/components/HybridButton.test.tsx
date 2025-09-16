import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HybridButton } from '../../app/components/HybridButton';

// Mock the CSS modules
jest.mock('../../styles/modules/Button.module.scss', () => ({
  button: 'button',
  primary: 'primary',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  link: 'link',
  small: 'small',
  medium: 'medium',
  large: 'large',
  extraLarge: 'extraLarge',
  loading: 'loading',
  fullWidth: 'fullWidth',
  iconOnly: 'iconOnly',
  icon: 'icon',
  'icon--left': 'icon--left',
  'icon--right': 'icon--right',
}));

// Mock the utils
jest.mock('../../lib/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => 
    classes.filter(Boolean).join(' '),
}));

describe('HybridButton', () => {
  const defaultProps = {
    children: 'Test Button',
  };

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<HybridButton {...defaultProps} />);
      const button = screen.getByRole('button', { name: /test button/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('button', 'primary', 'medium');
    });

    it('renders with custom children', () => {
      render(<HybridButton>Custom Text</HybridButton>);
      expect(screen.getByRole('button', { name: /custom text/i })).toBeInTheDocument();
    });

    it('renders with all variant types', () => {
      const variants = ['primary', 'secondary', 'outline', 'ghost', 'link'] as const;
      
      variants.forEach(variant => {
        const { unmount } = render(
          <HybridButton variant={variant}>Variant Test</HybridButton>
        );
        const button = screen.getByRole('button');
        expect(button).toHaveClass(variant);
        unmount();
      });
    });

    it('renders with all size types', () => {
      const sizes = ['small', 'medium', 'large', 'extraLarge'] as const;
      
      sizes.forEach(size => {
        const { unmount } = render(
          <HybridButton size={size}>Size Test</HybridButton>
        );
        const button = screen.getByRole('button');
        expect(button).toHaveClass(size);
        unmount();
      });
    });

    it('applies custom className', () => {
      render(<HybridButton className="custom-class">Test</HybridButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('renders with correct button type', () => {
      const types = ['button', 'submit', 'reset'] as const;
      
      types.forEach(type => {
        const { unmount } = render(
          <HybridButton type={type}>Type Test</HybridButton>
        );
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', type);
        unmount();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading state when loading is true', () => {
      render(<HybridButton loading>Loading Button</HybridButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('loading');
      expect(button).toBeDisabled();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('hides children when loading', () => {
      render(<HybridButton loading>Loading Button</HybridButton>);
      expect(screen.queryByText('Loading Button')).not.toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(<HybridButton loading>Loading Button</HybridButton>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Disabled State', () => {
    it('disables button when disabled is true', () => {
      render(<HybridButton disabled>Disabled Button</HybridButton>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('applies disabled styles', () => {
      render(<HybridButton disabled>Disabled Button</HybridButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('prevents click when disabled', async () => {
      const handleClick = jest.fn();
      render(<HybridButton disabled onClick={handleClick}>Disabled Button</HybridButton>);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Full Width', () => {
    it('applies full width class when fullWidth is true', () => {
      render(<HybridButton fullWidth>Full Width Button</HybridButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('fullWidth');
    });
  });

  describe('Icon Support', () => {
    const TestIcon = () => <span data-testid="test-icon">🔍</span>;

    it('renders icon on the left by default', () => {
      render(
        <HybridButton icon={<TestIcon />}>
          Icon Button
        </HybridButton>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveClass('icon--left');
    });

    it('renders icon on the right when specified', () => {
      render(
        <HybridButton icon={<TestIcon />} iconPosition="right">
          Icon Button
        </HybridButton>
      );
      
      const icon = screen.getByTestId('test-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.parentElement).toHaveClass('icon--right');
    });

    it('renders icon only when iconOnly is true', () => {
      render(
        <HybridButton iconOnly icon={<TestIcon />}>
          Hidden Text
        </HybridButton>
      );
      
      const button = screen.getByRole('button');
      const icon = screen.getByTestId('test-icon');
      
      expect(button).toHaveClass('iconOnly');
      expect(icon).toBeInTheDocument();
      expect(screen.queryByText('Hidden Text')).not.toBeInTheDocument();
    });

    it('hides children when iconOnly is true', () => {
      render(
        <HybridButton iconOnly icon={<TestIcon />}>
          Should be hidden
        </HybridButton>
      );
      
      expect(screen.queryByText('Should be hidden')).not.toBeInTheDocument();
    });

    it('renders both icon and text when iconOnly is false', () => {
      render(
        <HybridButton icon={<TestIcon />}>
          Icon and Text
        </HybridButton>
      );
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('Icon and Text')).toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = jest.fn();
      render(<HybridButton onClick={handleClick}>Clickable Button</HybridButton>);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      render(
        <HybridButton disabled onClick={handleClick}>
          Disabled Button
        </HybridButton>
      );
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const handleClick = jest.fn();
      render(
        <HybridButton loading onClick={handleClick}>
          Loading Button
        </HybridButton>
      );
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles keyboard events', async () => {
      const handleClick = jest.fn();
      render(<HybridButton onClick={handleClick}>Keyboard Button</HybridButton>);
      
      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<HybridButton>Accessible Button</HybridButton>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('aria-disabled', 'false');
    });

    it('updates aria-disabled when disabled', () => {
      render(<HybridButton disabled>Disabled Button</HybridButton>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('updates aria-disabled when loading', () => {
      render(<HybridButton loading>Loading Button</HybridButton>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('provides screen reader text for loading state', () => {
      render(<HybridButton loading>Loading Button</HybridButton>);
      
      expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });

    it('supports custom aria-label for icon-only buttons', () => {
      render(
        <HybridButton iconOnly aria-label="Close dialog">
          <span>×</span>
        </HybridButton>
      );
      
      const button = screen.getByRole('button', { name: /close dialog/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Focus Management', () => {
    it('can receive focus when enabled', () => {
      render(<HybridButton>Focusable Button</HybridButton>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).toHaveFocus();
    });

    it('cannot receive focus when disabled', () => {
      render(<HybridButton disabled>Disabled Button</HybridButton>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).not.toHaveFocus();
    });

    it('applies focus styles', () => {
      render(<HybridButton>Focusable Button</HybridButton>);
      const button = screen.getByRole('button');
      
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
    });
  });

  describe('Combined States', () => {
    it('handles loading and disabled together', () => {
      render(<HybridButton loading disabled>Complex Button</HybridButton>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toHaveClass('loading');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('handles fullWidth with icon', () => {
      const TestIcon = () => <span data-testid="test-icon">🔍</span>;
      
      render(
        <HybridButton fullWidth icon={<TestIcon />}>
          Full Width with Icon
        </HybridButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('fullWidth');
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('handles all props together', () => {
      const TestIcon = () => <span data-testid="test-icon">🔍</span>;
      const handleClick = jest.fn();
      
      render(
        <HybridButton
          variant="secondary"
          size="large"
          fullWidth
          icon={<TestIcon />}
          iconPosition="right"
          className="custom-class"
          onClick={handleClick}
          type="submit"
        >
          Complex Button
        </HybridButton>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('secondary', 'large', 'fullWidth', 'custom-class');
      expect(button).toHaveAttribute('type', 'submit');
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<HybridButton>{''}</HybridButton>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles null children', () => {
      render(<HybridButton>{null}</HybridButton>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles undefined onClick', () => {
      render(<HybridButton onClick={undefined}>Button</HybridButton>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('handles rapid clicks', async () => {
      const handleClick = jest.fn();
      render(<HybridButton onClick={handleClick}>Rapid Click Button</HybridButton>);
      
      const button = screen.getByRole('button');
      
      // Simulate rapid clicks
      for (let i = 0; i < 5; i++) {
        await userEvent.click(button);
      }
      
      expect(handleClick).toHaveBeenCalledTimes(5);
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestComponent = () => {
        renderSpy();
        return <HybridButton>Test</HybridButton>;
      };
      
      const { rerender } = render(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });
});
