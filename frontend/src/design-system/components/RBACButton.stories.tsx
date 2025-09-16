import type { Meta, StoryObj } from '@storybook/react'
import { RBACProvider } from '../../../core/rbac/context'
import { 
  RBACButton, 
  UploadButton, 
  DeleteButton, 
  ExportButton, 
  AISearchButton,
  AdminButton,
  ManagerButton,
  ProFeatureButton,
  EnterpriseFeatureButton,
  BulkActionButton,
  APIAccessButton,
  WorkflowButton,
} from './RBACButton'
import type { UserPermissions, SubscriptionTier, UserRole } from '../../../core/rbac/types'

// Mock user data for different scenarios
const mockUsers: Record<string, UserPermissions> = {
  freeUser: {
    userId: '1',
    role: 'viewer',
    subscription: 'free',
    permissions: ['documents:read', 'search:basic'],
    features: ['document_upload', 'ai_search'],
    limits: {
      maxDocuments: 10,
      maxUsers: 1,
      maxStorage: 1,
      maxApiCalls: 100,
      maxExports: 5,
      retentionDays: 30,
      features: ['document_upload', 'ai_search'],
    },
  },
  basicUser: {
    userId: '2',
    role: 'analyst',
    subscription: 'basic',
    permissions: ['documents:read', 'documents:write', 'upload:files', 'search:basic', 'search:advanced'],
    features: ['document_upload', 'ai_search', 'advanced_analytics', 'compliance_reports', 'data_export'],
    limits: {
      maxDocuments: 100,
      maxUsers: 5,
      maxStorage: 10,
      maxApiCalls: 1000,
      maxExports: 50,
      retentionDays: 90,
      features: ['document_upload', 'ai_search', 'advanced_analytics', 'compliance_reports', 'data_export'],
    },
  },
  proUser: {
    userId: '3',
    role: 'manager',
    subscription: 'pro',
    permissions: ['documents:read', 'documents:write', 'documents:delete', 'upload:files', 'upload:bulk', 'search:basic', 'search:advanced', 'search:ai'],
    features: ['document_upload', 'ai_search', 'advanced_analytics', 'compliance_reports', 'risk_assessment', 'user_management', 'api_access', 'data_export', 'bulk_operations', 'custom_fields', 'workflow_automation', 'audit_logs'],
    limits: {
      maxDocuments: 10000,
      maxUsers: 100,
      maxStorage: 1000,
      maxApiCalls: 100000,
      maxExports: 5000,
      retentionDays: 1095,
      features: ['document_upload', 'ai_search', 'advanced_analytics', 'compliance_reports', 'risk_assessment', 'user_management', 'api_access', 'data_export', 'bulk_operations', 'custom_fields', 'workflow_automation', 'audit_logs'],
    },
  },
  enterpriseUser: {
    userId: '4',
    role: 'admin',
    subscription: 'enterprise',
    permissions: ['documents:read', 'documents:write', 'documents:delete', 'documents:share', 'documents:export', 'upload:files', 'upload:bulk', 'upload:api', 'search:basic', 'search:advanced', 'search:ai', 'search:history', 'analytics:view', 'analytics:export', 'analytics:custom', 'compliance:view', 'compliance:manage', 'compliance:reports', 'risk:view', 'risk:assess', 'risk:manage', 'users:view', 'users:manage', 'users:invite', 'settings:view', 'settings:manage', 'settings:integrations', 'api:read', 'api:write', 'api:admin'],
    features: ['document_upload', 'ai_search', 'advanced_analytics', 'compliance_reports', 'risk_assessment', 'user_management', 'api_access', 'custom_branding', 'priority_support', 'sso_integration', 'data_export', 'bulk_operations', 'custom_fields', 'workflow_automation', 'audit_logs'],
    limits: {
      maxDocuments: -1,
      maxUsers: -1,
      maxStorage: -1,
      maxApiCalls: -1,
      maxExports: -1,
      retentionDays: -1,
      features: ['document_upload', 'ai_search', 'advanced_analytics', 'compliance_reports', 'risk_assessment', 'user_management', 'api_access', 'custom_branding', 'priority_support', 'sso_integration', 'data_export', 'bulk_operations', 'custom_fields', 'workflow_automation', 'audit_logs'],
    },
  },
}

