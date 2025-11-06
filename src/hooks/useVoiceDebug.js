import { useCallback, useRef } from 'react';

/**
 * Hook to help integrate VoiceDebugPanel with voice practice components
 * Provides functions to log API calls and track performance metrics
 * 
 * @returns {Object} Debug utilities
 */
export function useVoiceDebug() {
  const apiCallLogRef = useRef([]);
  
  /**
   * Log an API call for debugging
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} requestData - Request data
   * @param {Object} responseData - Response data
   * @param {string} status - 'success' or 'error'
   * @param {number} latency - Response latency in milliseconds
   */
  const logAPICall = useCallback((endpoint, method, requestData, responseData, status, latency) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      endpoint,
      method,
      requestData,
      responseData,
      status,
      latency
    };
    
    apiCallLogRef.current.push(logEntry);
    
    // Keep only last 50 entries
    if (apiCallLogRef.current.length > 50) {
      apiCallLogRef.current.shift();
    }
    
    // Dispatch custom event for debug panel
    window.dispatchEvent(new CustomEvent('voice-debug-api-call', { detail: logEntry }));
  }, []);
  
  /**
   * Get API call log
   */
  const getAPICallLog = useCallback(() => {
    return apiCallLogRef.current;
  }, []);
  
  /**
   * Clear API call log
   */
  const clearAPICallLog = useCallback(() => {
    apiCallLogRef.current = [];
  }, []);
  
  return {
    logAPICall,
    getAPICallLog,
    clearAPICallLog
  };
}

