import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Users,
  Clock,
  TrendingUp,
  Award,
  BarChart3,
  PieChart,
  Calendar,
  ChevronRight,
  Eye,
  X,
  FileText,
  FileDown,
  Settings,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Target,
  Activity,
  MessageCircle,
  Zap,
  RefreshCw
} from 'lucide-react';
import { DashboardQueries, generateUserReport, generateSessionReport } from '../utils/voiceAnalytics';
import { getAllScenarios } from '../data/voicePracticeScenarios';

// Mock chart components (install recharts: npm install recharts)
// For now, using simple div-based charts
const LineChart = ({ data, xKey, yKey, color = '#3b82f6' }) => {
  const maxValue = Math.max(...data.map(d => d[yKey]), 1);
  return (
    <div className="relative h-48 flex items-end gap-1">
      {data.map((item, index) => (
        <div
          key={index}
          className="flex-1 bg-blue-500/30 rounded-t transition-all hover:bg-blue-500/50"
          style={{
            height: `${(item[yKey] / maxValue) * 100}%`,
            minHeight: '4px'
          }}
          title={`${item[xKey]}: ${item[yKey]}`}
        />
      ))}
    </div>
  );
};

const BarChart = ({ data, xKey, yKey, color = '#10b981' }) => {
  const maxValue = Math.max(...data.map(d => d[yKey]), 1);
  return (
    <div className="relative h-48 flex items-end gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-green-500/30 rounded-t transition-all hover:bg-green-500/50"
            style={{
              height: `${(item[yKey] / maxValue) * 100}%`,
              minHeight: '4px'
            }}
            title={`${item[xKey]}: ${item[yKey]}`}
          />
          <span className={`text-xs ${data.length > 10 ? 'hidden' : ''}`}>
            {item[xKey]}
          </span>
        </div>
      ))}
    </div>
  );
};

const PieChartSimple = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const startAngle = currentAngle;
          currentAngle += angle;
          
          const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
          const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
          const endX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
          const endY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
          const largeArc = angle > 180 ? 1 : 0;
          
          return (
            <path
              key={index}
              d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
              fill={item.color}
              stroke="#000"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>
    </div>
  );
};

