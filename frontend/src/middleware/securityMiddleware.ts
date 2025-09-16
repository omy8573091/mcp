import { Middleware } from '@reduxjs/toolkit';
import { logger } from './loggingMiddleware';
import { config } from '../core/config';

// Security middleware
export const securityMiddleware: Middleware = (store) => (next) => (action) => {
  // Check for suspicious patterns
  if (isSuspiciousAction(action)) {
    logger.warn('Suspicious action detected', {
      action: action.type,
      payload: action.payload,
      timestamp: new Date().toISOString(),
    });
    
    // Block suspicious actions
    return next({
      type: 'security/blocked',
      payload: {
        action: action.type,
        reason: 'Suspicious pattern detected',
      },
    });
  }
  
  // Sanitize payload
  if (action.payload) {
    action.payload = sanitizePayload(action.payload);
  }
  
  return next(action);
};

// Check for suspicious patterns
const isSuspiciousAction = (action: any): boolean => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\(/i,
    /document\./i,
    /window\./i,
  ];
  
  const payloadStr = JSON.stringify(action.payload);
  
  return suspiciousPatterns.some(pattern => pattern.test(payloadStr));
};

// Sanitize payload
const sanitizePayload = (payload: any): any => {
  if (typeof payload === 'string') {
    return payload
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
  
  if (Array.isArray(payload)) {
    return payload.map(sanitizePayload);
  }
  
  if (payload && typeof payload === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(payload)) {
      sanitized[key] = sanitizePayload(value);
    }
    return sanitized;
  }
  
  return payload;
};
