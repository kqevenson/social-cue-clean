import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Star, 
  Plus, 
  Calendar, 
  Clock, 
  AlertCircle,
  Sparkles,
  Award,
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit
} from 'lucide-react';

function GoalsScreen({ userData, darkMode, onNavigate }) {
  const [goals, setGoals] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompletedGoals, setShowCompletedGoals] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  
  // Simple toast notification function
  const showToast = (message, type = 'info') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Could be enhanced with actual UI notifications later
  };

  // Configuration for API usage
  const API_BASE_URL = 'http://localhost:3001';
  const USE_API = true; // Set to false to use localStorage only
  
  // localStorage key for goals
  const GOALS_STORAGE_KEY = 'socialcue_goals';

  // Form state for creating custom goals
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetTopic: '',
    targetMetric: 'mastery',
    targetValue: 80,
    deadline: ''
  });

  useEffect(() => {
    // Clear any corrupted data on mount
    const clearCorruptedData = () => {
      try {
        // Check for corrupted goals data
        const goalsData = localStorage.getItem('goals');
        if (goalsData && goalsData.includes('<!doctype')) {
          console.log('Clearing corrupted goals data');
          localStorage.removeItem('goals');
        }
        
        // Check for corrupted user data
        const userData = localStorage.getItem('socialCueUserData');
        if (userData && userData.includes('<!doctype')) {
          console.log('Clearing corrupted user data');
          localStorage.removeItem('socialCueUserData');
        }
        
        // Check for corrupted guest data
        const guestData = localStorage.getItem('socialCueGuestData');
        if (guestData && guestData.includes('<!doctype')) {
          console.log('Clearing corrupted guest data');
          localStorage.removeItem('socialCueGuestData');
        }
      } catch (error) {
        console.error('Error clearing corrupted data:', error);
      }
    };
    
    clearCorruptedData();
    fetchGoals();
  }, [userData?.userId]);

  const fetchGoals = async () => {
    try {
      const userId = userData?.userId || localStorage.getItem('userId');
      
      // Always try localStorage first for immediate loading
      const localGoals = loadGoalsFromStorage();
      if (localGoals.length > 0) {
        setGoals(localGoals);
        setLoading(false);
        console.log('✅ Loaded goals from localStorage:', localGoals.length);
      }
      
      // If API is enabled and we have a userId, try to sync with backend
      if (USE_API && userId) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/goals/${userId}`);
          
          // Check if response is actually JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.log('⚠️ API returned non-JSON response, using localStorage only');
            return;
          }
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && Array.isArray(data.goals)) {
              // Update localStorage with server data
              saveGoalsToStorage(data.goals);
              setGoals(data.goals);
              console.log('✅ Synced goals from API:', data.goals.length);
            }
          } else {
            console.log('⚠️ API request failed, using localStorage only');
          }
        } catch (apiError) {
          console.log('⚠️ API sync failed, using localStorage only:', apiError.message);
        }
      }
      
      // If no goals found anywhere, initialize with empty array
      if (goals.length === 0 && localGoals.length === 0) {
        setGoals([]);
      }
      
    } catch (error) {
      console.error('Error loading goals:', error);
      // Fallback to localStorage
      const fallbackGoals = loadGoalsFromStorage();
      setGoals(fallbackGoals);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for localStorage operations
  const loadGoalsFromStorage = () => {
    try {
      const stored = localStorage.getItem(GOALS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('Error loading goals from localStorage:', error);
    }
    return [];
  };

  const saveGoalsToStorage = (goalsArray) => {
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goalsArray));
    } catch (error) {
      console.error('Error saving goals to localStorage:', error);
    }
  };

  const generateRecommendations = async () => {
    setIsGeneratingRecommendations(true);
    try {
      const userId = userData?.userId || localStorage.getItem('userId');
      
      // If API is enabled, try to get AI recommendations
      if (USE_API && userId) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/goals/generate-recommendations/${userId}`, {
            method: 'POST'
          });

          // Check if response is actually JSON
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.log('⚠️ API returned non-JSON response, using sample recommendations');
            throw new Error('Invalid response format');
          }

          if (response.ok) {
            const data = await response.json();
            if (data.success && Array.isArray(data.recommendations)) {
              setRecommendations(data.recommendations);
              setShowRecommendations(true);
              showToast('AI recommendations generated!', 'success');
              return;
            }
          }
        } catch (apiError) {
          console.log('⚠️ API recommendations failed, using sample data:', apiError.message);
        }
      }
      
      // Fallback to sample recommendations
      const sampleRecommendations = [
        {
          title: "Practice Active Listening",
          description: "Make eye contact and nod when friends are talking",
          targetTopic: "communication",
          targetMetric: "mastery",
          targetValue: 80,
          suggestedDeadline: "1 week",
          reason: "Active listening helps build stronger friendships",
          difficulty: "Easy"
        },
        {
          title: "Improve Body Language",
          description: "Stand up straight and smile more often",
          targetTopic: "body-language",
          targetMetric: "mastery",
          targetValue: 75,
          suggestedDeadline: "2 weeks",
          reason: "Good posture shows confidence",
          difficulty: "Easy"
        },
        {
          title: "Start Conversations",
          description: "Say hello to one new person each day",
          targetTopic: "conversation-starters",
          targetMetric: "sessions",
          targetValue: 7,
          suggestedDeadline: "1 week",
          reason: "Practice makes conversation easier",
          difficulty: "Medium"
        }
      ];
      
      setRecommendations(sampleRecommendations);
      setShowRecommendations(true);
      showToast('Sample recommendations generated! (AI recommendations coming soon)', 'info');
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      showToast('Failed to generate recommendations', 'error');
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const acceptRecommendation = async (recommendation) => {
    try {
      const userId = userData?.userId || localStorage.getItem('userId');
      
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + parseInt(recommendation.suggestedDeadline.split(' ')[0]) * 7);

      const goalData = {
        id: Date.now(), // Generate local ID
        userId: userId || 'local-user',
        title: recommendation.title,
        description: recommendation.description,
        targetTopic: recommendation.targetTopic,
        targetMetric: recommendation.targetMetric,
        targetValue: recommendation.targetValue,
        currentValue: 0,
        deadline: deadline.toISOString(),
        status: 'active',
        aiRecommended: true,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage immediately
      const currentGoals = loadGoalsFromStorage();
      const updatedGoals = [goalData, ...currentGoals];
      saveGoalsToStorage(updatedGoals);
      setGoals(updatedGoals);
      
      // Remove from recommendations
      setRecommendations(prev => prev.filter(rec => rec.title !== recommendation.title));
      showToast('Goal created successfully!', 'success');

      // Optionally sync to API in background
      if (USE_API && userId) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/goals/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalData)
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.goal) {
              // Update local goal with server ID
              const updatedGoalsWithServerId = updatedGoals.map(goal => 
                goal.id === goalData.id ? { ...goal, id: data.goal.id } : goal
              );
              saveGoalsToStorage(updatedGoalsWithServerId);
              setGoals(updatedGoalsWithServerId);
              console.log('✅ Goal synced to server');
            }
          }
        } catch (apiError) {
          console.log('⚠️ Failed to sync goal to server:', apiError.message);
        }
      }
      
    } catch (error) {
      console.error('Error accepting recommendation:', error);
      showToast('Failed to create goal', 'error');
    }
  };

  const createCustomGoal = async () => {
    try {
      const userId = userData?.userId || localStorage.getItem('userId');
      
      // Validate form data
      if (!newGoal.title || !newGoal.description || !newGoal.targetTopic) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const deadline = new Date(newGoal.deadline);

      const goalData = {
        id: Date.now(), // Generate local ID
        userId: userId || 'local-user',
        title: newGoal.title,
        description: newGoal.description,
        targetTopic: newGoal.targetTopic,
        targetMetric: newGoal.targetMetric,
        targetValue: newGoal.targetValue,
        currentValue: 0,
        deadline: deadline.toISOString(),
        status: 'active',
        aiRecommended: false,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage immediately
      const currentGoals = loadGoalsFromStorage();
      const updatedGoals = [goalData, ...currentGoals];
      saveGoalsToStorage(updatedGoals);
      setGoals(updatedGoals);
      
      // Reset form
      setShowCreateModal(false);
      setNewGoal({
        title: '',
        description: '',
        targetTopic: '',
        targetMetric: 'mastery',
        targetValue: 80,
        deadline: ''
      });
      showToast('Goal created successfully!', 'success');

      // Optionally sync to API in background
      if (USE_API && userId) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/goals/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalData)
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.goal) {
              // Update local goal with server ID
              const updatedGoalsWithServerId = updatedGoals.map(goal => 
                goal.id === goalData.id ? { ...goal, id: data.goal.id } : goal
              );
              saveGoalsToStorage(updatedGoalsWithServerId);
              setGoals(updatedGoalsWithServerId);
              console.log('✅ Goal synced to server');
            }
          }
        } catch (apiError) {
          console.log('⚠️ Failed to sync goal to server:', apiError.message);
        }
      }
      
    } catch (error) {
      console.error('Error creating goal:', error);
      showToast('Failed to create goal', 'error');
    }
  };

  const deleteGoal = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const userId = userData?.userId || localStorage.getItem('userId');
      
      // Remove from localStorage immediately
      const currentGoals = loadGoalsFromStorage();
      const updatedGoals = currentGoals.filter(goal => goal.id !== goalId);
      saveGoalsToStorage(updatedGoals);
      setGoals(updatedGoals);
      showToast('Goal deleted', 'success');

      // Optionally sync to API in background
      if (USE_API && userId) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          });

          if (response.ok) {
            console.log('✅ Goal deleted from server');
          }
        } catch (apiError) {
          console.log('⚠️ Failed to delete goal from server:', apiError.message);
        }
      }
      
    } catch (error) {
      console.error('Error deleting goal:', error);
      showToast('Failed to delete goal', 'error');
    }
  };

  const getGoalStatus = (goal) => {
    const now = new Date();
    const deadline = goal.deadline?.toDate ? goal.deadline.toDate() : new Date(goal.deadline);
    const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    const progress = (goal.currentValue / goal.targetValue) * 100;

    if (goal.status === 'completed') return 'completed';
    if (daysRemaining < 0) return 'overdue';
    if (daysRemaining <= 1) return 'due-soon';
    if (progress >= 80) return 'on-track';
    if (progress >= 50) return 'at-risk';
    return 'needs-attention';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'on-track': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'at-risk': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'due-soon': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
      case 'overdue': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      default: return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed!';
      case 'on-track': return 'On Track';
      case 'at-risk': return 'At Risk';
      case 'due-soon': return 'Due Soon';
      case 'overdue': return 'Overdue';
      default: return 'Needs Attention';
    }
  };

  const formatDeadline = (deadline) => {
    const date = deadline?.toDate ? deadline.toDate() : new Date(deadline);
    const now = new Date();
    const daysRemaining = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) return 'Overdue';
    if (daysRemaining === 0) return 'Due today!';
    if (daysRemaining === 1) return 'Due tomorrow';
    return `${daysRemaining} days remaining`;
  };

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');
  
  // Group goals by source for better organization
  const sessionGoals = activeGoals.filter(g => g.source?.includes('Post Session'));
  const otherActiveGoals = activeGoals.filter(g => !g.source?.includes('Post Session'));

  if (loading) {
    return (
      <div className="pb-24 px-6 py-8">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-6 py-8">
      <h1 className={`text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        My Goals
      </h1>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={generateRecommendations}
          disabled={isGeneratingRecommendations}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
          } ${isGeneratingRecommendations ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Sparkles className="w-4 h-4" />
          {isGeneratingRecommendations ? 'Analyzing...' : 'AI Recommendations'}
        </button>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
            darkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          Create Custom Goal
        </button>
      </div>

      {/* AI Recommendations */}
      {showRecommendations && (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
          darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              AI Recommendations
            </h2>
            <button
              onClick={() => setShowRecommendations(false)}
              className={`ml-auto px-3 py-1 rounded-lg text-sm ${
                darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Close
            </button>
          </div>
          
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border ${
                  darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {recommendation.title}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {recommendation.description}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    recommendation.difficulty === 'Easy' ? 'text-green-600 bg-green-100 dark:bg-green-900/30' :
                    recommendation.difficulty === 'Medium' ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' :
                    'text-red-600 bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {recommendation.difficulty}
                  </span>
                </div>
                
                <div className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong>Why recommended:</strong> {recommendation.reason}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Target: {recommendation.targetValue}{recommendation.targetMetric === 'mastery' ? '%' : ''} {recommendation.targetMetric}
                    </span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Deadline: {recommendation.suggestedDeadline}
                    </span>
                  </div>
                  <button
                    onClick={() => acceptRecommendation(recommendation)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      darkMode 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    Accept Goal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Session-Based Goals */}
      {sessionGoals.length > 0 && (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
          darkMode ? 'bg-white/8 border-blue-500/30' : 'bg-blue-50 border-blue-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-blue-400" />
            <h2 className={`text-xl font-bold text-blue-400`}>
              📝 Based on Your Recent Practice
            </h2>
            <span className={`text-sm px-2 py-1 rounded-full ${
              darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              {sessionGoals.length} goals
            </span>
          </div>

          <div className="space-y-4">
            {sessionGoals.map((goal) => {
              const status = getGoalStatus(goal);
              const progress = (goal.currentValue / goal.targetValue) * 100;
              
              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-xl border transition-all ${
                    darkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {goal.title}
                        </h3>
                        <Sparkles className="w-4 h-4 text-blue-400" />
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {goal.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </span>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className={`p-1 rounded-lg transition-colors ${
                          darkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-600'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Progress
                      </span>
                      <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {goal.currentValue}/{goal.targetValue} ({Math.round(progress)}%)
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${
                      darkMode ? 'bg-white/10' : 'bg-gray-200'
                    }`}>
                      <div
                        className={`h-full transition-all duration-500 ${
                          progress >= 80 ? 'bg-green-400' :
                          progress >= 50 ? 'bg-yellow-400' : 'bg-blue-400'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Goal Details */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Category: {goal.category || 'General'}
                      </span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Target: {goal.targetValue} {goal.targetMetric || 'times'}
                      </span>
                    </div>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {formatDeadline(goal.deadline)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Active Goals */}
      {otherActiveGoals.length > 0 && (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
          darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-blue-400" />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Other Goals
            </h2>
            <span className={`text-sm px-2 py-1 rounded-full ${
              darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              {otherActiveGoals.length} goals
            </span>
          </div>

          <div className="space-y-4">
            {otherActiveGoals.map((goal) => {
              const status = getGoalStatus(goal);
              const progress = (goal.currentValue / goal.targetValue) * 100;
              
              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-xl border transition-all ${
                    darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {goal.title}
                        </h3>
                        {goal.aiRecommended && (
                          <Sparkles className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {goal.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </span>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className={`p-1 rounded-lg transition-colors ${
                          darkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-600'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Progress
                      </span>
                      <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {goal.currentValue}/{goal.targetValue} ({Math.round(progress)}%)
                      </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${
                      darkMode ? 'bg-white/10' : 'bg-gray-200'
                    }`}>
                      <div
                        className={`h-full transition-all duration-500 ${
                          progress >= 80 ? 'bg-green-400' :
                          progress >= 50 ? 'bg-yellow-400' : 'bg-blue-400'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Goal Details */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Target: {goal.targetValue}{goal.targetMetric === 'mastery' ? '%' : ''} {goal.targetMetric}
                      </span>
                      {goal.targetTopic && (
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Topic: {goal.targetTopic}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {formatDeadline(goal.deadline)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State - No Goals */}
      {sessionGoals.length === 0 && otherActiveGoals.length === 0 && (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
          darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="text-center py-8">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              No active goals yet
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Complete a practice session to get personalized goals, or create your own!
            </p>
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
          darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <button
            onClick={() => setShowCompletedGoals(!showCompletedGoals)}
            className="flex items-center gap-3 mb-4 w-full"
          >
            <Award className="w-6 h-6 text-green-400" />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Completed Goals
            </h2>
            <span className={`text-sm px-2 py-1 rounded-full ${
              darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
            }`}>
              {completedGoals.length} completed
            </span>
            {showCompletedGoals ? (
              <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            )}
          </button>

          {showCompletedGoals && (
            <div className="space-y-3">
              {completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`p-3 rounded-xl border ${
                    darkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {goal.title}
                      </span>
                    </div>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Completed {goal.completedAt?.toDate ? 
                        goal.completedAt.toDate().toLocaleDateString() : 
                        new Date(goal.completedAt).toLocaleDateString()
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          
          <div className={`relative w-full max-w-md rounded-3xl p-6 ${
            darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200 shadow-2xl'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Create Custom Goal
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`text-sm block mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Goal Title
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                    darkMode 
                      ? 'bg-black/40 border-white/20 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
                  placeholder="e.g., Master Small Talk"
                />
              </div>
              
              <div>
                <label className={`text-sm block mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Description
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                    darkMode 
                      ? 'bg-black/40 border-white/20 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
                  rows={3}
                  placeholder="Describe what you want to achieve..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm block mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Target Metric
                  </label>
                  <select
                    value={newGoal.targetMetric}
                    onChange={(e) => setNewGoal({...newGoal, targetMetric: e.target.value})}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                      darkMode 
                        ? 'bg-black/40 border-white/20 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    }`}
                  >
                    <option value="mastery">Mastery %</option>
                    <option value="accuracy">Accuracy %</option>
                    <option value="sessions">Sessions</option>
                    <option value="streak">Streak Days</option>
                  </select>
                </div>
                
                <div>
                  <label className={`text-sm block mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Target Value
                  </label>
                  <input
                    type="number"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({...newGoal, targetValue: parseInt(e.target.value)})}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                      darkMode 
                        ? 'bg-black/40 border-white/20 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    }`}
                    min="1"
                  />
                </div>
              </div>
              
              <div>
                <label className={`text-sm block mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Deadline
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                  className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                    darkMode 
                      ? 'bg-black/40 border-white/20 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={createCustomGoal}
                disabled={!newGoal.title || !newGoal.description || !newGoal.deadline}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } ${(!newGoal.title || !newGoal.description || !newGoal.deadline) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoalsScreen;
