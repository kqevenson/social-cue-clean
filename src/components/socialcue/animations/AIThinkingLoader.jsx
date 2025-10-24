import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Zap, CheckCircle } from 'lucide-react';

const AIThinkingLoader = ({ 
  message = "AI is thinking...", 
  showProgress = true,
  estimatedTime = 3,
  onComplete 
}) => {
  const [progress, setProgress] = useState(0);
  const [currentIcon, setCurrentIcon] = useState(0);
  const [dots, setDots] = useState('');

  const icons = [
    <Brain className="w-8 h-8 text-blue-400" />,
    <Sparkles className="w-8 h-8 text-purple-400" />,
    <Zap className="w-8 h-8 text-yellow-400" />,
    <CheckCircle className="w-8 h-8 text-green-400" />
  ];

  useEffect(() => {
    // Animate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => onComplete?.(), 500);
          return 100;
        }
        return prev + (100 / (estimatedTime * 10)); // 10 updates per second
      });
    }, 100);

    // Animate icon rotation
    const iconInterval = setInterval(() => {
      setCurrentIcon(prev => (prev + 1) % icons.length);
    }, 800);

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(iconInterval);
      clearInterval(dotsInterval);
    };
  }, [estimatedTime, onComplete, icons.length]);

  return (
    <div className="flex flex-col items-center justify-center p-8 animate-fadeIn">
      {/* Animated Icon */}
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center animate-pulse">
            {icons[currentIcon]}
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-spin"></div>
        </div>
      </div>

      {/* Message */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-200 mb-2">
          {message}{dots}
        </h3>
        <p className="text-sm text-gray-400">
          Analyzing your response and preparing feedback...
        </p>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full max-w-xs">
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Analyzing</span>
            <span>{Math.round(progress)}%</span>
            <span>Complete</span>
          </div>
        </div>
      )}

      {/* Fun Tips */}
      <div className="mt-6 text-center">
        <div className="text-xs text-gray-500 animate-fadeIn">
          <p>💡 Each response is carefully analyzed</p>
          <p>🎯 Personalized feedback coming your way</p>
        </div>
      </div>
    </div>
  );
};

export default AIThinkingLoader;
