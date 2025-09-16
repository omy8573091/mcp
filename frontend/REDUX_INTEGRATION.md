# Redux Integration for GRC Document Management

This document outlines the Redux state management implementation for the GRC Document Management application.

## Overview

The application now uses Redux Toolkit for state management, providing centralized state management for:
- Theme preferences (light/dark/auto)
- Language settings (8 languages supported)
- User authentication
- Document management
- UI state (modals, notifications, etc.)

## Store Structure

```
store/
├── index.ts                 # Store configuration and persistence
├── hooks.ts                 # Typed Redux hooks
├── devtools.ts              # DevTools configuration
└── slices/
    ├── themeSlice.ts        # Theme management
    ├── languageSlice.ts     # Internationalization
    ├── authSlice.ts         # Authentication
    ├── documentsSlice.ts    # Document management
    └── uiSlice.ts           # UI state management
```

## State Slices

### 1. Theme Slice (`themeSlice.ts`)
- **State**: `mode`, `isDarkMode`, `systemPreference`
- **Actions**: `setThemeMode`, `toggleTheme`, `setSystemPreference`, `initializeTheme`
- **Features**: 
  - Light/Dark/Auto theme modes
  - System preference detection
  - Persistent theme selection

### 2. Language Slice (`languageSlice.ts`)
- **State**: `currentLanguage`, `translations`, `isLoading`, `error`
- **Actions**: `setLanguage`, `setLoading`, `setError`, `initializeLanguage`
- **Features**:
  - 8 language support (EN, ES, FR, DE, ZH, JA, KO, AR)
  - Complete translation system
  - Browser language detection

### 3. Authentication Slice (`authSlice.ts`)
- **State**: `user`, `token`, `isAuthenticated`, `permissions`
- **Actions**: `setUser`, `setToken`, `clearAuth`, `setPermissions`
- **Async Thunks**: `loginUser`, `logoutUser`, `refreshToken`
- **Features**:
  - JWT token management
  - User permissions
  - Automatic token refresh

### 4. Documents Slice (`documentsSlice.ts`)
- **State**: `documents`, `recentDocuments`, `searchResults`, `filters`, `pagination`
- **Actions**: `setDocuments`, `addDocument`, `updateDocument`, `removeDocument`
- **Async Thunks**: `fetchDocuments`, `uploadDocuments`, `searchDocuments`, `deleteDocument`
- **Features**:
  - Document CRUD operations
  - Search and filtering
  - Upload progress tracking
  - Pagination support

### 5. UI Slice (`uiSlice.ts`)
- **State**: `sidebarOpen`, `notifications`, `modals`, `loading`, `snackbar`
- **Actions**: `toggleSidebar`, `openModal`, `showSnackbar`, `addNotification`
- **Features**:
  - Sidebar state management
  - Modal management
  - Notification system
  - Loading states
  - Snackbar messages

## Redux Providers

### ReduxProvider (`providers/ReduxProvider.tsx`)
- Wraps the entire application
- Configures Redux store and persistence
- Initializes theme, language, and auth state

### ThemeProvider (`providers/ThemeProvider.tsx`)
- Provides Material-UI theme based on Redux state
- Automatically updates when theme changes

### LanguageProvider (`providers/LanguageProvider.tsx`)
- Provides translation function based on Redux state
- Maintains backward compatibility

## Custom Hooks

### useTheme (`hooks/useTheme.ts`)
```typescript
const { mode, isDarkMode, setTheme, toggleTheme } = useTheme();
```

### useLanguage (`hooks/useLanguage.ts`)
```typescript
const { language, setLanguage, t } = useLanguage();
```

### useAppSelector & useAppDispatch (`store/hooks.ts`)
- Typed Redux hooks for type safety

## Redux Components

### ReduxLayout (`components/ReduxLayout.tsx`)
- Manages sidebar state through Redux
- Handles mobile/desktop sidebar behavior

### ReduxAppBar (`components/ReduxAppBar.tsx`)
- Integrates theme toggle and language selector
- Manages mobile sidebar toggle

### ReduxSidebar (`components/ReduxSidebar.tsx`)
- Uses Redux for navigation state
- Supports mobile sidebar closing

### ReduxDashboard (`components/ReduxDashboard.tsx`)
- Fetches and displays documents from Redux store
- Real-time statistics calculation

## State Persistence

The application uses `redux-persist` to persist:
- Theme preferences
- Language settings
- Authentication state

Configuration in `store/index.ts`:
```typescript
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['theme', 'language', 'auth'],
};
```

## Migration from Context

The application has been migrated from React Context to Redux:

### Before (Context)
```typescript
const { isDarkMode, toggleTheme } = useTheme();
const { t } = useLanguage();
```

### After (Redux)
```typescript
const { isDarkMode, toggleTheme } = useTheme(); // Same API
const { t } = useLanguage(); // Same API
```

The migration maintains backward compatibility while providing:
- Better performance
- Centralized state management
- Time-travel debugging
- State persistence
- Better TypeScript support

## Usage Examples

### Theme Management
```typescript
import { useTheme } from '../hooks/useTheme';

function ThemeToggle() {
  const { isDarkMode, toggleTheme, setTheme } = useTheme();
  
  return (
    <Button onClick={toggleTheme}>
      {isDarkMode ? 'Light' : 'Dark'} Theme
    </Button>
  );
}
```

### Language Management
```typescript
import { useLanguage } from '../hooks/useLanguage';

function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
      <MenuItem value="en">{t('language.english')}</MenuItem>
      <MenuItem value="es">{t('language.spanish')}</MenuItem>
    </Select>
  );
}
```

### Document Management
```typescript
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchDocuments, uploadDocuments } from '../store/slices/documentsSlice';

function DocumentManager() {
  const dispatch = useAppDispatch();
  const { documents, isLoading } = useAppSelector(state => state.documents);
  
  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);
  
  const handleUpload = (files) => {
    dispatch(uploadDocuments(files));
  };
}
```

## Benefits

1. **Centralized State**: All application state in one place
2. **Predictable Updates**: State changes through actions only
3. **Time-travel Debugging**: Redux DevTools support
4. **State Persistence**: Automatic state restoration
5. **Type Safety**: Full TypeScript support
6. **Performance**: Optimized re-renders
7. **Scalability**: Easy to add new features
8. **Testing**: Easier to test state logic

## Development Tools

- **Redux DevTools**: Browser extension for debugging
- **Redux Toolkit**: Modern Redux with less boilerplate
- **Redux Persist**: Automatic state persistence
- **TypeScript**: Full type safety

## Next Steps

1. Add more async thunks for API integration
2. Implement optimistic updates
3. Add error boundaries for Redux errors
4. Create selectors for complex state derivations
5. Add middleware for logging and analytics
