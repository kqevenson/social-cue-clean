import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Shield, Zap } from 'lucide-react';

const StreakIndicator = ({ streak, maxStreak, darkMode, size = 'md' }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showProtection, setShowProtection] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  // Calculate flame intensity based on streak
  const flameIntensity = Math.min(streak / 10, 1);
  const isHotStreak = streak >= 7;
  const isOnFire = streak >= 14;

  useEffect(() => {
    if (streak > 0) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  }, [streak]);

  const getFlameColor = () => {
    if (isOnFire) return 'from-red-500 to-yellow-500';
    if (isHotStreak) return 'from-orange-500 to-red-500';
    return 'from-yellow-500 to-orange-500';
  };

  const getFlameSize = () => {
    const baseSize = sizeClasses[size];
    if (isOnFire) return `${baseSize} scale-125`;
    if (isHotStreak) return `${baseSize} scale-110`;
    return baseSize;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Flame Icon */}
      <div className="relative">
        <motion.div
          animate={isAnimating ? { 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{ duration: 0.5 }}
          className={`${getFlameSize()} relative`}
        >
          {/* Main Flame */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`w-full h-full rounded-full bg-gradient-to-r ${getFlameColor()} flex items-center justify-center`}
          >
            <Flame className={`${sizeClasses[size]} text-white`} />
          </motion.div>

          {/* Flame Glow Effect */}
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
            className={`absolute inset-0 rounded-full bg-gradient-to-r ${getFlameColor()} blur-md`}
          />

          {/* Fire Particles for Hot Streaks */}
          {isHotStreak && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-orange-400 rounded-full"
                  style={{
                    left: `${30 + i * 20}%`,
                    top: `${20 + i * 10}%`,
                  }}
                  animate={{
                    y: [-5, -15, -25],
                    opacity: [1, 0.5, 0],
                    scale: [1, 1.5, 0]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          )}

          {/* Protection Shield for High Streaks */}
          {streak >= 10 && (
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute -top-1 -right-1"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center"
              >
                <Shield className="w-2 h-2 text-white" />
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Lightning Bolt for On Fire Streaks */}
        {isOnFire && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -left-2"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 0.5, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center"
            >
              <Zap className="w-2 h-2 text-white" />
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Streak Counter */}
      <motion.div
        animate={isAnimating ? { 
          scale: [1, 1.1, 1],
          color: ['inherit', '#f59e0b', 'inherit']
        } : {}}
        transition={{ duration: 0.5 }}
        className={`${textSizeClasses[size]} font-bold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}
      >
        {streak}
      </motion.div>

      {/* Streak Status Text */}
      {isOnFire && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent`}
        >
          ON FIRE!
        </motion.div>
      )}
    </div>
  );
};

// Streak Freeze/Save Component
const StreakProtection = ({ isActive, onActivate, darkMode }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onActivate}
      disabled={isActive}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        isActive 
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
          : darkMode 
            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
      }`}
    >
      <Shield className="w-4 h-4" />
      <span className="text-sm font-medium">
        {isActive ? 'Protected' : 'Protect Streak'}
      </span>
    </motion.button>
  );
};

// Streak Restoration Component
const StreakRestoration = ({ lostStreak, onRestore, darkMode }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          darkMode 
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600' 
            : 'bg-gradient-to-r from-orange-400 to-red-400 text-white hover:from-orange-500 hover:to-red-500'
        }`}
      >
        <Zap className="w-4 h-4" />
        <span className="text-sm font-medium">Restore Streak</span>
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`p-6 rounded-2xl text-center ${
                darkMode 
                  ? 'bg-gray-900 border border-gray-700' 
                  : 'bg-white border border-gray-300'
              }`}
            >
              <h3 className={`text-xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Restore Your Streak?
              </h3>
              <p className={`mb-6 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                You had a {lostStreak} day streak! Would you like to restore it?
              </p>
              <div className="flex gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onRestore();
                    setShowModal(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
                >
                  Restore
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export { StreakIndicator, StreakProtection, StreakRestoration };
