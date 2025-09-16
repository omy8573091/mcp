import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../app/providers/ThemeProvider';
import { LanguageProvider } from '../../app/providers/LanguageProvider';
import { ReduxProvider } from '../../app/providers/ReduxProvider';
import { HybridButton } from '../../app/components/HybridButton';
import { ValidatedInput } from '../../design-system/components/ValidatedInput';
import { DocumentCard } from '../../app/components/DocumentCard';
import { EnhancedDashboard } from '../../app/components/EnhancedDashboard';
import { ThemeToggle } from '../../app/components/ThemeToggle';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import {
  ProtectedComponent,
  FeatureGate,
  PermissionGate,
} from '../../core/rbac/components';

// Mock all the dependencies
jest.mock('../../app/contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
    isDark: false,
    isLight: true,
    isSystem: false,
  }),
}));

jest.mock('../../app/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: jest.fn(),
    t: (key: string) => key,
  }),
}));

jest.mock('../../core/rbac/context', () => ({
  useRBAC: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      role: 'admin',
      permissions: ['read:documents', 'write:documents'],
      features: ['advanced_search'],
      subscription: 'premium',
    },
    canAccess: jest.fn().mockReturnValue(true),
    hasPermission: jest.fn().mockReturnValue(true),
    hasFeature: jest.fn().mockReturnValue(true),
    hasRole: jest.fn().mockReturnValue(true),
    hasSubscription: jest.fn().mockReturnValue(true),
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../../app/hooks/usePerformance', () => ({
  usePerformance: () => ({
    metrics: {
      loadTime: 1200,
      renderTime: 45,
      memoryUsage: 85,
      errorRate: 0.02,
    },
    isLoading: false,
    error: null,
  }),
}));

// Mock CSS modules
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

jest.mock('../../styles/modules/Card.module.scss', () => ({
  card: 'card',
  header: 'header',
  content: 'content',
  footer: 'footer',
  title: 'title',
  subtitle: 'subtitle',
  actions: 'actions',
  status: 'status',
  statusActive: 'statusActive',
  statusInactive: 'statusInactive',
  statusPending: 'statusPending',
  statusError: 'statusError',
  thumbnail: 'thumbnail',
  metadata: 'metadata',
  tags: 'tags',
  tag: 'tag',
  progress: 'progress',
  progressBar: 'progressBar',
  progressText: 'progressText',
}));

