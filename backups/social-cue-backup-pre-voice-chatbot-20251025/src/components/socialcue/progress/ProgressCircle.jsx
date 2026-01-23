import React from 'react';
import { CheckCircle, PlayCircle } from 'lucide-react';

function ProgressCircle({ 
  progress = 0, 
  status = 'not_started', 
  size = 'md', 
  showIcon = true,
  animated = true 
}) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24'
  };

  const strokeWidth = size === 'sm' ? 3 : size === 'lg' ? 4 : size === 'xl' ? 5 : 3;
  const radius = size === 'sm' ? 18 : size === 'md' ? 24 : size === 'lg' ? 30 : size === 'xl' ? 36 : 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStatusColors = () => {
    switch (status) {
      case 'completed':
        return {
          background: 'text-green-400/20',
          stroke: 'text-green-400',
          icon: 'text-green-400'
        };
      case 'in_progress':
        return {
          background: 'text-blue-400/20',
          stroke: 'text-blue-400',
          icon: 'text-blue-400'
        };
      default:
        return {
          background: 'text-gray-600/20',
          stroke: 'text-gray-600',
          icon: 'text-gray-400'
        };
    }
  };

  const colors = getStatusColors();

  return (
    <div 
      className={`relative ${sizeClasses[size]} flex items-center justify-center`}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In progress' : 'Not started'} - ${progress}%`}
    >
      {/* Background circle */}
      <svg
        className="absolute inset-0 w-full h-full transform -rotate-90"
        viewBox={`0 0 ${radius * 2 + strokeWidth * 2} ${radius * 2 + strokeWidth * 2}`}
      >
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className={colors.background}
        />
      </svg>

      {/* Progress circle */}
      {status === 'in_progress' && progress > 0 && (
        <svg
          className={`absolute inset-0 w-full h-full transform -rotate-90 ${animated ? 'transition-all duration-500 ease-out' : ''}`}
          viewBox={`0 0 ${radius * 2 + strokeWidth * 2} ${radius * 2 + strokeWidth * 2}`}
          style={{
            filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))'
          }}
        >
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={colors.stroke}
            style={{
              strokeDashoffset: strokeDashoffset
            }}
          />
        </svg>
      )}

      {/* Icon or percentage */}
      <div className="relative z-10 flex items-center justify-center">
        {showIcon && status === 'completed' && (
          <CheckCircle className={`w-6 h-6 ${colors.icon} ${animated ? 'animate-bounce' : ''}`} />
        )}
        {showIcon && status === 'in_progress' && (
          <PlayCircle className={`w-6 h-6 ${colors.icon} ${animated ? 'animate-pulse' : ''}`} />
        )}
        {!showIcon && status === 'in_progress' && (
          <span className={`text-sm font-bold ${colors.icon}`}>
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  );
}

export default ProgressCircle;
