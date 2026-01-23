import React, { useState, useEffect } from 'react';
import { Home, Target, TrendingUp, Settings, BookOpen, User, BarChart3, Star } from 'lucide-react';
import { getUserData, saveUserData } from './socialcue/utils/storage';
import { lessonApiService } from '../services/lessonApi';
import { ToastProvider, ErrorBoundary } from './socialcue/animations';
import HomeScreen from './socialcue/HomeScreen';
import PracticeScreen from './socialcue/PracticeScreen';
import ProgressScreen from './socialcue/ProgressScreen';
import SettingsScreen from './socialcue/SettingsScreen';
import ParentDashboard from './socialcue/ParentDashboard';
import ParentChildOverview from './socialcue/ParentChildOverview';
import PracticeSession from './socialcue/PracticeSession';
import AILessonSession from './socialcue/AILessonSession';
import AIPracticeSession from './AIPracticeSession';
import LessonsScreen from './socialcue/LessonsScreen';
import LearningPreferencesScreen from './socialcue/LearningPreferencesScreen';
import GoalsScreen from './socialcue/GoalsScreen';
import BottomNav from './socialcue/BottomNav';

function SocialCueApp({ onLogout }) {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [userData, setUserData] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [autoReadText, setAutoReadText] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sessionId, setSessionId] = useState(1);
  const [selectedChildId, setSelectedChildId] = useState(null);
  
  // Calculate new goals count (goals created in the last 5 minutes)
  const getNewGoalsCount = () => {
    try {
      const goals = JSON.parse(localStorage.getItem('socialcue_goals') || '[]');
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      return goals.filter(goal => {
        const createdAt = new Date(goal.createdAt);
        return createdAt > fiveMinutesAgo && goal.status === 'active';
      }).length;
    } catch (error) {
      console.error('Error calculating new goals count:', error);
      return 0;
    }
  };

  const newGoalsCount = getNewGoalsCount();

  // Role-based navigation items
  const getNavigationItems = (userRole) => {
    if (userRole === 'parent') {
      // Parent sees simplified nav with parent-specific icons
      return [
        { id: 'home', label: 'My Child', icon: User },
        { id: 'progress', label: 'Reports', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings }
      ];
    } else {
      // Learner sees full nav
      return [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'lessons', label: 'Lessons', icon: BookOpen },
        { id: 'practice', label: 'Practice', icon: Target },
        { id: 'goals', label: 'Goals', icon: Star },
        { id: 'progress', label: 'Progress', icon: TrendingUp },
        { id: 'settings', label: 'Settings', icon: Settings }
      ];
    }
  };

  useEffect(() => {
    const data = getUserData();
    console.log('SocialCueApp loaded userData:', data);
    setUserData(data);
    
    // Check if user needs adaptive learning initialization
    if (data && data.userId) {
      checkAndInitializeAdaptiveLearning(data.userId, data);
    }
    
    // Load child selection for parents
    const savedChildId = localStorage.getItem('selectedChildId');
    if (savedChildId) {
      setSelectedChildId(savedChildId);
    }
    
    // Load preferences from localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true');
    
    const savedSoundEffects = localStorage.getItem('soundEffects');
    if (savedSoundEffects !== null) setSoundEffects(savedSoundEffects === 'true');
    
    const savedAutoReadText = localStorage.getItem('autoReadText');
    if (savedAutoReadText !== null) setAutoReadText(savedAutoReadText === 'true');
    
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications !== null) setNotifications(savedNotifications === 'true');
  }, []);

  const checkAndInitializeAdaptiveLearning = async (userId, userData) => {
    try {
      console.log('🔍 Checking if user needs adaptive learning initialization:', userId);
      
      const response = await fetch(`http://localhost:3001/api/adaptive/check-init/${userId}`);
      const result = await response.json();
      
      if (result.success && !result.isInitialized) {
        console.log('⚠️ User needs initialization, running background setup...');
        
        // Initialize with default preferences
        const defaultAnswers = {
          learningGoal: 'confidence',
          practiceFrequency: 'few-times-week',
          pace: 'self-paced',
          feedbackStyle: 'encouraging',
          challengeLevel: 'moderate'
        };
        
        await initializeAdaptiveLearning(userId, userData, defaultAnswers);
      } else {
        console.log('✅ User is already initialized');
      }
    } catch (error) {
      console.error('❌ Error checking initialization status:', error);
      // Don't show error to user - this is background initialization
    }
  };

  const initializeAdaptiveLearning = async (userId, userData, answers) => {
    try {
      console.log('🚀 Running background initialization for user:', userId);
      
      const response = await fetch('http://localhost:3001/api/adaptive/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          userData: {
            name: userData.userName || userData.name,
            gradeLevel: userData.gradeLevel || userData.grade || '5'
          },
          onboardingAnswers: answers
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize adaptive learning');
      }

      const result = await response.json();
      console.log('✅ Background initialization completed:', result);
      
    } catch (error) {
      console.error('❌ Error in background initialization:', error);
      // Don't throw error - let user continue
    }
  };

  const toggleDarkMode = (value) => {
    setDarkMode(value);
    localStorage.setItem('darkMode', value.toString());
  };

  const toggleSoundEffects = (value) => {
    setSoundEffects(value);
    localStorage.setItem('soundEffects', value.toString());
  };

  const toggleAutoReadText = (value) => {
    setAutoReadText(value);
    localStorage.setItem('autoReadText', value.toString());
  };

  const toggleNotifications = (value) => {
    setNotifications(value);
    localStorage.setItem('notifications', value.toString());
  };

  const handleNavigate = (screen, sid) => {
    console.log('🧭 Navigating to:', screen, sid ? `with sessionId: ${sid}` : '');
    setCurrentScreen(screen);
    if (sid) {
      setSessionId(sid);
      // Set topicName based on sessionId
      const topicMap = {
        1: 'Small Talk Basics',
        2: 'Active Listening', 
        3: 'Reading Body Language',
        4: 'Building Confidence',
        5: 'Conflict Resolution',
        6: 'Teamwork',
        7: 'Empathy',
        8: 'Assertiveness'
      };
      const topicName = topicMap[sid] || 'Social Skills';
      
      // Update user data with topicName
      const currentData = getUserData();
      const updatedData = { ...currentData, topicName };
      saveUserData(updatedData);
      setUserData(updatedData);
    } else {
      // Reload user data when navigating (but preserve topicName if it exists)
      const data = getUserData();
      setUserData(data);
    }
  };

  const navItems = getNavigationItems(userData?.role);

  if (!userData) return null;

  return (
    <ToastProvider darkMode={darkMode}>
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Home screen - different for parents vs learners */}
        {currentScreen === 'home' && (
          userData?.role === 'parent' ? (
            <ParentChildOverview 
              childUserId={userData.childId || selectedChildId || 'test-user-123'}
              darkMode={darkMode}
              onNavigate={handleNavigate}
            />
          ) : (
            <HomeScreen 
              userData={userData} 
              onNavigate={handleNavigate} 
              darkMode={darkMode} 
              soundEffects={soundEffects}
            />
          )
        )}
        
        {/* Lessons - only for learners */}
        {currentScreen === 'lessons' && userData?.role !== 'parent' && (
          <ErrorBoundary darkMode={darkMode} onNavigate={handleNavigate}>
            <LessonsScreen 
              userData={userData} 
              onNavigate={handleNavigate} 
              darkMode={darkMode} 
            />
          </ErrorBoundary>
        )}
        
        {/* Practice Session - only for learners */}
        {currentScreen === 'practice' && sessionId && userData?.role !== 'parent' && (
          <ErrorBoundary darkMode={darkMode} onNavigate={handleNavigate}>
            <PracticeSession 
              sessionId={sessionId} 
              onNavigate={handleNavigate}
              onComplete={(data) => {
                console.log('Session completed!', data);
                handleNavigate('progress');
                setSessionId(null);
              }}
              onExit={() => {
                console.log('Session exited');
                handleNavigate('home');
                setSessionId(null);
              }}
              darkMode={darkMode} 
              gradeLevel={userData.grade || "5"} 
              soundEffects={soundEffects}
              autoReadText={autoReadText}
              topicName={userData.topicName}
            />
          </ErrorBoundary>
        )}
        
        {/* Practice Home - only for learners */}
        {currentScreen === 'practiceHome' && userData?.role !== 'parent' && (
          <PracticeScreen 
            onNavigate={handleNavigate} 
            darkMode={darkMode} 
          />
        )}
        
        {currentScreen === 'ai-practice' && (
          <AIPracticeSession 
            category="AI Practice" 
            gradeLevel={userData.gradeLevel || "6-8"} 
            onComplete={() => handleNavigate('home')}
          />
        )}
        
        {/* Progress - different for parents vs learners */}
        {currentScreen === 'progress' && (
          userData?.role === 'parent' ? (
            <ParentDashboard 
              childUserId={userData.childId || selectedChildId || 'test-user-123'}
              darkMode={darkMode}
            />
          ) : (
            <ErrorBoundary darkMode={darkMode} onNavigate={handleNavigate}>
              <ProgressScreen 
                userData={userData} 
                darkMode={darkMode} 
                onNavigate={handleNavigate}
              />
            </ErrorBoundary>
          )
        )}
        
        {currentScreen === 'goals' && (
          <ErrorBoundary darkMode={darkMode} onNavigate={handleNavigate}>
            <ToastProvider darkMode={darkMode}>
              <GoalsScreen 
                userData={userData} 
                darkMode={darkMode} 
                onNavigate={handleNavigate}
              />
            </ToastProvider>
          </ErrorBoundary>
        )}
        
        {currentScreen === 'settings' && (
          <SettingsScreen 
            userData={userData} 
            darkMode={darkMode} 
            onToggleDarkMode={toggleDarkMode} 
            soundEffects={soundEffects} 
            onToggleSoundEffects={toggleSoundEffects}
            autoReadText={autoReadText}
            onToggleAutoReadText={toggleAutoReadText}
            notifications={notifications}
            onToggleNotifications={toggleNotifications}
            onLogout={onLogout}
            onNavigate={handleNavigate}
          />
        )}
        
        {currentScreen === 'learning-preferences' && (
          <LearningPreferencesScreen 
            onNavigate={handleNavigate}
            darkMode={darkMode}
            gradeLevel={userData?.gradeLevel || '5'}
          />
        )}

        {currentScreen === 'parent-dashboard' && (
          <ParentDashboard 
            childUserId={selectedChildId || 'test-user-123'}
            darkMode={darkMode}
          />
        )}
      </div>

      <BottomNav 
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        darkMode={darkMode}
        navItems={navItems}
        newGoalsCount={newGoalsCount}
      />

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { height: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 4px; }
        `}</style>
      </div>
    </ToastProvider>
  );
}

export default SocialCueApp;