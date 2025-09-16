import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  notifications: Notification[];
  modals: {
    uploadModal: boolean;
    searchModal: boolean;
    settingsModal: boolean;
    deleteConfirmModal: boolean;
  };
  loading: {
    global: boolean;
    dashboard: boolean;
    documents: boolean;
    search: boolean;
  };
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
  breadcrumbs: Breadcrumb[];
  activeTab: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface Breadcrumb {
  label: string;
  path: string;
  active?: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  mobileSidebarOpen: false,
  notifications: [],
  modals: {
    uploadModal: false,
    searchModal: false,
    settingsModal: false,
    deleteConfirmModal: false,
  },
  loading: {
    global: false,
    dashboard: false,
    documents: false,
    search: false,
  },
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
  breadcrumbs: [],
  activeTab: 'dashboard',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen;
    },
    setMobileSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileSidebarOpen = action.payload;
    },
    
    // Modal actions
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },
    
    // Loading actions
    setLoading: (state, action: PayloadAction<{ key: keyof UIState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    
    // Snackbar actions
    showSnackbar: (state, action: PayloadAction<{ message: string; severity?: UIState['snackbar']['severity'] }>) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
    
    // Notification actions
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    
    // Breadcrumb actions
    setBreadcrumbs: (state, action: PayloadAction<Breadcrumb[]>) => {
      state.breadcrumbs = action.payload;
    },
    addBreadcrumb: (state, action: PayloadAction<Breadcrumb>) => {
      state.breadcrumbs.push(action.payload);
    },
    removeBreadcrumb: (state, action: PayloadAction<string>) => {
      state.breadcrumbs = state.breadcrumbs.filter(b => b.path !== action.payload);
    },
    clearBreadcrumbs: (state) => {
      state.breadcrumbs = [];
    },
    
    // Tab actions
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    
    // Reset UI state
    resetUI: (state) => {
      state.sidebarOpen = true;
      state.mobileSidebarOpen = false;
      state.modals = {
        uploadModal: false,
        searchModal: false,
        settingsModal: false,
        deleteConfirmModal: false,
      };
      state.loading = {
        global: false,
        dashboard: false,
        documents: false,
        search: false,
      };
      state.snackbar = {
        open: false,
        message: '',
        severity: 'info',
      };
      state.breadcrumbs = [];
      state.activeTab = 'dashboard';
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  openModal,
  closeModal,
  closeAllModals,
  setLoading,
  setGlobalLoading,
  showSnackbar,
  hideSnackbar,
  addNotification,
  markNotificationAsRead,
  removeNotification,
  clearAllNotifications,
  markAllNotificationsAsRead,
  setBreadcrumbs,
  addBreadcrumb,
  removeBreadcrumb,
  clearBreadcrumbs,
  setActiveTab,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
