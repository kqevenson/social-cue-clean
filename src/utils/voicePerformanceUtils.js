/**
 * Performance Utilities for Voice Practice
 * 
 * Provides optimized utility functions for:
 * - Request caching
 * - Debouncing/throttling
 * - Request queue management
 * - Network status detection
 * - Performance monitoring
 * 
 * @module voicePerformanceUtils
 */

/**
 * Simple in-memory cache with TTL
 */
class SimpleCache {
  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} [ttl] - Time to live in ms
   */
  set(key, value, ttl = this.defaultTTL) {
    // Evict oldest if at max size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Remove expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const apiCache = new SimpleCache(100, 5 * 60 * 1000); // 5 min TTL

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @param {boolean} immediate - Execute immediately
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Request queue for offline handling
 */
class RequestQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.maxRetries = 3;
  }

  /**
   * Add request to queue
   * @param {Function} requestFn - Function that returns a Promise
   * @param {Object} options - Options (retries, priority)
   */
  enqueue(requestFn, options = {}) {
    this.queue.push({
      fn: requestFn,
      retries: 0,
      priority: options.priority || 0,
      ...options
    });

    // Sort by priority
    this.queue.sort((a, b) => b.priority - a.priority);

    this.processQueue();
  }

  /**
   * Process queue
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();

      try {
        await item.fn();
      } catch (error) {
        if (item.retries < this.maxRetries) {
          item.retries++;
          this.queue.push(item);
        } else {
          console.error('Request failed after max retries:', error);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Clear queue
   */
  clear() {
    this.queue = [];
  }
}

export const requestQueue = new RequestQueue();

/**
 * Network status detector
 */
class NetworkStatus {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = new Set();

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  /**
   * Subscribe to network status changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.isOnline));
  }

  getStatus() {
    return this.isOnline;
  }
}

export const networkStatus = new NetworkStatus();

/**
 * Optimized fetch with caching and retry
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {Object} cacheOptions - Cache options
 * @returns {Promise<Response>} Fetch response
 */
export async function optimizedFetch(url, options = {}, cacheOptions = {}) {
  const cacheKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || {})}`;
  
  // Check cache for GET requests
  if ((!options.method || options.method === 'GET') && !cacheOptions.skipCache) {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Check network status
  if (!networkStatus.getStatus() && cacheOptions.allowOffline) {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw new Error('Network offline and no cached data available');
  }

  try {
    const startTime = performance.now();
    const response = await fetch(url, {
      ...options,
      signal: cacheOptions.signal
    });

    const duration = performance.now() - startTime;

    if (response.ok) {
      const data = await response.json();
      
      // Cache successful responses
      if ((!options.method || options.method === 'GET') && cacheOptions.ttl) {
        apiCache.set(cacheKey, data, cacheOptions.ttl);
      }

      // Track performance
      if (cacheOptions.trackPerformance) {
        trackPerformanceMetric('api_request', duration, { url, method: options.method });
      }

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: response.headers
      });
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    // Try cache on error
    if (cacheOptions.fallbackToCache) {
      const cached = apiCache.get(cacheKey);
      if (cached) {
        return new Response(JSON.stringify(cached), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    throw error;
  }
}

/**
 * Compress request payload
 * @param {Object} data - Data to compress
 * @returns {string} Compressed JSON string
 */
export function compressPayload(data) {
  // Simple compression: remove null/undefined, shorten keys
  const compressed = JSON.stringify(data, (key, value) => {
    if (value === null || value === undefined) return undefined;
    return value;
  });
  return compressed;
}

/**
 * Batch analytics events
 */
class AnalyticsBatcher {
  constructor(batchSize = 10, batchInterval = 30000) {
    this.batch = [];
    this.batchSize = batchSize;
    this.batchInterval = batchInterval;
    this.timer = null;
  }

  /**
   * Add event to batch
   * @param {string} eventName - Event name
   * @param {Object} properties - Event properties
   */
  add(eventName, properties = {}) {
    this.batch.push({
      eventName,
      properties,
      timestamp: Date.now()
    });

    if (this.batch.length >= this.batchSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.batchInterval);
    }
  }

  /**
   * Flush batch
   */
  flush() {
    if (this.batch.length === 0) return;

    const events = [...this.batch];
    this.batch = [];

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Send batch (implement your analytics service here)
    if (window.voiceAnalytics && typeof window.voiceAnalytics.trackBatch === 'function') {
      window.voiceAnalytics.trackBatch(events);
    }
  }
}

export const analyticsBatcher = new AnalyticsBatcher();

/**
 * Track performance metric
 * @param {string} name - Metric name
 * @param {number} value - Metric value
 * @param {Object} context - Additional context
 */
export function trackPerformanceMetric(name, value, context = {}) {
  analyticsBatcher.add('performance_metric', {
    metric: name,
    value,
    ...context,
    timestamp: Date.now()
  });

  // Also track via Performance API
  if (typeof window !== 'undefined' && window.performance && window.performance.mark) {
    performance.mark(`${name}_${value}`);
  }
}

/**
 * Measure function execution time
 * @param {string} name - Function name
 * @param {Function} fn - Function to measure
 * @returns {Promise<any>} Function result
 */
export async function measurePerformance(name, fn) {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    trackPerformanceMetric(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    trackPerformanceMetric(`${name}_error`, duration);
    throw error;
  }
}

/**
 * Cleanup expired cache entries
 */
export function cleanupCache() {
  apiCache.cleanup();
}

// Cleanup cache every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupCache, 5 * 60 * 1000);
}

export default {
  apiCache,
  debounce,
  throttle,
  requestQueue,
  networkStatus,
  optimizedFetch,
  compressPayload,
  analyticsBatcher,
  trackPerformanceMetric,
  measurePerformance,
  cleanupCache
};

