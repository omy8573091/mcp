// Security System - Comprehensive protection against various attacks
// Including replay attacks, CSRF, XSS, injection attacks, and penetration testing tools

import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

// Security configuration
export interface SecurityConfig {
  csrf: {
    enabled: boolean;
    tokenExpiry: number; // in milliseconds
    secretKey: string;
  };
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  session: {
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
  };
  headers: {
    hsts: boolean;
    csp: boolean;
    xss: boolean;
    frameOptions: boolean;
  };
  encryption: {
    algorithm: string;
    keySize: number;
    ivSize: number;
  };
  audit: {
    enabled: boolean;
    logLevel: 'low' | 'medium' | 'high';
    retentionDays: number;
  };
}

// Default security configuration
export const defaultSecurityConfig: SecurityConfig = {
  csrf: {
    enabled: true,
    tokenExpiry: 3600000, // 1 hour
    secretKey: process.env.CSRF_SECRET_KEY || 'default-secret-key-change-in-production',
  },
  rateLimit: {
    enabled: true,
    windowMs: 900000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
  },
  session: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 86400000, // 24 hours
  },
  headers: {
    hsts: true,
    csp: true,
    xss: true,
    frameOptions: true,
  },
  encryption: {
    algorithm: 'AES-256-GCM',
    keySize: 256,
    ivSize: 16,
  },
  audit: {
    enabled: true,
    logLevel: 'medium',
    retentionDays: 90,
  },
};

// Security event types
export enum SecurityEventType {
  CSRF_ATTEMPT = 'csrf_attempt',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_REQUEST = 'suspicious_request',
  REPLAY_ATTACK = 'replay_attack',
  INJECTION_ATTEMPT = 'injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  BRUTE_FORCE = 'brute_force',
  SESSION_HIJACK = 'session_hijack',
  API_ABUSE = 'api_abuse',
  PENETRATION_TEST = 'penetration_test',
}

// Security event interface
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  ip: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  requestId: string;
  endpoint: string;
  method: string;
  payload?: any;
  headers?: Record<string, string>;
  response?: {
    status: number;
    message: string;
  };
  metadata?: Record<string, any>;
}

// Security manager class
export class SecurityManager {
  private config: SecurityConfig;
  private requestCache: Map<string, { timestamp: number; count: number }> = new Map();
  private nonceCache: Set<string> = new Set();
  private blockedIPs: Set<string> = new Set();
  private securityEvents: SecurityEvent[] = [];

  constructor(config: SecurityConfig = defaultSecurityConfig) {
    this.config = config;
    this.cleanupExpiredEntries();
  }

  // CSRF Protection
  generateCSRFToken(sessionId: string): string {
    const timestamp = Date.now();
    const nonce = uuidv4();
    const data = `${sessionId}:${timestamp}:${nonce}`;
    const signature = CryptoJS.HmacSHA256(data, this.config.csrf.secretKey).toString();
    return `${data}:${signature}`;
  }

  validateCSRFToken(token: string, sessionId: string): boolean {
    try {
      const parts = token.split(':');
      if (parts.length !== 4) return false;

      const [tokenSessionId, timestamp, nonce, signature] = parts;
      
      // Check session ID match
      if (tokenSessionId !== sessionId) return false;

      // Check token expiry
      const tokenTime = parseInt(timestamp);
      if (Date.now() - tokenTime > this.config.csrf.tokenExpiry) return false;

      // Check nonce reuse (replay attack protection)
      if (this.nonceCache.has(nonce)) {
        this.logSecurityEvent(SecurityEventType.REPLAY_ATTACK, 'high', {
          nonce,
          sessionId,
          timestamp: tokenTime,
        });
        return false;
      }

      // Validate signature
      const data = `${tokenSessionId}:${timestamp}:${nonce}`;
      const expectedSignature = CryptoJS.HmacSHA256(data, this.config.csrf.secretKey).toString();
      
      if (signature !== expectedSignature) {
        this.logSecurityEvent(SecurityEventType.CSRF_ATTEMPT, 'high', {
          sessionId,
          providedSignature: signature,
          expectedSignature,
        });
        return false;
      }

      // Add nonce to cache
      this.nonceCache.add(nonce);
      return true;
    } catch (error) {
      this.logSecurityEvent(SecurityEventType.CSRF_ATTEMPT, 'medium', {
        error: error.message,
        token: token.substring(0, 20) + '...',
      });
      return false;
    }
  }

