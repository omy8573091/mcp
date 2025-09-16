'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAccessibility, useScreenReader, useAriaLiveRegion } from '../hooks/useAccessibility';
import { config } from '../core/config';

interface AccessibilityContextType {
  isKeyboardUser: boolean;
  isReducedMotion: boolean;
  isHighContrast: boolean;
  isScreenReader: boolean;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  clearAnnouncements: () => void;
  liveRegion: { message: string; level: 'polite' | 'assertive' } | null;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const {
    isKeyboardUser,
    isReducedMotion,
    isHighContrast,
    isScreenReader,
  } = useAccessibility();

  const { announce, clearAnnouncements } = useScreenReader();
  const { liveRegion } = useAriaLiveRegion();

  // Apply accessibility preferences to document
  useEffect(() => {
    const root = document.documentElement;

    // Apply reduced motion
    if (isReducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // Apply high contrast
    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply keyboard navigation styles
    if (isKeyboardUser) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }
  }, [isKeyboardUser, isReducedMotion, isHighContrast]);

  // Add global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Skip to main content (Alt + M)
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        const mainContent = document.querySelector('main, [role="main"]');
        if (mainContent) {
          (mainContent as HTMLElement).focus();
          announce('Skipped to main content');
        }
      }

      // Toggle high contrast (Alt + H)
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        const root = document.documentElement;
        const isCurrentlyHighContrast = root.classList.contains('high-contrast');
        
        if (isCurrentlyHighContrast) {
          root.classList.remove('high-contrast');
          announce('High contrast mode disabled');
        } else {
          root.classList.add('high-contrast');
          announce('High contrast mode enabled');
        }
      }

      // Focus search (Alt + S)
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]');
        if (searchInput) {
          (searchInput as HTMLElement).focus();
          announce('Search input focused');
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [announce]);

  const contextValue: AccessibilityContextType = {
    isKeyboardUser,
    isReducedMotion,
    isHighContrast,
    isScreenReader,
    announce,
    clearAnnouncements,
    liveRegion,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
      
      {/* ARIA Live Region for announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        {liveRegion?.message}
      </div>

      {/* Skip Links */}
      <div className="skip-links">
        <a
          href="#main-content"
          className="skip-link"
          onFocus={(e) => {
            e.currentTarget.style.position = 'absolute';
            e.currentTarget.style.top = '0';
            e.currentTarget.style.left = '0';
            e.currentTarget.style.zIndex = '9999';
            e.currentTarget.style.padding = '8px 16px';
            e.currentTarget.style.backgroundColor = '#000';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.textDecoration = 'none';
          }}
          onBlur={(e) => {
            e.currentTarget.style.position = 'absolute';
            e.currentTarget.style.left = '-10000px';
            e.currentTarget.style.top = 'auto';
            e.currentTarget.style.width = '1px';
            e.currentTarget.style.height = '1px';
            e.currentTarget.style.overflow = 'hidden';
          }}
        >
          Skip to main content
        </a>
        <a
          href="#navigation"
          className="skip-link"
          onFocus={(e) => {
            e.currentTarget.style.position = 'absolute';
            e.currentTarget.style.top = '0';
            e.currentTarget.style.left = '0';
            e.currentTarget.style.zIndex = '9999';
            e.currentTarget.style.padding = '8px 16px';
            e.currentTarget.style.backgroundColor = '#000';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.textDecoration = 'none';
          }}
          onBlur={(e) => {
            e.currentTarget.style.position = 'absolute';
            e.currentTarget.style.left = '-10000px';
            e.currentTarget.style.top = 'auto';
            e.currentTarget.style.width = '1px';
            e.currentTarget.style.height = '1px';
            e.currentTarget.style.overflow = 'hidden';
          }}
        >
          Skip to navigation
        </a>
      </div>

      <style jsx>{`
        .skip-links {
          position: absolute;
          left: -10000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        .skip-link {
          position: absolute;
          left: -10000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        .sr-only {
          position: absolute;
          left: -10000px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        /* High contrast mode styles */
        :global(.high-contrast) {
          --color-primary: #000000;
          --color-secondary: #ffffff;
          --color-background: #ffffff;
          --color-text: #000000;
          --color-border: #000000;
        }

        :global(.high-contrast) * {
          background-color: var(--color-background) !important;
          color: var(--color-text) !important;
          border-color: var(--color-border) !important;
        }

        /* Keyboard navigation styles */
        :global(.keyboard-navigation) *:focus {
          outline: 2px solid #0066cc !important;
          outline-offset: 2px !important;
        }

        /* Reduced motion styles */
        :global(.reduced-motion) * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `}</style>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibilityContext = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
};
