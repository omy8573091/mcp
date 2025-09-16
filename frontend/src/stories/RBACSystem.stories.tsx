import type { Meta, StoryObj } from '@storybook/react'
import { RBACProvider } from '../core/rbac/context'
import { 
  ProtectedComponent,
  FeatureGate,
  PermissionGate,
  SubscriptionGate,
  RoleGate,
  AccessGate,
  AccessButton,
  AccessIndicator,
} from '../core/rbac/components'
import { 
  RBACButton, 
  UploadButton, 
  DeleteButton, 
  ExportButton, 
  AISearchButton,
  AdminButton,
  ProFeatureButton,
} from '../design-system/components/RBACButton'
import { 
  RBACInput, 
  RBACSearchInput, 
  RBACSelectInput, 
  AIEnhancedInput,
} from '../design-system/components/RBACInput'
import type { UserPermissions, SubscriptionTier, UserRole, Permission, Feature } from '../core/rbac/types'

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
        {user && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <p>Permissions: {user.permissions.length} granted</p>
            <p>Features: {user.features.length} available</p>
          </div>
        )}
      </div>
      {children}
    </div>
  </RBACProvider>
)

const meta: Meta = {
  title: 'RBAC/System Overview',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete Role-Based Access Control system overview with subscription tiers, user roles, permissions, and features.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

// RBAC System Overview
export const SystemOverview: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          RBAC System Overview
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Role-Based Access Control system that manages component access based on subscription tiers, user roles, permissions, and features.
        </p>
      </div>

      {/* Subscription Tiers */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Subscription Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {['free', 'basic', 'standard', 'pro', 'enterprise'].map((tier) => (
            <div key={tier} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 capitalize">
                {tier} Plan
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>• Document upload</p>
                <p>• Basic search</p>
                {tier !== 'free' && <p>• Advanced analytics</p>}
                {tier === 'pro' && <p>• AI features</p>}
                {tier === 'enterprise' && <p>• Custom branding</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Roles */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">User Roles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {['guest', 'viewer', 'analyst', 'manager', 'admin'].map((role) => (
            <div key={role} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 capitalize">
                {role}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>• Read documents</p>
                {role !== 'guest' && <p>• Write documents</p>}
                {role === 'analyst' && <p>• Upload files</p>}
                {role === 'manager' && <p>• Manage users</p>}
                {role === 'admin' && <p>• Full access</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permission Categories */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Permission Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Documents</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• documents:read</p>
              <p>• documents:write</p>
              <p>• documents:delete</p>
              <p>• documents:share</p>
              <p>• documents:export</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Upload</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• upload:files</p>
              <p>• upload:bulk</p>
              <p>• upload:api</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Search</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• search:basic</p>
              <p>• search:advanced</p>
              <p>• search:ai</p>
              <p>• search:history</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Categories */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Feature Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Core Features</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• document_upload</p>
              <p>• ai_search</p>
              <p>• advanced_analytics</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Pro Features</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• user_management</p>
              <p>• api_access</p>
              <p>• workflow_automation</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Enterprise Features</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• custom_branding</p>
              <p>• sso_integration</p>
              <p>• priority_support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
}

// Component Access Examples
export const ComponentAccessExamples: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Component Access Examples</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Examples of how different components handle access control based on user permissions and subscription tiers.
        </p>
      </div>

      {/* Free User */}
      <RBACWrapper user={mockUsers.freeUser}>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Free User (Viewer / Free)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Buttons</h4>
              <div className="space-y-2">
                <UploadButton>Upload Files</UploadButton>
                <DeleteButton>Delete</DeleteButton>
                <ExportButton>Export</ExportButton>
                <AISearchButton>AI Search</AISearchButton>
                <ProFeatureButton>Pro Feature</ProFeatureButton>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Inputs</h4>
              <div className="space-y-2">
                <RBACInput placeholder="Basic input..." />
                <RBACSearchInput placeholder="Search..." />
                <RBACInput 
                  placeholder="Write permission required..." 
                  requiredPermissions={['documents:write']}
                />
                <AIEnhancedInput placeholder="AI features..." />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Access Gates</h4>
              <div className="space-y-2">
                <FeatureGate feature="ai_search">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded text-sm">
                    AI Search Available
                  </div>
                </FeatureGate>
                <PermissionGate permission="documents:write">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded text-sm">
                    Write Permission Granted
                  </div>
                </PermissionGate>
                <SubscriptionGate tier="pro">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded text-sm">
                    Pro Features Available
                  </div>
                </SubscriptionGate>
              </div>
            </div>
          </div>
        </div>
      </RBACWrapper>

      {/* Pro User */}
      <RBACWrapper user={mockUsers.proUser}>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Pro User (Manager / Pro)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Buttons</h4>
              <div className="space-y-2">
                <UploadButton>Upload Files</UploadButton>
                <DeleteButton>Delete</DeleteButton>
                <ExportButton>Export</ExportButton>
                <AISearchButton>AI Search</AISearchButton>
                <ProFeatureButton>Pro Feature</ProFeatureButton>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Inputs</h4>
              <div className="space-y-2">
                <RBACInput placeholder="Basic input..." />
                <RBACSearchInput placeholder="Search..." />
                <RBACInput 
                  placeholder="Write permission required..." 
                  requiredPermissions={['documents:write']}
                />
                <AIEnhancedInput placeholder="AI features..." />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Access Gates</h4>
              <div className="space-y-2">
                <FeatureGate feature="ai_search">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded text-sm">
                    AI Search Available
                  </div>
                </FeatureGate>
                <PermissionGate permission="documents:write">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded text-sm">
                    Write Permission Granted
                  </div>
                </PermissionGate>
                <SubscriptionGate tier="pro">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded text-sm">
                    Pro Features Available
                  </div>
                </SubscriptionGate>
              </div>
            </div>
          </div>
        </div>
      </RBACWrapper>
    </div>
  ),
}

// Access Control Patterns
export const AccessControlPatterns: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Access Control Patterns</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Different patterns for implementing access control in components.
        </p>
      </div>

      <RBACWrapper user={mockUsers.basicUser}>
        <div className="space-y-8">
          {/* Pattern 1: Permission-based */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Pattern 1: Permission-based Access
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <PermissionGate permission="documents:write">
                <div className="p-4 bg-white dark:bg-gray-700 rounded border">
                  <h4 className="font-medium mb-2">Write Permission Required</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This content is only visible to users with write permissions.
                  </p>
                </div>
              </PermissionGate>
            </div>
          </div>

          {/* Pattern 2: Feature-based */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Pattern 2: Feature-based Access
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <FeatureGate feature="ai_search">
                <div className="p-4 bg-white dark:bg-gray-700 rounded border">
                  <h4 className="font-medium mb-2">AI Search Feature</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This feature is available to users with AI search capabilities.
                  </p>
                </div>
              </FeatureGate>
            </div>
          </div>

          {/* Pattern 3: Subscription-based */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Pattern 3: Subscription-based Access
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <SubscriptionGate tier="pro">
                <div className="p-4 bg-white dark:bg-gray-700 rounded border">
                  <h4 className="font-medium mb-2">Pro Subscription Feature</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This feature requires Pro subscription or higher.
                  </p>
                </div>
              </SubscriptionGate>
            </div>
          </div>

          {/* Pattern 4: Role-based */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Pattern 4: Role-based Access
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <RoleGate role="manager">
                <div className="p-4 bg-white dark:bg-gray-700 rounded border">
                  <h4 className="font-medium mb-2">Manager Role Required</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This content is only visible to managers and above.
                  </p>
                </div>
              </RoleGate>
            </div>
          </div>

          {/* Pattern 5: Combined Access */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Pattern 5: Combined Access Control
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <AccessGate
                permissions={['documents:write']}
                features={['ai_search']}
                subscription="pro"
                role="analyst"
              >
                <div className="p-4 bg-white dark:bg-gray-700 rounded border">
                  <h4 className="font-medium mb-2">Complex Access Control</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This requires write permissions, AI search feature, Pro subscription, and analyst role or higher.
                  </p>
                </div>
              </AccessGate>
            </div>
          </div>

          {/* Pattern 6: Access Indicators */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Pattern 6: Access Indicators
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm">Write Permission:</span>
                  <AccessIndicator requiredPermissions={['documents:write']} />
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">AI Search Feature:</span>
                  <AccessIndicator requiredFeatures={['ai_search']} />
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">Pro Subscription:</span>
                  <AccessIndicator requiredSubscription="pro" />
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm">Manager Role:</span>
                  <AccessIndicator requiredRole="manager" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </RBACWrapper>
    </div>
  ),
}

// All User Types Comparison
export const AllUserTypesComparison: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">All User Types Comparison</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Compare how different user types see the same interface with RBAC controls.
        </p>
      </div>

      {Object.entries(mockUsers).map(([userType, user]) => (
        <RBACWrapper key={userType} user={user}>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 capitalize">
              {userType.replace('User', ' User')} ({user.role} / {user.subscription})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Action Buttons</h4>
                <div className="space-y-2">
                  <UploadButton size="sm">Upload</UploadButton>
                  <DeleteButton size="sm">Delete</DeleteButton>
                  <ExportButton size="sm">Export</ExportButton>
                  <AISearchButton size="sm">AI Search</AISearchButton>
                  <AdminButton size="sm">Admin</AdminButton>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Form Inputs</h4>
                <div className="space-y-2">
                  <RBACInput placeholder="Basic input..." size="small" />
                  <RBACSearchInput placeholder="Search..." size="small" />
                  <RBACInput 
                    placeholder="Write required..." 
                    size="small"
                    requiredPermissions={['documents:write']}
                  />
                  <AIEnhancedInput placeholder="AI features..." size="small" />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Access Gates</h4>
                <div className="space-y-2">
                  <PermissionGate permission="documents:write">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded text-xs">
                      Write Access
                    </div>
                  </PermissionGate>
                  <FeatureGate feature="ai_search">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded text-xs">
                      AI Search
                    </div>
                  </FeatureGate>
                  <SubscriptionGate tier="pro">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded text-xs">
                      Pro Features
                    </div>
                  </SubscriptionGate>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Access Indicators</h4>
                <div className="space-y-2">
                  <AccessIndicator requiredPermissions={['documents:write']} />
                  <AccessIndicator requiredFeatures={['ai_search']} />
                  <AccessIndicator requiredSubscription="pro" />
                  <AccessIndicator requiredRole="manager" />
                </div>
              </div>
            </div>
          </div>
        </RBACWrapper>
      ))}
    </div>
  ),
}
