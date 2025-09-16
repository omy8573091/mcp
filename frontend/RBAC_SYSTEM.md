# RBAC System Documentation

## Overview

The Role-Based Access Control (RBAC) system provides comprehensive access control for components, routes, and features based on user subscriptions, roles, permissions, and features. This system ensures that users only see and can interact with functionality they have access to.

## Architecture

### Core Components

1. **Types & Interfaces** (`types.ts`)
   - Defines subscription tiers, user roles, permissions, and features
   - Provides type safety for the entire RBAC system

2. **Context & Hooks** (`context.tsx`)
   - Manages RBAC state and provides access control functions
   - Offers hooks for checking permissions, features, roles, and subscriptions

3. **Components** (`components.tsx`)
   - Wrapper components for protecting UI elements
   - Access gates, indicators, and upgrade prompts

4. **Middleware** (`middleware.tsx`)
   - Route protection and page guards
   - Higher-order components for access control

## Subscription Tiers

### Free
- **Documents**: 10 max
- **Users**: 1 max
- **Storage**: 1 GB
- **API Calls**: 100/month
- **Features**: Document upload, AI search

### Basic
- **Documents**: 100 max
- **Users**: 5 max
- **Storage**: 10 GB
- **API Calls**: 1,000/month
- **Features**: Document upload, AI search, Advanced analytics, Compliance reports, Data export

### Standard
- **Documents**: 1,000 max
- **Users**: 25 max
- **Storage**: 100 GB
- **API Calls**: 10,000/month
- **Features**: All Basic features + Risk assessment, Bulk operations, Custom fields

### Pro
- **Documents**: 10,000 max
- **Users**: 100 max
- **Storage**: 1 TB
- **API Calls**: 100,000/month
- **Features**: All Standard features + User management, API access, Workflow automation, Audit logs

### Enterprise
- **Documents**: Unlimited
- **Users**: Unlimited
- **Storage**: Unlimited
- **API Calls**: Unlimited
- **Features**: All Pro features + Custom branding, Priority support, SSO integration

## User Roles

### Guest
- **Permissions**: documents:read, search:basic
- **Description**: Limited read-only access

### Viewer
- **Permissions**: documents:read, search:basic, analytics:view, compliance:view, risk:view
- **Description**: Read-only access with analytics viewing

### Analyst
- **Permissions**: documents:read, documents:write, upload:files, search:basic, search:advanced, search:ai, analytics:view, analytics:export, compliance:view, compliance:reports, risk:view, risk:assess
- **Description**: Can create and analyze documents

### Manager
- **Permissions**: All Analyst permissions + documents:share, upload:bulk, search:history, analytics:custom, compliance:manage, risk:manage, users:view, users:invite
- **Description**: Can manage team and workflows

### Admin
- **Permissions**: All permissions
- **Description**: Full system access

## Permission Categories

### Documents
- `documents:read` - View documents
- `documents:write` - Create/edit documents
- `documents:delete` - Delete documents
- `documents:share` - Share documents
- `documents:export` - Export documents

### Upload
- `upload:files` - Upload individual files
- `upload:bulk` - Bulk upload files
- `upload:api` - API-based uploads

### Search
- `search:basic` - Basic search functionality
- `search:advanced` - Advanced search with filters
- `search:ai` - AI-powered search
- `search:history` - Search history access

### Analytics
- `analytics:view` - View analytics
- `analytics:export` - Export analytics data
- `analytics:custom` - Create custom analytics

### Compliance
- `compliance:view` - View compliance data
- `compliance:manage` - Manage compliance settings
- `compliance:reports` - Generate compliance reports

### Risk
- `risk:view` - View risk assessments
- `risk:assess` - Perform risk assessments
- `risk:manage` - Manage risk settings

### Users
- `users:view` - View user list
- `users:manage` - Manage users
- `users:invite` - Invite new users

### Settings
- `settings:view` - View settings
- `settings:manage` - Manage settings
- `settings:integrations` - Manage integrations

### API
- `api:read` - Read API access
- `api:write` - Write API access
- `api:admin` - Admin API access

## Feature Categories

### Core Features
- `document_upload` - Upload documents
- `ai_search` - AI-powered search
- `advanced_analytics` - Advanced analytics

### Pro Features
- `user_management` - User management
- `api_access` - API access
- `workflow_automation` - Workflow automation

### Enterprise Features
- `custom_branding` - Custom branding
- `sso_integration` - SSO integration
- `priority_support` - Priority support

## Usage Examples

### Basic Component Protection

```tsx
import { ProtectedComponent } from '../core/rbac/components';

<ProtectedComponent
  requiredPermissions={['documents:write']}
  requiredFeatures={['document_upload']}
  requiredSubscription="basic"
>
  <UploadButton>Upload Document</UploadButton>
</ProtectedComponent>
```

### Feature Gate

```tsx
import { FeatureGate } from '../core/rbac/components';

<FeatureGate feature="ai_search">
  <AISearchComponent />
</FeatureGate>
```

### Permission Gate

```tsx
import { PermissionGate } from '../core/rbac/components';

<PermissionGate permission="documents:delete">
  <DeleteButton>Delete Document</DeleteButton>
</PermissionGate>
```

### Subscription Gate

```tsx
import { SubscriptionGate } from '../core/rbac/components';

<SubscriptionGate tier="pro">
  <ProFeatureComponent />
</SubscriptionGate>
```

### Role Gate

```tsx
import { RoleGate } from '../core/rbac/components';

<RoleGate role="admin">
  <AdminPanel />
</RoleGate>
```

### Route Protection

```tsx
import { RouteProtection } from '../core/rbac/middleware';

<RouteProtection
  requiredPermissions={['users:manage']}
  requiredRole="admin"
  redirectTo="/unauthorized"
>
  <UserManagementPage />
</RouteProtection>
```

