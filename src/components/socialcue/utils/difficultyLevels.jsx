// Difficulty Level Utilities for Adaptive Learning
// Shared across all components to maintain consistency

import React from 'react';

export const DIFFICULTY_LEVELS = {
  1: {
    label: 'Beginner',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    darkBgColor: 'bg-blue-500/20',
    darkTextColor: 'text-blue-400',
    darkBorderColor: 'border-blue-500/30',
    description: 'Learning the basics and building confidence',
    accuracyNeeded: '70%',
    icon: '🌱'
  },
  2: {
    label: 'Developing',
    color: 'blue',
    bgColor: 'bg-blue-200',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    darkBgColor: 'bg-blue-500/30',
    darkTextColor: 'text-blue-300',
    darkBorderColor: 'border-blue-500/40',
    description: 'Building skills with guided practice',
    accuracyNeeded: '75%',
    icon: '🌿'
  },
  3: {
    label: 'Intermediate',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    darkBgColor: 'bg-purple-500/20',
    darkTextColor: 'text-purple-400',
    darkBorderColor: 'border-purple-500/30',
    description: 'Applying skills in varied situations',
    accuracyNeeded: '80%',
    icon: '🌳'
  },
  4: {
    label: 'Advanced',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    darkBgColor: 'bg-orange-500/20',
    darkTextColor: 'text-orange-400',
    darkBorderColor: 'border-orange-500/30',
    description: 'Mastering complex social interactions',
    accuracyNeeded: '85%',
    icon: '🔥'
  },
  5: {
    label: 'Expert',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    darkBgColor: 'bg-red-500/20',
    darkTextColor: 'text-red-400',
    darkBorderColor: 'border-red-500/30',
    description: 'Leading and teaching others',
    accuracyNeeded: '90%',
    icon: '👑'
  }
};

// Helper functions
export const getDifficultyInfo = (level) => {
  return DIFFICULTY_LEVELS[level] || DIFFICULTY_LEVELS[1];
};

export const getDifficultyLabel = (level) => {
  return getDifficultyInfo(level).label;
};

export const getDifficultyColor = (level, darkMode = false) => {
  const info = getDifficultyInfo(level);
  return darkMode ? info.darkTextColor : info.textColor;
};

export const getDifficultyBgColor = (level, darkMode = false) => {
  const info = getDifficultyInfo(level);
  return darkMode ? info.darkBgColor : info.bgColor;
};

export const getDifficultyBorderColor = (level, darkMode = false) => {
  const info = getDifficultyInfo(level);
  return darkMode ? info.darkBorderColor : info.borderColor;
};

export const getDifficultyDescription = (level) => {
  return getDifficultyInfo(level).description;
};

export const getAccuracyNeeded = (level) => {
  return getDifficultyInfo(level).accuracyNeeded;
};

export const getDifficultyIcon = (level) => {
  return getDifficultyInfo(level).icon;
};

// Component for difficulty badge
export const DifficultyBadge = ({ level, darkMode = false, size = 'sm', showIcon = true }) => {
  const info = getDifficultyInfo(level);
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold border ${sizeClasses[size]} ${
      darkMode ? `${info.darkBgColor} ${info.darkTextColor} ${info.darkBorderColor}` : `${info.bgColor} ${info.textColor} ${info.borderColor}`
    }`}>
      {showIcon && <span>{info.icon}</span>}
      <span>{info.label}</span>
    </span>
  );
};

// Component for difficulty level indicator with progress
export const DifficultyLevelIndicator = ({ level, darkMode = false, showProgress = false, currentAccuracy = null }) => {
  const info = getDifficultyInfo(level);
  
  return (
    <div className={`p-4 rounded-xl border ${darkMode ? `${info.darkBgColor} ${info.darkBorderColor}` : `${info.bgColor} ${info.borderColor}`}`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{info.icon}</span>
        <div>
          <h3 className={`font-bold text-lg ${darkMode ? info.darkTextColor : info.textColor}`}>
            Level {level}: {info.label}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {info.description}
          </p>
        </div>
      </div>
      
      {showProgress && currentAccuracy !== null && (
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              Current Accuracy: {currentAccuracy}%
            </span>
            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              Need: {info.accuracyNeeded}
            </span>
          </div>
          <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                level === 1 ? 'bg-blue-500' :
                level === 2 ? 'bg-blue-600' :
                level === 3 ? 'bg-purple-500' :
                level === 4 ? 'bg-orange-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(currentAccuracy, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Component for difficulty change animation
export const DifficultyChangeAnimation = ({ oldLevel, newLevel, darkMode = false }) => {
  const oldInfo = getDifficultyInfo(oldLevel);
  const newInfo = getDifficultyInfo(newLevel);
  
  if (oldLevel === newLevel) {
    return (
      <div className={`p-4 rounded-xl border ${darkMode ? `${newInfo.darkBgColor} ${newInfo.darkBorderColor}` : `${newInfo.bgColor} ${newInfo.borderColor}`}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{newInfo.icon}</span>
          <div>
            <h3 className={`font-bold ${darkMode ? newInfo.darkTextColor : newInfo.textColor}`}>
              Building mastery at this level
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Keep practicing to strengthen your skills
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  const isLevelUp = newLevel > oldLevel;
  
  return (
    <div className={`p-6 rounded-xl border ${darkMode ? `${newInfo.darkBgColor} ${newInfo.darkBorderColor}` : `${newInfo.bgColor} ${newInfo.borderColor}`}`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{oldInfo.icon}</span>
          <span className="text-gray-400">→</span>
          <span className="text-3xl">{newInfo.icon}</span>
        </div>
        <div>
          <h3 className={`font-bold text-xl ${darkMode ? newInfo.darkTextColor : newInfo.textColor}`}>
            {isLevelUp ? '🎉 Level Up!' : '📚 Taking a step back to strengthen skills'}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isLevelUp 
              ? `Advanced to Level ${newLevel}: ${newInfo.label}!`
              : `Moved to Level ${newLevel}: ${newInfo.label} for better mastery`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

// REMOVED: Difficulty Progression Timeline component - was showing fake demo data
/*
// Component for difficulty progression timeline
export const DifficultyProgressionTimeline = ({ progression, darkMode = false }) => {
  if (!progression || progression.length === 0) return null;
  
  return (
    <div className={`p-6 rounded-xl border ${darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200'}`}>
      <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Difficulty Progression
      </h3>
      <div className="space-y-3">
        {progression.map((entry, index) => {
          const info = getDifficultyInfo(entry.level);
          return (
            <div key={index} className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? info.darkBgColor : info.bgColor}`}>
                <span className="text-lg">{info.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold ${darkMode ? info.darkTextColor : info.textColor}`}>
                    Level {entry.level}: {info.label}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                    {entry.date}
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Accuracy: {entry.accuracy}% • Sessions: {entry.sessions}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
*/