// Wrapper component for RBAC context
const RBACWrapper: React.FC<{ user: UserPermissions | null; children: React.ReactNode }> = ({ user, children }) => (
  <RBACProvider user={user}>
    <div className="p-4 space-y-4">
      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Current User Context:</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Role: <span className="font-medium">{user?.role || 'None'}</span> | 
          Subscription: <span className="font-medium">{user?.subscription || 'None'}</span>
        </p>
      </div>
      {children}
    </div>
  </RBACProvider>
)

const meta: Meta<typeof RBACButton> = {
  title: 'RBAC/RBACButton',
  component: RBACButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Role-Based Access Control Button component that restricts access based on user permissions, features, subscription tier, and role.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['contained', 'outlined', 'text'],
      description: 'Button variant style',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Button size',
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'error', 'warning', 'info'],
      description: 'Button color theme',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Shows loading state',
    },
    iconOnly: {
      control: { type: 'boolean' },
      description: 'Makes button display only an icon',
    },
    requiredPermissions: {
      control: { type: 'object' },
      description: 'Required permissions for button access',
    },
    requiredFeatures: {
      control: { type: 'object' },
      description: 'Required features for button access',
    },
    requiredSubscription: {
      control: { type: 'select' },
      options: ['free', 'basic', 'standard', 'pro', 'enterprise'],
      description: 'Required subscription tier',
    },
    requiredRole: {
      control: { type: 'select' },
      options: ['guest', 'viewer', 'analyst', 'manager', 'admin'],
      description: 'Required user role',
    },
    showUpgrade: {
      control: { type: 'boolean' },
      description: 'Show upgrade prompt when access is denied',
    },
    showAccessIndicator: {
      control: { type: 'boolean' },
      description: 'Show access indicator dot',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Basic RBAC Button Stories
export const Default: Story = {
  args: {
    children: 'Default Button',
    variant: 'contained',
    size: 'md',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACButton {...args} />
    </RBACWrapper>
  ),
}

export const WithPermissions: Story = {
  args: {
    children: 'Upload Document',
    requiredPermissions: ['upload:files'],
    requiredFeatures: ['document_upload'],
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACButton {...args} />
    </RBACWrapper>
  ),
}

export const WithSubscription: Story = {
  args: {
    children: 'Pro Feature',
    requiredSubscription: 'pro',
    color: 'secondary',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACButton {...args} />
    </RBACWrapper>
  ),
}

export const WithRole: Story = {
  args: {
    children: 'Admin Action',
    requiredRole: 'admin',
    color: 'error',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACButton {...args} />
    </RBACWrapper>
  ),
}

export const WithAccessIndicator: Story = {
  args: {
    children: 'Access Controlled',
    requiredPermissions: ['documents:write'],
    showAccessIndicator: true,
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACButton {...args} />
    </RBACWrapper>
  ),
}

// User Context Stories
export const FreeUser: Story = {
  args: {
    children: 'Upload Document',
    requiredPermissions: ['upload:files'],
    requiredFeatures: ['document_upload'],
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.freeUser}>
      <RBACButton {...args} />
    </RBACWrapper>
  ),
}

export const BasicUser: Story = {
  args: {
    children: 'Upload Document',
    requiredPermissions: ['upload:files'],
    requiredFeatures: ['document_upload'],
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACButton {...args} />
    </RBACWrapper>
  ),
}

export const ProUser: Story = {
  args: {
    children: 'AI Search',
    requiredFeatures: ['ai_search'],
    requiredSubscription: 'pro',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.proUser}>
      <RBACButton {...args} />
    </RBACWrapper>
  ),
}

