import React from 'react';
import { RefreshCw, Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

const NetworkStatusIndicator = ({ isOnline, onRetry, showDetails = false }) => {
  if (isOnline) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm">
        <Wifi className="w-4 h-4" />
        <span>Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-red-400 text-sm">
      <WifiOff className="w-4 h-4" />
      <span>Offline</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-2 p-1 hover:bg-red-500/20 rounded transition-colors"
          title="Retry connection"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

const FallbackModeIndicator = ({ onRetry, showDetails = false }) => {
  return (
    <div className="flex items-center gap-2 text-yellow-400 text-sm">
      <AlertTriangle className="w-4 h-4" />
      <span>Basic Mode</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-2 p-1 hover:bg-yellow-500/20 rounded transition-colors"
          title="Try adaptive mode again"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

const ErrorBoundaryFallback = ({ 
  error, 
  onRetry, 
  onFallback, 
  errorType = 'general',
  showDetails = false 
}) => {
  const getErrorInfo = () => {
    switch (errorType) {
      case 'network':
        return {
          icon: <WifiOff className="w-12 h-12 text-red-400" />,
          title: "Connection Problem",
          message: "We're having trouble connecting to our AI system. Don't worry, you can still practice!",
          suggestions: [
            "Check your internet connection",
            "Try again in a moment",
            "Use basic mode for now"
          ]
        };
      case 'ai_timeout':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-yellow-400" />,
          title: "AI Taking Too Long",
          message: "Our AI is taking longer than expected to respond. You can continue with basic feedback.",
          suggestions: [
            "Try again with a simpler response",
            "Use basic mode for immediate feedback",
            "Check your connection"
          ]
        };
      case 'ai_error':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-orange-400" />,
          title: "AI Service Unavailable",
          message: "Our AI system is temporarily unavailable. You can still practice with basic feedback.",
          suggestions: [
            "Try again in a few minutes",
            "Use basic mode for now",
            "Your progress is still being saved"
          ]
        };
      case 'session_interrupted':
        return {
          icon: <CheckCircle className="w-12 h-12 text-blue-400" />,
          title: "Session Interrupted",
          message: "Your session was interrupted, but your progress has been saved.",
          suggestions: [
            "Resume where you left off",
            "Start a new session",
            "Check your progress"
          ]
        };
      default:
        return {
          icon: <AlertTriangle className="w-12 h-12 text-red-400" />,
          title: "Something Went Wrong",
          message: "We encountered an unexpected error. Don't worry, your progress is safe.",
          suggestions: [
            "Try again",
            "Use basic mode",
            "Contact support if this continues"
          ]
        };
    }
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          {errorInfo.icon}
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">
            {errorInfo.title}
          </h2>
          <p className="text-gray-400 mb-6">
            {errorInfo.message}
          </p>
        </div>

        {/* Error Details (if enabled) */}
        {showDetails && error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left">
            <h3 className="text-sm font-bold text-red-400 mb-2">Technical Details:</h3>
            <p className="text-xs text-gray-400 font-mono break-all">
              {error.message || error.toString()}
            </p>
          </div>
        )}

        {/* Suggestions */}
        <div className="mb-8 text-left">
          <h3 className="text-sm font-bold text-gray-300 mb-3">What you can do:</h3>
          <ul className="space-y-2">
            {errorInfo.suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          )}
          
          {onFallback && (
            <button
              onClick={onFallback}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Use Basic Mode
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-700 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-all"
          >
            Refresh Page
          </button>
        </div>

        {/* Network Status */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <NetworkStatusIndicator 
            isOnline={navigator.onLine} 
            onRetry={onRetry}
            showDetails={showDetails}
          />
        </div>
      </div>
    </div>
  );
};

export { NetworkStatusIndicator, FallbackModeIndicator, ErrorBoundaryFallback };
export default ErrorBoundaryFallback;
