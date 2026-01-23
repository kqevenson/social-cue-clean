import React from 'react';

function ProgressBar({ 
  progress = 0, 
  status = 'not_started', 
  height = 'sm',
  showPercentage = false,
  showSteps = false,
  currentStep = 1,
  totalSteps = 3,
  animated = true
}) {
  const heightClasses = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const getStatusColors = () => {
    switch (status) {
      case 'completed':
        return {
          background: 'bg-green-400/20',
          fill: 'bg-green-400',
          text: 'text-green-400'
        };
      case 'in_progress':
        return {
          background: 'bg-blue-400/20',
          fill: 'bg-gradient-to-r from-blue-400 to-purple-500',
          text: 'text-blue-400'
        };
      default:
        return {
          background: 'bg-gray-600/20',
          fill: 'bg-gray-600',
          text: 'text-gray-400'
        };
    }
  };

  const colors = getStatusColors();

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className={`relative ${heightClasses[height]} rounded-full overflow-hidden ${colors.background}`}>
        <div
          className={`h-full ${colors.fill} ${animated ? 'transition-all duration-500 ease-out' : ''} ${
            status === 'in_progress' ? 'animate-pulse' : ''
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          {/* Shimmer effect for in-progress */}
          {status === 'in_progress' && animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          )}
        </div>
      </div>

      {/* Progress Info */}
      {(showPercentage || showSteps) && (
        <div className="flex items-center justify-between mt-1">
          {showSteps && status === 'in_progress' && (
            <span className={`text-xs font-medium ${colors.text}`}>
              Step {currentStep} of {totalSteps}
            </span>
          )}
          {showPercentage && status === 'in_progress' && (
            <span className={`text-xs font-medium ${colors.text}`}>
              {Math.round(progress)}%
            </span>
          )}
          {status === 'completed' && (
            <span className={`text-xs font-medium ${colors.text}`}>
              Completed
            </span>
          )}
          {status === 'not_started' && (
            <span className={`text-xs font-medium ${colors.text}`}>
              Not Started
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ProgressBar;
