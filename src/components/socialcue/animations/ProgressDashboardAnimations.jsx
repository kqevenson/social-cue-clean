import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';

// Animated Progress Bar Component
const AnimatedProgressBar = ({ 
  progress, 
  label, 
  color = 'from-blue-400 to-blue-600', 
  darkMode, 
  delay = 0,
  showPercentage = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {label}
        </span>
        {showPercentage && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ delay: delay + 0.5 }}
            className={`text-sm font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
          >
            {progress}%
          </motion.span>
        )}
      </div>
      
      <div className={`w-full h-3 rounded-full overflow-hidden ${
        darkMode ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isVisible ? `${progress}%` : '0%' }}
          transition={{ 
            duration: 1.5, 
            delay: delay + 0.2,
            ease: "easeOut"
          }}
          className={`h-full bg-gradient-to-r ${color} rounded-full relative`}
        >
          {/* Progress bar shine effect */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: isVisible ? '100%' : '-100%' }}
            transition={{ 
              duration: 1.5, 
              delay: delay + 0.8,
              ease: "easeOut"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
};

// Animated Chart Component
const AnimatedChart = ({ 
  data, 
  type = 'bar', 
  darkMode, 
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const maxValue = Math.max(...data.map(item => item.value));

  if (type === 'bar') {
    return (
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ height: 0 }}
            animate={{ height: isVisible ? `${(item.value / maxValue) * 100}%` : '0%' }}
            transition={{ 
              duration: 1,
              delay: delay + (index * 0.1),
              ease: "easeOut"
            }}
            className={`flex-1 rounded-t-lg bg-gradient-to-t ${item.color} relative`}
          >
            {/* Bar glow effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 0.3 : 0 }}
              transition={{ delay: delay + (index * 0.1) + 0.5 }}
              className={`absolute inset-0 rounded-t-lg bg-gradient-to-t ${item.color} blur-sm`}
            />
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          {data.map((item, index) => {
            const circumference = 2 * Math.PI * 45; // radius = 45
            const strokeDasharray = circumference;
            const strokeDashoffset = circumference - (item.value / 100) * circumference;
            
            return (
              <motion.circle
                key={item.label}
                cx="50%"
                cy="50%"
                r="45"
                fill="none"
                stroke={`url(#gradient-${index})`}
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: isVisible ? strokeDashoffset : circumference }}
                transition={{ 
                  duration: 1.5,
                  delay: delay + (index * 0.2),
                  ease: "easeOut"
                }}
              />
            );
          })}
          
          {/* Gradient definitions */}
          {data.map((item, index) => (
            <defs key={index}>
              <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={item.color.split(' ')[1]} />
                <stop offset="100%" stopColor={item.color.split(' ')[3]} />
              </linearGradient>
            </defs>
          ))}
        </svg>
        
        {/* Center text */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0 }}
          transition={{ delay: delay + 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className={`text-lg font-bold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {data.reduce((sum, item) => sum + item.value, 0)}%
          </span>
        </motion.div>
      </div>
    );
  }

  return null;
};

// Animated Stat Card Component
const AnimatedStatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'from-blue-400 to-blue-600', 
  darkMode, 
  delay = 0,
  trend = null 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.6, delay }}
      className={`p-6 rounded-2xl ${
        darkMode 
          ? 'bg-white/5 border border-white/20' 
          : 'bg-white border border-gray-200 shadow-sm'
      } backdrop-blur-xl hover:scale-105 transition-transform duration-200`}
    >
      <div className="flex items-center justify-between mb-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: isVisible ? 1 : 0, rotate: isVisible ? 0 : -180 }}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 300 }}
          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
        
        {trend && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
            transition={{ delay: delay + 0.4 }}
            className={`flex items-center gap-1 ${
              trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${
              trend < 0 ? 'rotate-180' : ''
            }`} />
            <span className="text-sm font-medium">
              {Math.abs(trend)}%
            </span>
          </motion.div>
        )}
      </div>
      
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ delay: delay + 0.6 }}
        className={`text-3xl font-bold mb-2 bg-gradient-to-r ${color} bg-clip-text text-transparent`}
      >
        {value}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ delay: delay + 0.8 }}
        className={`text-sm ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {title}
      </motion.p>
    </motion.div>
  );
};

// Animated Line Chart Component
const AnimatedLineChart = ({ 
  data, 
  darkMode, 
  delay = 0 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-32">
      <svg className="w-full h-full">
        <motion.polyline
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          points={points}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isVisible ? 1 : 0 }}
          transition={{ 
            duration: 2,
            delay: delay + 0.5,
            ease: "easeInOut"
          }}
        />
        
        {/* Data points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((item.value - minValue) / range) * 100;
          
          return (
            <motion.circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="url(#pointGradient)"
              initial={{ scale: 0 }}
              animate={{ scale: isVisible ? 1 : 0 }}
              transition={{ 
                delay: delay + 1 + (index * 0.1),
                type: "spring",
                stiffness: 300
              }}
            />
          );
        })}
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="pointGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Dashboard Loading Skeleton
const DashboardSkeleton = ({ darkMode }) => {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className={`p-6 rounded-2xl ${
            darkMode 
              ? 'bg-white/5 border border-white/20' 
              : 'bg-white border border-gray-200'
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            } animate-pulse`} />
            <div className="flex-1">
              <div className={`h-4 w-24 rounded ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              } animate-pulse mb-2`} />
              <div className={`h-3 w-16 rounded ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              } animate-pulse`} />
            </div>
          </div>
          <div className={`h-3 w-full rounded ${
            darkMode ? 'bg-gray-700' : 'bg-gray-200'
          } animate-pulse`} />
        </motion.div>
      ))}
    </div>
  );
};

export { 
  AnimatedProgressBar, 
  AnimatedChart, 
  AnimatedStatCard, 
  AnimatedLineChart, 
  DashboardSkeleton 
};
