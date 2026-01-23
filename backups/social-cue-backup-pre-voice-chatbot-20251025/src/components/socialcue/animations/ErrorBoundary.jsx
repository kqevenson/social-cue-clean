import React from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onNavigate) {
      this.props.onNavigate('home');
    }
  };

  render() {
    if (this.state.hasError) {
      const { darkMode = true } = this.props;
      
      return (
        <div className={`min-h-screen flex items-center justify-center p-6 ${
          darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'
        }`}>
          <div className={`max-w-md w-full text-center ${
            darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200'
          } backdrop-blur-xl border rounded-2xl p-8`}>
            <div className="mb-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                <AlertTriangle className={`w-8 h-8 ${
                  darkMode ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Something went wrong
              </h1>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Don't worry! Let's get you back on track.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  darkMode 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  darkMode 
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200'
                }`}
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className={`text-xs cursor-pointer ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Error Details (Development)
                </summary>
                <pre className={`text-xs mt-2 p-2 rounded ${
                  darkMode ? 'bg-black/50 text-red-400' : 'bg-gray-100 text-red-600'
                } overflow-auto`}>
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
