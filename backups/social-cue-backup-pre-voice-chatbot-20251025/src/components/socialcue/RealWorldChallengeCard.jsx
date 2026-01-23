import React, { useState } from 'react';
import { CheckCircle, Clock, MapPin, Lightbulb, Target, Calendar, Star, X, ArrowRight } from 'lucide-react';

const RealWorldChallengeCard = ({ 
  challenge, 
  onAccept, 
  onTryLater, 
  onSkip, 
  darkMode = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return {
          bg: darkMode ? 'bg-green-500/20' : 'bg-green-100',
          text: darkMode ? 'text-green-400' : 'text-green-700',
          border: darkMode ? 'border-green-500/30' : 'border-green-200'
        };
      case 'moderate':
        return {
          bg: darkMode ? 'bg-yellow-500/20' : 'bg-yellow-100',
          text: darkMode ? 'text-yellow-400' : 'text-yellow-700',
          border: darkMode ? 'border-yellow-500/30' : 'border-yellow-200'
        };
      case 'challenging':
        return {
          bg: darkMode ? 'bg-orange-500/20' : 'bg-orange-100',
          text: darkMode ? 'text-orange-400' : 'text-orange-700',
          border: darkMode ? 'border-orange-500/30' : 'border-orange-200'
        };
      default:
        return {
          bg: darkMode ? 'bg-blue-500/20' : 'bg-blue-100',
          text: darkMode ? 'text-blue-400' : 'text-blue-700',
          border: darkMode ? 'border-blue-500/30' : 'border-blue-200'
        };
    }
  };

  const difficultyColors = getDifficultyColor(challenge.estimatedDifficulty);

  return (
    <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
      darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-lg'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {challenge.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors.bg} ${difficultyColors.text} ${difficultyColors.border} border`}>
                {challenge.estimatedDifficulty || 'Easy'}
              </span>
              {challenge.timeframe && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  darkMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  <Clock className="w-3 h-3 inline mr-1" />
                  {challenge.timeframe}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-full transition-colors ${
            darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
          }`}
        >
          {isExpanded ? (
            <X className="w-5 h-5 text-gray-400" />
          ) : (
            <ArrowRight className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>

      {/* Description */}
      <p className={`text-base mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {challenge.description}
      </p>

      {/* Specific Goal */}
      {challenge.specificGoal && (
        <div className={`p-4 rounded-xl mb-4 ${
          darkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className={`font-semibold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                Your Goal
              </h4>
              <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}>
                {challenge.specificGoal}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Where to Try */}
          {challenge.whereToTry && challenge.whereToTry.length > 0 && (
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                    Where to Try This
                  </h4>
                  <ul className="space-y-1">
                    {challenge.whereToTry.map((location, index) => (
                      <li key={index} className={`text-sm flex items-center gap-2 ${
                        darkMode ? 'text-green-200' : 'text-green-600'
                      }`}>
                        <Star className="w-3 h-3" />
                        {location}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Success Indicators */}
          {challenge.successIndicators && challenge.successIndicators.length > 0 && (
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'
            }`}>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    How You'll Know You Succeeded
                  </h4>
                  <ul className="space-y-1">
                    {challenge.successIndicators.map((indicator, index) => (
                      <li key={index} className={`text-sm flex items-center gap-2 ${
                        darkMode ? 'text-emerald-200' : 'text-emerald-600'
                      }`}>
                        <CheckCircle className="w-3 h-3" />
                        {indicator}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          {challenge.tips && challenge.tips.length > 0 && (
            <div className={`p-4 rounded-xl ${
              darkMode ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    Helpful Tips
                  </h4>
                  <ul className="space-y-1">
                    {challenge.tips.map((tip, index) => (
                      <li key={index} className={`text-sm flex items-center gap-2 ${
                        darkMode ? 'text-yellow-200' : 'text-yellow-600'
                      }`}>
                        <Lightbulb className="w-3 h-3" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => onAccept(challenge)}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Accept Challenge
        </button>
        <button
          onClick={() => onTryLater(challenge)}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            darkMode ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Try Later
        </button>
        <button
          onClick={() => onSkip(challenge)}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            darkMode ? 'bg-white/10 text-gray-400 hover:bg-white/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default RealWorldChallengeCard;