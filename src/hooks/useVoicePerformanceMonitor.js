/**
 * Performance Monitoring Hook for Voice Practice
 * 
 * Tracks and reports performance metrics including:
 * - Time to Interactive (TTI)
 * - First Contentful Paint (FCP)
 * - API response times
 * - Memory usage
 * - CPU usage
 * - Bundle size
 * 
 * @module useVoicePerformanceMonitor
 */

import { useEffect, useRef, useCallback } from 'react';
import { trackPerformanceMetric } from '../utils/voicePerformanceUtils.js';

/**
 * Custom hook for performance monitoring
 * @param {Object} options - Monitoring options
 * @param {boolean} options.enabled - Enable monitoring
 * @param {number} options.sampleInterval - Sample interval in ms
 * @param {Function} options.onMetric - Callback for metrics
 */
export function useVoicePerformanceMonitor({
  enabled = true,
  sampleInterval = 5000,
  onMetric
} = {}) {
  const metricsRef = useRef({
    apiResponseTimes: [],
    memoryUsage: [],
    renderTimes: [],
    interactionTimes: []
  });

  const observerRef = useRef(null);
  const memoryObserverRef = useRef(null);

  /**
   * Track API response time
   */
  const trackAPIResponse = useCallback((duration, endpoint) => {
    if (!enabled) return;

    metricsRef.current.apiResponseTimes.push({
      duration,
      endpoint,
      timestamp: Date.now()
    });

    // Keep only last 50
    if (metricsRef.current.apiResponseTimes.length > 50) {
      metricsRef.current.apiResponseTimes.shift();
    }

    trackPerformanceMetric('api_response_time', duration, { endpoint });
    onMetric?.('api_response_time', duration, { endpoint });
  }, [enabled, onMetric]);

  /**
   * Track render time
   */
  const trackRender = useCallback((componentName, duration) => {
    if (!enabled) return;

    metricsRef.current.renderTimes.push({
      componentName,
      duration,
      timestamp: Date.now()
    });

    trackPerformanceMetric('render_time', duration, { component: componentName });
    onMetric?.('render_time', duration, { component: componentName });
  }, [enabled, onMetric]);

  /**
   * Track interaction time
   */
  const trackInteraction = useCallback((interactionType, duration) => {
    if (!enabled) return;

    metricsRef.current.interactionTimes.push({
      interactionType,
      duration,
      timestamp: Date.now()
    });

    trackPerformanceMetric('interaction_time', duration, { type: interactionType });
    onMetric?.('interaction_time', duration, { type: interactionType });
  }, [enabled, onMetric]);

  /**
   * Get performance metrics
   */
  const getMetrics = useCallback(() => {
    const apiTimes = metricsRef.current.apiResponseTimes.map(m => m.duration);
    const memory = metricsRef.current.memoryUsage;
    const renderTimes = metricsRef.current.renderTimes.map(m => m.duration);
    const interactionTimes = metricsRef.current.interactionTimes.map(m => m.duration);

    return {
      api: {
        average: apiTimes.length > 0 ? apiTimes.reduce((a, b) => a + b, 0) / apiTimes.length : 0,
        min: apiTimes.length > 0 ? Math.min(...apiTimes) : 0,
        max: apiTimes.length > 0 ? Math.max(...apiTimes) : 0,
        count: apiTimes.length
      },
      memory: {
        current: memory.length > 0 ? memory[memory.length - 1] : 0,
        average: memory.length > 0 ? memory.reduce((a, b) => a + b, 0) / memory.length : 0,
        peak: memory.length > 0 ? Math.max(...memory) : 0
      },
      render: {
        average: renderTimes.length > 0 ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length : 0,
        max: renderTimes.length > 0 ? Math.max(...renderTimes) : 0,
        count: renderTimes.length
      },
      interactions: {
        average: interactionTimes.length > 0 ? interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length : 0,
        count: interactionTimes.length
      }
    };
  }, []);

  /**
   * Monitor memory usage
   */
  useEffect(() => {
    if (!enabled) return;

    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = performance.memory;
        const usedMB = memory.usedJSHeapSize / 1048576;
        metricsRef.current.memoryUsage.push(usedMB);

        // Keep only last 100 samples
        if (metricsRef.current.memoryUsage.length > 100) {
          metricsRef.current.memoryUsage.shift();
        }

        trackPerformanceMetric('memory_usage', usedMB);
        onMetric?.('memory_usage', usedMB);
      }
    };

    const interval = setInterval(checkMemory, sampleInterval);
    return () => clearInterval(interval);
  }, [enabled, sampleInterval, onMetric]);

  /**
   * Track First Contentful Paint
   */
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          trackPerformanceMetric('fcp', entry.startTime);
          onMetric?.('fcp', entry.startTime);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
      observerRef.current = observer;
    } catch (e) {
      console.warn('Performance Observer not supported');
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, onMetric]);

  /**
   * Track Time to Interactive
   */
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const checkTTI = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          const tti = performance.now();
          trackPerformanceMetric('tti', tti);
          onMetric?.('tti', tti);
        });
      }
    };

    // Check TTI after load
    if (document.readyState === 'complete') {
      checkTTI();
    } else {
      window.addEventListener('load', checkTTI);
      return () => window.removeEventListener('load', checkTTI);
    }
  }, [enabled, onMetric]);

  /**
   * Track bundle size
   */
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const trackBundleSize = () => {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const resources = performance.getEntriesByType('resource');
        const jsResources = resources.filter(r => r.name.endsWith('.js'));
        const totalSize = jsResources.reduce((sum, r) => {
          return sum + (r.transferSize || 0);
        }, 0);

        trackPerformanceMetric('bundle_size', totalSize);
        onMetric?.('bundle_size', totalSize);
      }
    };

    // Track after page load
    setTimeout(trackBundleSize, 1000);
  }, [enabled, onMetric]);

  return {
    trackAPIResponse,
    trackRender,
    trackInteraction,
    getMetrics
  };
}

export default useVoicePerformanceMonitor;

