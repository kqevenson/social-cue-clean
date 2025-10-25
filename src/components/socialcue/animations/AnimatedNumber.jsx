import React, { useState, useEffect } from 'react';

const AnimatedNumber = ({ 
  value, 
  duration = 1000, 
  decimals = 0,
  className = '',
  prefix = '',
  suffix = '',
  onComplete = null
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value === displayValue) return;

    setIsAnimating(true);
    const startValue = displayValue;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
        if (onComplete) {
          onComplete();
        }
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, displayValue, onComplete]);

  const formatValue = (val) => {
    if (decimals === 0) {
      return Math.round(val);
    }
    return val.toFixed(decimals);
  };

  return (
    <span className={`transition-all duration-200 ${isAnimating ? 'scale-105' : 'scale-100'} ${className}`}>
      {prefix}{formatValue(displayValue)}{suffix}
    </span>
  );
};

export default AnimatedNumber;