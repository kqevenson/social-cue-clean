/**
 * VoiceErrorBoundary Component
 * 
 * React Error Boundary for voice practice components.
 * Catches errors, categorizes them, and displays user-friendly error messages
 * with recovery options.
 * 
 * @module VoiceErrorBoundary
 */

import React, { Component } from 'react';
import { AlertCircle, MicOff, WifiOff, RefreshCw, Settings, Monitor, Clock } from 'lucide-react';

/**
 * Error message definitions
 */
const ERROR_MESSAGES = {
  MICROPHONE_BLOCKED: {
    title: 'Microphone Access Needed',
    message: 'Please allow microphone access to use voice practice.',
    action: 'Open Settings',
    fallback: 'Try text practice instead',
    icon: MicOff,
    color: 'red',
  },
  BROWSER_NOT_SUPPORTED: {
    title: 'Browser Not Supported',
    message: 'Voice practice works best in Chrome, Edge, or Safari.',
    action: 'Learn More',
    fallback: 'Use text practice',
    icon: Monitor,
    color: 'orange',
  },
  CONNECTION_FAILED: {
    title: 'Connection Problem',
    message: 'Could not connect to voice service. Check your internet connection.',
    action: 'Retry',
    fallback: 'Try text practice',
    icon: WifiOff,
    color: 'yellow',
  },
  API_ERROR: {
    title: 'Something Went Wrong',
    message: 'Voice practice encountered an error. We are working on it!',
    action: 'Retry',
    fallback: 'Switch to text practice',
    icon: AlertCircle,
    color: 'red',
  },
  TIMEOUT: {
    title: 'Taking Too Long',
    message: 'The voice service is not responding. Let\'s try something else.',
    action: 'Retry',
    fallback: 'Use text practice',
    icon: Clock,
    color: 'yellow',
  },
  NO_MICROPHONE: {
    title: 'No Microphone Found',
    message: 'Please connect a microphone and try again.',
    action: 'Retry',
    fallback: 'Use text practice',
    icon: MicOff,
    color: 'orange',
  },
};

/**
 * Categorize error into error type
 * @param {Error} error - Error object
 * @returns {string} Error type key
 */
function categorizeError(error) {
  if (!error) return 'API_ERROR';

  const errorMessage = error.message?.toLowerCase() || '';
  const errorName = error.name?.toLowerCase() || '';

  // Microphone errors
  if (
    errorName === 'notallowederror' ||
    errorName === 'permissiondeniederror' ||
    errorMessage.includes('microphone permission') ||
    errorMessage.includes('microphone access') ||
    errorMessage.includes('permission denied')
  ) {
    return 'MICROPHONE_BLOCKED';
  }

  if (
    errorName === 'notfounderror' ||
    errorName === 'devicesnotfounderror' ||
    errorMessage.includes('no microphone') ||
    errorMessage.includes('microphone not found')
  ) {
    return 'NO_MICROPHONE';
  }

  // Browser compatibility
  if (
    errorMessage.includes('browser') ||
    errorMessage.includes('not supported') ||
    errorMessage.includes('webrtc') ||
    errorMessage.includes('getusermedia')
  ) {
    return 'BROWSER_NOT_SUPPORTED';
  }

  // Connection errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('websocket') ||
    errorMessage.includes('failed to connect')
  ) {
    return 'CONNECTION_FAILED';
  }

  // Timeout errors
  if (
    errorMessage.includes('timeout') ||
    errorMessage.includes('taking too long') ||
    errorMessage.includes('timed out')
  ) {
    return 'TIMEOUT';
  }

  // API errors
  if (
    errorMessage.includes('api') ||
    errorMessage.includes('500') ||
    errorMessage.includes('400') ||
    errorMessage.includes('server error')
  ) {
    return 'API_ERROR';
  }

  // Default
  return 'API_ERROR';
}

/**
 * Request microphone permission
 * @returns {Promise<boolean>} True if granted, false if denied
 */
export async function requestMicrophonePermission() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser not supported - getUserMedia not available');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Stop all tracks immediately - we just needed permission
    stream.getTracks().forEach(track => track.stop());
    
    return true;
  } catch (error) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      throw new Error('MICROPHONE_BLOCKED');
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      throw new Error('NO_MICROPHONE');
    } else {
      throw error;
    }
  }
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} initialDelay - Initial delay in milliseconds (default: 1000)
 * @returns {Promise<any>} Result of the function
 */
