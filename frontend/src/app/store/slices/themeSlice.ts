import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeState {
  mode: ThemeMode;
  isDarkMode: boolean;
  systemPreference: 'light' | 'dark';
}

const initialState: ThemeState = {
  mode: 'auto',
  isDarkMode: false,
  systemPreference: 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      if (action.payload === 'auto') {
        state.isDarkMode = state.systemPreference === 'dark';
      } else {
        state.isDarkMode = action.payload === 'dark';
      }
    },
    setSystemPreference: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.systemPreference = action.payload;
      if (state.mode === 'auto') {
        state.isDarkMode = action.payload === 'dark';
      }
    },
    toggleTheme: (state) => {
      if (state.mode === 'auto') {
        state.mode = state.isDarkMode ? 'light' : 'dark';
      } else {
        state.mode = state.isDarkMode ? 'light' : 'dark';
      }
      state.isDarkMode = !state.isDarkMode;
    },
    initializeTheme: (state) => {
      // Initialize theme based on system preference (SSR-safe)
      if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        state.systemPreference = prefersDark ? 'dark' : 'light';
        if (state.mode === 'auto') {
          state.isDarkMode = prefersDark;
        }
      } else {
        // Default to light mode during SSR
        state.systemPreference = 'light';
        if (state.mode === 'auto') {
          state.isDarkMode = false;
        }
      }
    },
  },
});

export const { setThemeMode, setSystemPreference, toggleTheme, initializeTheme } = themeSlice.actions;
export default themeSlice.reducer;