export const EnterpriseUser: Story = {
  args: {
    children: 'Admin Panel',
    requiredRole: 'admin',
    requiredSubscription: 'enterprise',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.enterpriseUser}>
      <RBACButton {...args} />
    </RBACWrapper>
  ),
}

// Specialized Button Stories
export const UploadButtonStory: Story = {
  args: {
    children: 'Upload Files',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <UploadButton {...args} />
    </RBACWrapper>
  ),
}

export const DeleteButtonStory: Story = {
  args: {
    children: 'Delete Document',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.proUser}>
      <DeleteButton {...args} />
    </RBACWrapper>
  ),
}

export const ExportButtonStory: Story = {
  args: {
    children: 'Export Data',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <ExportButton {...args} />
    </RBACWrapper>
  ),
}

export const AISearchButtonStory: Story = {
  args: {
    children: 'AI Search',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <AISearchButton {...args} />
    </RBACWrapper>
  ),
}

export const AdminButtonStory: Story = {
  args: {
    children: 'Admin Settings',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.proUser}>
      <AdminButton {...args} />
    </RBACWrapper>
  ),
}

export const ManagerButtonStory: Story = {
  args: {
    children: 'Manage Team',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.proUser}>
      <ManagerButton {...args} />
    </RBACWrapper>
  ),
}

export const ProFeatureButtonStory: Story = {
  args: {
    children: 'Pro Feature',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <ProFeatureButton {...args} />
    </RBACWrapper>
  ),
}

export const EnterpriseFeatureButtonStory: Story = {
  args: {
    children: 'Enterprise Feature',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.proUser}>
      <EnterpriseFeatureButton {...args} />
    </RBACWrapper>
  ),
}

export const BulkActionButtonStory: Story = {
  args: {
    children: 'Bulk Actions',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <BulkActionButton {...args} />
    </RBACWrapper>
  ),
}

export const APIAccessButtonStory: Story = {
  args: {
    children: 'API Access',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <APIAccessButton {...args} />
    </RBACWrapper>
  ),
}

export const WorkflowButtonStory: Story = {
  args: {
    children: 'Workflow Automation',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <WorkflowButton {...args} />
    </RBACWrapper>
  ),
}

// Comparison Stories
export const AllUserTypes: Story = {
  render: () => (
    <div className="space-y-8">
      {Object.entries(mockUsers).map(([userType, user]) => (
        <RBACWrapper key={userType} user={user}>
          <div>
            <h3 className="text-lg font-semibold mb-4 capitalize">
              {userType.replace('User', ' User')} ({user.role} / {user.subscription})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <UploadButton>Upload</UploadButton>
              <DeleteButton>Delete</DeleteButton>
              <ExportButton>Export</ExportButton>
              <AISearchButton>AI Search</AISearchButton>
              <AdminButton>Admin</AdminButton>
              <ProFeatureButton>Pro Feature</ProFeatureButton>
              <BulkActionButton>Bulk Actions</BulkActionButton>
              <APIAccessButton>API Access</APIAccessButton>
            </div>
          </div>
        </RBACWrapper>
      ))}
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}

// No User Context
export const NoUser: Story = {
  args: {
    children: 'Protected Action',
    requiredPermissions: ['documents:write'],
  },
  render: (args) => (
    <RBACWrapper user={null}>
      <RBACButton {...args} />
    </RBACWrapper>
  ),
}

// Custom Fallback Message
export const CustomFallback: Story = {
  args: {
    children: 'Custom Message',
    requiredSubscription: 'pro',
    fallbackMessage: 'This is a custom upgrade message for Pro features.',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACButton {...args} />
    </RBACWrapper>
  ),
}

// Loading State
export const LoadingState: Story = {
  args: {
    children: 'Loading Button',
    loading: true,
    requiredPermissions: ['upload:files'],
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACButton {...args} />
    </RBACWrapper>
  ),
}

// Icon Only Button
export const IconOnly: Story = {
  args: {
    children: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    iconOnly: true,
    requiredPermissions: ['upload:files'],
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACButton {...args} />
    </RBACWrapper>
  ),
}
