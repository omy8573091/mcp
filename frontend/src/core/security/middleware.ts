'use client';

// Frontend Security Middleware
// Protects against client-side attacks and provides security utilities

import { securityManager, SecurityEventType } from './index';

// Client-side security configuration
export interface ClientSecurityConfig {
  csrf: {
    enabled: boolean;
    tokenEndpoint: string;
    refreshInterval: number; // in milliseconds
  };
  rateLimit: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  inputValidation: {
    enabled: boolean;
    strictMode: boolean;
  };
  xssProtection: {
    enabled: boolean;
    sanitizeHtml: boolean;
  };
  requestSigning: {
    enabled: boolean;
    secretKey: string;
  };
}

// Default client security configuration
export const defaultClientSecurityConfig: ClientSecurityConfig = {
  csrf: {
    enabled: true,
    tokenEndpoint: '/api/csrf-token',
    refreshInterval: 300000, // 5 minutes
  },
  rateLimit: {
    enabled: true,
    maxRequests: 100,
    windowMs: 900000, // 15 minutes
  },
  inputValidation: {
    enabled: true,
    strictMode: true,
  },
  xssProtection: {
    enabled: true,
    sanitizeHtml: true,
  },
  requestSigning: {
    enabled: true,
    secretKey: process.env.NEXT_PUBLIC_CLIENT_SECRET || 'client-secret-key',
  },
};

// Client security manager
export class ClientSecurityManager {
  private config: ClientSecurityConfig;
  private csrfToken: string | null = null;
  private tokenExpiry: number = 0;
  private requestCount: number = 0;
  private requestWindowStart: number = 0;
  private blockedDomains: Set<string> = new Set();

  constructor(config: ClientSecurityConfig = defaultClientSecurityConfig) {
    this.config = config;
    this.initializeSecurity();
  }

  // Initialize security measures
  private async initializeSecurity(): Promise<void> {
    if (this.config.csrf.enabled) {
      await this.refreshCSRFToken();
      // Set up automatic token refresh
      setInterval(() => {
        this.refreshCSRFToken();
      }, this.config.csrf.refreshInterval);
    }

    // Initialize request rate limiting
    if (this.config.rateLimit.enabled) {
      this.requestWindowStart = Date.now();
    }

    // Block known malicious domains
    this.blockedDomains.add('malicious-site.com');
    this.blockedDomains.add('phishing-site.com');
    this.blockedDomains.add('malware-site.com');
  }

  // CSRF Token Management
  async refreshCSRFToken(): Promise<string> {
    try {
      const response = await fetch(this.config.csrf.tokenEndpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.token;
        this.tokenExpiry = Date.now() + (data.expiresIn || 3600000);
        return this.csrfToken;
      } else {
        throw new Error('Failed to fetch CSRF token');
      }
    } catch (error) {
      console.error('CSRF token refresh failed:', error);
      throw error;
    }
  }

  getCSRFToken(): string | null {
    if (!this.csrfToken || Date.now() > this.tokenExpiry) {
      return null;
    }
    return this.csrfToken;
  }

  // Rate Limiting
  checkRateLimit(): boolean {
    if (!this.config.rateLimit.enabled) return true;

    const now = Date.now();
    
    // Reset window if expired
    if (now - this.requestWindowStart > this.config.rateLimit.windowMs) {
      this.requestCount = 0;
      this.requestWindowStart = now;
    }

    // Check if limit exceeded
    if (this.requestCount >= this.config.rateLimit.maxRequests) {
      this.logSecurityEvent('rate_limit_exceeded', 'medium', {
        requestCount: this.requestCount,
        windowMs: this.config.rateLimit.windowMs,
      });
      return false;
    }

    this.requestCount++;
    return true;
  }

  // Input Sanitization
  sanitizeInput(input: string): string {
    if (!this.config.inputValidation.enabled) return input;

    // Remove potential XSS vectors
    let sanitized = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/onload=/gi, '')
      .replace(/onerror=/gi, '')
      .replace(/onclick=/gi, '')
      .replace(/onmouseover=/gi, '')
      .replace(/onfocus=/gi, '')
      .replace(/onblur=/gi, '')
      .replace(/onchange=/gi, '')
      .replace(/onsubmit=/gi, '')
      .replace(/onreset=/gi, '')
      .replace(/onselect=/gi, '')
      .replace(/onkeydown=/gi, '')
      .replace(/onkeyup=/gi, '')
      .replace(/onkeypress=/gi, '');

