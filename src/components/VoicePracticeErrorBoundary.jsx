import React, { Component } from 'react';
import { 
  AlertCircle, 
  Mic, 
  MicOff, 
  Wifi, 
  WifiOff, 
  Volume2, 
  VolumeX,
  RefreshCw,
  Home,
  MessageSquare,
  HelpCircle,
  X,
  ChevronRight,
  Clock
} from 'lucide-react';

/**
 * Voice Practice Error Boundary Component
 * 
 * Catches React errors in voice practice components and provides
 * user-friendly error UI with recovery options.
 * 
 * @class VoicePracticeErrorBoundary
 */
class VoicePracticeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: null,
      retryCount: 0,
      retryDelay: 0,
      retryTimer: null
    };
  }

  static getDerivedStateFromError(error) {
    // Determine error type based on error message or component
    const errorType = VoicePracticeErrorBoundary.categorizeError(error);
    
    return {
      hasError: true,
      errorType
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Voice Practice Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    // Log error with context
    this.logError(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  /**
   * Categorize error type
   */
  static categorizeError(error) {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorName = error?.name?.toLowerCase() || '';
    
    // Microphone errors
    if (
      errorMessage.includes('microphone') ||
      errorMessage.includes('mic') ||
      errorMessage.includes('audio-capture') ||
      errorMessage.includes('not-allowed') ||
      errorMessage.includes('permission') ||
      errorName.includes('notallowederror')
    ) {
      return 'microphone';
    }
    
    // Speech recognition errors
    if (
      errorMessage.includes('speech recognition') ||
      errorMessage.includes('recognition') ||
      errorMessage.includes('webkit') ||
      errorMessage.includes('speech api') ||
      errorMessage.includes('not supported')
    ) {
      return 'speech-recognition';
    }
    
    // API errors
    if (
      errorMessage.includes('api') ||
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('401') ||
      errorMessage.includes('403') ||
      errorMessage.includes('500')
    ) {
      return 'api';
    }
    
    // Text-to-Speech errors
    if (
      errorMessage.includes('speech synthesis') ||
      errorMessage.includes('tts') ||
      errorMessage.includes('voice') ||
      errorMessage.includes('audio playback') ||
      errorMessage.includes('elevenlabs')
    ) {
      return 'text-to-speech';
    }
    
    // Network errors
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('offline') ||
      errorMessage.includes('connection') ||
      errorName.includes('networkerror')
    ) {
      return 'network';
    }
    
    // Browser errors
    if (
      errorMessage.includes('browser') ||
      errorMessage.includes('not supported') ||
      errorMessage.includes('compatibility')
    ) {
      return 'browser';
    }
    
    return 'unknown';
  }

  /**
   * Log error with context
   */
  logError = (error, errorInfo) => {
    const errorContext = {
      error: {
        message: error?.message,
        name: error?.name,
        stack: error?.stack
      },
      errorInfo: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      sessionId: this.props.sessionId || 'unknown',
      userId: this.props.userId || 'unknown',
      gradeLevel: this.props.gradeLevel || 'unknown',
      state: {
        hasError: this.state.hasError,
        errorType: this.state.errorType
      }
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔴 Voice Practice Error');
      console.error('Error:', errorContext.error);
      console.error('Context:', errorContext);
      console.error('Component Stack:', errorInfo?.componentStack);
      console.groupEnd();
    }

    // Send to analytics service (if available)
    if (window.analytics && typeof window.analytics.track === 'function') {
      try {
        window.analytics.track('Voice Practice Error', {
          errorType: this.state.errorType,
          errorMessage: error?.message,
          sessionId: this.props.sessionId,
          userId: this.props.userId,
          gradeLevel: this.props.gradeLevel
        });
      } catch (analyticsError) {
        console.warn('Failed to send error to analytics:', analyticsError);
      }
    }

    // Optionally send to error reporting service
    if (this.props.onError) {
      this.props.onError(errorContext);
    }
  };

  /**
   * Handle retry with exponential backoff
   */
  handleRetry = () => {
    const { retryCount } = this.state;
    const maxRetries = 3;
    
    if (retryCount >= maxRetries) {
      this.handleFallback();
      return;
    }

    // Calculate delay (exponential backoff)
    const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
    
    this.setState({
      retryDelay: delay,
      retryCount: retryCount + 1
    });

    // Start countdown
    const timer = setInterval(() => {
      this.setState(prevState => {
        const newDelay = prevState.retryDelay - 100;
        if (newDelay <= 0) {
          clearInterval(timer);
          this.resetError();
          return { retryDelay: 0, retryTimer: null };
        }
        return { retryDelay: newDelay };
      });
    }, 100);

    this.setState({ retryTimer: timer });
  };

  /**
   * Reset error state
   */
  resetError = () => {
    if (this.state.retryTimer) {
      clearInterval(this.state.retryTimer);
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: null,
      retryDelay: 0,
      retryTimer: null
    });
  };

  /**
   * Handle fallback to text mode
   */
  handleFallback = () => {
    if (this.props.onFallback) {
      this.props.onFallback('text-mode');
    } else {
      // Default fallback: return to scenarios
      this.handleGoHome();
    }
  };

  /**
   * Handle skip to next phase
   */
  handleSkipPhase = () => {
    if (this.props.onSkipPhase) {
      this.props.onSkipPhase();
    }
    this.resetError();
  };

  /**
   * Handle save and resume later
   */
  handleSaveProgress = () => {
    if (this.props.onSaveProgress) {
      this.props.onSaveProgress();
    }
    this.handleGoHome();
  };

  /**
   * Handle go home
   */
  handleGoHome = () => {
    if (this.props.onGoHome) {
      this.props.onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  /**
   * Handle contact support
   */
  handleContactSupport = () => {
    if (this.props.onContactSupport) {
      this.props.onContactSupport(this.state.error);
    } else {
      // Default: open mailto or support page
      const supportEmail = 'support@socialcue.app';
      const subject = encodeURIComponent('Voice Practice Error Report');
      const body = encodeURIComponent(
        `Error Type: ${this.state.errorType}\n` +
        `Error Message: ${this.state.error?.message || 'Unknown'}\n` +
        `Session ID: ${this.props.sessionId || 'N/A'}\n` +
        `Browser: ${navigator.userAgent}`
      );
      window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
    }
  };

  /**
   * Get error icon based on type
   */
  getErrorIcon = () => {
    const { errorType } = this.state;
    
    switch (errorType) {
      case 'microphone':
        return <MicOff className="w-12 h-12 text-red-400" />;
      case 'speech-recognition':
        return <Mic className="w-12 h-12 text-yellow-400" />;
      case 'api':
        return <AlertCircle className="w-12 h-12 text-orange-400" />;
      case 'text-to-speech':
        return <VolumeX className="w-12 h-12 text-purple-400" />;
      case 'network':
        return <WifiOff className="w-12 h-12 text-blue-400" />;
      case 'browser':
        return <HelpCircle className="w-12 h-12 text-indigo-400" />;
      case 'timeout':
        return <Clock className="w-12 h-12 text-yellow-400" />;
      default:
        return <AlertCircle className="w-12 h-12 text-red-400" />;
    }
  };

  /**
   * Get user-friendly error message by grade level
   */
  getErrorMessage = () => {
    const { errorType } = this.state;
    const gradeLevel = this.props.gradeLevel || '6';
    const gradeRange = this.getGradeRange(gradeLevel);
    
    return this.getGradeLevelMessage(errorType, gradeRange);
  };

  /**
   * Get grade range from grade level
   */
  getGradeRange = (gradeLevel) => {
    const grade = parseInt(gradeLevel) || 6;
    if (grade <= 2) return 'k2';
    if (grade <= 5) return '3-5';
    if (grade <= 8) return '6-8';
    return '9-12';
  };

  /**
   * Get grade-level appropriate message
   */
  getGradeLevelMessage = (errorType, gradeRange) => {
    const messages = {
      microphone: {
        k2: {
          title: "Oops! The microphone isn't working.",
          message: "Let's ask a grown-up for help! They can check if the microphone is turned on.",
          actions: ["Ask a grown-up to help", "Try again"]
        },
        '3-5': {
          title: "Having trouble with the microphone.",
          message: "Try these steps: 1) Check if your microphone is plugged in. 2) Click the microphone button in your browser. 3) Ask an adult if you need help.",
          actions: ["Try again", "Get help"]
        },
        '6-8': {
          title: "Microphone issue detected.",
          message: "Here's how to fix it: Click the lock icon in your browser's address bar, then allow microphone access. If that doesn't work, check your device settings.",
          actions: ["Fix settings", "Try again", "Use text mode"]
        },
        '9-12': {
          title: "Microphone access required.",
          message: "Please check your browser settings. Click the lock icon in the address bar and ensure microphone permissions are enabled. You may also need to check your device's privacy settings.",
          actions: ["Fix settings", "Try again", "Continue without voice"]
        }
      },
      'speech-recognition': {
        k2: {
          title: "Can't hear you right now.",
          message: "Let's try again! Make sure you're speaking clearly and the microphone is working.",
          actions: ["Try again", "Ask for help"]
        },
        '3-5': {
          title: "Speech recognition not working.",
          message: "Try speaking more clearly, or check if your microphone is working. You might need to try a different browser.",
          actions: ["Try again", "Get help"]
        },
        '6-8': {
          title: "Speech recognition error.",
          message: "Your browser might not support voice recognition, or there's a connection issue. Try refreshing the page or using a different browser like Chrome or Edge.",
          actions: ["Try again", "Refresh page", "Use text mode"]
        },
        '9-12': {
          title: "Speech recognition unavailable.",
          message: "Your browser may not support speech recognition, or there's a technical issue. Try using Chrome or Edge, or switch to text-based mode.",
          actions: ["Try different browser", "Refresh page", "Continue without voice"]
        }
      },
      api: {
        k2: {
          title: "Having trouble connecting.",
          message: "The app needs the internet to work. Ask a grown-up to check if you're connected to Wi-Fi.",
          actions: ["Try again", "Get help"]
        },
        '3-5': {
          title: "Connection problem.",
          message: "Check if you're connected to the internet. If you are, try again in a few moments.",
          actions: ["Try again", "Check internet"]
        },
        '6-8': {
          title: "API connection error.",
          message: "There's a problem connecting to our servers. Check your internet connection and try again. If the problem persists, try refreshing the page.",
          actions: ["Try again", "Refresh page", "Save progress"]
        },
        '9-12': {
          title: "Service connection error.",
          message: "Unable to connect to our servers. This could be due to network issues, server maintenance, or rate limiting. Please try again in a few moments.",
          actions: ["Retry", "Refresh page", "Save and resume later"]
        }
      },
      'text-to-speech': {
        k2: {
          title: "Can't play sound right now.",
          message: "That's okay! You can still read what Cue says on the screen.",
          actions: ["Continue without sound", "Try again"]
        },
        '3-5': {
          title: "Audio playback issue.",
          message: "The sound isn't working, but you can still read everything on the screen. Try checking your device's volume settings.",
          actions: ["Continue without sound", "Try again"]
        },
        '6-8': {
          title: "Text-to-speech error.",
          message: "Audio playback isn't working. You can continue by reading the text on screen. Check your browser's audio settings or try refreshing.",
          actions: ["Continue without sound", "Refresh page", "Try again"]
        },
        '9-12': {
          title: "Audio playback unavailable.",
          message: "Text-to-speech is not functioning. You can continue by reading the conversation text. Check your browser's audio permissions and settings.",
          actions: ["Continue without audio", "Check settings", "Refresh page"]
        }
      },
      network: {
        k2: {
          title: "No internet connection.",
          message: "You need the internet to play. Ask a grown-up to help you connect.",
          actions: ["Try again", "Get help"]
        },
        '3-5': {
          title: "You're offline.",
          message: "Check if you're connected to Wi-Fi or the internet. Try refreshing the page once you're connected.",
          actions: ["Try again", "Check connection"]
        },
        '6-8': {
          title: "No internet connection detected.",
          message: "You appear to be offline. Check your internet connection and try again. Your progress will be saved.",
          actions: ["Try again", "Save progress"]
        },
        '9-12': {
          title: "Offline mode detected.",
          message: "No internet connection available. Your progress will be saved locally. Connect to the internet and refresh to continue.",
          actions: ["Save progress", "Retry when online"]
        }
      },
      browser: {
        k2: {
          title: "This browser doesn't work.",
          message: "Ask a grown-up to help you use Chrome or Firefox.",
          actions: ["Get help"]
        },
        '3-5': {
          title: "Browser not supported.",
          message: "This browser doesn't work with voice practice. Try using Chrome, Firefox, or Edge instead.",
          actions: ["Get help"]
        },
        '6-8': {
          title: "Browser compatibility issue.",
          message: "Your browser doesn't fully support voice features. Please use Chrome, Firefox, or Edge for the best experience.",
          actions: ["Switch browser", "Continue without voice"]
        },
        '9-12': {
          title: "Browser not supported.",
          message: "Your current browser doesn't support all voice features. For the best experience, use Chrome, Firefox, or Edge. You can continue in text mode.",
          actions: ["Switch browser", "Continue without voice"]
        }
      },
      timeout: {
        k2: {
          title: "Taking too long.",
          message: "Let's try again! The internet might be slow right now.",
          actions: ["Try again", "Get help"]
        },
        '3-5': {
          title: "Request timed out.",
          message: "The request took too long. Try again in a moment.",
          actions: ["Try again", "Check internet"]
        },
        '6-8': {
          title: "Request timeout.",
          message: "The request took too long to complete. Check your internet connection and try again.",
          actions: ["Try again", "Refresh page"]
        },
        '9-12': {
          title: "Connection timeout.",
          message: "The request timed out. This could be due to slow network or server issues. Please try again.",
          actions: ["Retry", "Refresh page"]
        }
      },
      unknown: {
        k2: {
          title: "Something went wrong.",
          message: "Don't worry! Try again or ask a grown-up for help.",
          actions: ["Try again", "Get help"]
        },
        '3-5': {
          title: "Something unexpected happened.",
          message: "Don't worry! Try refreshing the page or ask an adult for help.",
          actions: ["Try again", "Refresh page"]
        },
        '6-8': {
          title: "An error occurred.",
          message: "Something went wrong. Try refreshing the page. If the problem continues, you can save your progress and try again later.",
          actions: ["Refresh page", "Save progress"]
        },
        '9-12': {
          title: "Unexpected error occurred.",
          message: "An error has occurred. Try refreshing the page. If the issue persists, save your progress and contact support.",
          actions: ["Refresh page", "Save progress", "Contact support"]
        }
      }
    };

    return messages[errorType]?.[gradeRange] || messages.unknown[gradeRange];
  };

  /**
   * Get troubleshooting steps
   */
  getTroubleshootingSteps = () => {
    const { errorType } = this.state;
    
    const steps = {
      microphone: [
        'Check if your microphone is connected',
        'Click the lock icon in your browser\'s address bar',
        'Allow microphone access',
        'Check your device\'s privacy settings',
        'Try refreshing the page'
      ],
      'speech-recognition': [
        'Make sure you\'re speaking clearly',
        'Check your microphone is working',
        'Try using Chrome or Edge browser',
        'Check your internet connection',
        'Refresh the page'
      ],
      api: [
        'Check your internet connection',
        'Wait a few moments and try again',
        'Refresh the page',
        'Check if the service is down',
        'Clear your browser cache'
      ],
      'text-to-speech': [
        'Check your device volume',
        'Check browser audio permissions',
        'Try refreshing the page',
        'Continue reading text instead',
        'Check if audio is muted'
      ],
      network: [
        'Check your Wi-Fi connection',
        'Check your internet connection',
        'Try refreshing the page',
        'Save your progress',
        'Try again when connected'
      ],
      browser: [
        'Try using Chrome browser',
        'Try using Firefox browser',
        'Try using Edge browser',
        'Update your browser',
        'Continue without voice features'
      ],
      timeout: [
        'Check your internet connection speed',
        'Try again in a moment',
        'Refresh the page',
        'Check if the service is busy',
        'Try a different network'
      ]
    };

    return steps[errorType] || [];
  };

  componentWillUnmount() {
    if (this.state.retryTimer) {
      clearInterval(this.state.retryTimer);
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { errorType, retryDelay, retryCount } = this.state;
    const errorMessage = this.getErrorMessage();
    const troubleshootingSteps = this.getTroubleshootingSteps();
    const canRetry = retryCount < 3;
    const retrySeconds = Math.ceil(retryDelay / 1000);

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            {this.getErrorIcon()}
          </div>

          {/* Error Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {errorMessage.title}
          </h1>

          {/* Error Message */}
          <p className="text-gray-300 text-center mb-8 text-lg leading-relaxed">
            {errorMessage.message}
          </p>

          {/* Troubleshooting Steps */}
          {troubleshootingSteps.length > 0 && (
            <div className="bg-gray-900/50 rounded-lg p-6 mb-8 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Troubleshooting Steps
              </h2>
              <ul className="space-y-2">
                {troubleshootingSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <ChevronRight className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-500" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {canRetry && (
              <button
                onClick={this.handleRetry}
                disabled={retryDelay > 0}
                className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 text-white px-6 py-4 rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {retryDelay > 0 ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Retrying in {retrySeconds}s...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                  </>
                )}
              </button>
            )}

            {errorMessage.actions.includes('Continue without voice') && (
              <button
                onClick={this.handleFallback}
                className="w-full bg-gray-700 text-white px-6 py-4 rounded-full font-bold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                Continue Without Voice
              </button>
            )}

            {errorMessage.actions.includes('Save progress') && (
              <button
                onClick={this.handleSaveProgress}
                className="w-full bg-gray-700 text-white px-6 py-4 rounded-full font-bold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Save Progress & Exit
              </button>
            )}

            {errorMessage.actions.includes('Contact support') && (
              <button
                onClick={this.handleContactSupport}
                className="w-full bg-gray-700 text-white px-6 py-4 rounded-full font-bold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-5 h-5" />
                Contact Support
              </button>
            )}

            <button
              onClick={this.handleGoHome}
              className="w-full bg-gray-800 text-white px-6 py-4 rounded-full font-bold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Return to Scenarios
            </button>
          </div>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-gray-400 hover:text-white text-sm mb-2">
                Error Details (Development)
              </summary>
              <div className="mt-4 p-4 bg-gray-900 rounded-lg text-sm text-red-300 font-mono overflow-auto max-h-64">
                <div className="mb-2">
                  <strong>Error Type:</strong> {errorType}
                </div>
                <div className="mb-2">
                  <strong>Error:</strong> {this.state.error?.toString()}
                </div>
                {this.state.errorInfo && (
                  <div className="mb-2">
                    <strong>Component Stack:</strong>
                    <pre className="mt-2 whitespace-pre-wrap text-xs">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
                {this.state.error?.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-2 whitespace-pre-wrap text-xs">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }
}

export default VoicePracticeErrorBoundary;

