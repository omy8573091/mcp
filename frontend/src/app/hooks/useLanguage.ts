import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setLanguage } from '../store/slices/languageSlice';
import type { Language } from '../store/slices/languageSlice';

export const useLanguage = () => {
  const dispatch = useAppDispatch();
  const { currentLanguage, translations, isLoading, error } = useAppSelector((state) => state.language);

  const setLang = (language: Language) => {
    dispatch(setLanguage(language));
  };

  const t = (key: string): string => {
    return translations[currentLanguage][key] || key;
  };

  return {
    language: currentLanguage,
    setLanguage: setLang,
    t,
    isLoading,
    error,
  };
};