    // Check for SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
      /(\b(OR|AND)\s+['"]\s*=\s*['"])/gi,
      /(\b(OR|AND)\s+1\s*=\s*1)/gi,
      /(\b(OR|AND)\s+0\s*=\s*0)/gi,
      /(UNION\s+SELECT)/gi,
      /(DROP\s+TABLE)/gi,
      /(DELETE\s+FROM)/gi,
      /(INSERT\s+INTO)/gi,
      /(UPDATE\s+SET)/gi,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(sanitized)) {
        this.logSecurityEvent('injection_attempt', 'high', {
          input: input.substring(0, 100),
          pattern: pattern.toString(),
        });
        return '';
      }
    }

    return sanitized.trim();
  }

  // XSS Protection
  sanitizeHTML(html: string): string {
    if (!this.config.xssProtection.enabled) return html;

    // Create a temporary DOM element to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Remove script tags and event handlers
    const scripts = temp.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    const iframes = temp.querySelectorAll('iframe');
    iframes.forEach(iframe => iframe.remove());

    const objects = temp.querySelectorAll('object');
    objects.forEach(object => object.remove());

    const embeds = temp.querySelectorAll('embed');
    embeds.forEach(embed => embed.remove());

    // Remove event handlers from all elements
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(element => {
      const attributes = element.attributes;
      for (let i = attributes.length - 1; i >= 0; i--) {
        const attr = attributes[i];
        if (attr.name.startsWith('on')) {
          element.removeAttribute(attr.name);
        }
      }
    });

    return temp.innerHTML;
  }

  // Request Signing
  signRequest(data: any, timestamp: number): string {
    if (!this.config.requestSigning.enabled) return '';

    const payload = JSON.stringify(data) + timestamp;
    const signature = btoa(payload + this.config.requestSigning.secretKey);
    return signature;
  }

  // Validate request signature
  validateRequestSignature(data: any, timestamp: number, signature: string): boolean {
    if (!this.config.requestSigning.enabled) return true;

    const expectedSignature = this.signRequest(data, timestamp);
    return signature === expectedSignature;
  }

  // Secure API Request
  async secureRequest(
    url: string,
    options: RequestInit = {},
    data?: any
  ): Promise<Response> {
    // Check rate limit
    if (!this.checkRateLimit()) {
      throw new Error('Rate limit exceeded');
    }

    // Sanitize input data
    if (data && this.config.inputValidation.enabled) {
      data = this.sanitizeInput(JSON.stringify(data));
      try {
        data = JSON.parse(data);
      } catch (error) {
        throw new Error('Invalid input data');
      }
    }

    // Add CSRF token
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.config.csrf.enabled && this.getCSRFToken()) {
      headers['X-CSRF-Token'] = this.getCSRFToken()!;
    }

    // Add request signature
    if (this.config.requestSigning.enabled && data) {
      const timestamp = Date.now();
      const signature = this.signRequest(data, timestamp);
      headers['X-Request-Signature'] = signature;
      headers['X-Request-Timestamp'] = timestamp.toString();
    }

    // Add security headers
    headers['X-Requested-With'] = 'XMLHttpRequest';
    headers['X-Client-Version'] = '1.0.0';

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
      body: data ? JSON.stringify(data) : options.body,
    });

    // Check for security-related response headers
    this.checkSecurityHeaders(response);

    return response;
  }

  // Check security headers in response
  private checkSecurityHeaders(response: Response): void {
    const securityHeaders = [
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
    ];

    for (const header of securityHeaders) {
      if (!response.headers.get(header)) {
        this.logSecurityEvent('missing_security_header', 'medium', {
          header,
          url: response.url,
        });
      }
    }
  }

  // URL Validation
  validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Check if domain is blocked
      if (this.blockedDomains.has(urlObj.hostname)) {
        this.logSecurityEvent('blocked_domain_access', 'high', {
          domain: urlObj.hostname,
          url,
        });
        return false;
      }

      // Only allow HTTPS in production
      if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
        this.logSecurityEvent('insecure_protocol', 'medium', {
          protocol: urlObj.protocol,
          url,
        });
        return false;
      }

      return true;
    } catch (error) {
      this.logSecurityEvent('invalid_url', 'low', {
        url,
        error: error.message,
      });
      return false;
    }
  }

  // Secure Redirect
  secureRedirect(url: string): void {
    if (!this.validateURL(url)) {
      throw new Error('Invalid or blocked URL');
    }

    // Add security headers to redirect
    window.location.href = url;
  }

  // Log security events
  private logSecurityEvent(
    type: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata: Record<string, any> = {}
  ): void {
    const event = {
      type,
      severity,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      metadata,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Security Event: ${type}`, event);
    }

    // Send to server in production
    if (process.env.NODE_ENV === 'production') {
      this.sendSecurityEvent(event);
    }
  }

  // Send security event to server
  private async sendSecurityEvent(event: any): Promise<void> {
    try {
      await fetch('/api/security-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send security event:', error);
    }
  }

  // Content Security Policy
  enforceCSP(): void {
    if (typeof window === 'undefined') return;

    // Add CSP meta tag if not present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ');
      document.head.appendChild(meta);
    }
  }

  // Prevent right-click and developer tools
  preventDevTools(): void {
    if (typeof window === 'undefined') return;

    // Disable right-click
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.logSecurityEvent('right_click_attempt', 'low', {
        x: e.clientX,
        y: e.clientY,
      });
    });

    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        this.logSecurityEvent('dev_tools_attempt', 'medium', {
          key: e.key,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
        });
      }
    });

    // Detect developer tools
    let devtools = false;
    const threshold = 160;
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools) {
          devtools = true;
          this.logSecurityEvent('dev_tools_opened', 'medium', {
            height: window.outerHeight - window.innerHeight,
            width: window.outerWidth - window.innerWidth,
          });
        }
      } else {
        devtools = false;
      }
    }, 500);
  }

  // Secure Local Storage
  secureLocalStorage: {
    setItem: (key: string, value: string) => {
      try {
        const encrypted = btoa(value); // Simple base64 encoding
        localStorage.setItem(key, encrypted);
      } catch (error) {
        console.error('Failed to set secure localStorage item:', error);
      }
    },
    
    getItem: (key: string): string | null => {
      try {
        const encrypted = localStorage.getItem(key);
        if (encrypted) {
          return atob(encrypted); // Simple base64 decoding
        }
        return null;
      } catch (error) {
        console.error('Failed to get secure localStorage item:', error);
        return null;
      }
    },
    
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Failed to remove secure localStorage item:', error);
      }
    },
  };

  // Secure Session Storage
  secureSessionStorage: {
    setItem: (key: string, value: string) => {
      try {
        const encrypted = btoa(value);
        sessionStorage.setItem(key, encrypted);
      } catch (error) {
        console.error('Failed to set secure sessionStorage item:', error);
      }
    },
    
    getItem: (key: string): string | null => {
      try {
        const encrypted = sessionStorage.getItem(key);
        if (encrypted) {
          return atob(encrypted);
        }
        return null;
      } catch (error) {
        console.error('Failed to get secure sessionStorage item:', error);
        return null;
      }
    },
    
    removeItem: (key: string) => {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error('Failed to remove secure sessionStorage item:', error);
      }
    },
  };
}

// Global client security manager instance
export const clientSecurityManager = new ClientSecurityManager();

// Security hooks for React components
export const useSecurity = () => {
  return {
    sanitizeInput: (input: string) => clientSecurityManager.sanitizeInput(input),
    sanitizeHTML: (html: string) => clientSecurityManager.sanitizeHTML(html),
    secureRequest: (url: string, options?: RequestInit, data?: any) => 
      clientSecurityManager.secureRequest(url, options, data),
    validateURL: (url: string) => clientSecurityManager.validateURL(url),
    secureRedirect: (url: string) => clientSecurityManager.secureRedirect(url),
    getCSRFToken: () => clientSecurityManager.getCSRFToken(),
    secureLocalStorage: clientSecurityManager.secureLocalStorage,
    secureSessionStorage: clientSecurityManager.secureSessionStorage,
  };
};

// Security middleware for API calls
export const secureApiCall = async (
  url: string,
  options: RequestInit = {},
  data?: any
): Promise<Response> => {
  return clientSecurityManager.secureRequest(url, options, data);
};

// Security utilities
export const securityUtils = {
  // Generate secure random string
  generateSecureRandom: (length: number = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Hash string
  hashString: (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  },

  // Validate email
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  validatePasswordStrength: (password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password must be at least 8 characters long');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one lowercase letter');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one uppercase letter');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one number');
    }

    if (/[@$!%*?&]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password must contain at least one special character');
    }

    return {
      isValid: score >= 4,
      score,
      feedback,
    };
  },
};

export default clientSecurityManager;
