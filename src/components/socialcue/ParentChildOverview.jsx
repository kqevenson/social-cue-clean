import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Calendar, 
  Users,
  BookOpen,
  Activity,
  BarChart3,
  Lightbulb,
  Heart,
  MessageCircle,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ParentChildOverview = ({ childUserId, darkMode, onNavigate }) => {
  const [childData, setChildData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (childUserId) {
      fetchChildData();
    }
  }, [childUserId]);

  const fetchChildData = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics data
      const analyticsResponse = await fetch(`http://localhost:3001/api/adaptive/analytics/${childUserId}`);
      const analyticsResult = await analyticsResponse.json();
      
      if (analyticsResult.success) {
        console.log('Analytics data loaded:', analyticsResult.analytics); // DEBUG
        setAnalytics(analyticsResult.analytics);
        setChildData(analyticsResult.analytics.learnerProfile);
        console.log('Child data set:', analyticsResult.analytics.learnerProfile); // DEBUG
      } else {
        console.log('Analytics fetch failed:', analyticsResult); // DEBUG
      }
      
      // Fetch insights
      const insightsResponse = await fetch(`http://localhost:3001/api/adaptive/progress-insights/${childUserId}`);
      const insightsResult = await insightsResponse.json();
      
      if (insightsResult.success) {
        setInsights(insightsResult.insights);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching child data:', error);
      setError('Failed to load child data');
      setLoading(false);
    }
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
              onClick={fetchChildData}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!childData || !analytics) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Child Data Available</h2>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Please check the child ID and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header - Single Row with 3 Aligned Sections */}
        <div className="mb-8 pt-4">
          <div className="flex items-center justify-between">
            
            {/* LEFT - EXACT WORDMARK CODE FROM LEARNER HOMEPAGE */}
            <div className="flex items-center justify-center" style={{letterSpacing: '-2px'}}>
              <span className={`font-extrabold text-5xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>Social</span>
              <span className={`font-extrabold text-5xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{marginRight: '6px'}}>C</span>
              <div className="flex flex-col items-center justify-center" style={{marginBottom: '7px', height: '62px', gap: '10px'}}>
                <div className="flex smile-eyes" style={{gap: '16px'}}>
                  <div className="rounded-full" style={{width: '7px', height: '7px', background: '#4A90E2'}}></div>
                  <div className="rounded-full" style={{width: '7px', height: '7px', background: '#4A90E2'}}></div>
                </div>
                <div className="smile-mouth" style={{
                  width: '35px',
                  height: '22px',
                  borderLeft: '5px solid #34D399',
                  borderRight: '5px solid #34D399',
                  borderBottom: '5px solid #34D399',
                  borderTop: 'none',
                  borderRadius: '0 0 17px 17px'
                }}></div>
              </div>
              <span className={`font-extrabold text-5xl ${darkMode ? 'text-white' : 'text-gray-900'}`} style={{marginLeft: '6px'}}>e</span>
            </div>

            {/* CENTER - Parent Portal (INCREASED SIZE) */}
            <div className="text-4xl font-bold text-white text-center">
              Parent Portal
            </div>

            {/* RIGHT - Child's Progress (INCREASED SIZE) */}
            <div className="text-4xl font-bold text-white text-right">
              {childData?.userName || 'Alex'}'s Progress
            </div>

          </div>
        </div>

        {/* Child Info Card */}
        <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
          darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {childData.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold">{childData.name}</h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Grade {childData.gradeLevel} • Level {childData.currentLevel}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-500">{childData.totalPoints}</div>
              <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total Points</div>
            </div>
          </div>
        </div>

        {/* Today's Activity Summary */}
        <section className="mb-8">
          <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
            darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Today's Activity
            </h2>
            {analytics.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {analytics.recentActivity.slice(0, 3).map((activity, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
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
                ))}
              </div>
            ) : (
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                No practice sessions yet today
              </p>
            )}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-3 gap-4">
            <div className={`backdrop-blur-xl border rounded-xl p-4 text-center ${
              darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
            }`}>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                {childData.streak || 0}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Day Streak
              </div>
            </div>
            <div className={`backdrop-blur-xl border rounded-xl p-4 text-center ${
              darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
            }`}>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                {analytics.learningStats.totalSessions || 0}
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                This Week
              </div>
            </div>
            <div className={`backdrop-blur-xl border rounded-xl p-4 text-center ${
              darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
            }`}>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                {analytics.progressSummary.masteryPercentage || 0}%
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Mastery
              </div>
            </div>
          </div>
        </section>

        {/* AI Insights for Parents */}
        <section className="mb-8">
          <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
            darkMode ? 'bg-gradient-to-br from-blue-500/10 to-emerald-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
          }`}>
            <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💡 Parent Insights
            </h2>
            <div className="space-y-3">
              {analytics.strengths.length > 0 && (
                <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>Strength:</strong> {childData.name} excels at {analytics.strengths[0]}.
                </p>
              )}
              {analytics.growthAreas.length > 0 && (
                <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>Focus Area:</strong> Practice {analytics.growthAreas[0]} during daily conversations.
                </p>
              )}
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                <strong>This Week:</strong> Great consistency! Encourage {childData.name} to keep up the daily practice.
              </p>
            </div>
          </div>
        </section>

        {/* Recent Activity Timeline */}
        {analytics.recentActivity.length > 0 && (
          <section className="mb-8">
            <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
              darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Recent Activity
              </h2>
              <div className="space-y-3">
                {analytics.recentActivity.slice(0, 5).map((activity, index) => (
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
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

    </div>
  );
};

export default ParentChildOverview;
