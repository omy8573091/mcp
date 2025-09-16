import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

export interface Document {
  id: string;
  title: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  framework: string;
  documentType: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceScore: number;
  tags: string[];
  metadata: Record<string, any>;
  chunks?: DocumentChunk[];
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  pageNumber?: number;
  section?: string;
  embedding?: number[];
  relevanceScore?: number;
}

export interface SearchResult {
  answer: string;
  citations: Citation[];
  query: string;
  timestamp: string;
}

export interface Citation {
  documentId: string;
  chunkId: string;
  content: string;
  score: number;
  pageNumber?: number;
}

interface DocumentsState {
  documents: Document[];
  recentDocuments: Document[];
  searchResults: SearchResult | null;
  isLoading: boolean;
  isUploading: boolean;
  isSearching: boolean;
  error: string | null;
  uploadProgress: Record<string, number>;
  filters: {
    search: string;
    framework: string;
    documentType: string;
    riskLevel: string;
    status: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  hasNextPage: boolean;
  isNextPageLoading: boolean;
}

const initialState: DocumentsState = {
  documents: [],
  recentDocuments: [],
  searchResults: null,
  isLoading: false,
  isUploading: false,
  isSearching: false,
  error: null,
  uploadProgress: {},
  filters: {
    search: '',
    framework: '',
    documentType: '',
    riskLevel: '',
    status: '',
    dateRange: {
      start: '',
      end: '',
    },
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  hasNextPage: false,
  isNextPageLoading: false,
};

// Async thunks
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (params: { 
    page?: number; 
    limit?: number; 
    filters?: any; 
    append?: boolean;
  } = {}, { rejectWithValue, getState }) => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/documents?${new URLSearchParams(params as any)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      
      // Add pagination metadata
      return {
        documents: data.documents || data,
        total: data.total || data.length,
        page: params.page || 1,
        limit: params.limit || 10,
        hasNextPage: data.hasNextPage || (data.documents?.length === params.limit),
        append: params.append || false,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch documents');
    }
  }
);

export const fetchRecentDocuments = createAsyncThunk(
  'documents/fetchRecentDocuments',
  async (_, { rejectWithValue }) => {
    try {
      // Mock API call - replace with actual API
      const response = await fetch('/api/documents/recent');
      if (!response.ok) {
        throw new Error('Failed to fetch recent documents');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch recent documents');
    }
  }
);

export const uploadDocuments = createAsyncThunk(
  'documents/uploadDocuments',
  async (files: File[], { rejectWithValue, dispatch }) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('user_id', 'system');

      const response = await fetch('/grc/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Refresh documents after successful upload
      dispatch(fetchDocuments());
      dispatch(fetchRecentDocuments());
      
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Upload failed');
    }
  }
);

export const searchDocuments = createAsyncThunk(
  'documents/searchDocuments',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/grc/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: query }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Search failed');
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (documentId: string, { rejectWithValue, dispatch }) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      // Refresh documents after successful deletion
      dispatch(fetchDocuments());
      dispatch(fetchRecentDocuments());
      
      return documentId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Delete failed');
    }
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setDocuments: (state, action: PayloadAction<Document[]>) => {
      state.documents = action.payload;
    },
    addDocument: (state, action: PayloadAction<Document>) => {
      state.documents.unshift(action.payload);
    },
    updateDocument: (state, action: PayloadAction<{ id: string; updates: Partial<Document> }>) => {
      const index = state.documents.findIndex(doc => doc.id === action.payload.id);
      if (index !== -1) {
        state.documents[index] = { ...state.documents[index], ...action.payload.updates };
      }
    },
    removeDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter(doc => doc.id !== action.payload);
    },
    setSearchResults: (state, action: PayloadAction<SearchResult>) => {
      state.searchResults = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = null;
    },
    setFilters: (state, action: PayloadAction<Partial<DocumentsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action: PayloadAction<Partial<DocumentsState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setUploadProgress: (state, action: PayloadAction<{ fileName: string; progress: number }>) => {
      state.uploadProgress[action.payload.fileName] = action.payload.progress;
    },
    clearUploadProgress: (state, action: PayloadAction<string>) => {
      delete state.uploadProgress[action.payload];
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch documents
      .addCase(fetchDocuments.pending, (state, action) => {
        if (action.meta.arg.append) {
          state.isNextPageLoading = true;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isNextPageLoading = false;
        
        if (action.payload.append) {
          // Append to existing documents for infinite scroll
          state.documents = [...state.documents, ...action.payload.documents];
        } else {
          // Replace documents for pagination
          state.documents = action.payload.documents || [];
        }
        
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          total: action.payload.total || 0,
        };
        state.hasNextPage = action.payload.hasNextPage || false;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.isNextPageLoading = false;
        state.error = action.payload as string;
      })
      // Fetch recent documents
      .addCase(fetchRecentDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentDocuments = action.payload || [];
      })
      .addCase(fetchRecentDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Upload documents
      .addCase(uploadDocuments.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadDocuments.fulfilled, (state, action) => {
        state.isUploading = false;
        // Documents will be refreshed by the thunk
      })
      .addCase(uploadDocuments.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload as string;
      })
      // Search documents
      .addCase(searchDocuments.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchDocuments.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchDocuments.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload as string;
      })
      // Delete document
      .addCase(deleteDocument.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        // Documents will be refreshed by the thunk
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setDocuments,
  addDocument,
  updateDocument,
  removeDocument,
  setSearchResults,
  clearSearchResults,
  setFilters,
  setPagination,
  setUploadProgress,
  clearUploadProgress,
  setError,
} = documentsSlice.actions;

export default documentsSlice.reducer;
