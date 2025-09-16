import { useState, useEffect, useCallback, useRef } from 'react';
import { config } from '../core/config';

// Accessibility hook for managing focus and keyboard navigation
export function useAccessibility() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isScreenReader, setIsScreenReader] = useState(false);

  useEffect(() => {
    // Detect keyboard user
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    // Detect reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    // Detect high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(contrastQuery.matches);

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    // Detect screen reader (basic detection)
    const hasScreenReader = window.navigator.userAgent.includes('NVDA') ||
                           window.navigator.userAgent.includes('JAWS') ||
                           window.navigator.userAgent.includes('VoiceOver') ||
                           window.speechSynthesis;

    setIsScreenReader(hasScreenReader);

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    mediaQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      mediaQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  return {
    isKeyboardUser,
    isReducedMotion,
    isHighContrast,
    isScreenReader,
  };
}

// Focus management hook
export function useFocusManagement() {
  const focusHistory = useRef<HTMLElement[]>([]);
  const [currentFocus, setCurrentFocus] = useState<HTMLElement | null>(null);

  const saveFocus = useCallback((element: HTMLElement) => {
    if (element && !focusHistory.current.includes(element)) {
      focusHistory.current.push(element);
    }
  }, []);

  const restoreFocus = useCallback(() => {
    const lastFocused = focusHistory.current.pop();
    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus();
      setCurrentFocus(lastFocused);
    }
  }, []);

  const setFocus = useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus();
      setCurrentFocus(element);
      saveFocus(element);
    }
  }, [saveFocus]);

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return {
    currentFocus,
    saveFocus,
    restoreFocus,
    setFocus,
    trapFocus,
  };
}

// Keyboard navigation hook
export function useKeyboardNavigation() {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent, items: HTMLElement[]) => {
    if (!items.length) return;

    const { key } = event;
    let newIndex = activeIndex;

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
          items[activeIndex].click();
        }
        break;
      case 'Escape':
        event.preventDefault();
        setActiveIndex(-1);
        setIsNavigating(false);
        break;
      default:
        return;
    }

    setActiveIndex(newIndex);
    setIsNavigating(true);
    
    if (newIndex >= 0 && items[newIndex]) {
      items[newIndex].focus();
    }
  }, [activeIndex]);

  const resetNavigation = useCallback(() => {
    setActiveIndex(-1);
    setIsNavigating(false);
  }, []);

  return {
    activeIndex,
    isNavigating,
    handleKeyDown,
    resetNavigation,
  };
}

// Screen reader announcements hook
export function useScreenReader() {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = {
      id: Date.now().toString(),
      message,
      priority,
    };

    setAnnouncements(prev => [...prev, announcement]);

    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
    }, 1000);
  }, []);

  const clearAnnouncements = useCallback(() => {
    setAnnouncements([]);
  }, []);

  return {
    announcements,
    announce,
    clearAnnouncements,
  };
}

// ARIA live region hook
export function useAriaLiveRegion() {
  const [liveRegion, setLiveRegion] = useState<{
    message: string;
    level: 'polite' | 'assertive';
  } | null>(null);

  const announce = useCallback((message: string, level: 'polite' | 'assertive' = 'polite') => {
    setLiveRegion({ message, level });
    
    // Clear after announcement
    setTimeout(() => {
      setLiveRegion(null);
    }, 1000);
  }, []);

  return {
    liveRegion,
    announce,
  };
}

// Color contrast hook
export function useColorContrast() {
  const [contrastRatio, setContrastRatio] = useState<number>(0);

  const calculateContrast = useCallback((color1: string, color2: string) => {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    // Calculate relative luminance
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }, []);

  const checkContrast = useCallback((foreground: string, background: string) => {
    const ratio = calculateContrast(foreground, background);
    setContrastRatio(ratio);
    return ratio;
  }, [calculateContrast]);

  const isAccessible = useCallback((ratio: number = contrastRatio) => {
    return ratio >= 4.5; // WCAG AA standard
  }, [contrastRatio]);

  const getContrastLevel = useCallback((ratio: number = contrastRatio) => {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'AA Large';
    return 'Fail';
  }, [contrastRatio]);

  return {
    contrastRatio,
    checkContrast,
    isAccessible,
    getContrastLevel,
  };
}

// Accessibility testing hook
export function useAccessibilityTesting() {
  const [violations, setViolations] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const scanForViolations = useCallback(async (element?: HTMLElement) => {
    setIsScanning(true);
    
    try {
      // Basic accessibility checks
      const target = element || document.body;
      const issues: any[] = [];

      // Check for missing alt text on images
      const images = target.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt && !img.getAttribute('aria-label')) {
          issues.push({
            type: 'missing-alt-text',
            element: img,
            message: 'Image missing alt text',
            severity: 'error',
          });
        }
      });

      // Check for missing labels on form inputs
      const inputs = target.querySelectorAll('input, select, textarea');
      inputs.forEach((input, index) => {
        const id = input.getAttribute('id');
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');

        if (!label && !ariaLabel && !ariaLabelledBy) {
          issues.push({
            type: 'missing-label',
            element: input,
            message: 'Form input missing label',
            severity: 'error',
          });
        }
      });

      // Check for proper heading hierarchy
      const headings = target.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let lastLevel = 0;
      headings.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        if (level > lastLevel + 1) {
          issues.push({
            type: 'heading-hierarchy',
            element: heading,
            message: `Heading level ${level} skips level ${lastLevel + 1}`,
            severity: 'warning',
          });
        }
        lastLevel = level;
      });

      // Check for proper color contrast (basic check)
      const elements = target.querySelectorAll('*');
      elements.forEach((el) => {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        if (color && backgroundColor && color !== backgroundColor) {
          // This is a simplified check - in a real implementation,
          // you'd use a proper contrast calculation library
          if (color === backgroundColor) {
            issues.push({
              type: 'color-contrast',
              element: el,
              message: 'Insufficient color contrast',
              severity: 'warning',
            });
          }
        }
      });

      setViolations(issues);
    } catch (error) {
      console.error('Error scanning for accessibility violations:', error);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const clearViolations = useCallback(() => {
    setViolations([]);
  }, []);

  return {
    violations,
    isScanning,
    scanForViolations,
    clearViolations,
  };
}
