'use client';

import React, { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { useAppDispatch } from '../store/hooks';
import { initializeTheme } from '../store/slices/themeSlice';
import { initializeLanguage } from '../store/slices/languageSlice';
import { initializeAuth } from '../store/slices/authSlice';

interface ReduxProviderProps {
  children: ReactNode;
}

// Component to initialize Redux state
const ReduxInitializer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize theme
    dispatch(initializeTheme());
    
    // Initialize language
    dispatch(initializeLanguage());
    
    // Initialize auth
    dispatch(initializeAuth());
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      dispatch(initializeTheme());
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [dispatch]);

  return <>{children}</>;
};

export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <ReduxInitializer>
          {children}
        </ReduxInitializer>
      </PersistGate>
    </Provider>
  );
};
