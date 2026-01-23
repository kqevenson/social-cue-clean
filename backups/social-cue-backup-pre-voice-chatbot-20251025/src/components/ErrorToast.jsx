import React, { useEffect, useState } from 'react';
import { AlertCircle, X, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const ErrorToast = ({ 
  message, 
  type = 'error', 
  onClose, 
  duration = 5000,
  show = true 
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300); // Wait for animation
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [show, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" />;
      default:
        return <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/90';
      case 'warning':
        return 'bg-yellow-500/90';
      case 'info':
        return 'bg-blue-500/90';
      default:
        return 'bg-red-500/90';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Info';
      default:
        return 'Error';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 ${getBackgroundColor()} backdrop-blur text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-slideUp z-50 max-w-sm`}>
      {getIcon()}
      <div className="flex-1">
        <p className="font-bold text-sm">{getTitle()}</p>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }} 
        className="text-white/80 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ErrorToast;