  // Rate Limiting
  checkRateLimit(ip: string, endpoint: string): boolean {
    if (!this.config.rateLimit.enabled) return true;

    const key = `${ip}:${endpoint}`;
    const now = Date.now();
    const windowStart = now - this.config.rateLimit.windowMs;

    // Clean up old entries
    if (this.requestCache.has(key)) {
      const entry = this.requestCache.get(key)!;
      if (entry.timestamp < windowStart) {
        this.requestCache.delete(key);
      }
    }

    // Check current rate
    const entry = this.requestCache.get(key);
    if (entry && entry.timestamp >= windowStart) {
      if (entry.count >= this.config.rateLimit.maxRequests) {
        this.logSecurityEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, 'medium', {
          ip,
          endpoint,
          count: entry.count,
          windowMs: this.config.rateLimit.windowMs,
        });
        return false;
      }
      entry.count++;
    } else {
      this.requestCache.set(key, { timestamp: now, count: 1 });
    }

    return true;
  }

  // Input Sanitization
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';

    // Remove potential XSS vectors
    let sanitized = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
      .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '')
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
        this.logSecurityEvent(SecurityEventType.INJECTION_ATTEMPT, 'high', {
          input: input.substring(0, 100),
          pattern: pattern.toString(),
        });
        return '';
      }
    }

    // Check for XSS patterns
    const xssPatterns = [
      /<script/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /<link/i,
      /<meta/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i,
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(sanitized)) {
        this.logSecurityEvent(SecurityEventType.XSS_ATTEMPT, 'high', {
          input: input.substring(0, 100),
          pattern: pattern.toString(),
        });
        return '';
      }
    }

    return sanitized.trim();
  }

  // Request fingerprinting for anomaly detection
  generateRequestFingerprint(request: {
    ip: string;
    userAgent: string;
    headers: Record<string, string>;
    method: string;
    endpoint: string;
  }): string {
    const fingerprint = {
      ip: request.ip,
      userAgent: request.userAgent,
      acceptLanguage: request.headers['accept-language'] || '',
      acceptEncoding: request.headers['accept-encoding'] || '',
      method: request.method,
      endpoint: request.endpoint,
    };

    return CryptoJS.SHA256(JSON.stringify(fingerprint)).toString();
  }

  // Detect suspicious requests
  detectSuspiciousRequest(request: {
    ip: string;
    userAgent: string;
    headers: Record<string, string>;
    method: string;
    endpoint: string;
    payload?: any;
  }): boolean {
    // Check for common penetration testing tools
    const suspiciousUserAgents = [
      'burp',
      'sqlmap',
      'nmap',
      'nikto',
      'w3af',
      'zap',
      'acunetix',
      'nessus',
      'openvas',
      'metasploit',
      'havij',
      'pangolin',
      'sqlninja',
      'bsqlbf',
      'fimap',
      'golismero',
      'skipfish',
      'wafw00f',
      'whatweb',
      'dirb',
      'dirbuster',
      'gobuster',
      'wfuzz',
      'ffuf',
      'feroxbuster',
    ];

    const userAgent = request.userAgent.toLowerCase();
    for (const tool of suspiciousUserAgents) {
      if (userAgent.includes(tool)) {
        this.logSecurityEvent(SecurityEventType.PENETRATION_TEST, 'high', {
          tool,
          userAgent: request.userAgent,
          ip: request.ip,
        });
        return true;
      }
    }

    // Check for suspicious headers
    const suspiciousHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'x-originating-ip',
      'x-remote-ip',
      'x-remote-addr',
      'x-client-ip',
      'x-cluster-client-ip',
      'x-http-client-ip',
      'x-forwarded',
      'x-forwarded-for',
      'forwarded-for',
      'forwarded',
    ];

    for (const header of suspiciousHeaders) {
      if (request.headers[header] && request.headers[header] !== request.ip) {
        this.logSecurityEvent(SecurityEventType.SUSPICIOUS_REQUEST, 'medium', {
          header,
          value: request.headers[header],
          actualIp: request.ip,
        });
        return true;
      }
    }

    // Check for common attack patterns in payload
    if (request.payload) {
      const payloadStr = JSON.stringify(request.payload).toLowerCase();
      const attackPatterns = [
        'union select',
        'drop table',
        'delete from',
        'insert into',
        'update set',
        '<script',
        'javascript:',
        'vbscript:',
        'onload=',
        'onerror=',
        'onclick=',
        'eval(',
        'exec(',
        'system(',
        'shell_exec(',
        'passthru(',
        'proc_open(',
        'popen(',
        'file_get_contents(',
        'fopen(',
        'fwrite(',
        'fputs(',
        'include(',
        'require(',
        'include_once(',
        'require_once(',
      ];

      for (const pattern of attackPatterns) {
        if (payloadStr.includes(pattern)) {
          this.logSecurityEvent(SecurityEventType.INJECTION_ATTEMPT, 'high', {
            pattern,
            payload: payloadStr.substring(0, 200),
          });
          return true;
        }
      }
    }

    return false;
  }

  // Block IP address
  blockIP(ip: string, reason: string, duration: number = 3600000): void {
    this.blockedIPs.add(ip);
    this.logSecurityEvent(SecurityEventType.API_ABUSE, 'high', {
      ip,
      reason,
      duration,
    });

    // Auto-unblock after duration
    setTimeout(() => {
      this.blockedIPs.delete(ip);
    }, duration);
  }

  // Check if IP is blocked
  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  // Log security events
  logSecurityEvent(
    type: SecurityEventType,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata: Record<string, any> = {}
  ): void {
    const event: SecurityEvent = {
      id: uuidv4(),
      type,
      severity,
      timestamp: new Date(),
      ip: metadata.ip || 'unknown',
      userAgent: metadata.userAgent || 'unknown',
      userId: metadata.userId,
      sessionId: metadata.sessionId,
      requestId: metadata.requestId || uuidv4(),
      endpoint: metadata.endpoint || 'unknown',
      method: metadata.method || 'unknown',
      payload: metadata.payload,
      headers: metadata.headers,
      response: metadata.response,
      metadata,
    };

    this.securityEvents.push(event);

    // Keep only recent events
    if (this.securityEvents.length > 10000) {
      this.securityEvents = this.securityEvents.slice(-5000);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Security Event: ${type}`, event);
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(event);
    }
  }

  // Get security events
  getSecurityEvents(
    type?: SecurityEventType,
    severity?: 'low' | 'medium' | 'high' | 'critical',
    limit: number = 100
  ): SecurityEvent[] {
    let events = this.securityEvents;

    if (type) {
      events = events.filter(event => event.type === type);
    }

    if (severity) {
      events = events.filter(event => event.severity === severity);
    }

    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Cleanup expired entries
  private cleanupExpiredEntries(): void {
    setInterval(() => {
      const now = Date.now();
      
      // Clean up rate limit cache
      for (const [key, entry] of this.requestCache.entries()) {
        if (now - entry.timestamp > this.config.rateLimit.windowMs) {
          this.requestCache.delete(key);
        }
      }

      // Clean up nonce cache (keep for 24 hours)
      // Note: In production, you'd want to use a more sophisticated cache
      if (this.nonceCache.size > 100000) {
        this.nonceCache.clear();
      }

      // Clean up old security events
      const cutoffTime = now - (this.config.audit.retentionDays * 24 * 60 * 60 * 1000);
      this.securityEvents = this.securityEvents.filter(
        event => event.timestamp.getTime() > cutoffTime
      );
    }, 300000); // Run every 5 minutes
  }

  // Send to external logging service
  private async sendToLoggingService(event: SecurityEvent): Promise<void> {
    try {
      // In production, send to your logging service (e.g., Splunk, ELK, etc.)
      if (process.env.SECURITY_LOG_ENDPOINT) {
        await fetch(process.env.SECURITY_LOG_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SECURITY_LOG_TOKEN}`,
          },
          body: JSON.stringify(event),
        });
      }
    } catch (error) {
      console.error('Failed to send security event to logging service:', error);
    }
  }

  // Generate security headers
  generateSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.config.headers.hsts) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }

    if (this.config.headers.csp) {
      headers['Content-Security-Policy'] = [
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
    }

    if (this.config.headers.xss) {
      headers['X-XSS-Protection'] = '1; mode=block';
    }

    if (this.config.headers.frameOptions) {
      headers['X-Frame-Options'] = 'DENY';
    }

    headers['X-Content-Type-Options'] = 'nosniff';
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()';

    return headers;
  }

  // Encrypt sensitive data
  encrypt(data: string, key: string): string {
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
  }

  // Decrypt sensitive data
  decrypt(encryptedData: string, key: string): string {
    const encrypted = CryptoJS.enc.Base64.parse(encryptedData);
    const iv = CryptoJS.lib.WordArray.create(encrypted.words.slice(0, 4));
    const ciphertext = CryptoJS.lib.WordArray.create(encrypted.words.slice(4));
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext } as any,
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}

