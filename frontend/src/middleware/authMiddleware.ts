import { Middleware } from '@reduxjs/toolkit';
import { storageUtils } from '../core/utils';
import { STORAGE_KEYS } from '../core/constants';
import { config } from '../core/config';
import { ErrorFactory } from '../core/errors';

// Authentication middleware
export const authMiddleware: Middleware = (store) => (next) => (action) => {
  const state = store.getState();
  const isAuthenticated = state.auth?.isAuthenticated;
  const token = state.auth?.token;
  
  // Handle authentication actions
  if (action.type.startsWith('auth/')) {
    return handleAuthAction(store, next, action);
  }
  
  // Check if action requires authentication
  if (requiresAuth(action.type) && !isAuthenticated) {
    return next({
      type: 'auth/required',
      payload: {
        action: action.type,
        message: 'Authentication required',
      },
    });
  }
  
  // Check token validity for protected actions
  if (requiresAuth(action.type) && token && isTokenExpired(token)) {
    // Attempt to refresh token
    return handleTokenRefresh(store, next, action);
  }
  
  return next(action);
};

// Handle authentication actions
const handleAuthAction = (store: any, next: any, action: any) => {
  switch (action.type) {
    case 'auth/login/fulfilled':
      // Store auth data
      const { user, token, refreshToken } = action.payload;
      storageUtils.set(STORAGE_KEYS.auth, {
        user,
        token,
        refreshToken,
        timestamp: Date.now(),
      });
      
      // Set up token refresh timer
      setupTokenRefresh(refreshToken);
      break;
      
    case 'auth/logout':
      // Clear auth data
      storageUtils.remove(STORAGE_KEYS.auth);
      clearTokenRefresh();
      break;
      
    case 'auth/refreshToken/fulfilled':
      // Update stored token
      const authData = storageUtils.get(STORAGE_KEYS.auth);
      if (authData) {
        storageUtils.set(STORAGE_KEYS.auth, {
          ...authData,
          token: action.payload.token,
          timestamp: Date.now(),
        });
      }
      break;
  }
  
  return next(action);
};

// Check if action requires authentication
const requiresAuth = (actionType: string): boolean => {
  const protectedActions = [
    'documents/',
    'users/',
    'analytics/',
    'settings/',
    'profile/',
  ];
  
  return protectedActions.some(action => actionType.includes(action));
};

// Check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    
    // Check if token expires in the next 5 minutes
    return exp - now < 5 * 60 * 1000;
  } catch {
    return true; // Invalid token
  }
};

// Handle token refresh
const handleTokenRefresh = async (store: any, next: any, action: any) => {
  const state = store.getState();
  const refreshToken = state.auth?.refreshToken;
  
  if (!refreshToken) {
    // No refresh token, redirect to login
    return next({
      type: 'auth/logout',
      payload: { reason: 'No refresh token' },
    });
  }
  
  try {
    // Attempt to refresh token
    const refreshAction = {
      type: 'auth/refreshToken/pending',
    };
    
    const result = next(refreshAction);
    
    // Wait for refresh to complete
    const refreshResult = await store.dispatch({
      type: 'auth/refreshToken',
      payload: { refreshToken },
    });
    
    if (refreshResult.type === 'auth/refreshToken/fulfilled') {
      // Retry original action with new token
      return next(action);
    } else {
      // Refresh failed, logout
      return next({
        type: 'auth/logout',
        payload: { reason: 'Token refresh failed' },
      });
    }
  } catch (error) {
    // Refresh failed, logout
    return next({
      type: 'auth/logout',
      payload: { reason: 'Token refresh error' },
    });
  }
};

// Set up automatic token refresh
let refreshTimer: NodeJS.Timeout | null = null;