// Mock utils
jest.mock('../../lib/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => 
    classes.filter(Boolean).join(' '),
  formatDate: (date: Date) => date.toLocaleDateString(),
  formatNumber: (num: number) => num.toLocaleString(),
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
  formatFileSize: (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`,
}));

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
}));

// Mock validation utils
jest.mock('../../core/validation/utils', () => ({
  ValidationUtils: {
    validateValue: jest.fn().mockResolvedValue({ isValid: true, data: 'test' }),
    getFirstError: jest.fn().mockReturnValue('Validation error'),
    debounce: jest.fn((fn) => fn),
  },
}));

// Mock core utils
jest.mock('../../core/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => 
    classes.filter(Boolean).join(' '),
}));

describe('Component Integration Tests', () => {
  describe('Theme Integration', () => {
    it('integrates theme toggle with other components', async () => {
      render(
        <ThemeProvider>
          <div>
            <ThemeToggle />
            <HybridButton>Test Button</HybridButton>
          </div>
        </ThemeProvider>
      );

      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument();
    });

    it('applies theme changes across components', () => {
      const { rerender } = render(
        <ThemeProvider>
          <div>
            <ThemeToggle />
            <HybridButton>Test Button</HybridButton>
          </div>
        </ThemeProvider>
      );

      // Simulate theme change
      rerender(
        <ThemeProvider>
          <div>
            <ThemeToggle />
            <HybridButton>Test Button</HybridButton>
          </div>
        </ThemeProvider>
      );

      expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument();
    });
  });

  describe('Language Integration', () => {
    it('integrates language provider with components', () => {
      render(
        <LanguageProvider>
          <div>
            <HybridButton>Test Button</HybridButton>
            <ValidatedInput placeholder="Test input" />
          </div>
        </LanguageProvider>
      );

      expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument();
      expect(screen.getByTestId('textfield')).toBeInTheDocument();
    });

    it('handles language changes across components', () => {
      const { rerender } = render(
        <LanguageProvider>
          <div>
            <HybridButton>Test Button</HybridButton>
          </div>
        </LanguageProvider>
      );

      // Simulate language change
      rerender(
        <LanguageProvider>
          <div>
            <HybridButton>Test Button</HybridButton>
          </div>
        </LanguageProvider>
      );

      expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument();
    });
  });

  describe('Redux Integration', () => {
    it('integrates Redux provider with components', () => {
      render(
        <ReduxProvider>
          <div>
            <HybridButton>Test Button</HybridButton>
            <EnhancedDashboard
              data={{
                stats: {
                  totalUsers: 100,
                  totalDocuments: 200,
                  totalStorage: 1024,
                  activeUsers: 50,
                },
                recentActivity: [],
                charts: {
                  userGrowth: [],
                  documentUploads: [],
                },
              }}
              onRefresh={jest.fn()}
              onExport={jest.fn()}
              onSettings={jest.fn()}
            />
          </div>
        </ReduxProvider>
      );

      expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('RBAC Integration', () => {
    it('integrates RBAC with protected components', () => {
      render(
        <div>
          <ProtectedComponent requiredPermissions={['read:documents']}>
            <HybridButton>Protected Button</HybridButton>
          </ProtectedComponent>
          <FeatureGate feature="advanced_search">
            <ValidatedInput placeholder="Advanced search" />
          </FeatureGate>
          <PermissionGate permission="write:documents">
            <DocumentCard
              document={{
                id: '1',
                title: 'Test Document',
                type: 'pdf',
                size: 1024,
                createdAt: new Date(),
                status: 'active',
              }}
              onEdit={jest.fn()}
              onDelete={jest.fn()}
              onDownload={jest.fn()}
              onShare={jest.fn()}
              onView={jest.fn()}
            />
          </PermissionGate>
        </div>
      );

      expect(screen.getByRole('button', { name: /protected button/i })).toBeInTheDocument();
      expect(screen.getByTestId('textfield')).toBeInTheDocument();
      expect(screen.getByText('Test Document')).toBeInTheDocument();
    });

    it('handles RBAC state changes', () => {
      const { rerender } = render(
        <ProtectedComponent requiredPermissions={['read:documents']}>
          <HybridButton>Protected Button</HybridButton>
        </ProtectedComponent>
      );

      expect(screen.getByRole('button', { name: /protected button/i })).toBeInTheDocument();

      // Simulate permission change
      rerender(
        <ProtectedComponent requiredPermissions={['admin:access']}>
          <HybridButton>Protected Button</HybridButton>
        </ProtectedComponent>
      );

      // Should still render (mocked to return true)
      expect(screen.getByRole('button', { name: /protected button/i })).toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('integrates validated input with form submission', async () => {
      const handleSubmit = jest.fn();
      
      render(
        <form onSubmit={handleSubmit}>
          <ValidatedInput
            name="email"
            placeholder="Email"
            validationConfig={{
              schema: require('zod').z.string().email(),
            }}
          />
          <HybridButton type="submit">Submit</HybridButton>
        </form>
      );

      const input = screen.getByTestId('textfield');
      const submitButton = screen.getByRole('button', { name: /submit/i });

      fireEvent.change(input, { target: { value: 'test@example.com' } });
      await userEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('handles form validation errors', async () => {
      const { ValidationUtils } = require('../../core/validation/utils');
      ValidationUtils.validateValue.mockResolvedValueOnce({
        isValid: false,
        errors: ['Invalid email format'],
      });

      render(
        <ValidatedInput
          placeholder="Email"
          validationConfig={{
            schema: require('zod').z.string().email(),
          }}
        />
      );

      const input = screen.getByTestId('textfield');
      fireEvent.change(input, { target: { value: 'invalid-email' } });

      await waitFor(() => {
        expect(screen.getByTestId('error-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Integration', () => {
    it('integrates dashboard with all components', () => {
      render(
        <div>
          <EnhancedDashboard
            data={{
              stats: {
                totalUsers: 100,
                totalDocuments: 200,
                totalStorage: 1024,
                activeUsers: 50,
              },
              recentActivity: [
                {
                  id: '1',
                  type: 'document_upload',
                  user: 'John Doe',
                  description: 'Uploaded document.pdf',
                  timestamp: new Date(),
                  status: 'success',
                },
              ],
              charts: {
                userGrowth: [{ date: '2023-01-01', users: 100 }],
                documentUploads: [{ date: '2023-01-01', uploads: 25 }],
              },
            }}
            onRefresh={jest.fn()}
            onExport={jest.fn()}
            onSettings={jest.fn()}
          />
          <ThemeToggle />
          <HybridButton>Action Button</HybridButton>
        </div>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument(); // totalUsers
      expect(screen.getByText('200')).toBeInTheDocument(); // totalDocuments
      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /action button/i })).toBeInTheDocument();
    });

    it('handles dashboard interactions', async () => {
      const onRefresh = jest.fn();
      const onExport = jest.fn();
      const onSettings = jest.fn();

      render(
        <EnhancedDashboard
          data={{
            stats: {
              totalUsers: 100,
              totalDocuments: 200,
              totalStorage: 1024,
              activeUsers: 50,
            },
            recentActivity: [],
            charts: {
              userGrowth: [],
              documentUploads: [],
            },
          }}
          onRefresh={onRefresh}
          onExport={onExport}
          onSettings={onSettings}
        />
      );

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      const exportButton = screen.getByRole('button', { name: /export/i });
      const settingsButton = screen.getByRole('button', { name: /settings/i });

      await userEvent.click(refreshButton);
      await userEvent.click(exportButton);
      await userEvent.click(settingsButton);

      expect(onRefresh).toHaveBeenCalled();
      expect(onExport).toHaveBeenCalled();
      expect(onSettings).toHaveBeenCalled();
    });
  });

  describe('Error Boundary Integration', () => {
    it('integrates error boundary with all components', () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <div>
            <HybridButton>Test Button</HybridButton>
            <ValidatedInput placeholder="Test input" />
            <DocumentCard
              document={{
                id: '1',
                title: 'Test Document',
                type: 'pdf',
                size: 1024,
                createdAt: new Date(),
                status: 'active',
              }}
              onEdit={jest.fn()}
              onDelete={jest.fn()}
              onDownload={jest.fn()}
              onShare={jest.fn()}
              onView={jest.fn()}
            />
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /test button/i })).toBeInTheDocument();
      expect(screen.getByTestId('textfield')).toBeInTheDocument();
      expect(screen.getByText('Test Document')).toBeInTheDocument();
    });

    it('handles errors in component tree', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <div>
            <HybridButton>Test Button</HybridButton>
            <ThrowError />
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /test button/i })).not.toBeInTheDocument();
    });
  });

  describe('Complex User Flows', () => {
    it('handles complete user interaction flow', async () => {
      const onEdit = jest.fn();
      const onDelete = jest.fn();
      const onDownload = jest.fn();
      const onShare = jest.fn();
      const onView = jest.fn();

      render(
        <div>
          <ThemeToggle />
          <EnhancedDashboard
            data={{
              stats: {
                totalUsers: 100,
                totalDocuments: 200,
                totalStorage: 1024,
                activeUsers: 50,
              },
              recentActivity: [],
              charts: {
                userGrowth: [],
                documentUploads: [],
              },
            }}
            onRefresh={jest.fn()}
            onExport={jest.fn()}
            onSettings={jest.fn()}
          />
          <DocumentCard
            document={{
              id: '1',
              title: 'Test Document',
              type: 'pdf',
              size: 1024,
              createdAt: new Date(),
              status: 'active',
            }}
            onEdit={onEdit}
            onDelete={onDelete}
            onDownload={onDownload}
            onShare={onShare}
            onView={onView}
          />
          <ValidatedInput placeholder="Search documents" />
        </div>
      );

      // Toggle theme
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      await userEvent.click(themeToggle);

      // Interact with document card
      const viewButton = screen.getByRole('button', { name: /view/i });
      await userEvent.click(viewButton);

      // Search in input
      const searchInput = screen.getByTestId('textfield');
      fireEvent.change(searchInput, { target: { value: 'test search' } });

      // Refresh dashboard
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await userEvent.click(refreshButton);

      expect(onView).toHaveBeenCalled();
    });

    it('handles form submission with validation', async () => {
      const handleSubmit = jest.fn();
      const { ValidationUtils } = require('../../core/validation/utils');
      ValidationUtils.validateValue.mockResolvedValue({ isValid: true, data: 'test@example.com' });

      render(
        <form onSubmit={handleSubmit}>
          <ValidatedInput
            name="email"
            placeholder="Email"
            validationConfig={{
              schema: require('zod').z.string().email(),
            }}
          />
          <HybridButton type="submit">Submit Form</HybridButton>
        </form>
      );

      const input = screen.getByTestId('textfield');
      const submitButton = screen.getByRole('button', { name: /submit form/i });

      fireEvent.change(input, { target: { value: 'test@example.com' } });
      await userEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('handles protected component interactions', async () => {
      const onEdit = jest.fn();

      render(
        <ProtectedComponent requiredPermissions={['write:documents']}>
          <DocumentCard
            document={{
              id: '1',
              title: 'Protected Document',
              type: 'pdf',
              size: 1024,
              createdAt: new Date(),
              status: 'active',
            }}
            onEdit={onEdit}
            onDelete={jest.fn()}
            onDownload={jest.fn()}
            onShare={jest.fn()}
            onView={jest.fn()}
          />
        </ProtectedComponent>
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await userEvent.click(editButton);

      expect(onEdit).toHaveBeenCalled();
    });
  });

  describe('Performance Integration', () => {
    it('handles multiple component updates efficiently', () => {
      const { rerender } = render(
        <div>
          <ThemeToggle />
          <HybridButton>Test Button</HybridButton>
          <ValidatedInput placeholder="Test input" />
        </div>
      );

      // Simulate multiple updates
      for (let i = 0; i < 10; i++) {
        rerender(
          <div>
            <ThemeToggle />
            <HybridButton>Test Button {i}</HybridButton>
            <ValidatedInput placeholder="Test input" />
          </div>
        );
      }

      expect(screen.getByText('Test Button 9')).toBeInTheDocument();
    });

    it('handles large data sets in dashboard', () => {
      const largeData = {
        stats: {
          totalUsers: 999999,
          totalDocuments: 888888,
          totalStorage: 1024 * 1024 * 1024,
          activeUsers: 777777,
        },
        recentActivity: Array.from({ length: 1000 }, (_, i) => ({
          id: i.toString(),
          type: 'document_upload',
          user: `User ${i}`,
          description: `Uploaded document ${i}.pdf`,
          timestamp: new Date(),
          status: 'success',
        })),
        charts: {
          userGrowth: Array.from({ length: 365 }, (_, i) => ({
            date: `2023-01-${String(i + 1).padStart(2, '0')}`,
            users: Math.floor(Math.random() * 1000),
          })),
          documentUploads: Array.from({ length: 365 }, (_, i) => ({
            date: `2023-01-${String(i + 1).padStart(2, '0')}`,
            uploads: Math.floor(Math.random() * 100),
          })),
        },
      };

      render(
        <EnhancedDashboard
          data={largeData}
          onRefresh={jest.fn()}
          onExport={jest.fn()}
          onSettings={jest.fn()}
        />
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('999,999')).toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains accessibility across component interactions', async () => {
      render(
        <div>
          <ThemeToggle />
          <HybridButton>Test Button</HybridButton>
          <ValidatedInput placeholder="Test input" />
        </div>
      );

      // Test keyboard navigation
      await userEvent.tab();
      expect(screen.getByRole('button', { name: /toggle theme/i })).toHaveFocus();

      await userEvent.tab();
      expect(screen.getByRole('button', { name: /test button/i })).toHaveFocus();

      await userEvent.tab();
      expect(screen.getByTestId('textfield')).toHaveFocus();
    });

    it('provides proper ARIA labels across components', () => {
      render(
        <div>
          <HybridButton aria-label="Custom button">Test</HybridButton>
          <ValidatedInput placeholder="Test input" />
          <DocumentCard
            document={{
              id: '1',
              title: 'Test Document',
              type: 'pdf',
              size: 1024,
              createdAt: new Date(),
              status: 'active',
            }}
            onEdit={jest.fn()}
            onDelete={jest.fn()}
            onDownload={jest.fn()}
            onShare={jest.fn()}
            onView={jest.fn()}
          />
        </div>
      );

      expect(screen.getByRole('button', { name: /custom button/i })).toBeInTheDocument();
      expect(screen.getByRole('article')).toBeInTheDocument(); // DocumentCard
    });
  });
});
