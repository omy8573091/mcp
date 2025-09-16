import { api } from './client';
import type { ApiResponse, PaginationParams, FilterParams } from '../../core/types';

// Base endpoint types
export interface Document {
  id: string;
  title: string;
  filename: string;
  description?: string;
  documentType: string;
  framework: string;
  riskLevel: string;
  status: string;
  complianceScore: number;
  fileSize: number;
  uploadDate: string;
  updatedAt: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  preferences?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalDocuments: number;
  totalUsers: number;
  complianceScore: number;
  riskDistribution: Record<string, number>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
}

export interface ComplianceStatus {
  overallScore: number;
  frameworkScores: Record<string, number>;
  riskLevels: Record<string, number>;
  lastAssessment: string;
  nextAssessment: string;
}

// Authentication endpoints
export const authApi = {
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) =>
    api.post<{ user: User; token: string; refreshToken: string }>('/auth/login', credentials),

  logout: () =>
    api.post('/auth/logout'),

  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    acceptTerms: boolean;
  }) =>
    api.post<{ user: User; token: string }>('/auth/register', userData),

  refreshToken: (refreshToken: string) =>
    api.post<{ token: string; refreshToken: string }>('/auth/refresh', { refreshToken }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),

  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),

  resendVerification: (email: string) =>
    api.post('/auth/resend-verification', { email }),
};

// Document endpoints
export const documentApi = {
  // Get documents with pagination and filtering
  getDocuments: (params: PaginationParams & FilterParams) =>
    api.get<{ documents: Document[]; pagination: any }>('/documents', { params }),

  // Get single document
  getDocument: (id: string) =>
    api.get<Document>(`/documents/${id}`),

  // Create new document
  createDocument: (documentData: Partial<Document>) =>
    api.post<Document>('/documents', documentData),

  // Update document
  updateDocument: (id: string, documentData: Partial<Document>) =>
    api.put<Document>(`/documents/${id}`, documentData),

  // Delete document
  deleteDocument: (id: string) =>
    api.delete(`/documents/${id}`),

  // Upload document file
  uploadDocument: (file: File, metadata: Partial<Document>, onProgress?: (progress: number) => void) =>
    api.upload<Document>('/documents/upload', file, onProgress),

  // Search documents
  searchDocuments: (query: string, filters?: FilterParams) =>
    api.post<{ documents: Document[]; total: number }>('/documents/search', { query, filters }),

  // Download document
  downloadDocument: (id: string, filename?: string) =>
    api.download(`/documents/${id}/download`, filename),

  // Get document metadata
  getDocumentMetadata: (id: string) =>
    api.get<Record<string, any>>(`/documents/${id}/metadata`),

  // Update document metadata
  updateDocumentMetadata: (id: string, metadata: Record<string, any>) =>
    api.put<Record<string, any>>(`/documents/${id}/metadata`, metadata),

  // Get document versions
  getDocumentVersions: (id: string) =>
    api.get<Array<{ version: number; createdAt: string; user: string }>>(`/documents/${id}/versions`),

  // Restore document version
  restoreDocumentVersion: (id: string, version: number) =>
    api.post<Document>(`/documents/${id}/versions/${version}/restore`),

  // Get document comments
  getDocumentComments: (id: string) =>
    api.get<Array<{ id: string; comment: string; user: string; createdAt: string }>>(`/documents/${id}/comments`),

  // Add document comment
  addDocumentComment: (id: string, comment: string) =>
    api.post<{ id: string; comment: string; user: string; createdAt: string }>(`/documents/${id}/comments`, { comment }),

  // Update document comment
  updateDocumentComment: (documentId: string, commentId: string, comment: string) =>
    api.put<{ id: string; comment: string; user: string; createdAt: string }>(`/documents/${documentId}/comments/${commentId}`, { comment }),

  // Delete document comment
  deleteDocumentComment: (documentId: string, commentId: string) =>
    api.delete(`/documents/${documentId}/comments/${commentId}`),

  // Bulk operations
  bulkDelete: (ids: string[]) =>
    api.post('/documents/bulk/delete', { ids }),

  bulkUpdate: (ids: string[], updates: Partial<Document>) =>
    api.post('/documents/bulk/update', { ids, updates }),

  bulkExport: (ids: string[], format: 'pdf' | 'excel' | 'csv') =>
    api.post('/documents/bulk/export', { ids, format }),
};

// User endpoints
export const userApi = {
  // Get current user profile
  getProfile: () =>
    api.get<User>('/users/profile'),

  // Update user profile
  updateProfile: (userData: Partial<User>) =>
    api.put<User>('/users/profile', userData),

  // Change password
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/users/change-password', { currentPassword, newPassword }),

  // Get user preferences
  getPreferences: () =>
    api.get<Record<string, any>>('/users/preferences'),

  // Update user preferences
  updatePreferences: (preferences: Record<string, any>) =>
    api.put<Record<string, any>>('/users/preferences', preferences),

  // Get user activity
  getActivity: (params?: PaginationParams) =>
    api.get<{ activities: Array<{ id: string; type: string; description: string; timestamp: string }> }>('/users/activity', { params }),

  // Upload avatar
  uploadAvatar: (file: File) =>
    api.upload<{ avatar: string }>('/users/avatar', file),

  // Delete avatar
  deleteAvatar: () =>
    api.delete('/users/avatar'),

  // Get user notifications
  getNotifications: (params?: PaginationParams) =>
    api.get<{ notifications: Array<{ id: string; title: string; message: string; read: boolean; createdAt: string }> }>('/users/notifications', { params }),

  // Mark notification as read
  markNotificationAsRead: (id: string) =>
    api.put(`/users/notifications/${id}/read`),

  // Mark all notifications as read
  markAllNotificationsAsRead: () =>
    api.put('/users/notifications/read-all'),

  // Delete notification
  deleteNotification: (id: string) =>
    api.delete(`/users/notifications/${id}`),
};

