// Application constants
export const APP_CONFIG = {
  name: 'GRC Document Management',
  version: '1.0.0',
  description: 'Enterprise Governance, Risk, and Compliance Document Management System',
  author: 'GRC Team',
  repository: 'https://github.com/company/grc-document-management',
} as const;

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

export const STORAGE_KEYS = {
  theme: 'grc_theme',
  language: 'grc_language',
  auth: 'grc_auth',
  cache: 'grc_cache',
  preferences: 'grc_preferences',
} as const;

export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  documents: '/documents',
  upload: '/upload',
  search: '/search',
  settings: '/settings',
  profile: '/profile',
  login: '/login',
  logout: '/logout',
} as const;

export const PAGINATION = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageSize: 1000,
} as const;

export const CACHE_CONFIG = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
} as const;

export const PERFORMANCE = {
  debounceDelay: 300,
  throttleDelay: 100,
  virtualScrollItemHeight: 120,
  maxRenderItems: 1000,
} as const;

export const VALIDATION = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['pdf', 'docx', 'xlsx', 'txt', 'csv'],
  maxTitleLength: 255,
  maxDescriptionLength: 1000,
} as const;

export const THEME = {
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
  },
  shadows: {
    light: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    medium: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    heavy: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  },
} as const;

export const ACCESSIBILITY = {
  focusVisible: true,
  reducedMotion: 'prefers-reduced-motion',
  highContrast: 'prefers-contrast',
  colorScheme: 'prefers-color-scheme',
} as const;

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
] as const;

export const DOCUMENT_TYPES = [
  'POLICY',
  'PROCEDURE',
  'CONTROL',
  'RISK_ASSESSMENT',
  'AUDIT_REPORT',
  'COMPLIANCE_REPORT',
  'TRAINING_MATERIAL',
  'OTHER',
] as const;

export const COMPLIANCE_FRAMEWORKS = [
  'SOX',
  'GDPR',
  'ISO27001',
  'NIST',
  'COSO',
  'PCI_DSS',
  'HIPAA',
  'FISMA',
] as const;

export const RISK_LEVELS = [
  'low',
  'medium',
  'high',
  'critical',
] as const;

export const DOCUMENT_STATUS = [
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'archived',
] as const;