const setupTokenRefresh = (refreshToken: string) => {
  clearTokenRefresh();
  
  // Refresh token 5 minutes before expiry
  const refreshInterval = 55 * 60 * 1000; // 55 minutes
  
  refreshTimer = setInterval(async () => {
    try {
      const response = await fetch(`${config.api.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update stored token
        const authData = storageUtils.get(STORAGE_KEYS.auth);
        if (authData) {
          storageUtils.set(STORAGE_KEYS.auth, {
            ...authData,
            token: data.token,
            timestamp: Date.now(),
          });
        }
      } else {
        // Refresh failed, logout
        storageUtils.remove(STORAGE_KEYS.auth);
        window.location.href = config.routing.routes.login;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      storageUtils.remove(STORAGE_KEYS.auth);
      window.location.href = config.routing.routes.login;
    }
  }, refreshInterval);
};

const clearTokenRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

// Route protection middleware
export const routeProtectionMiddleware: Middleware = (store) => (next) => (action) => {
  if (action.type === 'router/navigate') {
    const state = store.getState();
    const isAuthenticated = state.auth?.isAuthenticated;
    const route = action.payload;
    
    // Check if route requires authentication
    if (isProtectedRoute(route) && !isAuthenticated) {
      // Redirect to login
      return next({
        type: 'router/navigate',
        payload: config.routing.routes.login,
      });
    }
    
    // Check if route requires specific permissions
    if (requiresPermission(route)) {
      const user = state.auth?.user;
      const hasPermission = checkPermission(user, route);
      
      if (!hasPermission) {
        // Redirect to unauthorized page
        return next({
          type: 'router/navigate',
          payload: '/unauthorized',
        });
      }
    }
  }
  
  return next(action);
};

// Check if route is protected
const isProtectedRoute = (route: string): boolean => {
  const protectedRoutes = [
    '/dashboard',
    '/documents',
    '/upload',
    '/search',
    '/settings',
    '/profile',
  ];
  
  return protectedRoutes.some(protectedRoute => route.startsWith(protectedRoute));
};

// Check if route requires specific permissions
const requiresPermission = (route: string): boolean => {
  const permissionRoutes = [
    '/admin',
    '/settings',
    '/users',
  ];
  
  return permissionRoutes.some(permissionRoute => route.startsWith(permissionRoute));
};

// Check user permissions
const checkPermission = (user: any, route: string): boolean => {
  if (!user) return false;
  
  const permissions = user.permissions || [];
  
  if (route.startsWith('/admin')) {
    return permissions.includes('admin');
  }
  
  if (route.startsWith('/settings')) {
    return permissions.includes('settings') || permissions.includes('admin');
  }
  
  if (route.startsWith('/users')) {
    return permissions.includes('users') || permissions.includes('admin');
  }
  
  return true;
};

// Permission-based component access
export const withPermission = (
  Component: React.ComponentType<any>,
  requiredPermission: string,
  fallback?: React.ComponentType<any>
) => {
  return React.forwardRef<any, any>((props, ref) => {
    const user = useAppSelector(state => state.auth?.user);
    const hasPermission = user?.permissions?.includes(requiredPermission) || false;
    
    if (!hasPermission) {
      if (fallback) {
        return React.createElement(fallback, { ...props, ref });
      }
      return null;
    }
    
    return React.createElement(Component, { ...props, ref });
  });
};

// Role-based component access
export const withRole = (
  Component: React.ComponentType<any>,
  requiredRoles: string[],
  fallback?: React.ComponentType<any>
) => {
  return React.forwardRef<any, any>((props, ref) => {
    const user = useAppSelector(state => state.auth?.user);
    const userRole = user?.role;
    const hasRole = requiredRoles.includes(userRole);
    
    if (!hasRole) {
      if (fallback) {
        return React.createElement(fallback, { ...props, ref });
      }
      return null;
    }
    
    return React.createElement(Component, { ...props, ref });
  });
};

// Hook for authentication state
export const useAuth = () => {
  const authState = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  
  const login = useCallback(async (credentials: { email: string; password: string }) => {
    return dispatch({
      type: 'auth/login',
      payload: credentials,
    });
  }, [dispatch]);
  
  const logout = useCallback(() => {
    dispatch({ type: 'auth/logout' });
  }, [dispatch]);
  
  const refreshToken = useCallback(async () => {
    const authData = storageUtils.get(STORAGE_KEYS.auth);
    if (authData?.refreshToken) {
      return dispatch({
        type: 'auth/refreshToken',
        payload: { refreshToken: authData.refreshToken },
      });
    }
  }, [dispatch]);
  
  const hasPermission = useCallback((permission: string) => {
    return authState.user?.permissions?.includes(permission) || false;
  }, [authState.user]);
  
  const hasRole = useCallback((role: string) => {
    return authState.user?.role === role;
  }, [authState.user]);
  
  const hasAnyRole = useCallback((roles: string[]) => {
    return roles.includes(authState.user?.role || '');
  }, [authState.user]);
  
  return {
    ...authState,
    login,
    logout,
    refreshToken,
    hasPermission,
    hasRole,
    hasAnyRole,
  };
};

// Initialize auth state from storage
export const initializeAuth = () => {
  const authData = storageUtils.get(STORAGE_KEYS.auth);
  
  if (authData && authData.token && !isTokenExpired(authData.token)) {
    // Restore auth state
    return {
      type: 'auth/restore',
      payload: authData,
    };
  } else {
    // Clear invalid auth data
    storageUtils.remove(STORAGE_KEYS.auth);
    return {
      type: 'auth/clear',
    };
  }
};
