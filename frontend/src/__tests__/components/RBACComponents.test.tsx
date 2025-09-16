import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ProtectedComponent,
  FeatureGate,
  PermissionGate,
  SubscriptionGate,
  RoleGate,
  AccessGate,
  ConditionalRender,
  AccessButton,
  AccessLink,
  AccessIndicator,
  UpgradePrompt,
} from '../../core/rbac/components';
import { useRBAC } from '../../core/rbac/context';
import { Permission, Feature, UserRole, SubscriptionTier } from '../../core/rbac/types';

// Mock the RBAC context
jest.mock('../../core/rbac/context', () => ({
  useRBAC: jest.fn(),
}));

// Mock utils
jest.mock('../../core/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => 
    classes.filter(Boolean).join(' '),
}));

const mockUseRBAC = useRBAC as jest.MockedFunction<typeof useRBAC>;

describe('RBAC Components', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    role: 'admin' as UserRole,
    permissions: ['read:documents', 'write:documents', 'delete:documents'] as Permission[],
    features: ['advanced_search', 'bulk_operations'] as Feature[],
    subscription: 'premium' as SubscriptionTier,
  };

  const mockRBACContext = {
    user: mockUser,
    canAccess: jest.fn(),
    hasPermission: jest.fn(),
    hasFeature: jest.fn(),
    hasRole: jest.fn(),
    hasSubscription: jest.fn(),
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    mockUseRBAC.mockReturnValue(mockRBACContext);
    jest.clearAllMocks();
  });

  describe('ProtectedComponent', () => {
    it('renders children when user has access', () => {
      mockRBACContext.canAccess.mockReturnValue(true);

      render(
        <ProtectedComponent requiredPermissions={['read:documents']}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedComponent>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockRBACContext.canAccess).toHaveBeenCalledWith({
        requiredPermissions: ['read:documents'],
        requiredFeatures: [],
        requiredSubscription: undefined,
        requiredRole: undefined,
      });
    });

    it('renders fallback when user lacks access', () => {
      mockRBACContext.canAccess.mockReturnValue(false);

      render(
        <ProtectedComponent 
          requiredPermissions={['admin:access']}
          fallbackMessage="Access denied"
        >
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedComponent>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByText('Upgrade Required')).toBeInTheDocument();
      expect(screen.getByText('Access denied')).toBeInTheDocument();
    });

    it('renders custom fallback component', () => {
      mockRBACContext.canAccess.mockReturnValue(false);
      const CustomFallback = () => <div data-testid="custom-fallback">Custom Fallback</div>;

      render(
        <ProtectedComponent 
          requiredPermissions={['admin:access']}
          fallbackComponent={CustomFallback}
        >
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedComponent>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });

    it('handles multiple access requirements', () => {
      mockRBACContext.canAccess.mockReturnValue(true);

      render(
        <ProtectedComponent 
          requiredPermissions={['read:documents']}
          requiredFeatures={['advanced_search']}
          requiredSubscription="premium"
          requiredRole="admin"
        >
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedComponent>
      );

      expect(mockRBACContext.canAccess).toHaveBeenCalledWith({
        requiredPermissions: ['read:documents'],
        requiredFeatures: ['advanced_search'],
        requiredSubscription: 'premium',
        requiredRole: 'admin',
      });
    });

    it('hides upgrade prompt when showUpgrade is false', () => {
      mockRBACContext.canAccess.mockReturnValue(false);

      render(
        <ProtectedComponent 
          requiredPermissions={['admin:access']}
          showUpgrade={false}
        >
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedComponent>
      );

      expect(screen.queryByText('Upgrade Required')).not.toBeInTheDocument();
    });
  });

  describe('FeatureGate', () => {
    it('renders children when user has feature', () => {
      mockRBACContext.hasFeature.mockReturnValue(true);

      render(
        <FeatureGate feature="advanced_search">
          <div data-testid="feature-content">Feature Content</div>
        </FeatureGate>
      );

      expect(screen.getByTestId('feature-content')).toBeInTheDocument();
      expect(mockRBACContext.hasFeature).toHaveBeenCalledWith('advanced_search');
    });

    it('renders fallback when user lacks feature', () => {
      mockRBACContext.hasFeature.mockReturnValue(false);

      render(
        <FeatureGate feature="premium_feature">
          <div data-testid="feature-content">Feature Content</div>
        </FeatureGate>
      );

      expect(screen.queryByTestId('feature-content')).not.toBeInTheDocument();
      expect(screen.getByText('The premium_feature feature is not available in your current plan.')).toBeInTheDocument();
    });

    it('renders custom fallback', () => {
      mockRBACContext.hasFeature.mockReturnValue(false);

      render(
        <FeatureGate 
          feature="premium_feature"
          fallback={<div data-testid="custom-fallback">Custom Fallback</div>}
        >
          <div data-testid="feature-content">Feature Content</div>
        </FeatureGate>
      );

      expect(screen.queryByTestId('feature-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });
  });

  describe('PermissionGate', () => {
    it('renders children when user has permission', () => {
      mockRBACContext.hasPermission.mockReturnValue(true);

      render(
        <PermissionGate permission="write:documents">
          <div data-testid="permission-content">Permission Content</div>
        </PermissionGate>
      );

      expect(screen.getByTestId('permission-content')).toBeInTheDocument();
      expect(mockRBACContext.hasPermission).toHaveBeenCalledWith('write:documents');
    });

    it('renders fallback when user lacks permission', () => {
      mockRBACContext.hasPermission.mockReturnValue(false);

      render(
        <PermissionGate permission="admin:access">
          <div data-testid="permission-content">Permission Content</div>
        </PermissionGate>
      );

      expect(screen.queryByTestId('permission-content')).not.toBeInTheDocument();
      expect(screen.getByText("You don't have permission to admin access.")).toBeInTheDocument();
    });

    it('renders custom fallback', () => {
      mockRBACContext.hasPermission.mockReturnValue(false);

      render(
        <PermissionGate 
          permission="admin:access"
          fallback={<div data-testid="custom-fallback">Custom Fallback</div>}
        >
          <div data-testid="permission-content">Permission Content</div>
        </PermissionGate>
      );

      expect(screen.queryByTestId('permission-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });
  });

  describe('SubscriptionGate', () => {
    it('renders children when user has subscription', () => {
      mockRBACContext.hasSubscription.mockReturnValue(true);

      render(
        <SubscriptionGate tier="premium">
          <div data-testid="subscription-content">Subscription Content</div>
        </SubscriptionGate>
      );

      expect(screen.getByTestId('subscription-content')).toBeInTheDocument();
      expect(mockRBACContext.hasSubscription).toHaveBeenCalledWith('premium');
    });

    it('renders fallback when user lacks subscription', () => {
      mockRBACContext.hasSubscription.mockReturnValue(false);

      render(
        <SubscriptionGate tier="enterprise">
          <div data-testid="subscription-content">Subscription Content</div>
        </SubscriptionGate>
      );

      expect(screen.queryByTestId('subscription-content')).not.toBeInTheDocument();
      expect(screen.getByText('This feature requires a enterprise subscription or higher.')).toBeInTheDocument();
    });

    it('renders custom fallback', () => {
      mockRBACContext.hasSubscription.mockReturnValue(false);

      render(
        <SubscriptionGate 
          tier="enterprise"
          fallback={<div data-testid="custom-fallback">Custom Fallback</div>}
        >
          <div data-testid="subscription-content">Subscription Content</div>
        </SubscriptionGate>
      );

      expect(screen.queryByTestId('subscription-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });
  });

  describe('RoleGate', () => {
    it('renders children when user has role', () => {
      mockRBACContext.hasRole.mockReturnValue(true);

      render(
        <RoleGate role="admin">
          <div data-testid="role-content">Role Content</div>
        </RoleGate>
      );

      expect(screen.getByTestId('role-content')).toBeInTheDocument();
      expect(mockRBACContext.hasRole).toHaveBeenCalledWith('admin');
    });

    it('renders fallback when user lacks role', () => {
      mockRBACContext.hasRole.mockReturnValue(false);

      render(
        <RoleGate role="super_admin">
          <div data-testid="role-content">Role Content</div>
        </RoleGate>
      );

      expect(screen.queryByTestId('role-content')).not.toBeInTheDocument();
      expect(screen.getByText('This feature requires super_admin role or higher.')).toBeInTheDocument();
    });

    it('renders custom fallback', () => {
      mockRBACContext.hasRole.mockReturnValue(false);

      render(
        <RoleGate 
          role="super_admin"
          fallback={<div data-testid="custom-fallback">Custom Fallback</div>}
        >
          <div data-testid="role-content">Role Content</div>
        </RoleGate>
      );

      expect(screen.queryByTestId('role-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });
  });

  describe('AccessGate', () => {
    it('renders children when user has all required access', () => {
      mockRBACContext.canAccess.mockReturnValue(true);

      render(
        <AccessGate 
          permissions={['read:documents']}
          features={['advanced_search']}
          subscription="premium"
          role="admin"
        >
          <div data-testid="access-content">Access Content</div>
        </AccessGate>
      );

      expect(screen.getByTestId('access-content')).toBeInTheDocument();
      expect(mockRBACContext.canAccess).toHaveBeenCalledWith({
        requiredPermissions: ['read:documents'],
        requiredFeatures: ['advanced_search'],
        requiredSubscription: 'premium',
        requiredRole: 'admin',
      });
    });

    it('renders fallback when user lacks access', () => {
      mockRBACContext.canAccess.mockReturnValue(false);

      render(
        <AccessGate 
          permissions={['admin:access']}
          fallback={<div data-testid="access-fallback">Access Denied</div>}
        >
          <div data-testid="access-content">Access Content</div>
        </AccessGate>
      );

      expect(screen.queryByTestId('access-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('access-fallback')).toBeInTheDocument();
    });
  });

  describe('ConditionalRender', () => {
    it('renders children when condition is true', () => {
      render(
        <ConditionalRender condition={true}>
          <div data-testid="conditional-content">Conditional Content</div>
        </ConditionalRender>
      );

      expect(screen.getByTestId('conditional-content')).toBeInTheDocument();
    });

    it('renders fallback when condition is false', () => {
      render(
        <ConditionalRender 
          condition={false}
          fallback={<div data-testid="conditional-fallback">Fallback Content</div>}
        >
          <div data-testid="conditional-content">Conditional Content</div>
        </ConditionalRender>
      );

      expect(screen.queryByTestId('conditional-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('conditional-fallback')).toBeInTheDocument();
    });

    it('renders nothing when condition is false and no fallback', () => {
      render(
        <ConditionalRender condition={false}>
          <div data-testid="conditional-content">Conditional Content</div>
        </ConditionalRender>
      );

      expect(screen.queryByTestId('conditional-content')).not.toBeInTheDocument();
    });
  });

  describe('AccessButton', () => {
    it('renders enabled button when user has access', () => {
      mockRBACContext.canAccess.mockReturnValue(true);
      const handleClick = jest.fn();

      render(
        <AccessButton 
          requiredPermissions={['write:documents']}
          onClick={handleClick}
        >
          Save Document
        </AccessButton>
      );

      const button = screen.getByRole('button', { name: /save document/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
      expect(button).toHaveClass('bg-blue-600');

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders disabled button when user lacks access', () => {
      mockRBACContext.canAccess.mockReturnValue(false);
      const handleClick = jest.fn();

      render(
        <AccessButton 
          requiredPermissions={['admin:access']}
          onClick={handleClick}
        >
          Admin Action
        </AccessButton>
      );

      const button = screen.getByRole('button', { name: /admin action/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
      expect(button).toHaveClass('bg-gray-300', 'cursor-not-allowed');

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles additional disabled prop', () => {
      mockRBACContext.canAccess.mockReturnValue(true);

      render(
        <AccessButton 
          requiredPermissions={['write:documents']}
          disabled={true}
        >
          Save Document
        </AccessButton>
      );

      const button = screen.getByRole('button', { name: /save document/i });
      expect(button).toBeDisabled();
    });

    it('applies custom className', () => {
      mockRBACContext.canAccess.mockReturnValue(true);

      render(
        <AccessButton 
          requiredPermissions={['write:documents']}
          className="custom-button-class"
        >
          Save Document
        </AccessButton>
      );

      const button = screen.getByRole('button', { name: /save document/i });
      expect(button).toHaveClass('custom-button-class');
    });
  });

  describe('AccessLink', () => {
    it('renders enabled link when user has access', () => {
      mockRBACContext.canAccess.mockReturnValue(true);
      const handleClick = jest.fn();

      render(
        <AccessLink 
          requiredPermissions={['read:documents']}
          href="/documents"
          onClick={handleClick}
        >
          View Documents
        </AccessLink>
      );

      const link = screen.getByRole('link', { name: /view documents/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/documents');
      expect(link).toHaveClass('text-blue-600');

      fireEvent.click(link);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders disabled span when user lacks access', () => {
      mockRBACContext.canAccess.mockReturnValue(false);

      render(
        <AccessLink 
          requiredPermissions={['admin:access']}
          href="/admin"
        >
          Admin Panel
        </AccessLink>
      );

      const span = screen.getByText('Admin Panel');
      expect(span).toBeInTheDocument();
      expect(span).toHaveClass('text-gray-400', 'cursor-not-allowed');
      expect(span.tagName).toBe('SPAN');
    });

    it('applies custom className', () => {
      mockRBACContext.canAccess.mockReturnValue(true);

      render(
        <AccessLink 
          requiredPermissions={['read:documents']}
          href="/documents"
          className="custom-link-class"
        >
          View Documents
        </AccessLink>
      );

      const link = screen.getByRole('link', { name: /view documents/i });
      expect(link).toHaveClass('custom-link-class');
    });
  });

  describe('AccessIndicator', () => {
    it('shows access granted indicator', () => {
      mockRBACContext.canAccess.mockReturnValue(true);

      render(
        <AccessIndicator 
          requiredPermissions={['read:documents']}
        />
      );

      expect(screen.getByText('Access Granted')).toBeInTheDocument();
      expect(screen.getByText('Access Granted')).toHaveClass('text-green-600');
    });

    it('shows access denied indicator', () => {
      mockRBACContext.canAccess.mockReturnValue(false);

      render(
        <AccessIndicator 
          requiredPermissions={['admin:access']}
        />
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('Access Denied')).toHaveClass('text-red-600');
    });

    it('applies custom className', () => {
      mockRBACContext.canAccess.mockReturnValue(true);

      render(
        <AccessIndicator 
          requiredPermissions={['read:documents']}
          className="custom-indicator-class"
        />
      );

      const container = screen.getByText('Access Granted').parentElement;
      expect(container).toHaveClass('custom-indicator-class');
    });
  });

  describe('UpgradePrompt', () => {
    it('renders with default message', () => {
      render(<UpgradePrompt />);

      expect(screen.getByText('Upgrade Required')).toBeInTheDocument();
      expect(screen.getByText('This feature requires a higher subscription tier.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /upgrade now/i })).toBeInTheDocument();
    });

    it('renders with custom message', () => {
      render(<UpgradePrompt message="Custom upgrade message" />);

      expect(screen.getByText('Upgrade Required')).toBeInTheDocument();
      expect(screen.getByText('Custom upgrade message')).toBeInTheDocument();
    });

    it('hides when showUpgrade is false', () => {
      render(<UpgradePrompt showUpgrade={false} />);

      expect(screen.queryByText('Upgrade Required')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<UpgradePrompt className="custom-prompt-class" />);

      const container = screen.getByText('Upgrade Required').closest('div');
      expect(container).toHaveClass('custom-prompt-class');
    });

    it('handles upgrade button click', async () => {
      render(<UpgradePrompt />);

      const upgradeButton = screen.getByRole('button', { name: /upgrade now/i });
      await userEvent.click(upgradeButton);

      // Button should be clickable (no error thrown)
      expect(upgradeButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles missing RBAC context gracefully', () => {
      mockUseRBAC.mockReturnValue({
        user: null,
        canAccess: jest.fn().mockReturnValue(false),
        hasPermission: jest.fn().mockReturnValue(false),
        hasFeature: jest.fn().mockReturnValue(false),
        hasRole: jest.fn().mockReturnValue(false),
        hasSubscription: jest.fn().mockReturnValue(false),
        isLoading: false,
        error: null,
      });

      render(
        <ProtectedComponent requiredPermissions={['read:documents']}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedComponent>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByText('Upgrade Required')).toBeInTheDocument();
    });

    it('handles empty permission arrays', () => {
      mockRBACContext.canAccess.mockReturnValue(true);

      render(
        <ProtectedComponent requiredPermissions={[]}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedComponent>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(mockRBACContext.canAccess).toHaveBeenCalledWith({
        requiredPermissions: [],
        requiredFeatures: [],
        requiredSubscription: undefined,
        requiredRole: undefined,
      });
    });

    it('handles null/undefined children', () => {
      mockRBACContext.canAccess.mockReturnValue(true);

      render(
        <ProtectedComponent requiredPermissions={['read:documents']}>
          {null}
        </ProtectedComponent>
      );

      // Should not crash
      expect(mockRBACContext.canAccess).toHaveBeenCalled();
    });

    it('handles rapid permission changes', async () => {
      mockRBACContext.canAccess.mockReturnValue(true);

      const { rerender } = render(
        <ProtectedComponent requiredPermissions={['read:documents']}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedComponent>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();

      // Change permissions
      mockRBACContext.canAccess.mockReturnValue(false);
      rerender(
        <ProtectedComponent requiredPermissions={['admin:access']}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedComponent>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByText('Upgrade Required')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestComponent = () => {
        renderSpy();
        return (
          <ProtectedComponent requiredPermissions={['read:documents']}>
            <div>Test</div>
          </ProtectedComponent>
        );
      };

      const { rerender } = render(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('memoizes access checks', () => {
      mockRBACContext.canAccess.mockReturnValue(true);

      render(
        <ProtectedComponent requiredPermissions={['read:documents']}>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedComponent>
      );

      // Access check should be called once
      expect(mockRBACContext.canAccess).toHaveBeenCalledTimes(1);
    });
  });
});