// Global security manager instance
export const securityManager = new SecurityManager();

// Security middleware for API requests
export const securityMiddleware = {
  // CSRF protection middleware
  csrfProtection: (req: any, res: any, next: any) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return next();
    }

    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionId = req.session?.id;

    if (!token || !sessionId) {
      return res.status(403).json({ error: 'CSRF token required' });
    }

    if (!securityManager.validateCSRFToken(token, sessionId)) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    next();
  },

  // Rate limiting middleware
  rateLimit: (req: any, res: any, next: any) => {
    const ip = req.ip || req.connection.remoteAddress;
    const endpoint = req.path;

    if (securityManager.isIPBlocked(ip)) {
      return res.status(429).json({ error: 'IP address blocked' });
    }

    if (!securityManager.checkRateLimit(ip, endpoint)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    next();
  },

  // Input sanitization middleware
  sanitizeInput: (req: any, res: any, next: any) => {
    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return securityManager.sanitizeInput(obj);
      } else if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      } else if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
      }
      return obj;
    };

    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);

    next();
  },

  // Security headers middleware
  securityHeaders: (req: any, res: any, next: any) => {
    const headers = securityManager.generateSecurityHeaders();
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
    next();
  },

  // Suspicious request detection middleware
  suspiciousRequestDetection: (req: any, res: any, next: any) => {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    const headers = req.headers;
    const method = req.method;
    const endpoint = req.path;
    const payload = req.body;

    const request = {
      ip,
      userAgent,
      headers,
      method,
      endpoint,
      payload,
    };

    if (securityManager.detectSuspiciousRequest(request)) {
      // Log the suspicious request
      securityManager.logSecurityEvent(SecurityEventType.SUSPICIOUS_REQUEST, 'high', {
        ...request,
        requestId: req.id,
      });

      // Block IP if too many suspicious requests
      const recentEvents = securityManager.getSecurityEvents(
        SecurityEventType.SUSPICIOUS_REQUEST,
        'high',
        10
      );
      
      const recentSuspiciousFromIP = recentEvents.filter(
        event => event.ip === ip && 
        event.timestamp.getTime() > Date.now() - 3600000 // Last hour
      );

      if (recentSuspiciousFromIP.length >= 5) {
        securityManager.blockIP(ip, 'Too many suspicious requests', 3600000); // 1 hour
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.status(400).json({ error: 'Suspicious request detected' });
    }

    next();
  },
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

  // Hash password securely
  hashPassword: (password: string, salt: string): string => {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000,
    }).toString();
  },

  // Verify password
  verifyPassword: (password: string, hash: string, salt: string): boolean => {
    const hashedPassword = securityUtils.hashPassword(password, salt);
    return hashedPassword === hash;
  },

  // Generate secure session ID
  generateSessionId: (): string => {
    return uuidv4();
  },

  // Validate session
  validateSession: (sessionId: string): boolean => {
    // In production, you'd validate against your session store
    return sessionId && sessionId.length === 36;
  },
};

export default securityManager;