export async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Track error for analytics
 * @param {string} errorType - Error type
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
function trackError(errorType, error, context = {}) {
  const errorData = {
    type: errorType,
    message: error?.message || 'Unknown error',
    name: error?.name || 'Error',
    stack: error?.stack || '',
    timestamp: new Date().toISOString(),
    ...context,
  };

  // Console log in development
  if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
    console.error('Voice Practice Error:', errorData);
  }

  // Send to analytics in production
  if (import.meta.env.PROD || import.meta.env.MODE === 'production') {
    // TODO: Integrate with your analytics service
    // Example: analytics.track('voice_practice_error', errorData);
    
    // For now, log to console with structured data
    console.error('Voice Practice Error (Production):', JSON.stringify(errorData));
  }
}

/**
 * VoiceErrorBoundary Component
 */
class VoiceErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    const errorType = categorizeError(error);
    return {
      hasError: true,
      error,
      errorType,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Track error
    const errorType = categorizeError(error);
    trackError(errorType, error, {
      componentStack: errorInfo?.componentStack,
      props: this.props,
    });

    this.setState({
      errorInfo,
      errorType,
    });
  }

  /**
   * Handle retry action
   */
  handleRetry = async () => {
    const { retryCount } = this.state;
    
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: null,
      retryCount: retryCount + 1,
    });

    // Call onRetry prop if provided
    if (this.props.onRetry) {
      try {
        await this.props.onRetry();
      } catch (error) {
        // Error will be caught by error boundary again
        console.error('Retry failed:', error);
      }
    }
  };

  /**
   * Handle fallback to text practice
   */
  handleFallback = () => {
    if (this.props.onFallback) {
      this.props.onFallback();
    } else {
      // Default fallback - navigate or show message
      console.log('Switching to text practice');
      window.location.href = '/practice';
    }
  };

  /**
   * Handle open settings
   */
  handleOpenSettings = () => {
    // Try to open browser settings
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Request permission again - browser will show settings dialog
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
          this.handleRetry();
        })
        .catch(() => {
          // Permission still denied
          console.log('Microphone permission still denied');
        });
    }
  };

  /**
   * Handle learn more action
   */
  handleLearnMore = () => {
    window.open('https://support.elevenlabs.io/hc/en-us/articles/browser-compatibility', '_blank');
  };

  /**
   * Render error display
   */
  renderError() {
    const { errorType, error } = this.state;
    const errorConfig = ERROR_MESSAGES[errorType] || ERROR_MESSAGES.API_ERROR;
    const IconComponent = errorConfig.icon || AlertCircle;

    // Map color to Tailwind classes
    const colorClasses = {
      red: {
        bg: 'bg-red-500/20',
        border: 'border-red-500/50',
        icon: 'text-red-400',
      },
      orange: {
        bg: 'bg-orange-500/20',
        border: 'border-orange-500/50',
        icon: 'text-orange-400',
      },
      yellow: {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/50',
        icon: 'text-yellow-400',
      },
    };

    const colors = colorClasses[errorConfig.color] || colorClasses.red;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className={`bg-gray-900 border-2 ${colors.border} rounded-3xl p-8 max-w-md w-full shadow-2xl`}>
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-full ${colors.bg} flex items-center justify-center`}>
              <IconComponent className={`w-10 h-10 ${colors.icon}`} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-3">
            {errorConfig.title}
          </h2>

          {/* Message */}
          <p className="text-gray-300 text-center mb-6">
            {errorConfig.message}
          </p>

          {/* Error details in dev mode */}
          {import.meta.env.DEV && error && (
            <details className="mb-6 bg-gray-800/50 rounded-lg p-4 text-xs">
              <summary className="text-gray-400 cursor-pointer mb-2">Error Details (Dev Only)</summary>
              <pre className="text-red-400 overflow-auto max-h-40">
                {error.toString()}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={this.handleAction}
              className="w-full px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-blue-500 to-emerald-400 text-white hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
            >
              {errorConfig.action === 'Retry' && <RefreshCw className="w-5 h-5" />}
              {errorConfig.action === 'Open Settings' && <Settings className="w-5 h-5" />}
              {errorConfig.action === 'Learn More' && <Monitor className="w-5 h-5" />}
              {errorConfig.action}
            </button>

            <button
              onClick={this.handleFallback}
              className="w-full px-6 py-3 rounded-full font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {errorConfig.fallback}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Handle action button click
   */
  handleAction = () => {
    const { errorType } = this.state;
    const errorConfig = ERROR_MESSAGES[errorType] || ERROR_MESSAGES.API_ERROR;

    switch (errorConfig.action) {
      case 'Open Settings':
        this.handleOpenSettings();
        break;
      case 'Learn More':
        this.handleLearnMore();
        break;
      case 'Retry':
      default:
        this.handleRetry();
        break;
    }
  };

  render() {
    if (this.state.hasError) {
      return this.renderError();
    }

    return this.props.children;
  }
}

export default VoiceErrorBoundary;
export { requestMicrophonePermission, retryWithBackoff, categorizeError, ERROR_MESSAGES };

