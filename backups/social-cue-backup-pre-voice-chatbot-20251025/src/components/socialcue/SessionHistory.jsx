import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ChevronDown, 
  ChevronRight,
  Filter,
  X,
  BookOpen,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react';
import { getUserData } from './utils/storage';

const SessionHistory = ({ darkMode = false }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSession, setExpandedSession] = useState(null);
  const [filters, setFilters] = useState({
    topicId: '',
    performance: '',
    dateRange: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSessionHistory();
  }, [filters]);

  const fetchSessionHistory = async () => {
    try {
      setLoading(true);
      const userData = getUserData();
      const userId = userData?.userId || 'default-user';
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.topicId) params.append('topicId', filters.topicId);
      if (filters.performance) params.append('performance', filters.performance);
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate;
        switch (filters.dateRange) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = null;
        }
        if (startDate) {
          params.append('startDate', startDate.toISOString());
        }
      }
      params.append('limit', '20');

      const response = await fetch(`http://localhost:3001/api/adaptive/session-history/${userId}?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.sessions || []);
      } else {
        setError(data.error || 'Failed to fetch session history');
      }
    } catch (err) {
      console.error('Error fetching session history:', err);
      setError('Failed to fetch session history');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (accuracy) => {
    if (accuracy >= 70) return darkMode ? 'text-green-400' : 'text-green-600';
    if (accuracy >= 50) return darkMode ? 'text-yellow-400' : 'text-yellow-600';
    return darkMode ? 'text-red-400' : 'text-red-600';
  };

  const getPerformanceBgColor = (accuracy) => {
    if (accuracy >= 70) return darkMode ? 'bg-green-500/20 border-green-500/30' : 'bg-green-50 border-green-200';
    if (accuracy >= 50) return darkMode ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200';
    return darkMode ? 'bg-red-500/20 border-red-500/30' : 'bg-red-50 border-red-200';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getTopicIcon = (topicName) => {
    const iconMap = {
      'Small Talk': BookOpen,
      'Active Listening': Target,
      'Starting Conversations': Star,
      'Body Language': Target,
      'Making Friends': Star,
      'Handling Disagreements': Target
    };
    return iconMap[topicName] || BookOpen;
  };

  const getTrendIcon = (sessions) => {
    if (sessions.length < 2) return Minus;
    const recent = sessions.slice(0, 3);
    const older = sessions.slice(3, 6);
    const recentAvg = recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.accuracy, 0) / older.length;
    
    if (recentAvg > olderAvg + 5) return TrendingUp;
    if (recentAvg < olderAvg - 5) return TrendingDown;
    return Minus;
  };

  const getTrendColor = (sessions) => {
    if (sessions.length < 2) return darkMode ? 'text-gray-400' : 'text-gray-500';
    const recent = sessions.slice(0, 3);
    const older = sessions.slice(3, 6);
    const recentAvg = recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.accuracy, 0) / older.length;
    
    if (recentAvg > olderAvg + 5) return darkMode ? 'text-green-400' : 'text-green-600';
    if (recentAvg < olderAvg - 5) return darkMode ? 'text-red-400' : 'text-red-600';
    return darkMode ? 'text-gray-400' : 'text-gray-500';
  };

  if (loading) {
    return (
      <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
        darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Session History
          </h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-3 relative">
              <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading session history...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
        darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
            <XCircle className="w-4 h-4 text-white" />
          </div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Session History
          </h2>
        </div>
        <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
      darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Session History
          </h2>
          {sessions.length > 0 && (
            <div className="flex items-center gap-2">
              {getTrendIcon(sessions)}
              <span className={`text-sm ${getTrendColor(sessions)}`}>
                {sessions.length} sessions
              </span>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg transition-colors ${
            darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
          }`}
        >
          <Filter className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={`p-4 rounded-xl mb-4 ${
          darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Topic
              </label>
              <select
                value={filters.topicId}
                onChange={(e) => setFilters({...filters, topicId: e.target.value})}
                className={`w-full p-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-white/10 border-white/20 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Topics</option>
                <option value="small-talk">Small Talk</option>
                <option value="active-listening">Active Listening</option>
                <option value="starting-conversations">Starting Conversations</option>
                <option value="body-language">Body Language</option>
                <option value="making-friends">Making Friends</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Performance
              </label>
              <select
                value={filters.performance}
                onChange={(e) => setFilters({...filters, performance: e.target.value})}
                className={`w-full p-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-white/10 border-white/20 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Performance</option>
                <option value="high">High (≥70%)</option>
                <option value="medium">Medium (50-69%)</option>
                <option value="low">Low (&lt;50%)</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className={`w-full p-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-white/10 border-white/20 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📚</div>
          <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            No Sessions Yet
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Complete some practice sessions to see your history here!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session, index) => {
            const TopicIcon = getTopicIcon(session.topicName);
            const isExpanded = expandedSession === session.sessionId;
            
            return (
              <div 
                key={session.sessionId}
                className={`p-4 rounded-xl border transition-all ${
                  getPerformanceBgColor(session.accuracy)
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      darkMode ? 'bg-white/10' : 'bg-white/50'
                    }`}>
                      <TopicIcon className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {session.topicName}
                        </h3>
                        <DifficultyBadge level={session.difficultyLevel} darkMode={darkMode} />
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                            {formatDate(session.date)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                            {formatDuration(session.duration)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`font-semibold ${getPerformanceColor(session.accuracy)}`}>
                          {session.correctAnswers || 0}/{session.totalQuestions || 0} correct ({session.accuracy || 0}%)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setExpandedSession(isExpanded ? null : session.sessionId)}
                    className={`p-1 rounded transition-colors ${
                      darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    }`}
                  >
                    {isExpanded ? (
                      <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    ) : (
                      <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    )}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className={`pt-3 border-t ${
                    darkMode ? 'border-white/10' : 'border-gray-200'
                  }`}>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Score: 
                        </span>
                        <span className={`ml-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {session.score || 0} points
                        </span>
                      </div>
                      
                      <div>
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Scenarios: 
                        </span>
                        <span className={`ml-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {session.scenariosCompleted || 0}
                        </span>
                      </div>
                    </div>
                    
                    {session.summary && (
                      <div className="mt-3">
                        <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Summary: 
                        </span>
                        <span className={`ml-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {session.summary}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
