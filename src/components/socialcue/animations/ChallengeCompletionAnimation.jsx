import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, Star, Zap, Crown } from 'lucide-react';

const ChallengeCompletionAnimation = ({ 
  isVisible, 
  challenge, 
  xpEarned, 
  badgeUnlocked, 
  onComplete, 
  darkMode 
}) => {
  const [showXP, setShowXP] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [showTrophy, setShowTrophy] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Show trophy immediately
      setShowTrophy(true);
      
      // Show XP after a short delay
      setTimeout(() => setShowXP(true), 800);
      
      // Show badge if unlocked
      if (badgeUnlocked) {
        setTimeout(() => setShowBadge(true), 1500);
      }
      
      // Complete animation after 4 seconds
      setTimeout(() => {
        setShowTrophy(false);
        setShowXP(false);
        setShowBadge(false);
        onComplete?.();
      }, 4000);
    }
  }, [isVisible, badgeUnlocked, onComplete]);

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
          className={`relative p-8 rounded-3xl text-center max-w-lg ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-700' 
              : 'bg-gradient-to-br from-white to-gray-100 border border-gray-300'
          } backdrop-blur-xl shadow-2xl`}
        >
          {/* Background Glow Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 animate-pulse" />
          
          {/* Trophy Animation */}
          {showTrophy && (
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              className="relative z-10 mb-6"
            >
              <div className="relative mx-auto w-32 h-32">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-full h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center"
                >
                  <Trophy className="w-16 h-16 text-white" />
                </motion.div>
                
                {/* Trophy Glow Effect */}
                <motion.div
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/50 to-orange-500/50 blur-lg"
                />

                {/* Crown for special achievements */}
                <motion.div
                  initial={{ scale: 0, y: -20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 1, type: "spring", stiffness: 300 }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                >
                  <Crown className="w-8 h-8 text-yellow-300" />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Completion Text */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="relative z-10 mb-6"
          >
            <motion.h1
              className={`text-5xl font-black mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
              animate={{ 
                scale: [1, 1.05, 1],
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
              CHALLENGE COMPLETE!
            </motion.h1>
            
            <p className={`text-xl font-semibold ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {challenge?.title || 'Great job!'}
            </p>
          </motion.div>

          {/* XP Points Animation */}
          {showXP && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring", stiffness: 300 }}
              className="relative z-10 mb-6"
            >
              <div className="flex items-center justify-center gap-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: "spring", stiffness: 300 }}
                  className={`text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent`}
                >
                  +{xpEarned} XP
                </motion.span>
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              
              {/* XP Counter Animation */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1.5, duration: 1 }}
                className="mt-3 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              />
            </motion.div>
          )}

          {/* Badge Unlock Animation */}
          {showBadge && badgeUnlocked && (
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 2, type: "spring", stiffness: 300 }}
              className="relative z-10 mb-6"
            >
              <div className="flex items-center justify-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center"
                >
                  <Award className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <p className={`text-lg font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    New Badge Unlocked!
                  </p>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {badgeUnlocked.name}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Confetti Effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#fbbf24', '#f59e0b', '#d97706', '#92400e'][i % 4],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: 360,
                  y: [-20, -100],
                }}
                transition={{
                  delay: 0.5 + (i * 0.05),
                  duration: 2,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>

          {/* Floating Stars */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${10 + (i * 9)}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [-10, -30, -50]
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

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="relative z-10"
          >
            <p className={`text-lg ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              🎉 You're becoming a social skills master! 🎉
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Medal Component for smaller achievements
const MedalAward = ({ type, darkMode, size = 'md' }) => {
  const medalTypes = {
    bronze: { color: 'from-amber-600 to-amber-800', icon: Medal },
    silver: { color: 'from-gray-400 to-gray-600', icon: Medal },
    gold: { color: 'from-yellow-400 to-yellow-600', icon: Medal },
    platinum: { color: 'from-purple-400 to-purple-600', icon: Award }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const medalData = medalTypes[type];
  const IconComponent = medalData.icon;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="relative"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-r ${medalData.color} flex items-center justify-center`}
      >
        <IconComponent className={`${sizeClasses[size]} text-white`} />
      </motion.div>
      
      {/* Medal Glow */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`absolute inset-0 rounded-full bg-gradient-to-r ${medalData.color} blur-md`}
      />
    </motion.div>
  );
};

export { ChallengeCompletionAnimation, MedalAward };
