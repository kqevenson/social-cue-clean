import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

const NoScenariosFound = ({ onRetry, onGoHome }) => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-6 animate-pulse" />
        <h3 className="text-2xl font-bold mb-4 text-white">No Scenarios Found</h3>
        <p className="text-gray-400 mb-8 text-lg">
          We couldn't load the practice scenarios. This might be a temporary issue.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={onRetry || (() => window.location.reload())}
            className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
          
          <button 
            onClick={onGoHome || (() => window.location.href = '/')}
            className="w-full bg-gray-700 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
          <p className="text-sm text-gray-400">
            If this problem persists, please check your internet connection or try refreshing the page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoScenariosFound;
