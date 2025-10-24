import React, { useState } from 'react';
import { Target, Clock, MapPin, CheckCircle, XCircle, Lightbulb, Star, Calendar, Zap } from 'lucide-react';

function RealWorldChallengeCard({ challenge, onAccept, onSkip, onTryLater, darkMode, isLoading = false }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'moderate':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'challenging':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      default:
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return <CheckCircle className="w-4 h-4" />;
      case 'moderate':
        return <Star className="w-4 h-4" />;
      case 'challenging':
        return <Zap className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const handleAction = async (action) => {
    setIsProcessing(true);
    try {
      await action();
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`backdrop-blur-xl border rounded-3xl p-8 ${darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-lg'}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            <Target className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Creating Your Challenge...
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            AI is crafting a personalized real-world challenge for you
          </p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className={`backdrop-blur-xl border rounded-3xl p-8 ${darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-lg'}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            No Challenge Available
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Complete more lessons to unlock personalized challenges
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-xl border rounded-3xl p-8 ${darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-lg'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {challenge.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(challenge.estimatedDifficulty)}`}>
                <div className="flex items-center gap-1">
                  {getDifficultyIcon(challenge.estimatedDifficulty)}
                  {challenge.estimatedDifficulty}
                </div>
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {challenge.timeframe}
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {challenge.description}
        </p>
      </div>

      {/* Specific Goal */}
      <div className="mb-6">
        <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <Target className="w-5 h-5 text-blue-400" />
          Your Goal
        </h3>
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
            {challenge.specificGoal}
          </p>
        </div>
      </div>

      {/* Where to Try */}
      <div className="mb-6">
        <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <MapPin className="w-5 h-5 text-green-400" />
          Where to Try This
        </h3>
        <div className="space-y-2">
          {challenge.whereToTry?.map((location, index) => (
            <div key={index} className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'}`}>
              <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
              <span className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                {location}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Success Indicators */}
      <div className="mb-6">
        <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          How You'll Know You Succeeded
        </h3>
        <div className="space-y-2">
          {challenge.successIndicators?.map((indicator, index) => (
            <div key={index} className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className={`text-sm ${darkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
                {indicator}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="mb-8">
        <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          Pro Tips
        </h3>
        <div className="space-y-2">
          {challenge.tips?.map((tip, index) => (
            <div key={index} className={`flex items-start gap-3 p-3 rounded-xl ${darkMode ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
              <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                {tip}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => handleAction(onAccept)}
          disabled={isProcessing}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-4 px-6 rounded-full hover:shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-5 h-5" />
          {isProcessing ? 'Accepting...' : 'Accept Challenge'}
        </button>
        <button
          onClick={() => handleAction(onTryLater)}
          disabled={isProcessing}
          className={`flex-1 font-bold py-4 px-6 rounded-full border-2 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            darkMode 
              ? 'border-white/20 text-white hover:bg-white/10' 
              : 'border-gray-300 text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-5 h-5" />
          Try Later
        </button>
        <button
          onClick={() => handleAction(onSkip)}
          disabled={isProcessing}
          className={`flex-1 font-bold py-4 px-6 rounded-full border-2 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            darkMode 
              ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' 
              : 'border-red-300 text-red-600 hover:bg-red-50'
          }`}
        >
          <XCircle className="w-5 h-5" />
          Skip
        </button>
      </div>
    </div>
  );
}

export default RealWorldChallengeCard;