### Page Guard

```tsx
import { PageGuard } from '../core/rbac/middleware';

<PageGuard
  requiredSubscription="pro"
  requiredFeatures={['api_access']}
>
  <APISettingsPage />
</PageGuard>
```

### Using Hooks

```tsx
import { usePermission, useFeature, useSubscription, useRole } from '../core/rbac/context';

function MyComponent() {
  const canWrite = usePermission('documents:write');
  const hasAI = useFeature('ai_search');
  const isPro = useSubscription('pro');
  const isAdmin = useRole('admin');

  return (
    <div>
      {canWrite && <WriteButton />}
      {hasAI && <AIFeature />}
      {isPro && <ProFeature />}
      {isAdmin && <AdminFeature />}
    </div>
  );
}
```

### RBAC-Enhanced Components

```tsx
import { RBACButton, RBACInput } from '../design-system/components';

// Button with RBAC
<RBACButton
  requiredPermissions={['upload:files']}
  requiredFeatures={['document_upload']}
  requiredSubscription="basic"
>
  Upload Files
</RBACButton>

// Input with RBAC
<RBACInput
  placeholder="Document title..."
  requiredPermissions={['documents:write']}
  requiredFeatures={['document_upload']}
/>
```

## Specialized Components

### UploadButton
- Requires `upload:files` permission
- Requires `document_upload` feature

### DeleteButton
- Requires `documents:delete` permission
- Requires `manager` role or higher

### ExportButton
- Requires `documents:export` permission
- Requires `data_export` feature
- Requires `basic` subscription or higher

### AISearchButton
- Requires `ai_search` feature
- Requires `pro` subscription or higher

### AdminButton
- Requires `admin` role

### ProFeatureButton
- Requires `pro` subscription or higher

### EnterpriseFeatureButton
- Requires `enterprise` subscription

## Access Indicators

```tsx
import { AccessIndicator } from '../core/rbac/components';

<AccessIndicator
  requiredPermissions={['documents:write']}
  requiredFeatures={['ai_search']}
  requiredSubscription="pro"
  requiredRole="manager"
/>
```

## Upgrade Prompts

The system automatically shows upgrade prompts when users don't have access to features. These prompts can be customized:

```tsx
<ProtectedComponent
  requiredSubscription="pro"
  fallbackMessage="This feature requires Pro subscription for advanced AI capabilities."
  showUpgrade={true}
>
  <ProFeature />
</ProtectedComponent>
```

## Best Practices

### 1. Use Appropriate Access Levels
- Use the most restrictive access level that makes sense
- Don't over-restrict features unnecessarily

### 2. Provide Clear Feedback
- Use descriptive fallback messages
- Show upgrade prompts when appropriate
- Use access indicators for clarity

### 3. Progressive Enhancement
- Show basic functionality to all users
- Enhance with premium features for higher tiers
- Gracefully degrade when features aren't available

### 4. Consistent Patterns
- Use the same access patterns across similar components
- Follow naming conventions for permissions and features
- Document access requirements clearly

### 5. Testing
- Test with different user types and subscription levels
- Verify access controls work as expected
- Test upgrade flows and fallback scenarios

## Integration with Redux

The RBAC system integrates with Redux for state management:

```tsx
// In your Redux slice
import { createUserPermissions } from '../core/rbac';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    permissions: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.permissions = createUserPermissions(
        action.payload.id,
        action.payload.role,
        action.payload.subscription
      );
    },
  },
});
```

## Storybook Integration

The RBAC system includes comprehensive Storybook stories:

- `RBACButton.stories.tsx` - Button component examples
- `RBACInput.stories.tsx` - Input component examples
- `RBACSystem.stories.tsx` - System overview and comparisons

## Migration Guide

### From Basic Components to RBAC Components

1. **Replace basic components**:
   ```tsx
   // Before
   <Button>Upload</Button>
   
   // After
   <RBACButton requiredPermissions={['upload:files']}>Upload</RBACButton>
   ```

2. **Add access controls**:
   ```tsx
   // Before
   <div>
     <UploadForm />
   </div>
   
   // After
   <ProtectedComponent requiredPermissions={['upload:files']}>
     <UploadForm />
   </ProtectedComponent>
   ```

3. **Use specialized components**:
   ```tsx
   // Before
   <Button>Delete</Button>
   
   // After
   <DeleteButton>Delete</DeleteButton>
   ```

## Troubleshooting

### Common Issues

1. **Components not showing**: Check if user has required permissions/features
2. **Upgrade prompts not appearing**: Verify `showUpgrade` prop is true
3. **Access denied errors**: Check user role and subscription level
4. **TypeScript errors**: Ensure proper type imports from RBAC system

### Debug Mode

Enable debug mode to see access control decisions:

```tsx
import { useRBAC } from '../core/rbac/context';

function DebugComponent() {
  const { user, hasPermission, hasFeature } = useRBAC();
  
  console.log('User:', user);
  console.log('Can write:', hasPermission('documents:write'));
  console.log('Has AI:', hasFeature('ai_search'));
  
  return <div>Debug info in console</div>;
}
```

## Future Enhancements

1. **Dynamic Permissions**: Load permissions from API
2. **Time-based Access**: Temporary access grants
3. **Resource-specific Permissions**: Document-level access control
4. **Audit Logging**: Track access control decisions
5. **Custom Roles**: User-defined role creation
6. **Integration APIs**: Third-party permission systems

## Support

For questions or issues with the RBAC system:

1. Check the Storybook examples
2. Review the type definitions
3. Test with different user scenarios
4. Consult the component documentation
5. Check the Redux integration examples
