import React, { useState, useEffect } from 'react';
import { Play, Clock, Sparkles, TrendingUp, MessageCircle, Ear, Users, Zap, Loader, MessageSquare, Target, Shield, Heart, Compass } from 'lucide-react';
import { getLearnerProfile, getSessionStats, getAllTopicMastery, getLessonProgressStats } from '../../firebaseHelpers';
import AnimatedLogo from './AnimatedLogo';

function HomeScreen({ userData, onNavigate, darkMode, soundEffects }) {
  // Debug: Log userData to see what we're getting
  console.log('HomeScreen userData:', userData);

  // Firebase data state
  const [firebaseData, setFirebaseData] = useState({
    learnerProfile: null,
    sessionStats: null,
    topicMastery: [],
    lessonProgressStats: null,
    isLoading: true,
    error: null
  });

  // Load Firebase data on component mount
  useEffect(() => {
    const loadFirebaseData = async () => {
      if (!userData?.userId) {
        console.log('⚠️ No userId found, using localStorage data only');
        setFirebaseData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        console.log('🔄 Loading Firebase data for user:', userData.userId);

        // Load all Firebase data in parallel
        const [learnerProfile, sessionStats, topicMastery, lessonProgressStats] = await Promise.all([
          getLearnerProfile(userData.userId),
          getSessionStats(userData.userId),
          getAllTopicMastery(userData.userId),
          getLessonProgressStats(userData.userId)
        ]);

        console.log('✅ Firebase data loaded:', {
          learnerProfile,
          sessionStats,
          topicMastery: topicMastery.length,
          lessonProgressStats
        });

        setFirebaseData({
          learnerProfile,
          sessionStats,
          topicMastery,
          lessonProgressStats,
          isLoading: false,
          error: null
        });

      } catch (error) {
        console.error('❌ Error loading Firebase data:', error);
        setFirebaseData(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
      }
    };

    loadFirebaseData();
  }, [userData?.userId]);

  const lessons = [
    { id: 'small-talk', title: 'Small Talk', subtitle: 'Start conversations', color: '#4A90E2', icon: <MessageCircle className="w-6 h-6" /> },
    { id: 'active-listening', title: 'Active Listening', subtitle: 'Really hear others', color: '#34D399', icon: <Ear className="w-6 h-6" /> },
    { id: 'body-language', title: 'Body Language', subtitle: 'Read the signals', color: '#8B5CF6', icon: <Users className="w-6 h-6" /> },
    { id: 'confidence', title: 'Confidence', subtitle: 'Own the room', color: '#14B8A6', icon: <Zap className="w-6 h-6" /> },
    { id: 'conflict', title: 'Conflict Resolution', subtitle: 'Stay cool under pressure', color: '#EF4444', icon: <Shield className="w-6 h-6" /> },
    { id: 'making-friends', title: 'Making Friends', subtitle: 'Build real connections', color: '#EC4899', icon: <Heart className="w-6 h-6" /> },
  ];

  const practices = [
    { id: 'roleplay', title: 'Role Play', subtitle: 'Practice real scenarios', color: '#F59E0B', icon: <MessageCircle className="w-6 h-6" /> },
    { id: 'spot-the-cue', title: 'Spot the Cue', subtitle: 'Test your skills', color: '#4A90E2', icon: <Target className="w-6 h-6" /> },
    { id: 'quiz', title: 'Quick Quiz', subtitle: 'What would you do?', color: '#8B5CF6', icon: <Sparkles className="w-6 h-6" /> },
    { id: 'mirror', title: 'Mirror Mode', subtitle: 'Practice expressions', color: '#34D399', icon: <Users className="w-6 h-6" /> },
  ];

  // Calculate stats from Firebase data with fallback to localStorage
  const calculateStats = () => {
    const { learnerProfile, sessionStats, topicMastery, lessonProgressStats } = firebaseData;

    return [
      {
        label: 'Day Streak',
        value: String(learnerProfile?.streak || userData?.streak || 0),
        icon: <Sparkles className="w-5 h-5" />,
        gradient: 'from-emerald-500 to-emerald-600'
      },
      {
        label: 'Sessions',
        value: String(sessionStats?.totalSessions || userData?.totalSessions || 0),
        icon: <Play className="w-5 h-5" />,
        gradient: 'from-blue-400 to-blue-500'
      },
      {
        label: 'Lessons',
        value: String(lessonProgressStats?.completedLessons || 0),
        icon: <Users className="w-5 h-5" />,
        gradient: 'from-orange-400 to-orange-500'
      }
    ];
  };

  const stats = calculateStats();

  return (
    <div className="pb-24">
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <AnimatedLogo darkMode={darkMode} />

            <div className="text-right">
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Welcome back,</div>
              <div className="font-bold text-2xl" style={{
                background: 'linear-gradient(to right, #60a5fa, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {userData?.userName || 'Alex'}
              </div>
            </div>
          </div>
        </header>

        <section className="mb-8">
          <div className="relative rounded-3xl overflow-hidden" style={{height: '300px'}}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-400"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <div className="mb-3">
                <span className="bg-emerald-400 text-black text-xs font-bold px-3 py-1.5 rounded-full">FEATURED</span>
              </div>
              <h1 className="text-3xl font-bold mb-3 text-white">Master Small Talk</h1>
              <p className="text-base mb-4 opacity-90 max-w-2xl text-white">Learn conversation starters that work in any situation</p>
              <div className="flex items-center gap-4">
                <button onClick={() => onNavigate('practiceHome')} className="bg-white text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors">
                  <Play className="w-5 h-5" fill="black" />
                  Start Session
                </button>
                <div className="text-sm opacity-90 text-white">15 min • Beginner</div>
              </div>
            </div>
          </div>
        </section>

        {/* Parent Dashboard Access */}
        {userData?.role === 'parent' && (
          <section className="mb-8">
            <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
              darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-blue-500" />
                <h3 className="text-xl font-bold">Parent Dashboard</h3>
              </div>
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Monitor your child's learning progress and get insights to support their social skills development.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const savedChildId = localStorage.getItem('selectedChildId');
                    if (savedChildId) {
                      onNavigate('parent-dashboard');
                    } else {
                      const childId = prompt('Enter your child\'s user ID (or use test-user-123 for demo):');
                      if (childId) {
                        localStorage.setItem('selectedChildId', childId);
                        onNavigate('parent-dashboard');
                      }
                    }
                  }}
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  View Progress Dashboard
                </button>
                <button
                  onClick={() => {
                    const childId = prompt('Enter your child\'s user ID (or use test-user-123 for demo):');
                    if (childId) {
                      localStorage.setItem('selectedChildId', childId);
                      onNavigate('parent-dashboard');
                    }
                  }}
                  className={`px-6 py-3 rounded-full font-bold border transition-all ${
                    darkMode
                      ? 'border-white/20 text-white hover:bg-white/10'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Select Child
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="mb-8">
          <div className={`backdrop-blur-xl border rounded-3xl p-6 transition-all ${
            darkMode ? 'bg-white/6 border-white/15' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            {firebaseData.isLoading ? (
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center text-center animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-40 mb-2" />
                    <div className={`h-3 w-16 rounded-full ${darkMode ? 'bg-white/10' : 'bg-gray-200'} mb-1`} />
                    <div className={`h-3 w-20 rounded-full ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className={`text-4xl font-extrabold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1`}> {stat.value}</div>
                    <div className={`text-sm font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{stat.label}</div>
                    {firebaseData.error && (
                      <div className="text-xs text-orange-500 mt-1">Using cached data</div>
                    )}
                    {firebaseData.learnerProfile && !firebaseData.error && (
                      <div className="text-xs text-emerald-500 mt-1">Live data</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 1. Lessons */}
        <section className="mb-8">
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Lessons</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {lessons.map(lesson => (
              <button
                key={lesson.id}
                onClick={() => onNavigate('practiceHome', { topic: lesson.id })}
                className={`backdrop-blur-xl border rounded-2xl overflow-hidden hover:border-white/30 transition-all cursor-pointer group flex-shrink-0 w-48 ${
                  darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <div className="p-4 flex items-center justify-center" style={{backgroundColor: `${lesson.color}DD`}}>
                  <div className="text-white">
                    {lesson.icon}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{lesson.title}</h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{lesson.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 2. Live Practice */}
        <section className="mb-8">
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Live Practice</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {practices.map(practice => (
              <button
                key={practice.id}
                onClick={() => onNavigate('practiceHome', { mode: practice.id })}
                className={`backdrop-blur-xl border rounded-2xl overflow-hidden hover:border-white/30 transition-all cursor-pointer group flex-shrink-0 w-48 ${
                  darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <div className="p-4 flex items-center justify-center" style={{backgroundColor: `${practice.color}DD`}}>
                  <div className="text-white">
                    {practice.icon}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{practice.title}</h3>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{practice.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 3. Cue -- take your skills into the real world */}
        <section className="mb-8">
          <button
            onClick={() => onNavigate('cue')}
            className={`w-full backdrop-blur-xl border rounded-2xl p-5 text-left transition-all group hover:scale-[1.01] ${
              darkMode
                ? 'bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/20 hover:border-emerald-500/40'
                : 'bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Cue
                </h3>
                <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                  You've got the skills -- now try them in the real world!
                </p>
              </div>
              <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </section>

        {/* 4. Social Sandbox */}
        <section className="mb-8">
          <button
            onClick={() => onNavigate('sandbox')}
            className={`w-full backdrop-blur-xl border rounded-2xl p-5 text-left transition-all group hover:scale-[1.01] ${
              darkMode
                ? 'bg-gradient-to-r from-orange-500/10 to-purple-500/10 border-orange-500/20 hover:border-orange-500/40'
                : 'bg-gradient-to-r from-orange-50 to-purple-50 border-orange-200 hover:border-orange-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Need to blow off steam?
                  </h3>
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-500/20 text-orange-400">
                    NEW
                  </span>
                </div>
                <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                  Your safe space to vent, process, and learn - no judgment, no grades
                </p>
              </div>
              <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </section>
      </div>
    </div>
  );
}

export default HomeScreen;
