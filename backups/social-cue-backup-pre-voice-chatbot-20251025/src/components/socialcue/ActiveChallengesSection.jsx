import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { challengeService } from '../../services/challengeService';
import { getUserData } from './utils/storage';
import ChallengeCard from './ChallengeCard';

const ActiveChallengesSection = ({ darkMode = false }) => {
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadActiveChallenges();
  }, []);

  const loadActiveChallenges = async () => {
    try {
      const currentUserData = getUserData();
      setUserData(currentUserData);
      
      const userId = currentUserData.userId || 'guest_' + Date.now();
      
      // Try to fetch from backend API first
      const challenges = await challengeService.fetchActiveChallenges(userId);
      
      setActiveChallenges(challenges);
      setLoading(false);
    } catch (error) {
      console.error('Error loading active challenges:', error);
      setLoading(false);
    }
  };

  const handleCompleteChallenge = async (challengeId, notes = '') => {
    try {
      const userId = userData.userId || 'guest_' + Date.now();
      
      // Try API first, fallback to localStorage
      await challengeService.completeChallengeAPI(challengeId, userId, notes);
      
      // Update local state
      setActiveChallenges(prev => prev.filter(c => c.id !== challengeId));
      
      // Show success message
      alert('Great job! Challenge completed! 🎉');
    } catch (error) {
      console.error('Error completing challenge:', error);
      alert('Error completing challenge. Please try again.');
    }
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
            Active Challenges
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
            Active Challenges
          </h2>
        </div>
        
        <div className="text-center py-8">
          <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            No Active Challenges
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Complete lessons to get personalized real-world challenges!
          </p>
          <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            ✨ Challenges help you practice skills in real life
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
      darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Active Challenges
          </h2>
        </div>
        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {activeChallenges.length} active
        </span>
      </div>

      <div className="space-y-4">
        {activeChallenges.slice(0, 3).map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onComplete={handleCompleteChallenge}
            darkMode={darkMode}
          />
        ))}
      </div>
    </div>
  );
};

export default ActiveChallengesSection;