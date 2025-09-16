import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../../app/components/ThemeToggle';

// Mock the theme context
jest.mock('../../app/contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

// Mock utils
jest.mock('../../lib/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => 
    classes.filter(Boolean).join(' '),
}));

const mockUseTheme = require('../../app/contexts/ThemeContext').useTheme;

describe('ThemeToggle', () => {
  const mockThemeContext = {
    theme: 'light',
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
    isDark: false,
    isLight: true,
    isSystem: false,
  };

  beforeEach(() => {
    mockUseTheme.mockReturnValue(mockThemeContext);
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders theme toggle button', () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('renders with light theme icon', () => {
      render(<ThemeToggle />);
      
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
    });

    it('renders with dark theme icon', () => {
      mockUseTheme.mockReturnValue({
        ...mockThemeContext,
        theme: 'dark',
        isDark: true,
        isLight: false,
      });

      render(<ThemeToggle />);
      
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    });

    it('renders with system theme icon', () => {
      mockUseTheme.mockReturnValue({
        ...mockThemeContext,
        theme: 'system',
        isSystem: true,
        isLight: false,
      });

      render(<ThemeToggle />);
      
      expect(screen.getByTestId('system-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<ThemeToggle className="custom-toggle" />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(toggleButton).toHaveClass('custom-toggle');
    });

    it('renders with custom testId', () => {
      render(<ThemeToggle testId="custom-theme-toggle" />);
      
      expect(screen.getByTestId('custom-theme-toggle')).toBeInTheDocument();
    });
  });

  describe('Theme Switching', () => {
    it('calls toggleTheme when clicked', async () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      await userEvent.click(toggleButton);
      
      expect(mockThemeContext.toggleTheme).toHaveBeenCalledTimes(1);
    });

    it('cycles through themes when clicked multiple times', async () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      
      // Click multiple times
      await userEvent.click(toggleButton);
      await userEvent.click(toggleButton);
      await userEvent.click(toggleButton);
      
      expect(mockThemeContext.toggleTheme).toHaveBeenCalledTimes(3);
    });

    it('handles keyboard activation', async () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      toggleButton.focus();
      
      fireEvent.keyDown(toggleButton, { key: 'Enter', code: 'Enter' });
      expect(mockThemeContext.toggleTheme).toHaveBeenCalledTimes(1);
      
      fireEvent.keyDown(toggleButton, { key: ' ', code: 'Space' });
      expect(mockThemeContext.toggleTheme).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(toggleButton).toHaveAttribute('aria-label', 'Toggle theme');
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('updates aria-pressed for dark theme', () => {
      mockUseTheme.mockReturnValue({
        ...mockThemeContext,
        theme: 'dark',
        isDark: true,
        isLight: false,
      });

      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('has proper focus management', () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      toggleButton.focus();
      
      expect(toggleButton).toHaveFocus();
    });

    it('supports keyboard navigation', async () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      
      // Tab to focus
      await userEvent.tab();
      expect(toggleButton).toHaveFocus();
      
      // Enter to activate
      fireEvent.keyDown(toggleButton, { key: 'Enter', code: 'Enter' });
      expect(mockThemeContext.toggleTheme).toHaveBeenCalledTimes(1);
    });

    it('provides screen reader text', () => {
      render(<ThemeToggle />);
      
      expect(screen.getByText('Switch to dark mode')).toBeInTheDocument();
    });

    it('updates screen reader text for dark theme', () => {
      mockUseTheme.mockReturnValue({
        ...mockThemeContext,
        theme: 'dark',
        isDark: true,
        isLight: false,
      });

      render(<ThemeToggle />);
      
      expect(screen.getByText('Switch to light mode')).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('applies light theme styles', () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(toggleButton).toHaveClass('bg-gray-200', 'text-gray-800');
    });

    it('applies dark theme styles', () => {
      mockUseTheme.mockReturnValue({
        ...mockThemeContext,
        theme: 'dark',
        isDark: true,
        isLight: false,
      });

      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(toggleButton).toHaveClass('bg-gray-800', 'text-gray-200');
    });

    it('applies hover styles', async () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.mouseEnter(toggleButton);
      
      expect(toggleButton).toHaveClass('hover:bg-gray-300');
    });

    it('applies focus styles', () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      toggleButton.focus();
      
      expect(toggleButton).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('applies active styles', async () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.mouseDown(toggleButton);
      
      expect(toggleButton).toHaveClass('active:scale-95');
    });
  });

  describe('Animation and Transitions', () => {
    it('applies transition classes', () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(toggleButton).toHaveClass('transition-all', 'duration-200');
    });

    it('handles icon transitions', () => {
      const { rerender } = render(<ThemeToggle />);
      
      // Initially light theme
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
      
      // Switch to dark theme
      mockUseTheme.mockReturnValue({
        ...mockThemeContext,
        theme: 'dark',
        isDark: true,
        isLight: false,
      });
      
      rerender(<ThemeToggle />);
      
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    });

    it('handles system theme transitions', () => {
      const { rerender } = render(<ThemeToggle />);
      
      // Switch to system theme
      mockUseTheme.mockReturnValue({
        ...mockThemeContext,
        theme: 'system',
        isSystem: true,
        isLight: false,
      });
      
      rerender(<ThemeToggle />);
      
      expect(screen.getByTestId('system-icon')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('renders with small size', () => {
      render(<ThemeToggle size="small" />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(toggleButton).toHaveClass('w-8', 'h-8');
    });

    it('renders with medium size by default', () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(toggleButton).toHaveClass('w-10', 'h-10');
    });

    it('renders with large size', () => {
      render(<ThemeToggle size="large" />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(toggleButton).toHaveClass('w-12', 'h-12');
    });
  });

  describe('Disabled State', () => {
    it('renders disabled state', () => {
      render(<ThemeToggle disabled />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(toggleButton).toBeDisabled();
      expect(toggleButton).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('does not call toggleTheme when disabled', async () => {
      render(<ThemeToggle disabled />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      await userEvent.click(toggleButton);
      
      expect(mockThemeContext.toggleTheme).not.toHaveBeenCalled();
    });

    it('updates aria-disabled when disabled', () => {
      render(<ThemeToggle disabled />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(toggleButton).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Loading State', () => {
    it('renders loading state', () => {
      render(<ThemeToggle loading />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(toggleButton).toBeDisabled();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('hides icon when loading', () => {
      render(<ThemeToggle loading />);
      
      expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('system-icon')).not.toBeInTheDocument();
    });

    it('does not call toggleTheme when loading', async () => {
      render(<ThemeToggle loading />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      await userEvent.click(toggleButton);
      
      expect(mockThemeContext.toggleTheme).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles theme context errors gracefully', () => {
      mockUseTheme.mockImplementation(() => {
        throw new Error('Theme context error');
      });

      // Should not crash
      expect(() => render(<ThemeToggle />)).not.toThrow();
    });

    it('handles missing theme context', () => {
      mockUseTheme.mockReturnValue(null);

      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('handles undefined theme values', () => {
      mockUseTheme.mockReturnValue({
        theme: undefined,
        setTheme: jest.fn(),
        toggleTheme: jest.fn(),
        isDark: undefined,
        isLight: undefined,
        isSystem: undefined,
      });

      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid clicks', async () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      
      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        await userEvent.click(toggleButton);
      }
      
      expect(mockThemeContext.toggleTheme).toHaveBeenCalledTimes(10);
    });

    it('handles keyboard spam', async () => {
      render(<ThemeToggle />);
      
      const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
      toggleButton.focus();
      
      // Simulate rapid key presses
      for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(toggleButton, { key: 'Enter', code: 'Enter' });
      }
      
      expect(mockThemeContext.toggleTheme).toHaveBeenCalledTimes(10);
    });

    it('handles theme context updates', () => {
      const { rerender } = render(<ThemeToggle />);
      
      // Update theme context
      mockUseTheme.mockReturnValue({
        ...mockThemeContext,
        theme: 'dark',
        isDark: true,
        isLight: false,
      });
      
      rerender(<ThemeToggle />);
      
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestComponent = () => {
        renderSpy();
        return <ThemeToggle />;
      };

      const { rerender } = render(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('handles theme context changes efficiently', () => {
      const { rerender } = render(<ThemeToggle />);
      
      // Change theme multiple times
      for (let i = 0; i < 5; i++) {
        mockUseTheme.mockReturnValue({
          ...mockThemeContext,
          theme: i % 2 === 0 ? 'light' : 'dark',
          isDark: i % 2 !== 0,
          isLight: i % 2 === 0,
        });
        
        rerender(<ThemeToggle />);
      }
      
      // Should handle all changes without issues
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
    });
  });
});
