import React from 'react';
import { CheckCircle, PlayCircle, Clock } from 'lucide-react';

function StatusBadge({ 
  status = 'not_started', 
  size = 'md',
  showIcon = true,
  animated = true 
}) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          classes: 'bg-green-500/20 text-green-400 border-green-400/30',
          icon: CheckCircle,
          text: 'Completed',
          animation: animated ? 'animate-pulse' : ''
        };
      case 'in_progress':
        return {
          classes: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
          icon: PlayCircle,
          text: 'In Progress',
          animation: animated ? 'animate-pulse' : ''
        };
      default:
        return {
          classes: 'bg-gray-500/20 text-gray-400 border-gray-400/30',
          icon: Clock,
          text: 'Not Started',
          animation: ''
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div 
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${sizeClasses[size]} ${config.classes} ${config.animation}`}
      role="status"
      aria-label={`Lesson status: ${config.text}`}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      <span>{config.text}</span>
    </div>
  );
}

export default StatusBadge;
