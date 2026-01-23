import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Star, AlertCircle, Lightbulb } from 'lucide-react';

const FeedbackAnimation = ({ 
  isVisible, 
  type, 
  message, 
  onComplete, 
  darkMode,
  position = 'center' 
}) => {
  const [showTips, setShowTips] = useState(false);

  const feedbackTypes = {
    correct: {
      icon: CheckCircle,
      color: 'from-green-400 to-emerald-500',
      bgColor: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/50',
      textColor: 'text-green-400',
      animation: 'bounce'
    },
    thoughtful: {
      icon: Star,
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-500/50',
      textColor: 'text-yellow-400',
      animation: 'pulse'
    },
    needsWork: {
      icon: AlertCircle,
      color: 'from-blue-400 to-purple-500',
      bgColor: 'from-blue-500/20 to-purple-500/20',
      borderColor: 'border-blue-500/50',
      textColor: 'text-blue-400',
      animation: 'gentle-pulse'
    }
  };

  const feedbackData = feedbackTypes[type];

  useEffect(() => {
    if (isVisible) {
      // Show tips after a short delay for "needs work" feedback
      if (type === 'needsWork') {
        setTimeout(() => setShowTips(true), 1000);
      }
      
      // Complete animation after 3 seconds
      setTimeout(() => {
        setShowTips(false);
        onComplete?.();
      }, 3000);
    }
  }, [isVisible, type, onComplete]);

  if (!isVisible) return null;

  const positionClasses = {
    center: 'fixed inset-0 z-50 flex items-center justify-center',
    top: 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
    bottom: 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={positionClasses[position]}
      >
        <motion.div
          initial={{ 
            scale: 0, 
            rotate: type === 'correct' ? -180 : 0,
            y: position === 'top' ? -50 : position === 'bottom' ? 50 : 0
          }}
          animate={{ 
            scale: 1, 
            rotate: 0,
            y: 0
          }}
          exit={{ 
            scale: 0, 
            rotate: type === 'correct' ? 180 : 0,
            y: position === 'top' ? -50 : position === 'bottom' ? 50 : 0
          }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            duration: 0.6 
          }}
          className={`relative p-4 rounded-2xl text-center max-w-sm ${
            darkMode 
              ? `bg-gradient-to-br ${feedbackData.bgColor} border ${feedbackData.borderColor}` 
              : `bg-white border ${feedbackData.borderColor} shadow-lg`
          } backdrop-blur-xl`}
        >
          {/* Background Glow Effect */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feedbackData.color} opacity-10 animate-pulse`} />
          
          {/* Icon Animation */}
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="relative z-10 mb-3"
          >
            <div className="relative mx-auto w-16 h-16">
              <motion.div
                animate={feedbackData.animation === 'bounce' ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                } : feedbackData.animation === 'pulse' ? {
                  scale: [1, 1.1, 1],
                  opacity: [0.8, 1, 0.8]
                } : {
                  scale: [1, 1.05, 1],
                  opacity: [0.9, 1, 0.9]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`w-full h-full rounded-full bg-gradient-to-r ${feedbackData.color} flex items-center justify-center`}
              >
                <feedbackData.icon className="w-8 h-8 text-white" />
              </motion.div>
              
              {/* Icon Glow Effect */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${feedbackData.color} blur-md`}
              />
            </div>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative z-10"
          >
            <motion.p
              className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
              animate={type === 'correct' ? {
                textShadow: [
                  '0 0 0px rgba(34, 197, 94, 0)',
                  '0 0 10px rgba(34, 197, 94, 0.5)',
                  '0 0 0px rgba(34, 197, 94, 0)'
                ]
              } : {}}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              {message}
            </motion.p>
          </motion.div>

          {/* Particle Effects */}
          {type === 'correct' && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-green-400 rounded-full"
                  style={{
                    left: `${20 + (i * 10)}%`,
                    top: `${30 + (i % 2) * 20}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [-10, -30, -50]
                  }}
                  transition={{
                    delay: 0.5 + (i * 0.1),
                    duration: 1.5,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          )}

          {/* Tips for "Needs Work" feedback */}
          {showTips && type === 'needsWork' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-blue-400" />
                <span className={`text-sm font-medium ${feedbackData.textColor}`}>
                  Quick Tip
                </span>
              </div>
              <p className={`text-sm ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Take a moment to think about the situation and consider how others might feel.
              </p>
            </motion.div>
          )}

          {/* Floating Stars for Thoughtful feedback */}
          {type === 'thoughtful' && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${15 + (i * 20)}%`,
                    top: `${25 + (i % 2) * 25}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [-10, -25, -40]
                  }}
                  transition={{
                    delay: 0.8 + (i * 0.15),
                    duration: 1.5,
                    ease: "easeOut"
                  }}
                >
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Quick Feedback Component for inline use
const QuickFeedback = ({ type, darkMode, size = 'sm' }) => {
  const feedbackTypes = {
    correct: { icon: CheckCircle, color: 'text-green-400' },
    thoughtful: { icon: Star, color: 'text-yellow-400' },
    needsWork: { icon: AlertCircle, color: 'text-blue-400' }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const feedbackData = feedbackTypes[type];

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="inline-flex items-center"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{
          duration: 0.6,
          ease: "easeOut"
        }}
      >
        <feedbackData.icon className={`${sizeClasses[size]} ${feedbackData.color}`} />
      </motion.div>
    </motion.div>
  );
};

export { FeedbackAnimation, QuickFeedback };