// Dashboard endpoints
export const dashboardApi = {
  // Get dashboard statistics
  getStats: () =>
    api.get<DashboardStats>('/dashboard/stats'),

  // Get recent documents
  getRecentDocuments: (limit?: number) =>
    api.get<{ documents: Document[] }>('/dashboard/recent', { params: { limit } }),

  // Get compliance status
  getComplianceStatus: () =>
    api.get<ComplianceStatus>('/dashboard/compliance'),

  // Get activity feed
  getActivityFeed: (params?: PaginationParams) =>
    api.get<{ activities: Array<{ id: string; type: string; description: string; timestamp: string; user: string }> }>('/dashboard/activity', { params }),

  // Get performance metrics
  getPerformanceMetrics: (period: 'day' | 'week' | 'month' | 'year') =>
    api.get<{ metrics: Record<string, number> }>('/dashboard/performance', { params: { period } }),

  // Get risk assessment
  getRiskAssessment: () =>
    api.get<{ risks: Array<{ id: string; title: string; level: string; score: number; description: string }> }>('/dashboard/risks'),
};

// Search endpoints
export const searchApi = {
  // Global search
  globalSearch: (query: string, filters?: FilterParams) =>
    api.post<{ results: Array<{ type: string; data: any; score: number }> }>('/search/global', { query, filters }),

  // Search documents
  searchDocuments: (query: string, filters?: FilterParams) =>
    api.post<{ documents: Document[]; total: number; facets: Record<string, any> }>('/search/documents', { query, filters }),

  // Search suggestions
  getSuggestions: (query: string) =>
    api.get<{ suggestions: string[] }>('/search/suggestions', { params: { q: query } }),

  // Search history
  getSearchHistory: () =>
    api.get<{ searches: Array<{ query: string; timestamp: string; results: number }> }>('/search/history'),

  // Clear search history
  clearSearchHistory: () =>
    api.delete('/search/history'),

  // Save search
  saveSearch: (name: string, query: string, filters: FilterParams) =>
    api.post<{ id: string; name: string; query: string; filters: FilterParams }>('/search/saved', { name, query, filters }),

  // Get saved searches
  getSavedSearches: () =>
    api.get<{ searches: Array<{ id: string; name: string; query: string; filters: FilterParams; createdAt: string }> }>('/search/saved'),

  // Delete saved search
  deleteSavedSearch: (id: string) =>
    api.delete(`/search/saved/${id}`),
};

// Analytics endpoints
export const analyticsApi = {
  // Get document analytics
  getDocumentAnalytics: (period: 'day' | 'week' | 'month' | 'year') =>
    api.get<{ analytics: Record<string, any> }>('/analytics/documents', { params: { period } }),

  // Get user analytics
  getUserAnalytics: (period: 'day' | 'week' | 'month' | 'year') =>
    api.get<{ analytics: Record<string, any> }>('/analytics/users', { params: { period } }),

  // Get compliance analytics
  getComplianceAnalytics: (period: 'day' | 'week' | 'month' | 'year') =>
    api.get<{ analytics: Record<string, any> }>('/analytics/compliance', { params: { period } }),

  // Get risk analytics
  getRiskAnalytics: (period: 'day' | 'week' | 'month' | 'year') =>
    api.get<{ analytics: Record<string, any> }>('/analytics/risks', { params: { period } }),

  // Export analytics
  exportAnalytics: (type: 'documents' | 'users' | 'compliance' | 'risks', format: 'pdf' | 'excel' | 'csv') =>
    api.post('/analytics/export', { type, format }),
};

// System endpoints
export const systemApi = {
  // Health check
  healthCheck: () =>
    api.get<{ status: string; timestamp: string; version: string }>('/health'),

  // System status
  getStatus: () =>
    api.get<{ status: string; services: Record<string, string>; uptime: number }>('/status'),

  // System metrics
  getMetrics: () =>
    api.get<{ metrics: Record<string, any> }>('/metrics'),

  // System logs
  getLogs: (params?: { level?: string; limit?: number; offset?: number }) =>
    api.get<{ logs: Array<{ level: string; message: string; timestamp: string; context: any }> }>('/logs', { params }),

  // Clear cache
  clearCache: () =>
    api.post('/system/cache/clear'),

  // Backup system
  createBackup: () =>
    api.post<{ backupId: string; status: string }>('/system/backup'),

  // Restore system
  restoreBackup: (backupId: string) =>
    api.post<{ status: string }>('/system/restore', { backupId }),
};

// Export all API endpoints
export const endpoints = {
  auth: authApi,
  documents: documentApi,
  users: userApi,
  dashboard: dashboardApi,
  search: searchApi,
  analytics: analyticsApi,
  system: systemApi,
};
