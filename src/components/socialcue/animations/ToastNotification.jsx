import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Info } from 'lucide-react';

const ToastNotification = ({ 
  message, 
  type = 'info', 
  onClose, 
  duration = 5000,
  show = true,
  action = null
}) => {
  const [isVisible, setIsVisible] = React.useState(show);

  React.useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [show, duration, onClose]);

  if (!isVisible) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
          bgColor: 'bg-emerald-500/90',
          borderColor: 'border-emerald-400/30',
          title: 'Success!'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
          bgColor: 'bg-yellow-500/90',
          borderColor: 'border-yellow-400/30',
          title: 'Warning'
        };
      case 'error':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
          bgColor: 'bg-red-500/90',
          borderColor: 'border-red-400/30',
          title: 'Error'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-400" />,
          bgColor: 'bg-blue-500/90',
          borderColor: 'border-blue-400/30',
          title: 'Info'
        };
    }
  };

  const config = getConfig();

  return (
    <div className={`fixed bottom-4 right-4 ${config.bgColor} backdrop-blur border ${config.borderColor} text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-slideUp z-50 max-w-sm`}>
      {config.icon}
      <div className="flex-1">
        <p className="font-bold text-sm">{config.title}</p>
        <p className="text-sm opacity-90">{message}</p>
        {action && (
          <div className="mt-2">
            {action}
          </div>
        )}
      </div>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }} 
        className="text-white/80 hover:text-white transition-colors"
      >
        ×
      </button>
    </div>
  );
};

const SuccessToast = ({ message, onClose, duration = 3000 }) => (
  <ToastNotification 
    message={message} 
    type="success" 
    onClose={onClose} 
    duration={duration}
  />
);

const ErrorToast = ({ message, onClose, duration = 7000, action }) => (
  <ToastNotification 
    message={message} 
    type="error" 
    onClose={onClose} 
    duration={duration}
    action={action}
  />
);

const WarningToast = ({ message, onClose, duration = 5000 }) => (
  <ToastNotification 
    message={message} 
    type="warning" 
    onClose={onClose} 
    duration={duration}
  />
);

const InfoToast = ({ message, onClose, duration = 4000 }) => (
  <ToastNotification 
    message={message} 
    type="info" 
    onClose={onClose} 
    duration={duration}
  />
);

export { 
  ToastNotification, 
  SuccessToast, 
  ErrorToast, 
  WarningToast, 
  InfoToast 
};
export default ToastNotification;
