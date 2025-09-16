import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setThemeMode, toggleTheme, setSystemPreference } from '../store/slices/themeSlice';
import type { ThemeMode } from '../store/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const { mode, isDarkMode, systemPreference } = useAppSelector((state) => state.theme);

  const setTheme = (theme: ThemeMode) => {
    dispatch(setThemeMode(theme));
  };

  const toggle = () => {
    dispatch(toggleTheme());
  };

  const updateSystemPreference = (preference: 'light' | 'dark') => {
    dispatch(setSystemPreference(preference));
  };

  return {
    mode,
    isDarkMode,
    systemPreference,
    setTheme,
    toggleTheme: toggle,
    setSystemPreference: updateSystemPreference,
  };
};
