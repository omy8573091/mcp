'use client';

import React, { ReactNode } from 'react';
import { useAppSelector } from '../store/hooks';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { currentLanguage, translations } = useAppSelector((state) => state.language);
  
  // Create translation function
  const t = (key: string): string => {
    return translations[currentLanguage][key] || key;
  };

  // Create context value
  const contextValue = {
    language: currentLanguage,
    t,
  };

  // For backward compatibility, we'll still provide the context
  // but now it gets its data from Redux
  return (
    <div data-language={currentLanguage} data-translations={JSON.stringify(translations)}>
      {children}
    </div>
  );
};
