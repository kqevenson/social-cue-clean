import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Zap } from 'lucide-react';

const LevelUpAnimation = ({ isVisible, newLevel, onComplete, darkMode }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Start confetti immediately
      setShowConfetti(true);
      
      // Show badge after a short delay
      setTimeout(() => setShowBadge(true), 500);
      
      // Complete animation after 3 seconds
      setTimeout(() => {
        setShowConfetti(false);
        setShowBadge(false);
        onComplete?.();
      }, 3000);
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
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                initial={{
                  x: '50vw',
                  y: '50vh',
                  rotate: 0,
                  scale: 1,
                }}
                animate={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  rotate: 360,
                  scale: [1, 1.5, 0],
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}

        {/* Main Level Up Content */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            duration: 0.8 
          }}
          className={`relative p-8 rounded-3xl text-center ${
            darkMode 
              ? 'bg-gradient-to-br from-purple-900/90 to-blue-900/90 border border-purple-500/50' 
              : 'bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-300'
          } backdrop-blur-xl shadow-2xl`}
        >
          {/* Background Glow Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 animate-pulse" />
          
          {/* Level Up Text */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative z-10"
          >
            <motion.h1
              className={`text-6xl font-black mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
              animate={{ 
                scale: [1, 1.1, 1],
                textShadow: [
                  '0 0 0px rgba(255, 215, 0, 0)',
                  '0 0 20px rgba(255, 215, 0, 0.8)',
                  '0 0 0px rgba(255, 215, 0, 0)'
                ]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              LEVEL UP!
            </motion.h1>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              <Trophy className="w-12 h-12 text-yellow-400" />
              <span className={`text-3xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Level {newLevel}
              </span>
              <Trophy className="w-12 h-12 text-yellow-400" />
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className={`text-lg ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              🎉 Amazing progress! You're getting stronger! 🎉
            </motion.p>
          </motion.div>

          {/* Difficulty Badge Animation */}
          {showBadge && (
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 1.2, 
                type: "spring", 
                stiffness: 300 
              }}
              className="absolute -top-4 -right-4"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400 to-blue-500 flex items-center justify-center"
                >
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/50 to-blue-500/50 blur-md"
                />
              </div>
            </motion.div>
          )}

          {/* Floating Stars */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${20 + (i * 10)}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [-20, -40, -60]
              }}
              transition={{
                delay: 1 + (i * 0.1),
                duration: 1.5,
                ease: "easeOut"
              }}
            >
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LevelUpAnimation;
