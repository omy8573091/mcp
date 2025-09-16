import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

// Extend AxiosInstance with custom methods
interface ExtendedAxiosInstance extends AxiosInstance {
  getDashboardStats: () => Promise<any>
  getRecentDocuments: () => Promise<any>
  getComplianceStatus: () => Promise<any>
  uploadDocuments: (files: File[]) => Promise<any>
  searchDocuments: (question: string) => Promise<any>
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
}) as ExtendedAxiosInstance

// Request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const apiClient = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/api/dashboard/stats')
    return response.data
  },

  getRecentDocuments: async () => {
    const response = await api.get('/api/documents/recent')
    return response.data
  },

  getComplianceStatus: async () => {
    const response = await api.get('/api/compliance/status')
    return response.data
  },

  // Document Management
  uploadDocuments: async (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    formData.append('user_id', 'system') // In production, get from auth context

    const response = await api.post('/grc/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getDocuments: async (params?: any) => {
    const response = await api.get('/api/documents', { params })
    return response.data
  },

  getDocument: async (id: string) => {
    const response = await api.get(`/api/documents/${id}`)
    return response.data
  },

  updateDocument: async (id: string, data: any) => {
    const response = await api.put(`/api/documents/${id}`, data)
    return response.data
  },

  deleteDocument: async (id: string) => {
    const response = await api.delete(`/api/documents/${id}`)
    return response.data
  },

  // GRC Search and Query
  searchDocuments: async (question: string) => {
    const response = await api.post('/grc/query', { question })
    return response.data
  },

  // Document Classification
  updateDocumentClassification: async (grcDocId: string, classification: any) => {
    const response = await api.put(`/grc/documents/${grcDocId}/classify`, classification)
    return response.data
  },

  getDocumentComplianceStatus: async (grcDocId: string) => {
    const response = await api.get(`/grc/documents/${grcDocId}/status`)
    return response.data
  },

  // Compliance Reports
  generateComplianceReport: async (framework: string, documentIds: number[] = []) => {
    const response = await api.post('/grc/reports/compliance', {
      framework,
      document_ids: documentIds,
    })
    return response.data
  },

  // Risk Assessment
  assessRisk: async (question: string, context: string = '') => {
    const response = await api.post('/grc/risk/assess', { question, context })
    return response.data
  },

  // Metadata
  getFrameworks: async () => {
    const response = await api.get('/grc/frameworks')
    return response.data
  },

  getDocumentTypes: async () => {
    const response = await api.get('/grc/document-types')
    return response.data
  },

  getRiskLevels: async () => {
    const response = await api.get('/grc/risk-levels')
    return response.data
  },

  // Health Check
  healthCheck: async () => {
    const response = await api.get('/healthz')
    return response.data
  },
}

// Create a combined API object
const combinedApi = {
  ...api,
  ...apiClient,
}

export { combinedApi as api }
