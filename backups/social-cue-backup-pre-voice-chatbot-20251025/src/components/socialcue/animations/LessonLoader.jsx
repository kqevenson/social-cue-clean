import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Brain, Zap, CheckCircle } from 'lucide-react';

export default function LessonLoader({ onComplete }) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);

  const messages = [
    {
      text: "Creating your personalized lesson...",
      icon: <BookOpen className="w-8 h-8 text-blue-400" />,
      delay: 1000
    },
    {
      text: "Analyzing your learning style...",
      icon: <Brain className="w-8 h-8 text-purple-400" />,
      delay: 1500
    },
    {
      text: "Choosing the perfect practice scenarios for you...",
      icon: <Sparkles className="w-8 h-8 text-yellow-400" />,
      delay: 2000
    },
    {
      text: "Adding personalized tips and feedback...",
      icon: <Zap className="w-8 h-8 text-green-400" />,
      delay: 1500
    },
    {
      text: "Almost ready...",
      icon: <CheckCircle className="w-8 h-8 text-emerald-400" />,
      delay: 1000
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 2000);

    return () => clearInterval(messageTimer);
  }, [messages.length]);

  const currentMsg = messages[currentMessage];

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Animated Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center animate-pulse">
              {currentMsg.icon}
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-spin"></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400">{progress}% Complete</p>
        </div>

        {/* Loading Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 animate-fadeIn">
            {currentMsg.text}
          </h2>
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentMessage % 3 ? 'bg-blue-400' : 'bg-gray-600'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Fun Facts */}
        <div className="text-sm text-gray-500 animate-fadeIn">
          <p>✨ Each lesson is crafted just for you</p>
          <p>🎯 Based on your unique learning style</p>
          <p>🚀 Ready in just a few moments...</p>
        </div>
      </div>
    </div>
  );
}
