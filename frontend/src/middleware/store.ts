import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import middleware
import {
  errorMiddleware,
  subscriptionMiddleware,
  authMiddleware,
  loggingMiddleware,
  performanceMiddleware,
  validationMiddleware,
  cacheMiddleware,
  analyticsMiddleware,
  securityMiddleware,
  rateLimitMiddleware,
} from './index';

// Import slices
import themeSlice from '../app/store/slices/themeSlice';
import languageSlice from '../app/store/slices/languageSlice';
import authSlice from '../app/store/slices/authSlice';
import documentsSlice from '../app/store/slices/documentsSlice';
import uiSlice from '../app/store/slices/uiSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['theme', 'language', 'auth'], // Only persist these slices
};

// Root reducer
const rootReducer = combineReducers({
  theme: themeSlice,
  language: languageSlice,
  auth: authSlice,
  documents: documentsSlice,
  ui: uiSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with middleware
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat([
      // Core middleware
      errorMiddleware,
      authMiddleware,
      subscriptionMiddleware,
      
      // Performance middleware
      performanceMiddleware,
      loggingMiddleware,
      
      // Validation middleware
      validationMiddleware,
      
      // Caching middleware
      cacheMiddleware,
      
      // Analytics middleware
      analyticsMiddleware,
      
      // Security middleware
      securityMiddleware,
      rateLimitMiddleware,
    ]),
  devTools: process.env.NODE_ENV !== 'production',
});

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
