/**
 * Performance Optimization Service for Social Cue App
 * Provides performance monitoring, optimization, and caching
 */

import { config } from '../config/appConfig.js';
import { trackPerformance } from './analyticsService.js';

class PerformanceService {
  constructor() {
    this.metrics = new Map();
    this.cache = new Map();
    this.observers = new Map();
    this.isMonitoring = false;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Monitor Core Web Vitals
    this.observeCoreWebVitals();
    
    // Monitor resource loading
    this.observeResourceLoading();
    
    // Monitor memory usage
    this.observeMemoryUsage();
    
    console.log('🚀 Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    console.log('⏹️ Performance monitoring stopped');
  }

  /**
   * Measure function execution time
   */
  measureFunction(name, fn) {
    const startTime = performance.now();
    
    try {
      const result = fn();
      
      // Handle async functions
      if (result && typeof result.then === 'function') {
        return result.then(value => {
          const endTime = performance.now();
          this.recordMetric(name, endTime - startTime);
          return value;
        });
      }
      
      // Handle sync functions
      const endTime = performance.now();
      this.recordMetric(name, endTime - startTime);
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      this.recordMetric(`${name}_error`, endTime - startTime);
      throw error;
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(name, value, context = {}) {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    };

    // Store metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push(metric);

    // Keep only last 100 metrics per name
    const metrics = this.metrics.get(name);
    if (metrics.length > 100) {
      metrics.shift();
    }

    // Track in analytics
    trackPerformance(name, value, context);

    // Log in development
    if (config.features.devMode) {
      console.log(`📊 Performance Metric [${name}]:`, value, context);
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    const stats = {
      totalMetrics: 0,
      byMetric: {},
      averages: {},
      recent: []
    };

    this.metrics.forEach((metrics, name) => {
      if (metrics.length === 0) return;

      const values = metrics.map(m => m.value);
      const sum = values.reduce((a, b) => a + b, 0);
      const average = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      stats.totalMetrics += metrics.length;
      stats.byMetric[name] = {
        count: metrics.length,
        average,
        min,
        max,
        recent: metrics.slice(-10)
      };
      stats.averages[name] = average;
    });

    // Get recent metrics
    const allMetrics = [];
    this.metrics.forEach(metrics => {
      allMetrics.push(...metrics);
    });
    stats.recent = allMetrics
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);

    return stats;
  }

  /**
   * Cache management
   */
  setCache(key, value, ttl = config.performance.cacheTimeout) {
    const cacheItem = {
      value,
      timestamp: Date.now(),
      ttl
    };
    
    this.cache.set(key, cacheItem);
    
    // Auto-cleanup expired items
    this.cleanupCache();
  }

  getCache(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * Optimize voice practice performance
   */
  optimizeVoicePractice() {
    // Preload voice components
    this.preloadVoiceComponents();
    
    // Optimize audio caching
    this.optimizeAudioCaching();
    
    // Monitor voice practice metrics
    this.monitorVoicePracticeMetrics();
  }

  /**
   * Preload critical resources
   */
  preloadResources(resources) {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.url;
      link.as = resource.type || 'script';
      
      if (resource.crossOrigin) {
        link.crossOrigin = resource.crossOrigin;
      }
      
      document.head.appendChild(link);
    });
  }

  /**
   * Debounce function calls
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function calls
   */
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Private methods

  observeCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.recordMetric('fid', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordMetric('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }
  }

  observeResourceLoading() {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.recordMetric('resource_load', entry.duration, {
              name: entry.name,
              type: entry.initiatorType,
              size: entry.transferSize
            });
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (e) {
        console.warn('Resource observer not supported');
      }
    }
  }

  observeMemoryUsage() {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = performance.memory;
        this.recordMetric('memory_used', memory.usedJSHeapSize);
        this.recordMetric('memory_total', memory.totalJSHeapSize);
        this.recordMetric('memory_limit', memory.jsHeapSizeLimit);
      };

      // Check memory every 30 seconds
      setInterval(checkMemory, 30000);
      checkMemory(); // Initial check
    }
  }

  preloadVoiceComponents() {
    // Preload voice practice components
    const components = [
      { url: '/src/components/voice/VoiceInput.jsx', type: 'script' },
      { url: '/src/components/voice/VoiceOutput.jsx', type: 'script' },
      { url: '/src/components/socialcue/VoicePracticeScreen.jsx', type: 'script' }
    ];

    this.preloadResources(components);
  }

  optimizeAudioCaching() {
    // Set up audio caching strategy
    if ('caches' in window) {
      caches.open('voice-practice-audio').then(cache => {
        console.log('🎵 Audio cache initialized');
      });
    }
  }

  monitorVoicePracticeMetrics() {
    // Monitor voice practice specific metrics
    const metrics = [
      'voice_recognition_latency',
      'tts_generation_time',
      'api_response_time',
      'audio_playback_delay'
    ];

    metrics.forEach(metric => {
      if (!this.metrics.has(metric)) {
        this.metrics.set(metric, []);
      }
    });
  }

  cleanupCache() {
    const now = Date.now();
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    });
  }
}

// Create singleton instance
const performanceService = new PerformanceService();

// Export convenience functions
export const measureFunction = (name, fn) => performanceService.measureFunction(name, fn);
export const recordMetric = (name, value, context) => performanceService.recordMetric(name, value, context);
export const getPerformanceStats = () => performanceService.getPerformanceStats();
export const setCache = (key, value, ttl) => performanceService.setCache(key, value, ttl);
export const getCache = (key) => performanceService.getCache(key);
export const clearCache = () => performanceService.clearCache();
export const startMonitoring = () => performanceService.startMonitoring();
export const stopMonitoring = () => performanceService.stopMonitoring();
export const optimizeVoicePractice = () => performanceService.optimizeVoicePractice();
export const preloadResources = (resources) => performanceService.preloadResources(resources);
export const debounce = (func, wait) => performanceService.debounce(func, wait);
export const throttle = (func, limit) => performanceService.throttle(func, limit);

export default performanceService;
