// Simple in-memory cache service
interface CacheItem {
  value: any;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private cache = new Map<string, CacheItem>();

  set(key: string, value: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

export const cacheService = new CacheService();

export const cacheKeys = {
  USER_DATA: 'user_data',
  AUTH_TOKEN: 'auth_token',
  THEME_PREFERENCE: 'theme_preference',
  LANGUAGE_PREFERENCE: 'language_preference',
} as const;

export const cacheTTL = {
  SHORT: 60000, // 1 minute
  MEDIUM: 300000, // 5 minutes
  LONG: 1800000, // 30 minutes
  VERY_LONG: 3600000, // 1 hour
} as const;
