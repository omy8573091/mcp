// Cache service for API calls and data persistence
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100; // Maximum number of items in cache
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Check if item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let validCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        expiredCount++;
        this.cache.delete(key);
      } else {
        validCount++;
      }
    }

    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
      maxSize: this.maxSize,
    };
  }

  // Clean expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
export const cacheService = new CacheService();

// Auto-cleanup every 5 minutes
setInterval(() => {
  cacheService.cleanup();
}, 5 * 60 * 1000);

// Cache keys generator
export const cacheKeys = {
  documents: (page: number, limit: number, filters: any) => 
    `documents:${page}:${limit}:${JSON.stringify(filters)}`,
  document: (id: string) => `document:${id}`,
  search: (query: string) => `search:${query}`,
  dashboard: () => 'dashboard:stats',
  recentDocuments: () => 'documents:recent',
  compliance: () => 'compliance:status',
};

// Cache TTL constants
export const cacheTTL = {
  documents: 2 * 60 * 1000, // 2 minutes
  document: 5 * 60 * 1000, // 5 minutes
  search: 1 * 60 * 1000, // 1 minute
  dashboard: 30 * 1000, // 30 seconds
  recentDocuments: 1 * 60 * 1000, // 1 minute
  compliance: 2 * 60 * 1000, // 2 minutes
};
