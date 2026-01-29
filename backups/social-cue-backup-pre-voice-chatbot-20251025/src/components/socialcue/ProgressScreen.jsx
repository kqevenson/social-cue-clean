import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, Users, Clock, CheckCircle, Star, BookOpen, Calendar, History, ChevronDown, ChevronRight, Filter, Play } from 'lucide-react';
import { getUserData } from './utils/storage';
import SessionReplayModal from './SessionReplayModal';

function ProgressScreen({ userData, darkMode, onNavigate }) {
  const [masteryData, setMasteryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [showReplayModal, setShowReplayModal] = useState(false);

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

  // Fetch session history
  const fetchSessionHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      
      const currentUserData = getUserData();
      const userId = currentUserData.userId || 'guest_' + Date.now();
      
      console.log('📚 Fetching session history for user:', userId);
      
      const response = await fetch(`http://localhost:3001/api/adaptive/session-history/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.sessions) {
        console.log('✅ Session history received:', data.sessions.length, 'sessions');
        // Sort by most recent first and limit to 20
        const sortedSessions = data.sessions
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 20);
        setSessionHistory(sortedSessions);
      } else {
        console.log('ℹ️ No session history found, using demo data');
        // Use demo data for new users
        setSessionHistory([
          {
            sessionId: 'demo-1',
            topicName: 'Small Talk Basics',
            date: new Date().toISOString(),
            accuracy: 80,
            correctAnswers: 4,
            totalQuestions: 5,
            duration: 8,
            difficultyLevel: 2,
            scenarios: [
              { correct: true, question: 'How to start a conversation' },
              { correct: true, question: 'Asking about someone\'s day' },
              { correct: false, question: 'Handling awkward silence' },
              { correct: true, question: 'Ending a conversation politely' },
              { correct: true, question: 'Following up on shared interests' }
            ]
          },
          {
            sessionId: 'demo-2',
            topicName: 'Active Listening',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            accuracy: 60,
            correctAnswers: 3,
            totalQuestions: 5,
            duration: 12,
            difficultyLevel: 2,
            scenarios: [
              { correct: true, question: 'Showing you\'re paying attention' },
              { correct: false, question: 'Asking follow-up questions' },
              { correct: true, question: 'Avoiding interrupting' },
              { correct: false, question: 'Reflecting back what you heard' },
              { correct: true, question: 'Maintaining eye contact' }
            ]
          },
          {
            sessionId: 'demo-3',
            topicName: 'Building Confidence',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            accuracy: 40,
            correctAnswers: 2,
            totalQuestions: 5,
            duration: 15,
            difficultyLevel: 1,
            scenarios: [
              { correct: false, question: 'Speaking up in group settings' },
              { correct: true, question: 'Making eye contact' },
              { correct: false, question: 'Trying new social activities' },
              { correct: false, question: 'Asking for help when needed' },
              { correct: true, question: 'Celebrating small wins' }
            ]
          }
        ]);
      }
    } catch (err) {
      console.error('❌ Error fetching session history:', err);
      setHistoryError(err.message);
      
      // Fallback to demo data
      setSessionHistory([
        {
          sessionId: 'fallback-1',
          topicName: 'Small Talk Basics',
          date: new Date().toISOString(),
          accuracy: 80,
          correctAnswers: 4,
          totalQuestions: 5,
          duration: 8,
          difficultyLevel: 2,
          scenarios: [
            { correct: true, question: 'How to start a conversation' },
            { correct: true, question: 'Asking about someone\'s day' },
            { correct: false, question: 'Handling awkward silence' },
            { correct: true, question: 'Ending a conversation politely' },
            { correct: true, question: 'Following up on shared interests' }
          ]
        }
      ]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch session history when component mounts
  useEffect(() => {
    fetchSessionHistory();
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

  // Helper functions for session history
  const formatSessionDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 70) return darkMode ? 'text-green-400' : 'text-green-600';
    if (accuracy >= 50) return darkMode ? 'text-yellow-400' : 'text-yellow-600';
    return darkMode ? 'text-red-400' : 'text-red-600';
  };

  const getAccuracyBgColor = (accuracy) => {
    if (accuracy >= 70) return darkMode ? 'bg-green-500/20 border-green-500/30' : 'bg-green-50 border-green-200';
    if (accuracy >= 50) return darkMode ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200';
    return darkMode ? 'bg-red-500/20 border-red-500/30' : 'bg-red-50 border-red-200';
  };

  const toggleSessionExpansion = (sessionId) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  const handleReplaySession = (sessionId, event) => {
    event.stopPropagation(); // Prevent expanding the session card
    setSelectedSessionId(sessionId);
    setShowReplayModal(true);
  };

  const handleCloseReplayModal = () => {
    setShowReplayModal(false);
    setSelectedSessionId(null);
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
      <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
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

      {/* Session History Section */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
        darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-purple-400" />
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Session History
            </h2>
            <span className={`text-sm px-2 py-1 rounded-full ${
              darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
            }`}>
              {sessionHistory.length} sessions
            </span>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {showHistory ? (
              <>
                <ChevronDown className="w-4 h-4" />
                <span className="text-sm font-medium">Hide</span>
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4" />
                <span className="text-sm font-medium">Show</span>
              </>
            )}
          </button>
        </div>

        {showHistory && (
          <>
            {historyLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 mx-auto mb-3 relative">
                  <div className="absolute inset-0 border-2 border-purple-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-2 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loading session history...
                </p>
              </div>
            ) : historyError ? (
              <div className={`text-center py-8 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                <p className="text-sm">Error loading session history: {historyError}</p>
                <button
                  onClick={fetchSessionHistory}
                  className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : sessionHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  No practice history yet
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Complete your first lesson to see your progress here
                </p>
                <button
                  onClick={() => onNavigate('lessons')}
                  className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Start Your First Lesson
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sessionHistory.map((session) => (
                  <div
                    key={session.sessionId}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      expandedSession === session.sessionId
                        ? darkMode ? 'bg-white/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'
                        : darkMode ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleSessionExpansion(session.sessionId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          session.accuracy >= 70 ? 'bg-green-500/20' : 
                          session.accuracy >= 50 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                        }`}>
                          <BookOpen className={`w-4 h-4 ${
                            session.accuracy >= 70 ? 'text-green-400' : 
                            session.accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {session.topicName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatSessionDate(session.date)}
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                            }`}>
                              Level {session.difficultyLevel}: {getDifficultyLabel(session.difficultyLevel)}
                            </span>
                            {session.duration && (
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {session.duration}m
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-xl font-bold ${getAccuracyColor(session.accuracy)}`}>
                          {session.correctAnswers}/{session.totalQuestions} ({session.accuracy}%)
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={(e) => handleReplaySession(session.sessionId, e)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              darkMode 
                                ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400' 
                                : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
                            }`}
                          >
                            <Play className="w-3 h-3" />
                            Replay
                          </button>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {expandedSession === session.sessionId ? 'Click to collapse' : 'Click to expand'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Session Details */}
                    {expandedSession === session.sessionId && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <h4 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Scenario Breakdown:
                        </h4>
                        <div className="space-y-2">
                          {session.scenarios?.map((scenario, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                scenario.correct ? 'bg-green-500/20' : 'bg-red-500/20'
                              }`}>
                                {scenario.correct ? (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-red-400" />
                                )}
                              </div>
                              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {scenario.question}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Session Replay Modal */}
      <SessionReplayModal
        sessionId={selectedSessionId}
        isOpen={showReplayModal}
        onClose={handleCloseReplayModal}
        darkMode={darkMode}
      />
    </div>
  );
}

export default ProgressScreen;