const VoicePracticeAdminDashboard = ({ onBack, darkMode = true, userRole = 'admin' }) => {
  // View states
  const [currentView, setCurrentView] = useState('overview'); // overview, students, student-detail, session-detail, analytics, scenarios
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  
  // Data states
  const [overviewData, setOverviewData] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [scenarioFilter, setScenarioFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lastActive');
  
  // Date range presets
  const [datePreset, setDatePreset] = useState('week'); // today, week, month, custom

  // Load overview data
  useEffect(() => {
    loadOverviewData();
    loadStudents();
    loadScenarios();
  }, [datePreset]);

  // Load analytics when view changes
  useEffect(() => {
    if (currentView === 'analytics') {
      loadAnalytics();
    }
  }, [currentView, gradeFilter, dateRange]);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      
      // Calculate date ranges
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      let startDate, endDate;
      switch (datePreset) {
        case 'today':
          startDate = today;
          endDate = now;
          break;
        case 'week':
          startDate = weekAgo;
          endDate = now;
          break;
        case 'month':
          startDate = monthAgo;
          endDate = now;
          break;
        default:
          startDate = weekAgo;
          endDate = now;
      }

      // Load session data from localStorage
      const eventsKey = 'voice_analytics_reports_events';
      const allEvents = JSON.parse(localStorage.getItem(eventsKey) || '[]');
      
      const filteredEvents = allEvents.filter(e => {
        const eventDate = new Date(e.timestamp);
        return eventDate >= startDate && eventDate <= endDate;
      });

      const completedEvents = filteredEvents.filter(e => e.eventName === 'voice_practice_completed');
      const startedEvents = filteredEvents.filter(e => e.eventName === 'voice_practice_started');
      const abandonedEvents = filteredEvents.filter(e => e.eventName === 'voice_practice_abandoned');
      
      // Get unique users
      const uniqueUsers = new Set(filteredEvents.map(e => e.userId).filter(Boolean));
      
      // Calculate average duration
      const totalDuration = completedEvents.reduce((sum, e) => sum + (e.eventData.duration || 0), 0);
      const avgDuration = completedEvents.length > 0 ? Math.round(totalDuration / completedEvents.length) : 0;
      
      // Calculate completion rate
      const completionRate = startedEvents.length > 0
        ? Math.round((completedEvents.length / startedEvents.length) * 100)
        : 0;
      
      // Most popular scenarios
      const scenarioCounts = {};
      completedEvents.forEach(e => {
        const scenarioId = e.eventData.scenarioId || 'unknown';
        scenarioCounts[scenarioId] = (scenarioCounts[scenarioId] || 0) + 1;
      });
      const popularScenarios = Object.entries(scenarioCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, count]) => ({ id, count }));

      setOverviewData({
        totalSessions: completedEvents.length,
        totalStarted: startedEvents.length,
        totalAbandoned: abandonedEvents.length,
        activeUsers: uniqueUsers.size,
        averageDuration: avgDuration,
        completionRate,
        popularScenarios
      });
      
    } catch (err) {
      console.error('Error loading overview data:', err);
      setError('Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      // Load from localStorage
      const eventsKey = 'voice_analytics_reports_events';
      const allEvents = JSON.parse(localStorage.getItem(eventsKey) || '[]');
      
      const completedEvents = allEvents.filter(e => e.eventName === 'voice_practice_completed');
      
      // Group by user
      const userMap = {};
      completedEvents.forEach(event => {
        const userId = event.userId || 'unknown';
        if (!userMap[userId]) {
          userMap[userId] = {
            userId,
            name: `User ${userId.slice(0, 8)}`, // Anonymized
            gradeLevel: event.gradeLevel || 'unknown',
            sessions: [],
            totalSessions: 0,
            totalScore: 0,
            lastActive: null,
            currentDifficulty: 'moderate'
          };
        }
        
        userMap[userId].sessions.push(event);
        userMap[userId].totalSessions++;
        userMap[userId].totalScore += event.eventData.performanceScore || 0;
        
        const eventDate = new Date(event.timestamp);
        if (!userMap[userId].lastActive || eventDate > new Date(userMap[userId].lastActive)) {
          userMap[userId].lastActive = event.timestamp;
        }
        
        if (event.eventData.finalDifficulty) {
          userMap[userId].currentDifficulty = event.eventData.finalDifficulty;
        }
      });
      
      const studentList = Object.values(userMap).map(student => ({
        ...student,
        averageScore: student.totalSessions > 0
          ? Math.round(student.totalScore / student.totalSessions)
          : 0
      }));
      
      setStudents(studentList);
      
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Failed to load students');
    }
  };

  const loadScenarios = async () => {
    try {
      const allScenarios = getAllScenarios();
      setScenarios(allScenarios);
    } catch (err) {
      console.error('Error loading scenarios:', err);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const avgDurationByGrade = await DashboardQueries.averageSessionDurationByGrade();
      const completionRateByScenario = await DashboardQueries.completionRateByScenario();
      const commonErrors = await DashboardQueries.commonErrors();
      const difficultyDistribution = await DashboardQueries.difficultyDistribution();
      const performanceTrends = await DashboardQueries.performanceTrends(30);
      
      setAnalytics({
        avgDurationByGrade,
        completionRateByScenario,
        commonErrors,
        difficultyDistribution,
        performanceTrends
      });
      
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Filtered students
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Grade filter
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(s => s.gradeLevel === gradeFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.userId.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(s => {
        if (!s.lastActive) return false;
        const lastActiveDate = new Date(s.lastActive);
        if (dateRange.start && lastActiveDate < new Date(dateRange.start)) return false;
        if (dateRange.end && lastActiveDate > new Date(dateRange.end)) return false;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'lastActive':
          return new Date(b.lastActive || 0) - new Date(a.lastActive || 0);
        case 'sessions':
          return b.totalSessions - a.totalSessions;
        case 'score':
          return b.averageScore - a.averageScore;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [students, searchQuery, gradeFilter, dateRange, sortBy]);

  // Handle student selection
  const handleStudentSelect = useCallback((student) => {
    setSelectedStudent(student);
    setCurrentView('student-detail');
  }, []);

  // Handle session selection
  const handleSessionSelect = useCallback((session) => {
    setSelectedSession(session);
    setCurrentView('session-detail');
  }, []);

  // Export functions
  const exportStudentData = useCallback(() => {
    const csv = [
      ['User ID', 'Name', 'Grade Level', 'Sessions', 'Avg Score', 'Last Active', 'Difficulty'],
      ...filteredStudents.map(s => [
        s.userId,
        s.name,
        s.gradeLevel,
        s.totalSessions,
        s.averageScore,
        s.lastActive ? new Date(s.lastActive).toLocaleDateString() : 'Never',
        s.currentDifficulty
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voice_practice_students_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredStudents]);

  const exportSessionTranscript = useCallback((sessionId) => {
    const report = generateSessionReport(sessionId);
    if (!report) return;

    const transcript = report.events
      .filter(e => e.eventName === 'voice_practice_completed' || e.eventName === 'voice_practice_started')
      .map(e => {
        const role = e.eventName.includes('completed') ? 'AI' : 'User';
        return `${role}: ${e.eventData.description || e.eventName}`;
      })
      .join('\n\n');

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session_${sessionId}_transcript.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (!userRole || (userRole !== 'admin' && userRole !== 'teacher')) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            You don't have permission to access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Background decoration */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            {currentView !== 'overview' && (
              <button
                onClick={() => {
                  if (currentView === 'student-detail') {
                    setCurrentView('students');
                    setSelectedStudent(null);
                  } else if (currentView === 'session-detail') {
                    setCurrentView('student-detail');
                    setSelectedSession(null);
                  } else {
                    setCurrentView('overview');
                  }
                }}
                className={`p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">Voice Practice Admin Dashboard</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Monitor voice practice usage and student progress
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  loadOverviewData();
                  loadStudents();
                  loadAnalytics();
                }}
                className={`p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
                aria-label="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              {onBack && (
                <button
                  onClick={onBack}
                  className={`px-4 py-2 rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-white/5 border border-white/20 hover:bg-white/10'
                      : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  Back
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'scenarios', label: 'Scenarios', icon: Target }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 ${
                    currentView === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-400 text-white'
                      : darkMode
                        ? 'bg-white/5 border border-white/20 text-gray-300 hover:bg-white/10'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Error state */}
        {error && (
          <div className={`mb-6 p-4 rounded-2xl border ${
            darkMode
              ? 'bg-red-500/10 border-red-500/50 text-red-400'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading dashboard data...</p>
            </div>
          </div>
        )}

        {/* Overview View */}
        {!loading && currentView === 'overview' && overviewData && (
          <OverviewView
            data={overviewData}
            darkMode={darkMode}
            datePreset={datePreset}
            setDatePreset={setDatePreset}
          />
        )}

        {/* Students View */}
        {!loading && currentView === 'students' && (
          <StudentsView
            students={filteredStudents}
            onStudentSelect={handleStudentSelect}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            gradeFilter={gradeFilter}
            setGradeFilter={setGradeFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            dateRange={dateRange}
            setDateRange={setDateRange}
            datePreset={datePreset}
            setDatePreset={setDatePreset}
            exportStudentData={exportStudentData}
            darkMode={darkMode}
          />
        )}

        {/* Student Detail View */}
        {!loading && currentView === 'student-detail' && selectedStudent && (
          <StudentDetailView
            student={selectedStudent}
            onSessionSelect={handleSessionSelect}
            darkMode={darkMode}
          />
        )}

        {/* Session Detail View */}
        {!loading && currentView === 'session-detail' && selectedSession && (
          <SessionDetailView
            session={selectedSession}
            exportTranscript={exportSessionTranscript}
            darkMode={darkMode}
          />
        )}

        {/* Analytics View */}
        {!loading && currentView === 'analytics' && analytics && (
          <AnalyticsView
            analytics={analytics}
            darkMode={darkMode}
          />
        )}

        {/* Scenarios View */}
        {!loading && currentView === 'scenarios' && (
          <ScenariosView
            scenarios={scenarios}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
};

// Overview View Component
const OverviewView = ({ data, darkMode, datePreset, setDatePreset }) => {
  return (
    <div className="space-y-6">
      {/* Date Preset Selector */}
      <div className="flex items-center gap-2">
        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Timeframe:</span>
        {['today', 'week', 'month'].map(preset => (
          <button
            key={preset}
            onClick={() => setDatePreset(preset)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              datePreset === preset
                ? 'bg-blue-500 text-white'
                : darkMode
                  ? 'bg-white/5 text-gray-300 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {preset.charAt(0).toUpperCase() + preset.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Total Sessions"
          value={data.totalSessions}
          subtitle={`${data.totalStarted} started`}
          color="blue"
          darkMode={darkMode}
        />
        <StatCard
          icon={Users}
          label="Active Users"
          value={data.activeUsers}
          subtitle="Unique users"
          color="green"
          darkMode={darkMode}
        />
        <StatCard
          icon={Clock}
          label="Avg Duration"
          value={formatDuration(data.averageDuration)}
          subtitle="Per session"
          color="purple"
          darkMode={darkMode}
        />
        <StatCard
          icon={TrendingUp}
          label="Completion Rate"
          value={`${data.completionRate}%`}
          subtitle={`${data.totalStarted - data.totalSessions} abandoned`}
          color="emerald"
          darkMode={darkMode}
        />
      </div>

      {/* Popular Scenarios */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
        darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
      }`}>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          Most Popular Scenarios
        </h3>
        <div className="space-y-2">
          {data.popularScenarios.length > 0 ? (
            data.popularScenarios.map((scenario, index) => (
              <div
                key={scenario.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    index === 1 ? 'bg-gray-400/20 text-gray-400' :
                    index === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium">{scenario.id}</span>
                </div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {scenario.count} sessions
                </span>
              </div>
            ))
          ) : (
            <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No sessions recorded yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Students View Component
const StudentsView = ({
  students,
  onStudentSelect,
  searchQuery,
  setSearchQuery,
  gradeFilter,
  setGradeFilter,
  sortBy,
  setSortBy,
  dateRange,
  setDateRange,
  datePreset,
  setDatePreset,
  exportStudentData,
  darkMode
}) => {
  const gradeLevels = ['all', 'k2', '3-5', '6-8', '9-12'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className={`backdrop-blur-xl border rounded-2xl p-4 ${
        darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-white/5 border-white/20 focus:border-blue-500/50'
                  : 'bg-white border-gray-200 focus:border-blue-500'
              }`}
            />
          </div>

          {/* Grade Filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? 'bg-white/5 border-white/20 focus:border-blue-500/50'
                : 'bg-white border-gray-200 focus:border-blue-500'
            }`}
          >
            {gradeLevels.map(grade => (
              <option key={grade} value={grade}>
                Grade: {grade === 'all' ? 'All' : grade}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? 'bg-white/5 border-white/20 focus:border-blue-500/50'
                : 'bg-white border-gray-200 focus:border-blue-500'
            }`}
          >
            <option value="lastActive">Last Active</option>
            <option value="sessions">Most Sessions</option>
            <option value="score">Highest Score</option>
            <option value="name">Name</option>
          </select>

          {/* Export */}
          <button
            onClick={exportStudentData}
            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2 ${
              darkMode
                ? 'bg-white/5 border-white/20 hover:bg-white/10'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Students List */}
      <div className={`backdrop-blur-xl border rounded-2xl overflow-hidden ${
        darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
      }`}>
        <div className="divide-y divide-white/10">
          {students.length > 0 ? (
            students.map((student) => (
              <button
                key={student.userId}
                onClick={() => onStudentSelect(student)}
                className={`w-full p-4 text-left hover:bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode ? '' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                      darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {student.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold mb-1">{student.name}</div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Grade {student.gradeLevel} • {formatDate(student.lastActive)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-right">
                    <div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sessions</div>
                      <div className="font-bold">{student.totalSessions}</div>
                    </div>
                    <div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Score</div>
                      <div className="font-bold">{student.averageScore}%</div>
                    </div>
                    <div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Difficulty</div>
                      <div className={`font-bold capitalize ${
                        student.currentDifficulty === 'easy' ? 'text-green-400' :
                        student.currentDifficulty === 'hard' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {student.currentDifficulty}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 ml-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
              </button>
            ))
          ) : (
            <div className="p-12 text-center">
              <Users className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No students found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Student Detail View Component
const StudentDetailView = ({ student, onSessionSelect, darkMode }) => {
  const [studentReport, setStudentReport] = useState(null);

  useEffect(() => {
    const report = generateUserReport(student.userId, {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    });
    setStudentReport(report);
  }, [student.userId]);

  return (
    <div className="space-y-6">
      {/* Student Profile */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
        darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl ${
              darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
            }`}>
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{student.name}</h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Grade {student.gradeLevel} • {formatDate(student.lastActive)}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Sessions</div>
            <div className="text-2xl font-bold">{student.totalSessions}</div>
          </div>
          <div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Score</div>
            <div className="text-2xl font-bold">{student.averageScore}%</div>
          </div>
          <div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Difficulty</div>
            <div className={`text-2xl font-bold capitalize ${
              student.currentDifficulty === 'easy' ? 'text-green-400' :
              student.currentDifficulty === 'hard' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {student.currentDifficulty}
            </div>
          </div>
          <div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Exchanges</div>
            <div className="text-2xl font-bold">
              {studentReport?.totalExchanges || student.sessions.reduce((sum, s) => sum + (s.eventData.exchangeCount || 0), 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      {studentReport && studentReport.performanceTrend && studentReport.performanceTrend.length > 0 && (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
          darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
        }`}>
          <h3 className="text-xl font-bold mb-4">Progress Over Time</h3>
          <LineChart
            data={studentReport.performanceTrend.slice(-10)}
            xKey="index"
            yKey="averageExchanges"
            color="#3b82f6"
          />
        </div>
      )}

      {/* Session History */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
        darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
      }`}>
        <h3 className="text-xl font-bold mb-4">Session History</h3>
        <div className="space-y-2">
          {student.sessions.slice(0, 10).map((session, index) => (
            <button
              key={index}
              onClick={() => onSessionSelect(session)}
              className={`w-full p-4 rounded-lg border text-left transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-white/5 border-white/20 hover:bg-white/10'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold mb-1">
                    {session.eventData.scenarioTitle || session.eventData.scenarioId}
                  </div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatDate(session.timestamp)} • {formatDuration(session.eventData.duration)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${
                    (session.eventData.performanceScore || 0) >= 80 ? 'text-green-400' :
                    (session.eventData.performanceScore || 0) >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {session.eventData.performanceScore || 0}%
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Score
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 ml-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Session Detail View Component
const SessionDetailView = ({ session, exportTranscript, darkMode }) => {
  const [sessionReport, setSessionReport] = useState(null);

  useEffect(() => {
    const report = generateSessionReport(session.eventData.sessionId || session.sessionId);
    setSessionReport(report);
  }, [session]);

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
        darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {session.eventData.scenarioTitle || session.eventData.scenarioId}
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {formatDate(session.timestamp)} • {formatDuration(session.eventData.duration)}
            </p>
          </div>
          <button
            onClick={() => exportTranscript(session.eventData.sessionId || session.sessionId)}
            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 ${
              darkMode
                ? 'bg-white/5 border-white/20 hover:bg-white/10'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Download className="w-4 h-4" />
            Export Transcript
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Exchanges</div>
            <div className="text-xl font-bold">{session.eventData.exchangeCount || 0}</div>
          </div>
          <div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Performance</div>
            <div className={`text-xl font-bold ${
              (session.eventData.performanceScore || 0) >= 80 ? 'text-green-400' :
              (session.eventData.performanceScore || 0) >= 60 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {session.eventData.performanceScore || 0}%
            </div>
          </div>
          <div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Difficulty</div>
            <div className={`text-xl font-bold capitalize ${
              session.eventData.finalDifficulty === 'easy' ? 'text-green-400' :
              session.eventData.finalDifficulty === 'hard' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {session.eventData.finalDifficulty || session.eventData.difficulty || 'moderate'}
            </div>
          </div>
          <div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</div>
            <div className={`text-xl font-bold ${
              session.eventData.completionStatus === 'completed' ? 'text-green-400' : 'text-red-400'
            }`}>
              {session.eventData.completionStatus === 'completed' ? 'Completed' : 'Abandoned'}
            </div>
          </div>
        </div>
      </div>

      {/* Transcript */}
      {sessionReport && sessionReport.events && (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
          darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
        }`}>
          <h3 className="text-xl font-bold mb-4">Conversation Transcript</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {sessionReport.events
              .filter(e => e.eventName === 'voice_practice_started' || e.eventName.includes('message'))
              .map((event, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    event.eventName === 'voice_practice_started' || event.eventName.includes('ai')
                      ? darkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'
                      : darkMode ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'
                  }`}
                >
                  <div className={`text-xs font-semibold mb-2 ${
                    event.eventName === 'voice_practice_started' || event.eventName.includes('ai')
                      ? 'text-blue-400' : 'text-green-400'
                  }`}>
                    {event.eventName === 'voice_practice_started' || event.eventName.includes('ai') ? 'AI' : 'Student'}
                  </div>
                  <div className={darkMode ? 'text-gray-200' : 'text-gray-900'}>
                    {event.eventData.aiResponse || event.eventData.userMessage || event.eventName}
                  </div>
                  <div className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {formatDate(event.timestamp)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Analytics View Component
const AnalyticsView = ({ analytics, darkMode }) => {
  return (
    <div className="space-y-6">
      {/* Average Duration by Grade */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
        darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
      }`}>
        <h3 className="text-xl font-bold mb-4">Average Session Duration by Grade</h3>
        <BarChart
          data={Object.entries(analytics.avgDurationByGrade).map(([grade, duration]) => ({
            grade,
            duration
          }))}
          xKey="grade"
          yKey="duration"
        />
      </div>

      {/* Completion Rate by Scenario */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
        darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
      }`}>
        <h3 className="text-xl font-bold mb-4">Completion Rate by Scenario</h3>
        <div className="space-y-3">
          {Object.entries(analytics.completionRateByScenario)
            .sort((a, b) => b[1].completionRate - a[1].completionRate)
            .slice(0, 10)
            .map(([scenarioId, stats]) => (
              <div key={scenarioId}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{scenarioId}</span>
                  <span className={`font-bold ${
                    stats.completionRate >= 80 ? 'text-green-400' :
                    stats.completionRate >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {stats.completionRate}%
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  darkMode ? 'bg-white/10' : 'bg-gray-200'
                }`}>
                  <div
                    className={`h-full transition-all ${
                      stats.completionRate >= 80 ? 'bg-green-500' :
                      stats.completionRate >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stats.completed} completed / {stats.started} started
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Common Errors */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
        darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
      }`}>
        <h3 className="text-xl font-bold mb-4">Common Errors</h3>
        <div className="space-y-2">
          {analytics.commonErrors.length > 0 ? (
            analytics.commonErrors.map((error, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                <span className="font-medium capitalize">{error.type.replace('_', ' ')}</span>
                <span className={`font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                  {error.count} occurrences
                </span>
              </div>
            ))
          ) : (
            <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No errors recorded
            </p>
          )}
        </div>
      </div>

      {/* Difficulty Distribution */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
        darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
      }`}>
        <h3 className="text-xl font-bold mb-4">Difficulty Distribution</h3>
        <PieChartSimple
          data={[
            { label: 'Easy', value: analytics.difficultyDistribution.easy || 0, color: '#10b981' },
            { label: 'Moderate', value: analytics.difficultyDistribution.moderate || 0, color: '#eab308' },
            { label: 'Hard', value: analytics.difficultyDistribution.hard || 0, color: '#ef4444' }
          ]}
        />
        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {analytics.difficultyDistribution.easy || 0}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Easy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {analytics.difficultyDistribution.moderate || 0}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Moderate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {analytics.difficultyDistribution.hard || 0}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hard</div>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      {analytics.performanceTrends && analytics.performanceTrends.length > 0 && (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
          darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
        }`}>
          <h3 className="text-xl font-bold mb-4">Performance Trends (Last 30 Days)</h3>
          <LineChart
            data={analytics.performanceTrends}
            xKey="date"
            yKey="averageScore"
            color="#3b82f6"
          />
        </div>
      )}
    </div>
  );
};

// Scenarios View Component
const ScenariosView = ({ scenarios, darkMode }) => {
  const [enabledScenarios, setEnabledScenarios] = useState(new Set(scenarios.map(s => s.id)));

  const toggleScenario = (scenarioId) => {
    setEnabledScenarios(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scenarioId)) {
        newSet.delete(scenarioId);
      } else {
        newSet.add(scenarioId);
      }
      return newSet;
    });
  };

  const groupedScenarios = useMemo(() => {
    const groups = {};
    scenarios.forEach(scenario => {
      const category = scenario.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(scenario);
    });
    return groups;
  }, [scenarios]);

  return (
    <div className="space-y-6">
      <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
        darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
      }`}>
        <h3 className="text-xl font-bold mb-4">Scenario Management</h3>
        <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Enable or disable scenarios for different grade levels
        </p>

        {Object.entries(groupedScenarios).map(([category, categoryScenarios]) => (
          <div key={category} className="mb-6">
            <h4 className="font-semibold mb-3 capitalize">{category.replace('-', ' ')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryScenarios.map(scenario => (
                <div
                  key={scenario.id}
                  className={`p-4 rounded-lg border transition-all ${
                    enabledScenarios.has(scenario.id)
                      ? darkMode
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-green-50 border-green-200'
                      : darkMode
                        ? 'bg-white/5 border-white/20 opacity-50'
                        : 'bg-gray-50 border-gray-200 opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {scenario.id === 'voice-starting-conversations' ? '👋' :
                           scenario.id === 'voice-active-listening' ? '👂' :
                           scenario.id === 'voice-joining-groups' ? '👥' :
                           scenario.id === 'voice-handling-disagreement' ? '🤝' :
                           scenario.id === 'voice-making-plans' ? '📅' :
                           scenario.id === 'voice-showing-empathy' ? '❤️' :
                           scenario.id === 'voice-asking-for-help' ? '🙋' :
                           scenario.id === 'voice-handling-teasing' ? '🛡️' :
                           scenario.id === 'voice-introducing-yourself' ? '👤' :
                           scenario.id === 'voice-setting-boundaries' ? '🚫' : '💬'}
                        </span>
                        <h5 className="font-semibold">
                          {typeof scenario.title === 'object' 
                            ? scenario.title['6-8'] || scenario.title['3-5'] || Object.values(scenario.title)[0]
                            : scenario.title || scenario.id}
                        </h5>
                      </div>
                      <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {typeof scenario.description === 'object'
                          ? scenario.description['6-8'] || scenario.description['3-5'] || Object.values(scenario.description)[0]
                          : scenario.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          scenario.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                          scenario.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {scenario.difficulty}
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {scenario.estimatedDuration} min
                        </span>
                        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Grades: {scenario.gradeRanges?.join(', ') || 'All'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleScenario(scenario.id)}
                      className={`ml-4 p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        enabledScenarios.has(scenario.id)
                          ? darkMode ? 'bg-green-500/20 hover:bg-green-500/30' : 'bg-green-100 hover:bg-green-200'
                          : darkMode ? 'bg-gray-600/20 hover:bg-gray-600/30' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {enabledScenarios.has(scenario.id) ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, subtitle, color, darkMode }) => {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    emerald: 'text-emerald-400'
  };

  return (
    <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
      darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 ${colorClasses[color]}`} />
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="font-semibold mb-1">{label}</div>
      {subtitle && (
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default VoicePracticeAdminDashboard;

