import React, { useState, useEffect } from 'react';
import { Sparkles, Play, TrendingUp, Award, Target, Users, Zap, Clock, CheckCircle, Star, BookOpen, Calendar, ArrowUp, ArrowDown, Minus, Trophy, Lightbulb, ArrowRight } from 'lucide-react';
import { getUserData } from './utils/storage';
import { DifficultyBadge } from './utils/difficultyLevels.jsx';
import { 
  AnimatedProgressBar, 
  AnimatedChart, 
  AnimatedStatCard, 
  AnimatedLineChart, 
  DashboardSkeleton 
} from './animations';

function ProgressScreen({ userData, darkMode }) {
  const [masteryData, setMasteryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState(null);

  // Fetch mastery dashboard data
  // COMMENT OUT API CALLS FOR NOW - Backend not ready
  /*
  useEffect(() => {
    const fetchMasteryData = async () => {
      try {
        setLoading(true);
        const currentUserData = getUserData();
        const userId = currentUserData.userId || 'guest_' + Date.now();
        
        console.log('📊 Fetching mastery dashboard for user:', userId);
        
        const response = await fetch(`http://localhost:3001/api/adaptive/mastery-dashboard/${userId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          // Handle "Learner profile not found" as a normal case, not an error
          if (data.error === 'Learner profile not found') {
            console.log('ℹ️ No learner profile found, using demo data');
            setError(null); // Clear any previous errors
            // Use fallback data for new users
            setMasteryData({
              summary: {
                totalTopics: 8,
                completedTopics: 0,
                averageMastery: 0,
                topicsInProgress: 8
              },
              topics: [
                {
                  topicId: '1',
                  topicName: 'Small Talk Basics',
                  masteryLevel: 0,
                  difficultyLevel: 1,
                  accuracyRate: 0,
                  timeSpent: 0,
                  isCompleted: false,
                  lastPracticed: 'Never'
                },
                {
                  topicId: '2',
                  topicName: 'Active Listening',
                  masteryLevel: 0,
                  difficultyLevel: 1,
                  accuracyRate: 0,
                  timeSpent: 0,
                  isCompleted: false,
                  lastPracticed: 'Never'
                },
                {
                  topicId: '3',
                  topicName: 'Reading Body Language',
                  masteryLevel: 0,
                  difficultyLevel: 1,
                  accuracyRate: 0,
                  timeSpent: 0,
                  isCompleted: false,
                  lastPracticed: 'Never'
                },
                {
                  topicId: '4',
                  topicName: 'Building Confidence',
                  masteryLevel: 0,
                  difficultyLevel: 1,
                  accuracyRate: 0,
                  timeSpent: 0,
                  isCompleted: false,
                  lastPracticed: 'Never'
                },
                {
                  topicId: '5',
                  topicName: 'Conflict Resolution',
                  masteryLevel: 0,
                  difficultyLevel: 1,
                  accuracyRate: 0,
                  timeSpent: 0,
                  isCompleted: false,
                  lastPracticed: 'Never'
                },
                {
                  topicId: '6',
                  topicName: 'Teamwork',
                  masteryLevel: 0,
                  difficultyLevel: 1,
                  accuracyRate: 0,
                  timeSpent: 0,
                  isCompleted: false,
                  lastPracticed: 'Never'
                },
                {
                  topicId: '7',
                  topicName: 'Empathy',
                  masteryLevel: 0,
                  difficultyLevel: 1,
                  accuracyRate: 0,
                  timeSpent: 0,
                  isCompleted: false,
                  lastPracticed: 'Never'
                },
                {
                  topicId: '8',
                  topicName: 'Assertiveness',
                  masteryLevel: 0,
                  difficultyLevel: 1,
                  accuracyRate: 0,
                  timeSpent: 0,
                  isCompleted: false,
                  lastPracticed: 'Never'
                }
              ]
            });
            return;
          }
          // For other errors, throw as before
          throw new Error(data.error || 'Failed to fetch mastery data');
        }
        
        console.log('✅ Mastery dashboard data received:', data);
        setMasteryData(data.dashboard);
        
      } catch (err) {
        console.error('❌ Error fetching mastery dashboard:', err);
        setError(err.message);
        
        // COMMENTED OUT: Fallback data with fake 2024 dates
        /*
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
              timeSpent: 120, // minutes
              isCompleted: true,
              lastPracticed: '2024-01-15'
            },
            {
              topicId: '2',
              topicName: 'Active Listening',
              masteryLevel: 65,
              difficultyLevel: 2,
              accuracyRate: 72,
              timeSpent: 95,
              isCompleted: false,
              lastPracticed: '2024-01-14'
            },
            {
              topicId: '3',
              topicName: 'Reading Body Language',
              masteryLevel: 40,
              difficultyLevel: 2,
              accuracyRate: 65,
              timeSpent: 60,
              isCompleted: false,
              lastPracticed: '2024-01-12'
            },
            {
              topicId: '4',
              topicName: 'Building Confidence',
              masteryLevel: 30,
              difficultyLevel: 1,
              accuracyRate: 58,
              timeSpent: 45,
              isCompleted: false,
              lastPracticed: '2024-01-10'
            },
            {
              topicId: '5',
              topicName: 'Conflict Resolution',
              masteryLevel: 25,
              difficultyLevel: 1,
              accuracyRate: 55,
              timeSpent: 30,
              isCompleted: false,
              lastPracticed: '2024-01-08'
            },
            {
              topicId: '6',
              topicName: 'Teamwork',
              masteryLevel: 20,
              difficultyLevel: 1,
              accuracyRate: 52,
              timeSpent: 25,
              isCompleted: false,
              lastPracticed: '2024-01-05'
            },
            {
              topicId: '7',
              topicName: 'Empathy',
              masteryLevel: 15,
              difficultyLevel: 1,
              accuracyRate: 48,
              timeSpent: 20,
              isCompleted: false,
              lastPracticed: '2024-01-03'
            },
            {
              topicId: '8',
              topicName: 'Assertiveness',
              masteryLevel: 10,
              difficultyLevel: 1,
              accuracyRate: 45,
              timeSpent: 15,
              isCompleted: false,
              lastPracticed: '2024-01-01'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMasteryData();
  }, []);

  // Set default data for demo purposes (no API calls)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
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
          timeSpent: 120, // minutes
          isCompleted: true,
          lastPracticed: today // Use today's date
        },
        {
          topicId: '2',
          topicName: 'Active Listening',
          masteryLevel: 65,
          difficultyLevel: 2,
          accuracyRate: 72,
          timeSpent: 95,
          isCompleted: false,
          lastPracticed: yesterday // Use yesterday's date
        },
        {
          topicId: '3',
          topicName: 'Reading Body Language',
          masteryLevel: 40,
          difficultyLevel: 2,
          accuracyRate: 65,
          timeSpent: 60,
          isCompleted: false,
          lastPracticed: twoDaysAgo // Use 2 days ago
        },
        {
          topicId: '4',
          topicName: 'Building Confidence',
          masteryLevel: 30,
          difficultyLevel: 1,
          accuracyRate: 58,
          timeSpent: 45,
          isCompleted: false,
          lastPracticed: threeDaysAgo // Use 3 days ago
        },
        {
          topicId: '5',
          topicName: 'Conflict Resolution',
          masteryLevel: 25,
          difficultyLevel: 1,
          accuracyRate: 55,
          timeSpent: 30,
          isCompleted: false,
          lastPracticed: fourDaysAgo // Use 4 days ago
        },
        {
          topicId: '6',
          topicName: 'Teamwork',
          masteryLevel: 20,
          difficultyLevel: 1,
          accuracyRate: 52,
          timeSpent: 25,
          isCompleted: false,
          lastPracticed: fiveDaysAgo // Use 5 days ago
        },
        {
          topicId: '7',
          topicName: 'Empathy',
          masteryLevel: 15,
          difficultyLevel: 1,
          accuracyRate: 48,
          timeSpent: 20,
          isCompleted: false,
          lastPracticed: sixDaysAgo // Use 6 days ago
        },
        {
          topicId: '8',
          topicName: 'Assertiveness',
          masteryLevel: 10,
          difficultyLevel: 1,
          accuracyRate: 45,
          timeSpent: 15,
          isCompleted: false,
          lastPracticed: weekAgo // Use 1 week ago
        }
      ]
    });
    setInsights({
      weeklyHighlight: "Welcome to Social Cue! 🎉",
      topStrengths: ["Ready to learn!", "Open to new experiences"],
      motivationalMessage: "You're about to start an amazing journey of social skills development!",
      nextMilestone: "Complete your first practice session to unlock insights",
      celebrationWorthy: false,
      practiceRecommendation: {
        topicToFocus: "Small Talk Basics",
        reason: "Great foundation for all social interactions",
        estimatedSessions: 3
      },
      trend: "stable"
    });
    setLoading(false);
    setInsightsLoading(false);
  }, []);

  // COMMENT OUT API CALLS FOR NOW - Backend not ready
  /*
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setInsightsLoading(true);
        const currentUserData = getUserData();
        const userId = currentUserData.userId || 'guest_' + Date.now();
        
        console.log('🧠 Fetching progress insights for user:', userId);
        
        const response = await fetch(`http://localhost:3001/api/adaptive/progress-insights/${userId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          // Handle "Learner profile not found" as a normal case, not an error
          if (data.error === 'Learner profile not found') {
            console.log('ℹ️ No learner profile found for insights, using demo data');
            setInsightsError(null); // Clear any previous errors
            // Use fallback insights for new users
            setInsights({
              weeklyHighlight: "Welcome to Social Cue! 🎉",
              topStrengths: ["Ready to learn!", "Open to new experiences"],
              motivationalMessage: "You're about to start an amazing journey of social skills development!",
              nextMilestone: "Complete your first practice session to unlock insights",
              celebrationWorthy: false,
              celebrationReason: "",
              practiceRecommendation: {
                topicToFocus: "Small Talk Basics",
                reason: "Perfect place to start your social skills journey!",
                estimatedSessions: 3
              },
              trendIndicator: "stable"
            });
            return;
          }
          // For other errors, throw as before
          throw new Error(data.error || 'Failed to fetch insights');
        }
        
        console.log('✅ Progress insights received:', data);
        setInsights(data.insights);
        
      } catch (err) {
        console.error('❌ Error fetching progress insights:', err);
        setInsightsError(err.message);
        
        // Fallback insights for demo purposes
        setInsights({
          weeklyHighlight: "You've mastered Small Talk Basics! 🎉",
          topStrengths: ["Active Listening", "Confidence Building", "Empathy"],
          motivationalMessage: "Your consistent practice is paying off! Keep up the great work.",
          nextMilestone: "Complete 3 more topics to unlock advanced challenges",
          celebrationWorthy: true,
          celebrationReason: "First topic mastered!",
          practiceRecommendation: {
            topicToFocus: "Active Listening",
            reason: "You're showing strong progress here - just a few more sessions to mastery!",
            estimatedSessions: 2
          },
          trendIndicator: "improving"
        });
      } finally {
        setInsightsLoading(false);
      }
    };

    fetchInsights();
  }, []);
  */

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
      1: 'text-gray-400',
      2: 'text-blue-400',
      3: 'text-green-400',
      4: 'text-purple-400',
      5: 'text-yellow-400'
    };
    return colors[level] || 'text-gray-400';
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

  // Helper functions for insights
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <ArrowUp className="w-5 h-5 text-green-400" />;
      case 'stable':
        return <Minus className="w-5 h-5 text-blue-400" />;
      case 'needs_attention':
        return <ArrowDown className="w-5 h-5 text-yellow-400" />;
      default:
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving':
        return 'text-green-400';
      case 'stable':
        return 'text-blue-400';
      case 'needs_attention':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTrendLabel = (trend) => {
    switch (trend) {
      case 'improving':
        return 'Improving';
      case 'stable':
        return 'Stable';
      case 'needs_attention':
        return 'Needs Attention';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="pb-24 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              <Sparkles className="w-6 h-6 text-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Loading Mastery Dashboard...
            </h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Analyzing your learning progress
            </p>
          </div>
          <DashboardSkeleton darkMode={darkMode} />
        </div>
      </div>
    );
  }

  if (error && !masteryData) {
    return (
      <div className="pb-24 px-6 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😔</div>
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Unable to Load Dashboard
          </h2>
          <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {error}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="pb-24 px-6 py-8">
      <h1 className={`text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Mastery Dashboard</h1>
      
      {/* This Week's Insights */}
      {!insightsLoading && insights && (
        <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-8 ${
          darkMode ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>This Week's Insights</h2>
            {insights.trendIndicator && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                darkMode ? 'bg-white/10' : 'bg-white/50'
              }`}>
                {getTrendIcon(insights.trendIndicator)}
                <span className={`text-sm font-semibold ${getTrendColor(insights.trendIndicator)}`}>
                  {getTrendLabel(insights.trendIndicator)}
                </span>
              </div>
            )}
          </div>

          {/* Weekly Highlight */}
          <div className="mb-6">
            <div className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {insights.weeklyHighlight}
            </div>
            {insights.celebrationWorthy && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                darkMode ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-yellow-100 border border-yellow-200'
              }`}>
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className={`font-semibold ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  🎉 {insights.celebrationReason}
                </span>
              </div>
            )}
          </div>

          {/* Top Strengths */}
          {insights.topStrengths && insights.topStrengths.length > 0 && (
            <div className="mb-6">
              <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Your Top Strengths</h3>
              <div className="flex flex-wrap gap-2">
                {insights.topStrengths.map((strength, index) => (
                  <span key={index} className={`px-3 py-1 rounded-full text-sm font-medium ${
                    darkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {strength}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Motivational Message */}
          {insights.motivationalMessage && (
            <div className={`p-4 rounded-xl mb-6 ${
              darkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                  {insights.motivationalMessage}
                </p>
              </div>
            </div>
          )}

          {/* Next Milestone */}
          {insights.nextMilestone && (
            <div className={`p-4 rounded-xl mb-6 ${
              darkMode ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'
            }`}>
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className={`font-semibold mb-1 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>Next Milestone</h4>
                  <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}>
                    {insights.nextMilestone}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Practice Recommendation */}
          {insights.practiceRecommendation && (
            <div className={`p-6 rounded-xl ${
              darkMode ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30' : 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200'
            }`}>
              <div className="flex items-start gap-3 mb-4">
                <Play className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className={`font-bold text-lg mb-2 ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                    Recommended Practice
                  </h4>
                  <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {insights.practiceRecommendation.topicToFocus}
                  </p>
                  <p className={`text-sm mb-3 ${darkMode ? 'text-orange-200' : 'text-orange-600'}`}>
                    {insights.practiceRecommendation.reason}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                      ~{insights.practiceRecommendation.estimatedSessions} sessions needed
                    </span>
                    <button className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      darkMode 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}>
                      Start Practice
                      <ArrowRight className="w-4 h-4 inline ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Insights Loading State */}
      {insightsLoading && (
        <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-8 ${
          darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>This Week's Insights</h2>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-3 relative">
                <div className="absolute inset-0 border-2 border-purple-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
              </div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                AI is analyzing your progress...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Animated Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <AnimatedStatCard 
          title="Total Topics"
          value={masteryData?.summary?.totalTopics || 0}
          icon={BookOpen}
          color="from-blue-500 to-blue-600"
          darkMode={darkMode}
          delay={0}
        />
        <AnimatedStatCard 
          title="Completed"
          value={masteryData?.summary?.completedTopics || 0}
          icon={CheckCircle}
          color="from-emerald-500 to-emerald-600"
          darkMode={darkMode}
          delay={100}
        />
        <AnimatedStatCard 
          title="Avg Mastery"
          value={`${masteryData?.summary?.averageMastery || 0}%`}
          icon={TrendingUp}
          color="from-purple-500 to-purple-600"
          darkMode={darkMode}
          delay={200}
        />
        <AnimatedStatCard 
          title="In Progress"
          value={masteryData?.summary?.topicsInProgress || 0}
          icon={Target}
          color="from-orange-500 to-orange-600"
          darkMode={darkMode}
          delay={300}
        />
      </div>

      {/* Mastery Dashboard */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
        darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-blue-400" />
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Topic Mastery</h2>
          <span className={`text-sm px-2 py-1 rounded-full ${
            darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
          }`}>
            Sorted by Progress
          </span>
        </div>
        
        <div className="space-y-4">
          {masteryData?.topics?.sort((a, b) => a.masteryLevel - b.masteryLevel).map((topic, index) => (
            <div key={topic.topicId} className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${
              darkMode ? 'bg-white/5 border-white/10 hover:border-blue-500/30' : 'bg-gray-50 border-gray-200 hover:border-blue-300'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    topic.isCompleted ? 'bg-emerald-500/20' : 'bg-blue-500/20'
                  }`}>
                    {topic.isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Star className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {topic.topicName}
                    </h3>
                    <div className="flex items-center gap-2">
                      <DifficultyBadge level={topic.difficultyLevel} darkMode={darkMode} size="sm" />
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

              {/* Animated Progress Bar */}
              <div className="mb-4">
                <AnimatedProgressBar 
                  progress={topic.masteryLevel}
                  label=""
                  color={getProgressBarColor(topic.masteryLevel)}
                  darkMode={darkMode}
                  delay={index * 100}
                  showPercentage={false}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
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
                
                <div className="text-center">
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
                
                <div className="text-center">
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
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Level
                    </span>
                  </div>
                  <div className={`text-lg font-bold ${getDifficultyColor(topic.difficultyLevel)}`}>
                    {topic.difficultyLevel}/5
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REMOVED: Difficulty Progression Timeline - was showing fake demo data */}
      {/* 
      <DifficultyProgressionTimeline 
        progression={masteryData?.topics?.map(topic => ({
          level: topic.difficultyLevel,
          date: formatDate(topic.lastPracticed),
          accuracy: topic.accuracyRate,
          sessions: Math.floor(topic.timeSpent / 15) // Approximate sessions (15 min each)
        })).sort((a, b) => new Date(a.date) - new Date(b.date))}
        darkMode={darkMode}
      />
      */}

      {/* Error Message - Only show for real errors, not "Learner profile not found" */}
      {/* COMMENTED OUT: Demo data warning
      {error && !error.includes('Learner profile not found') && (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
          darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="text-red-400">⚠️</div>
            <div>
              <h3 className={`font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                Using Demo Data
              </h3>
              <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-500'}`}>
                {error} - Showing sample mastery data for demonstration.
              </p>
            </div>
          </div>
        </div>
      )}
      */}

      {/* Original Stats Section */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
        darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Stats</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent mb-2">
              {userData?.streak || 0}
            </div>
            <div className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent mb-2">
              {userData?.totalSessions || 0}
            </div>
            <div className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent mb-2">
              {userData?.confidenceScore || 0}%
            </div>
            <div className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Confidence</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressScreen;