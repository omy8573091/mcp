import { APP_CONFIG, API_CONFIG, STORAGE_KEYS, ROUTES, PAGINATION, CACHE_CONFIG, PERFORMANCE, VALIDATION, THEME, ACCESSIBILITY } from '../constants';

// Environment configuration
export const env = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || API_CONFIG.baseUrl,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  version: process.env.NEXT_PUBLIC_APP_VERSION || APP_CONFIG.version,
} as const;

// Application configuration
export const appConfig = {
  name: APP_CONFIG.name,
  version: APP_CONFIG.version,
  description: APP_CONFIG.description,
  author: APP_CONFIG.author,
  repository: APP_CONFIG.repository,
  environment: env.isDevelopment ? 'development' : 'production',
  debug: env.isDevelopment,
} as const;

// API configuration
export const apiConfig = {
  baseUrl: env.apiUrl,
  timeout: API_CONFIG.timeout,
  retryAttempts: API_CONFIG.retryAttempts,
  retryDelay: API_CONFIG.retryDelay,
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      register: '/auth/register',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
    },
    documents: {
      list: '/documents',
      create: '/documents',
      get: '/documents/:id',
      update: '/documents/:id',
      delete: '/documents/:id',
      upload: '/documents/upload',
      search: '/documents/search',
      download: '/documents/:id/download',
    },
    users: {
      profile: '/users/profile',
      update: '/users/profile',
      changePassword: '/users/change-password',
      preferences: '/users/preferences',
    },
    dashboard: {
      stats: '/dashboard/stats',
      recent: '/dashboard/recent',
      compliance: '/dashboard/compliance',
    },
  },
} as const;

// Storage configuration
export const storageConfig = {
  keys: STORAGE_KEYS,
  options: {
    theme: {
      key: STORAGE_KEYS.theme,
      defaultValue: 'system',
    },
    language: {
      key: STORAGE_KEYS.language,
      defaultValue: 'en',
    },
    auth: {
      key: STORAGE_KEYS.auth,
      secure: true,
    },
    cache: {
      key: STORAGE_KEYS.cache,
      maxAge: CACHE_CONFIG.defaultTTL,
    },
    preferences: {
      key: STORAGE_KEYS.preferences,
      defaultValue: {},
    },
  },
} as const;

// Routing configuration
export const routingConfig = {
  routes: ROUTES,
  protected: [
    ROUTES.dashboard,
    ROUTES.documents,
    ROUTES.upload,
    ROUTES.search,
    ROUTES.settings,
    ROUTES.profile,
  ],
  public: [
    ROUTES.home,
    ROUTES.login,
  ],
  redirects: {
    authenticated: ROUTES.dashboard,
    unauthenticated: ROUTES.login,
  },
} as const;

// Pagination configuration
export const paginationConfig = {
  defaultPageSize: PAGINATION.defaultPageSize,
  pageSizeOptions: PAGINATION.pageSizeOptions,
  maxPageSize: PAGINATION.maxPageSize,
} as const;

// Cache configuration
export const cacheConfig = {
  defaultTTL: CACHE_CONFIG.defaultTTL,
  maxSize: CACHE_CONFIG.maxSize,
  cleanupInterval: CACHE_CONFIG.cleanupInterval,
  strategies: {
    documents: {
      ttl: 2 * 60 * 1000, // 2 minutes
      maxAge: 5 * 60 * 1000, // 5 minutes
    },
    search: {
      ttl: 1 * 60 * 1000, // 1 minute
      maxAge: 2 * 60 * 1000, // 2 minutes
    },
    dashboard: {
      ttl: 30 * 1000, // 30 seconds
      maxAge: 1 * 60 * 1000, // 1 minute
    },
    user: {
      ttl: 5 * 60 * 1000, // 5 minutes
      maxAge: 10 * 60 * 1000, // 10 minutes
    },
  },
} as const;

// Performance configuration
export const performanceConfig = {
  debounceDelay: PERFORMANCE.debounceDelay,
  throttleDelay: PERFORMANCE.throttleDelay,
  virtualScrollItemHeight: PERFORMANCE.virtualScrollItemHeight,
  maxRenderItems: PERFORMANCE.maxRenderItems,
  lazyLoading: {
    enabled: true,
    threshold: 0.1,
    rootMargin: '50px',
  },
  codeSplitting: {
    enabled: true,
    chunkSize: 244 * 1024, // 244KB
  },
  compression: {
    enabled: true,
    level: 6,
  },
} as const;

// Validation configuration
export const validationConfig = {
  maxFileSize: VALIDATION.maxFileSize,
  allowedFileTypes: VALIDATION.allowedFileTypes,
  maxTitleLength: VALIDATION.maxTitleLength,
  maxDescriptionLength: VALIDATION.maxDescriptionLength,
  rules: {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecialChar: true,
    },
    phone: {
      pattern: /^[\+]?[1-9][\d]{0,15}$/,
    },
    url: {
      pattern: /^https?:\/\/.+/,
    },
  },
} as const;

// Theme configuration
export const themeConfig = {
  breakpoints: THEME.breakpoints,
  spacing: THEME.spacing,
  borderRadius: THEME.borderRadius,
  shadows: THEME.shadows,
  colors: {
    primary: {
      light: '#1976d2',
      main: '#1976d2',
      dark: '#115293',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#dc004e',
      main: '#dc004e',
      dark: '#9a0036',
      contrastText: '#ffffff',
    },
    error: {
      light: '#e57373',
      main: '#f44336',
      dark: '#d32f2f',
      contrastText: '#ffffff',
    },
    warning: {
      light: '#ffb74d',
      main: '#ff9800',
      dark: '#f57c00',
      contrastText: '#ffffff',
    },
    info: {
      light: '#64b5f6',
      main: '#2196f3',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
    success: {
      light: '#81c784',
      main: '#4caf50',
      dark: '#388e3c',
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
} as const;

// Accessibility configuration
export const accessibilityConfig = {
  focusVisible: ACCESSIBILITY.focusVisible,
  reducedMotion: ACCESSIBILITY.reducedMotion,
  highContrast: ACCESSIBILITY.highContrast,
  colorScheme: ACCESSIBILITY.colorScheme,
  ariaLabels: {
    navigation: 'Main navigation',
    sidebar: 'Sidebar navigation',
    content: 'Main content',
    footer: 'Footer',
  },
  keyboard: {
    navigation: {
      next: 'ArrowRight',
      previous: 'ArrowLeft',
      up: 'ArrowUp',
      down: 'ArrowDown',
      select: 'Enter',
      escape: 'Escape',
    },
    shortcuts: {
      search: 'Ctrl+K',
      newDocument: 'Ctrl+N',
      save: 'Ctrl+S',
      undo: 'Ctrl+Z',
      redo: 'Ctrl+Y',
    },
  },
} as const;

// Feature flags
export const featureFlags = {
  enableDarkMode: true,
  enableMultiLanguage: true,
  enableNotifications: true,
  enableOfflineMode: false,
  enableAnalytics: env.isProduction,
  enableErrorReporting: env.isProduction,
  enablePerformanceMonitoring: true,
  enableAccessibilityTools: true,
  enableAdvancedSearch: true,
  enableBulkOperations: true,
  enableRealTimeUpdates: false,
  enableCollaboration: false,
} as const;

// Security configuration
export const securityConfig = {
  csrf: {
    enabled: true,
    tokenHeader: 'X-CSRF-Token',
  },
  cors: {
    enabled: true,
    origins: env.isDevelopment ? ['http://localhost:3000'] : [env.appUrl],
  },
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
} as const;

// Export all configurations
export const config = {
  env,
  app: appConfig,
  api: apiConfig,
  storage: storageConfig,
  routing: routingConfig,
  pagination: paginationConfig,
  cache: cacheConfig,
  performance: performanceConfig,
  validation: validationConfig,
  theme: themeConfig,
  accessibility: accessibilityConfig,
  features: featureFlags,
  security: securityConfig,
} as const;
