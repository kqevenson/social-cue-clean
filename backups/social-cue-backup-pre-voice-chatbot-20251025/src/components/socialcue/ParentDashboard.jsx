import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Calendar, 
  Download, 
  Eye, 
  MessageCircle, 
  Star,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen,
  Activity,
  BarChart3,
  Lightbulb,
  Heart,
  ArrowRight
} from 'lucide-react';

const ParentDashboard = ({ childUserId, darkMode }) => {
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  useEffect(() => {
    if (childUserId) {
      fetchAnalytics();
      fetchInsights();
    }
  }, [childUserId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/adaptive/analytics/${childUserId}`);
      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.analytics);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load child progress data');
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/adaptive/progress-insights/${childUserId}`);
      const result = await response.json();
      
      if (result.success) {
        setInsights(result.insights);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const downloadProgressReport = () => {
    if (!analytics) return;
    
    const reportData = {
      childName: analytics.learnerProfile.name,
      gradeLevel: analytics.learnerProfile.gradeLevel,
      reportDate: new Date().toLocaleDateString(),
      progressSummary: analytics.progressSummary,
      learningStats: analytics.learningStats,
      strengths: analytics.strengths,
      growthAreas: analytics.growthAreas,
      topicMastery: analytics.topicMastery
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${analytics.learnerProfile.name}_progress_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'practice_session':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'challenge_completed':
        return <Award className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMasteryColor = (level) => {
    if (level >= 80) return 'text-green-500';
    if (level >= 50) return 'text-yellow-500';
    if (level > 0) return 'text-orange-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading your child's progress...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Unable to Load Progress</h2>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
            <button 
              onClick={fetchAnalytics}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Data Available</h2>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Your child hasn't started practicing yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Parent Dashboard</h1>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {analytics.learnerProfile.name}'s Learning Progress
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={downloadProgressReport}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  darkMode 
                    ? 'border-white/20 text-white hover:bg-white/10' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
          
          {/* Child Info */}
          <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
            darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {analytics.learnerProfile.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{analytics.learnerProfile.name}</h3>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Grade {analytics.learnerProfile.gradeLevel} • Level {analytics.learnerProfile.currentLevel}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-500">{analytics.learnerProfile.totalPoints}</div>
                <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
            darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-green-500">
                {analytics.progressSummary.masteryPercentage}%
              </span>
            </div>
            <h3 className="font-bold mb-1">Mastery Progress</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {analytics.progressSummary.masteredTopics} of {analytics.progressSummary.totalTopics} topics mastered
            </p>
          </div>

          <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
            darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-blue-500">
                {analytics.learningStats.totalTimeSpent}h
              </span>
            </div>
            <h3 className="font-bold mb-1">Time Spent</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {analytics.learningStats.totalSessions} practice sessions
            </p>
          </div>

          <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
            darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-purple-500">
                {analytics.learningStats.averageAccuracy}%
              </span>
            </div>
            <h3 className="font-bold mb-1">Average Accuracy</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {analytics.learningStats.practiceFrequency}% practice frequency
            </p>
          </div>

          <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
            darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-yellow-500">
                {analytics.learningStats.completedChallenges}
              </span>
            </div>
            <h3 className="font-bold mb-1">Challenges Completed</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {analytics.learningStats.activeChallenges} active challenges
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Strengths & Growth Areas */}
          <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
            darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
          }`}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Strengths & Growth Areas
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-green-500 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Strengths
                </h4>
                <div className="space-y-2">
                  {analytics.strengths.length > 0 ? (
                    analytics.strengths.map((strength, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        darkMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
                      }`}>
                        <span className="font-medium">{strength}</span>
                      </div>
                    ))
                  ) : (
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No strengths identified yet</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-orange-500 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Growth Areas
                </h4>
                <div className="space-y-2">
                  {analytics.growthAreas.length > 0 ? (
                    analytics.growthAreas.map((area, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        darkMode ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-orange-50 border border-orange-200'
                      }`}>
                        <span className="font-medium">{area}</span>
                      </div>
                    ))
                  ) : (
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No growth areas identified yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
            darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
          }`}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" />
              Recent Activity
            </h3>
            
            <div className="space-y-3">
              {analytics.recentActivity.length > 0 ? (
                analytics.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                    darkMode ? 'bg-white/5' : 'bg-gray-50'
                  }`}>
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <div className="font-medium">
                        {activity.type === 'practice_session' 
                          ? `Practiced ${activity.topic}` 
                          : `Completed: ${activity.title}`
                        }
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDate(activity.date)}
                        {activity.score && ` • ${activity.score}% accuracy`}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Topic Mastery */}
        <div className={`backdrop-blur-xl border rounded-2xl p-6 mt-8 ${
          darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
        }`}>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-500" />
            Topic Mastery Progress
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.topicMastery.map((topic, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                darkMode ? 'border-white/10' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{topic.topicName}</h4>
                  <span className={`font-bold ${getMasteryColor(topic.masteryLevel)}`}>
                    {topic.masteryLevel}%
                  </span>
                </div>
                <div className={`w-full bg-gray-200 rounded-full h-2 mb-2 ${
                  darkMode ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${topic.masteryLevel}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Level {topic.difficultyLevel}
                  </span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {topic.sessionsCompleted} sessions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        {insights && (
          <div className={`backdrop-blur-xl border rounded-2xl p-6 mt-8 ${
            darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
          }`}>
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-500" />
              AI-Generated Insights
            </h3>
            
            <div className="space-y-6">
              {insights.parentTip && (
                <div className={`p-4 rounded-lg ${
                  darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <h4 className="font-bold text-blue-500 mb-2 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Parent Tip
                  </h4>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {insights.parentTip}
                  </p>
                </div>
              )}

              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
              }`}>
                <h4 className="font-bold text-green-500 mb-2 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Conversation Starters
                </h4>
                <div className="space-y-2">
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    "Tell me about a social situation you practiced today. What did you learn?"
                  </p>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    "I noticed you're doing great with {analytics.strengths[0] || 'your practice'}. What makes you feel confident about that?"
                  </p>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                    "What's something you'd like to practice more? How can I help you at home?"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
