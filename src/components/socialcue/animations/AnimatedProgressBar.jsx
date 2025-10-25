import React, { useState, useEffect, useRef } from 'react';

const AnimatedProgressBar = ({ 
  progress, 
  duration = 1500,
  height = 'h-2',
  className = '',
  darkMode = false,
  showPercentage = false,
  animated = true
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const progressRef = useRef(null);

  useEffect(() => {
    if (!animated) {
      setDisplayProgress(progress);
      return;
    }

    if (progress === displayProgress) return;

    setIsAnimating(true);
    const startValue = displayProgress;
    const endValue = progress;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progressRatio, 3);
      
      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayProgress(currentValue);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayProgress(endValue);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [progress, duration, displayProgress, animated]);

  const getProgressColor = () => {
    if (displayProgress >= 80) {
      return darkMode ? 'bg-green-400' : 'bg-green-500';
    } else if (displayProgress >= 60) {
      return darkMode ? 'bg-blue-400' : 'bg-blue-500';
    } else if (displayProgress >= 40) {
      return darkMode ? 'bg-yellow-400' : 'bg-yellow-500';
    } else {
      return darkMode ? 'bg-red-400' : 'bg-red-500';
    }
  };

  const getBackgroundColor = () => {
    return darkMode ? 'bg-white/10' : 'bg-gray-200';
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`w-full ${height} rounded-full overflow-hidden ${getBackgroundColor()}`}>
        <div
          ref={progressRef}
          className={`${height} rounded-full transition-all duration-300 ease-out ${getProgressColor()} ${
            isAnimating ? 'shadow-lg' : ''
          }`}
          style={{
            width: `${Math.min(Math.max(displayProgress, 0), 100)}%`,
            transition: animated ? 'width 0.3s ease-out' : 'none'
          }}
        />
      </div>
      {showPercentage && (
        <div className={`absolute inset-0 flex items-center justify-center text-xs font-medium ${
          darkMode ? 'text-white' : 'text-gray-700'
        }`}>
          {Math.round(displayProgress)}%
        </div>
      )}
    </div>
  );
};

export default AnimatedProgressBar;
