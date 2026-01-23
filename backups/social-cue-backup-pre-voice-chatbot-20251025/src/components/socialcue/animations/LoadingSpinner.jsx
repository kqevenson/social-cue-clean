import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = "md", text = "Loading...", variant = "spinner", darkMode = false }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24"
  };

  const iconSizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  if (variant === "icon") {
    return (
      <div className="flex flex-col items-center justify-center p-8 animate-fadeIn">
        <Loader2 className={`${iconSizeClasses[size]} ${darkMode ? 'text-blue-400' : 'text-blue-600'} animate-spin`} />
        <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'} animate-pulse`}>{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 animate-fadeIn">
      <div className={`relative ${sizeClasses[size]}`}>
        <div className={`absolute inset-0 border-4 ${darkMode ? 'border-blue-500/20' : 'border-blue-200'} rounded-full`}></div>
        <div className={`absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin`}></div>
      </div>
      <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'} animate-pulse`}>{text}</p>
    </div>
  );
};

export default LoadingSpinner;
