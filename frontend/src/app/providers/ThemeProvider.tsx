'use client';

import React, { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ThemeContextProvider, useTheme } from '../contexts/ThemeContext';

interface ThemeProviderProps {
  children: ReactNode;
}

// Create a comprehensive, standalone theme that doesn't depend on external imports
const createStandaloneTheme = (isDark: boolean = false) => createTheme({
  palette: {
    mode: isDark ? 'dark' : 'light',
    primary: { 
      main: isDark ? '#90caf9' : '#1976d2',
      light: isDark ? '#e3f2fd' : '#42a5f5',
      dark: isDark ? '#42a5f5' : '#1565c0',
      contrastText: isDark ? '#000000' : '#ffffff'
    },
    secondary: { 
      main: isDark ? '#f48fb1' : '#dc004e',
      light: isDark ? '#fce4ec' : '#ff5983',
      dark: isDark ? '#ad1457' : '#9a0036',
      contrastText: isDark ? '#000000' : '#ffffff'
    },
    background: { 
      default: isDark ? '#121212' : '#ffffff', 
      paper: isDark ? '#1e1e1e' : '#ffffff' 
    },
    text: { 
      primary: isDark ? '#ffffff' : '#000000', 
      secondary: isDark ? '#b0b0b0' : '#666666' 
    },
    divider: isDark ? '#333333' : '#e0e0e0',
    success: { 
      main: isDark ? '#66bb6a' : '#4caf50',
      light: isDark ? '#a5d6a7' : '#81c784',
      dark: isDark ? '#4caf50' : '#388e3c'
    },
    warning: { 
      main: isDark ? '#ffb74d' : '#ff9800',
      light: isDark ? '#ffcc02' : '#ffb74d',
      dark: isDark ? '#ff9800' : '#f57c00'
    },
    error: { 
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f'
    },
    info: { 
      main: isDark ? '#42a5f5' : '#2196f3',
      light: isDark ? '#64b5f6' : '#64b5f6',
      dark: isDark ? '#1976d2' : '#1976d2'
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.43 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Internal component that uses the theme context
const MuiThemeProviderWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isDarkMode } = useTheme();
  
  // Create themes using the standalone function
  const lightTheme = createStandaloneTheme(false);
  const darkTheme = createStandaloneTheme(true);
  
  // Always use a valid theme
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

// Main ThemeProvider that wraps everything
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeContextProvider>
      <MuiThemeProviderWrapper>
        {children}
      </MuiThemeProviderWrapper>
    </ThemeContextProvider>
  );
};
