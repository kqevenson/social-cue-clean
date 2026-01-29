import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastNotification = ({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose,
  darkMode = false 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return darkMode ? 'bg-green-500/20 border-green-500/30' : 'bg-green-50 border-green-200';
      case 'error':
        return darkMode ? 'bg-red-500/20 border-red-500/30' : 'bg-red-50 border-red-200';
      case 'warning':
        return darkMode ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200';
      default:
        return darkMode ? 'bg-green-500/20 border-green-500/30' : 'bg-green-50 border-green-200';
    }
  };

  const getTextColor = () => {
    return darkMode ? 'text-white' : 'text-gray-900';
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`backdrop-blur-xl border rounded-xl p-4 shadow-lg ${getBgColor()}`}>
        <div className="flex items-center gap-3">
          {getIcon()}
          <p className={`font-medium ${getTextColor()}`}>{message}</p>
          <button
            onClick={handleClose}
            className={`ml-2 p-1 rounded-full hover:bg-black/10 transition-colors ${getTextColor()}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;