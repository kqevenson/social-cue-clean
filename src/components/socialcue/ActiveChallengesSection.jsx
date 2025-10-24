import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Calendar, Target, Star, AlertCircle } from 'lucide-react';
import { challengeService } from '../../services/challengeService';
import { getUserData } from './utils/storage';

const ActiveChallengesSection = ({ darkMode = false }) => {
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadActiveChallenges();
  }, []);

  const loadActiveChallenges = () => {
    try {
      const currentUserData = getUserData();
      setUserData(currentUserData);
      
      const userId = currentUserData.userId || 'guest_' + Date.now();
      const challenges = challengeService.updateDaysRemaining(userId);
      
      setActiveChallenges(challenges);
      setLoading(false);
    } catch (error) {
      console.error('Error loading active challenges:', error);
      setLoading(false);
    }
  };

  const handleCompleteChallenge = async (challengeId) => {
    try {
      const userId = userData.userId || 'guest_' + Date.now();
      await challengeService.completeChallenge(challengeId, userId);
      
      // Update local state
      setActiveChallenges(prev => prev.filter(c => c.id !== challengeId));
      
      // Show success message
      alert('Great job! Challenge completed! 🎉');
    } catch (error) {
      console.error('Error completing challenge:', error);
      alert('Error completing challenge. Please try again.');
    }
  };

  const getDaysRemainingColor = (daysRemaining) => {
    if (daysRemaining <= 1) return 'text-red-400';
    if (daysRemaining <= 3) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getDaysRemainingText = (daysRemaining) => {
    if (daysRemaining <= 0) return 'Expired';
    if (daysRemaining === 1) return '1 day left';
    return `${daysRemaining} days left`;
  };

  if (loading) {
    return (
      <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
        darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🎯 Active Challenges
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-3 relative">
              <div className="absolute inset-0 border-2 border-purple-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading challenges...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!activeChallenges || activeChallenges.length === 0) {
    return (
      <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
        darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🎯 Active Challenges
          </h2>
        </div>
        
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            No Active Challenges
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Complete lessons to get personalized real-world challenges!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
      darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🎯 Active Challenges
          </h2>
        </div>
        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {activeChallenges.length} active
        </span>
      </div>

      <div className="space-y-4">
        {activeChallenges.map((challenge, index) => (
          <div 
            key={challenge.id}
            className={`p-4 rounded-xl border ${
              darkMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className={`font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {challenge.title}
                </h3>
                <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {challenge.description}
                </p>
                
                {/* Challenge Details */}
                <div className="flex items-center gap-4 text-xs">
                  {challenge.topicName && (
                    <span className={`px-2 py-1 rounded ${
                      darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {challenge.topicName}
                    </span>
                  )}
                  
                  {challenge.estimatedDifficulty && (
                    <span className={`px-2 py-1 rounded ${
                      challenge.estimatedDifficulty.toLowerCase() === 'easy' 
                        ? (darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700')
                        : challenge.estimatedDifficulty.toLowerCase() === 'moderate'
                        ? (darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700')
                        : (darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700')
                    }`}>
                      {challenge.estimatedDifficulty}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Days Remaining */}
              <div className="text-right">
                <div className={`text-sm font-semibold ${getDaysRemainingColor(challenge.daysRemaining)}`}>
                  {getDaysRemainingText(challenge.daysRemaining)}
                </div>
                {challenge.daysRemaining <= 1 && challenge.daysRemaining > 0 && (
                  <div className="flex items-center gap-1 text-red-400 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>Due soon!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex gap-2">
              <button
                onClick={() => handleCompleteChallenge(challenge.id)}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Complete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveChallengesSection;
