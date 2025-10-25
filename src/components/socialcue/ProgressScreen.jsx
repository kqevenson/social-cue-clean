import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, Users, Clock, CheckCircle, Star, BookOpen, Calendar } from 'lucide-react';
import { getUserData } from './utils/storage';

function ProgressScreen({ userData, darkMode, onNavigate }) {
  const [masteryData, setMasteryData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set basic demo data (no API calls)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const sixDaysAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setMasteryData({
      summary: {
        totalTopics: 8,
        completedTopics: 2,
        averageMastery: 45,
        topicsInProgress: 6
      },
      topics: [
        {
          topicId: '1',
          topicName: 'Small Talk Basics',
          masteryLevel: 85,
          difficultyLevel: 3,
          accuracyRate: 78,
          timeSpent: 120,
          isCompleted: true,
          lastPracticed: today
        },
        {
          topicId: '2',
          topicName: 'Active Listening',
          masteryLevel: 65,
          difficultyLevel: 2,
          accuracyRate: 72,
          timeSpent: 95,
          isCompleted: false,
          lastPracticed: yesterday
        },
        {
          topicId: '3',
          topicName: 'Reading Body Language',
          masteryLevel: 40,
          difficultyLevel: 2,
          accuracyRate: 65,
          timeSpent: 60,
          isCompleted: false,
          lastPracticed: twoDaysAgo
        },
        {
          topicId: '4',
          topicName: 'Building Confidence',
          masteryLevel: 30,
          difficultyLevel: 1,
          accuracyRate: 58,
          timeSpent: 45,
          isCompleted: false,
          lastPracticed: threeDaysAgo
        },
        {
          topicId: '5',
          topicName: 'Conflict Resolution',
          masteryLevel: 25,
          difficultyLevel: 1,
          accuracyRate: 55,
          timeSpent: 30,
          isCompleted: false,
          lastPracticed: fourDaysAgo
        },
        {
          topicId: '6',
          topicName: 'Teamwork',
          masteryLevel: 20,
          difficultyLevel: 1,
          accuracyRate: 52,
          timeSpent: 25,
          isCompleted: false,
          lastPracticed: fiveDaysAgo
        },
        {
          topicId: '7',
          topicName: 'Empathy',
          masteryLevel: 15,
          difficultyLevel: 1,
          accuracyRate: 48,
          timeSpent: 20,
          isCompleted: false,
          lastPracticed: sixDaysAgo
        },
        {
          topicId: '8',
          topicName: 'Assertiveness',
          masteryLevel: 10,
          difficultyLevel: 1,
          accuracyRate: 45,
          timeSpent: 15,
          isCompleted: false,
          lastPracticed: weekAgo
        }
      ]
    });
    setLoading(false);
  }, []);

  // Helper functions
  const getDifficultyLabel = (level) => {
    const labels = {
      1: 'Beginner',
      2: 'Developing', 
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert'
    };
    return labels[level] || 'Unknown';
  };

  const getDifficultyColor = (level) => {
    const colors = {
      1: darkMode ? 'text-green-400' : 'text-green-600',
      2: darkMode ? 'text-blue-400' : 'text-blue-600', 
      3: darkMode ? 'text-yellow-400' : 'text-yellow-600',
      4: darkMode ? 'text-orange-400' : 'text-orange-600',
      5: darkMode ? 'text-red-400' : 'text-red-600'
    };
    return colors[level] || darkMode ? 'text-gray-400' : 'text-gray-600';
  };

  const formatTimeSpent = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMasteryColor = (level) => {
    if (level >= 80) return 'text-green-400';
    if (level >= 60) return 'text-blue-400';
    if (level >= 40) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getProgressBarColor = (level) => {
    if (level >= 80) return 'from-green-500 to-emerald-500';
    if (level >= 60) return 'from-blue-500 to-cyan-500';
    if (level >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  if (loading) {
    return (
      <div className="pb-24 px-6 py-8">
        <div className="text-center py-12">
          <div className="w-8 h-8 mx-auto mb-3 relative">
            <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Loading Progress...
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Getting your learning data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-6 py-8">
      <h1 className={`text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Progress Dashboard
      </h1>
      
      {/* Basic Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
          darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Total Topics
            </span>
          </div>
          <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {masteryData?.summary?.totalTopics || 0}
          </div>
        </div>
        
        <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
          darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Completed
            </span>
          </div>
          <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {masteryData?.summary?.completedTopics || 0}
          </div>
        </div>
        
        <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
          darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Avg Mastery
            </span>
          </div>
          <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {masteryData?.summary?.averageMastery || 0}%
          </div>
        </div>
        
        <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
          darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-orange-400" />
            <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              In Progress
            </span>
          </div>
          <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {masteryData?.summary?.topicsInProgress || 0}
          </div>
        </div>
      </div>

      {/* Topic Mastery List */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
        darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Topic Mastery
          </h2>
        </div>
        
        <div className="space-y-4">
          {masteryData?.topics?.sort((a, b) => b.masteryLevel - a.masteryLevel).map((topic) => (
            <div key={topic.topicId} className={`p-4 rounded-xl border ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    topic.isCompleted ? 'bg-emerald-500/20' : 'bg-blue-500/20'
                  }`}>
                    {topic.isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Star className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {topic.topicName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                      }`}>
                        Level {topic.difficultyLevel}: {getDifficultyLabel(topic.difficultyLevel)}
                      </span>
                      {topic.isCompleted && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                          COMPLETED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getMasteryColor(topic.masteryLevel)}`}>
                    {topic.masteryLevel}%
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Mastery Level
                  </div>
                </div>
              </div>

              {/* Simple Progress Bar */}
              <div className="mb-3">
                <div className={`w-full h-2 rounded-full ${
                  darkMode ? 'bg-white/10' : 'bg-gray-200'
                }`}>
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${getProgressBarColor(topic.masteryLevel)}`}
                    style={{ width: `${topic.masteryLevel}%` }}
                  />
                </div>
              </div>

              {/* Basic Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Accuracy
                    </span>
                  </div>
                  <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {topic.accuracyRate}%
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Time Spent
                    </span>
                  </div>
                  <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatTimeSpent(topic.timeSpent)}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="w-4 h-4 text-green-400" />
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Last Practice
                    </span>
                  </div>
                  <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(topic.lastPracticed)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Stats */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
        darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Your Stats
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent mb-2">
              {userData?.streak || 0}
            </div>
            <div className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Day Streak
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent mb-2">
              {userData?.totalSessions || 0}
            </div>
            <div className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Total Sessions
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent mb-2">
              {userData?.confidenceScore || 0}%
            </div>
            <div className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Confidence
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressScreen;