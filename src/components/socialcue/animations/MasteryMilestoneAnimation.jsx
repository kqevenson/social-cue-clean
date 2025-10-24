import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Target, TrendingUp, CheckCircle } from 'lucide-react';

const MasteryMilestoneAnimation = ({ isVisible, milestone, mastery, onComplete, darkMode }) => {
  const [showProgress, setShowProgress] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  const milestones = {
    25: { 
      icon: Target, 
      color: 'from-blue-400 to-blue-600', 
      text: 'Getting Started!', 
      message: 'You\'re on your way to mastering this skill!' 
    },
    50: { 
      icon: TrendingUp, 
      color: 'from-green-400 to-green-600', 
      text: 'Halfway There!', 
      message: 'Great progress! Keep up the momentum!' 
    },
    75: { 
      icon: Award, 
      color: 'from-purple-400 to-purple-600', 
      text: 'Almost Master!', 
      message: 'You\'re so close to mastery!' 
    },
    100: { 
      icon: CheckCircle, 
      color: 'from-yellow-400 to-orange-500', 
      text: 'MASTERED!', 
      message: 'Congratulations! You\'ve mastered this skill!' 
    }
  };

  const milestoneData = milestones[milestone];

  useEffect(() => {
    if (isVisible) {
      // Start progress animation
      setShowProgress(true);
      
      // Show badge after progress completes
      setTimeout(() => setShowBadge(true), 1500);
      
      // Complete animation after 4 seconds
      setTimeout(() => {
        setShowProgress(false);
        setShowBadge(false);
        onComplete?.();
      }, 4000);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            duration: 0.8 
          }}
          className={`relative p-8 rounded-3xl text-center max-w-md ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-700' 
              : 'bg-gradient-to-br from-white to-gray-100 border border-gray-300'
          } backdrop-blur-xl shadow-2xl`}
        >
          {/* Background Glow Effect */}
          <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${milestoneData.color} opacity-20 animate-pulse`} />
          
          {/* Milestone Icon */}
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            className="relative z-10 mb-6"
          >
            <div className="relative mx-auto w-24 h-24">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className={`w-full h-full rounded-full bg-gradient-to-r ${milestoneData.color} flex items-center justify-center`}
              >
                <milestoneData.icon className="w-12 h-12 text-white" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className={`absolute inset-0 rounded-full bg-gradient-to-r ${milestoneData.color} opacity-50 blur-md`}
              />
            </div>
          </motion.div>

          {/* Milestone Text */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="relative z-10 mb-6"
          >
            <motion.h1
              className={`text-4xl font-black mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
              animate={{ 
                scale: [1, 1.05, 1],
                textShadow: [
                  '0 0 0px rgba(255, 255, 255, 0)',
                  '0 0 20px rgba(255, 255, 255, 0.5)',
                  '0 0 0px rgba(255, 255, 255, 0)'
                ]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              {milestoneData.text}
            </motion.h1>
            
            <p className={`text-lg ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {milestoneData.message}
            </p>
          </motion.div>

          {/* Progress Bar Animation */}
          {showProgress && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="relative z-10 mb-6"
            >
              <div className={`w-full h-4 rounded-full ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              } overflow-hidden`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${mastery}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${milestoneData.color} rounded-full relative`}
                >
                  {/* Progress bar shine effect */}
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className={`text-sm font-bold mt-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {mastery}% Complete
              </motion.div>
            </motion.div>
          )}

          {/* Badge Award Animation */}
          {showBadge && (
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 1.8, 
                type: "spring", 
                stiffness: 300 
              }}
              className="absolute -top-6 -right-6"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center"
                >
                  <Award className="w-6 h-6 text-white" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/50 to-orange-500/50 blur-md"
                />
              </div>
            </motion.div>
          )}

          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${15 + (i * 15)}%`,
                top: `${20 + (i % 2) * 30}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [-10, -30, -50]
              }}
              transition={{
                delay: 1.5 + (i * 0.1),
                duration: 1.5,
                ease: "easeOut"
              }}
            >
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${milestoneData.color}`} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MasteryMilestoneAnimation;
