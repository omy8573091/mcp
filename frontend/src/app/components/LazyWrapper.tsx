'use client';

import React, { Suspense, lazy, ComponentType } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minHeight?: number;
}

const DefaultFallback: React.FC<{ minHeight?: number }> = ({ minHeight = 200 }) => (
  <Box 
    display="flex" 
    flexDirection="column" 
    alignItems="center" 
    justifyContent="center" 
    minHeight={minHeight}
    gap={2}
  >
    <CircularProgress />
    <Typography variant="body2" color="textSecondary">
      Loading...
    </Typography>
  </Box>
);

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback, 
  minHeight = 200 
}) => {
  return (
    <Suspense fallback={fallback || <DefaultFallback minHeight={minHeight} />}>
      {children}
    </Suspense>
  );
};

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyWrapper fallback={fallback}>
        <Component {...props} />
      </LazyWrapper>
    );
  };
}

// Lazy load components
export const LazyDashboard = lazy(() => import('../components/ReduxDashboard').then(module => ({ default: module.ReduxDashboard })));
export const LazyUploadPage = lazy(() => import('../upload/page'));
export const LazySearchPage = lazy(() => import('../search/page'));
export const LazyDocumentsPage = lazy(() => import('../documents/page'));
export const LazySettingsPage = lazy(() => import('../settings/page'));
