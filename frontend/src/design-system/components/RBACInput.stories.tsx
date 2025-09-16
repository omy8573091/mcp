import type { Meta, StoryObj } from '@storybook/react'
import { RBACProvider } from '../../../core/rbac/context'
import { 
  RBACInput, 
  RBACSearchInput, 
  RBACSelectInput, 
  RBACTextarea,
  AIEnhancedInput,
} from './RBACInput'
import type { UserPermissions } from '../../../core/rbac/types'

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

const meta: Meta<typeof RBACInput> = {
  title: 'RBAC/RBACInput',
  component: RBACInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Role-Based Access Control Input component that restricts access based on user permissions, features, subscription tier, and role.',
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
    requiredPermissions: {
      control: { type: 'object' },
      description: 'Required permissions for input access',
    },
    requiredFeatures: {
      control: { type: 'object' },
      description: 'Required features for input access',
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
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Basic RBAC Input Stories
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    variant: 'outlined',
    size: 'md',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACInput {...args} />
    </RBACWrapper>
  ),
}

export const WithPermissions: Story = {
  args: {
    placeholder: 'Document title...',
    requiredPermissions: ['documents:write'],
    requiredFeatures: ['document_upload'],
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACInput {...args} />
    </RBACWrapper>
  ),
}

export const WithSubscription: Story = {
  args: {
    placeholder: 'Pro feature input...',
    requiredSubscription: 'pro',
    variant: 'filled',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACInput {...args} />
    </RBACWrapper>
  ),
}

export const WithRole: Story = {
  args: {
    placeholder: 'Admin only input...',
    requiredRole: 'admin',
    variant: 'standard',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACInput {...args} />
    </RBACWrapper>
  ),
}

export const PasswordInput: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
    requiredPermissions: ['documents:write'],
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACInput {...args} />
    </RBACWrapper>
  ),
}

export const WithClearButton: Story = {
  args: {
    placeholder: 'Clearable input...',
    clearable: true,
    defaultValue: 'Some text',
    requiredPermissions: ['documents:write'],
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACInput {...args} />
    </RBACWrapper>
  ),
}

export const LoadingState: Story = {
  args: {
    placeholder: 'Loading input...',
    loading: true,
    requiredPermissions: ['documents:write'],
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACInput {...args} />
    </RBACWrapper>
  ),
}

// Search Input Stories
export const SearchInput: Story = {
  args: {
    placeholder: 'Search documents...',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACSearchInput {...args} />
    </RBACWrapper>
  ),
}

export const SearchInputFreeUser: Story = {
  args: {
    placeholder: 'Search documents...',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.freeUser}>
      <RBACSearchInput {...args} />
    </RBACWrapper>
  ),
}

export const SearchInputProUser: Story = {
  args: {
    placeholder: 'Advanced search...',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.proUser}>
      <RBACSearchInput {...args} />
    </RBACWrapper>
  ),
}

// Select Input Stories
export const SelectInput: Story = {
  args: {
    label: 'Document Type',
    placeholder: 'Select document type...',
    options: [
      { value: 'pdf', label: 'PDF Document' },
      { value: 'docx', label: 'Word Document' },
      { value: 'xlsx', label: 'Excel Spreadsheet' },
      { value: 'txt', label: 'Text File' },
    ],
    requiredPermissions: ['documents:write'],
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACSelectInput {...args} />
    </RBACWrapper>
  ),
}

export const SelectInputRestricted: Story = {
  args: {
    label: 'Admin Settings',
    placeholder: 'Select setting...',
    options: [
      { value: 'setting1', label: 'Setting 1' },
      { value: 'setting2', label: 'Setting 2' },
      { value: 'setting3', label: 'Setting 3' },
    ],
    requiredRole: 'admin',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACSelectInput {...args} />
    </RBACWrapper>
  ),
}

// Textarea Stories
export const Textarea: Story = {
  args: {
    placeholder: 'Enter description...',
    rows: 4,
    requiredPermissions: ['documents:write'],
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACTextarea {...args} />
    </RBACWrapper>
  ),
}

export const TextareaRestricted: Story = {
  args: {
    placeholder: 'Admin notes...',
    rows: 6,
    requiredRole: 'admin',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACTextarea {...args} />
    </RBACWrapper>
  ),
}

// AI Enhanced Input Stories
export const AIEnhancedInput: Story = {
  args: {
    placeholder: 'AI-powered input...',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <AIEnhancedInput {...args} />
    </RBACWrapper>
  ),
}

export const AIEnhancedInputPro: Story = {
  args: {
    placeholder: 'AI-powered input...',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.proUser}>
      <AIEnhancedInput {...args} />
    </RBACWrapper>
  ),
}

// User Context Comparison
export const AllUserTypes: Story = {
  render: () => (
    <div className="space-y-8">
      {Object.entries(mockUsers).map(([userType, user]) => (
        <RBACWrapper key={userType} user={user}>
          <div>
            <h3 className="text-lg font-semibold mb-4 capitalize">
              {userType.replace('User', ' User')} ({user.role} / {user.subscription})
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Basic Input</label>
                <RBACInput placeholder="Basic input..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Search Input</label>
                <RBACSearchInput placeholder="Search..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Write Permission Required</label>
                <RBACInput 
                  placeholder="Write permission required..." 
                  requiredPermissions={['documents:write']}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Pro Subscription Required</label>
                <RBACInput 
                  placeholder="Pro subscription required..." 
                  requiredSubscription="pro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Admin Role Required</label>
                <RBACInput 
                  placeholder="Admin role required..." 
                  requiredRole="admin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">AI Enhanced Input</label>
                <AIEnhancedInput placeholder="AI features..." />
              </div>
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
    placeholder: 'Protected input...',
    requiredPermissions: ['documents:write'],
  },
  render: (args) => (
    <RBACWrapper user={null}>
      <RBACInput {...args} />
    </RBACWrapper>
  ),
}

// Custom Fallback Message
export const CustomFallback: Story = {
  args: {
    placeholder: 'Custom message input...',
    requiredSubscription: 'pro',
    fallbackMessage: 'This input requires Pro subscription for advanced features.',
  },
  render: (args) => (
    <RBACWrapper user={mockUsers.basicUser}>
      <RBACInput {...args} />
    </RBACWrapper>
  ),
}

// Form Example
export const FormExample: Story = {
  render: () => (
    <RBACWrapper user={mockUsers.basicUser}>
      <form className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-2">Document Title</label>
          <RBACInput 
            placeholder="Enter document title..." 
            requiredPermissions={['documents:write']}
            fullWidth
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Document Type</label>
          <RBACSelectInput
            placeholder="Select type..."
            options={[
              { value: 'pdf', label: 'PDF Document' },
              { value: 'docx', label: 'Word Document' },
              { value: 'xlsx', label: 'Excel Spreadsheet' },
            ]}
            requiredPermissions={['documents:write']}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <RBACTextarea 
            placeholder="Enter description..." 
            rows={3}
            requiredPermissions={['documents:write']}
            fullWidth
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">AI Analysis (Pro Feature)</label>
          <AIEnhancedInput 
            placeholder="AI-powered analysis..." 
            fullWidth
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Admin Notes (Admin Only)</label>
          <RBACTextarea 
            placeholder="Admin notes..." 
            rows={2}
            requiredRole="admin"
            fullWidth
          />
        </div>
      </form>
    </RBACWrapper>
  ),
  parameters: {
    layout: 'padded',
  },
}
