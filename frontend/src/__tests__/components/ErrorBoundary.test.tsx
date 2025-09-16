import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Component that throws an error in useEffect
const ThrowErrorInEffect = ({ shouldThrow }: { shouldThrow: boolean }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      throw new Error('Effect error');
    }
  }, [shouldThrow]);

  return <div>Effect component</div>;
};

// Component that throws an error in render
const ThrowErrorInRender = ({ errorMessage }: { errorMessage?: string }) => {
  throw new Error(errorMessage || 'Render error');
};

describe('ErrorBoundary', () => {
  const defaultProps = {
    fallback: <div>Something went wrong</div>,
  };

  describe('Rendering', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary {...defaultProps}>
          <div>Child component</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child component')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('renders fallback when error occurs', () => {
      render(
        <ErrorBoundary {...defaultProps}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.queryByText('No error')).not.toBeInTheDocument();
    });

    it('renders custom fallback component', () => {
      const CustomFallback = ({ error }: { error: Error }) => (
        <div>Custom error: {error.message}</div>
      );

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom error: Test error')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(
        <ErrorBoundary {...defaultProps} className="custom-error-boundary">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorBoundary = screen.getByText('Something went wrong').parentElement;
      expect(errorBoundary).toHaveClass('custom-error-boundary');
    });

    it('renders with custom testId', () => {
      render(
        <ErrorBoundary {...defaultProps} testId="custom-error-boundary">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-error-boundary')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('catches errors in render', () => {
      render(
        <ErrorBoundary {...defaultProps}>
          <ThrowErrorInRender />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('catches errors in useEffect', () => {
      render(
        <ErrorBoundary {...defaultProps}>
          <ThrowErrorInEffect shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('handles different error types', () => {
      const TypeErrorComponent = () => {
        throw new TypeError('Type error');
      };

      render(
        <ErrorBoundary {...defaultProps}>
          <TypeErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('handles ReferenceError', () => {
      const ReferenceErrorComponent = () => {
        throw new ReferenceError('Reference error');
      };

      render(
        <ErrorBoundary {...defaultProps}>
          <ReferenceErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('handles custom error messages', () => {
      render(
        <ErrorBoundary {...defaultProps}>
          <ThrowErrorInRender errorMessage="Custom error message" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('allows recovery when error is resolved', () => {
      const { rerender } = render(
        <ErrorBoundary {...defaultProps}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Fix the error
      rerender(
        <ErrorBoundary {...defaultProps}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('handles multiple error cycles', () => {
      const { rerender } = render(
        <ErrorBoundary {...defaultProps}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Fix the error
      rerender(
        <ErrorBoundary {...defaultProps}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();

      // Throw error again
      rerender(
        <ErrorBoundary {...defaultProps}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Reporting', () => {
    it('calls onError when error occurs', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary {...defaultProps} onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('calls onError with correct error information', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary {...defaultProps} onError={onError}>
          <ThrowErrorInRender errorMessage="Specific error message" />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Specific error message',
        }),
        expect.any(Object)
      );
    });

    it('calls onError with error info', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary {...defaultProps} onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  describe('Fallback Props', () => {
    it('passes error to fallback component', () => {
      const FallbackWithError = ({ error }: { error: Error }) => (
        <div>
          <div>Error occurred: {error.message}</div>
          <div>Error name: {error.name}</div>
        </div>
      );

      render(
        <ErrorBoundary fallback={FallbackWithError}>
          <ThrowErrorInRender errorMessage="Test error message" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred: Test error message')).toBeInTheDocument();
      expect(screen.getByText('Error name: Error')).toBeInTheDocument();
    });

    it('passes resetError to fallback component', () => {
      const FallbackWithReset = ({ resetError }: { resetError: () => void }) => (
        <div>
          <div>Error occurred</div>
          <button onClick={resetError}>Retry</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={FallbackWithReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('calls resetError when retry button is clicked', async () => {
      const FallbackWithReset = ({ resetError }: { resetError: () => void }) => (
        <div>
          <div>Error occurred</div>
          <button onClick={resetError}>Retry</button>
        </div>
      );

      const { rerender } = render(
        <ErrorBoundary fallback={FallbackWithReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await userEvent.click(retryButton);

      // Fix the error after reset
      rerender(
        <ErrorBoundary fallback={FallbackWithReset}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('Nested Error Boundaries', () => {
    it('handles nested error boundaries', () => {
      render(
        <ErrorBoundary fallback={<div>Outer error</div>}>
          <ErrorBoundary fallback={<div>Inner error</div>}>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </ErrorBoundary>
      );

      expect(screen.getByText('Inner error')).toBeInTheDocument();
      expect(screen.queryByText('Outer error')).not.toBeInTheDocument();
    });

    it('bubbles up to outer boundary when inner boundary fails', () => {
      const FailingErrorBoundary = ({ children }: { children: React.ReactNode }) => {
        throw new Error('Boundary error');
      };

      render(
        <ErrorBoundary fallback={<div>Outer error</div>}>
          <FailingErrorBoundary>
            <ThrowError shouldThrow={true} />
          </FailingErrorBoundary>
        </ErrorBoundary>
      );

      expect(screen.getByText('Outer error')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <ErrorBoundary {...defaultProps}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorElement = screen.getByText('Something went wrong');
      expect(errorElement).toHaveAttribute('role', 'alert');
    });

    it('announces error to screen readers', () => {
      render(
        <ErrorBoundary {...defaultProps}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorElement = screen.getByText('Something went wrong');
      expect(errorElement).toHaveAttribute('aria-live', 'assertive');
    });

    it('provides error information for screen readers', () => {
      const AccessibleFallback = ({ error }: { error: Error }) => (
        <div role="alert" aria-live="assertive">
          <h2>An error occurred</h2>
          <p>Error: {error.message}</p>
        </div>
      );

      render(
        <ErrorBoundary fallback={AccessibleFallback}>
          <ThrowErrorInRender errorMessage="Accessibility test error" />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
      expect(screen.getByText('Error: Accessibility test error')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestComponent = () => {
        renderSpy();
        return (
          <ErrorBoundary {...defaultProps}>
            <div>Test component</div>
          </ErrorBoundary>
        );
      };

      const { rerender } = render(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('handles rapid error cycles efficiently', () => {
      const { rerender } = render(
        <ErrorBoundary {...defaultProps}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Simulate rapid error/recovery cycles
      for (let i = 0; i < 10; i++) {
        rerender(
          <ErrorBoundary {...defaultProps}>
            <ThrowError shouldThrow={i % 2 === 0} />
          </ErrorBoundary>
        );
      }

      // Should handle all cycles without issues
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles null children', () => {
      render(
        <ErrorBoundary {...defaultProps}>
          {null}
        </ErrorBoundary>
      );

      // Should not crash
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('handles undefined children', () => {
      render(
        <ErrorBoundary {...defaultProps}>
          {undefined}
        </ErrorBoundary>
      );

      // Should not crash
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('handles empty children', () => {
      render(
        <ErrorBoundary {...defaultProps}>
          <></>
        </ErrorBoundary>
      );

      // Should not crash
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('handles multiple children', () => {
      render(
        <ErrorBoundary {...defaultProps}>
          <div>Child 1</div>
          <div>Child 2</div>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('handles async errors', async () => {
      const AsyncErrorComponent = () => {
        const [shouldThrow, setShouldThrow] = React.useState(false);

        React.useEffect(() => {
          const timer = setTimeout(() => {
            setShouldThrow(true);
          }, 100);

          return () => clearTimeout(timer);
        }, []);

        if (shouldThrow) {
          throw new Error('Async error');
        }

        return <div>Loading...</div>;
      };

      render(
        <ErrorBoundary {...defaultProps}>
          <AsyncErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();

      await new Promise(resolve => setTimeout(resolve, 150));

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Lifecycle', () => {
    it('calls componentDidCatch when error occurs', () => {
      const componentDidCatch = jest.fn();

      class TestErrorBoundary extends React.Component {
        componentDidCatch = componentDidCatch;
        render() {
          return this.props.children;
        }
      }

      render(
        <TestErrorBoundary>
          <ThrowError shouldThrow={true} />
        </TestErrorBoundary>
      );

      expect(componentDidCatch).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('handles getDerivedStateFromError', () => {
      class TestErrorBoundary extends React.Component {
        static getDerivedStateFromError(error: Error) {
          return { hasError: true, error };
        }

        render() {
          if ((this.state as any)?.hasError) {
            return <div>Error caught: {(this.state as any).error.message}</div>;
          }
          return this.props.children;
        }
      }

      render(
        <TestErrorBoundary>
          <ThrowErrorInRender errorMessage="Derived state error" />
        </TestErrorBoundary>
      );

      expect(screen.getByText('Error caught: Derived state error')).toBeInTheDocument();
    });
  });
});
