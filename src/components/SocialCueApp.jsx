import React, { useState, useEffect, useRef, Suspense, lazy, useMemo, useCallback } from 'react';
import { Home, Target, TrendingUp, Settings, BookOpen, User, BarChart3, Star, Mic } from 'lucide-react';
import { getUserData, saveUserData } from './socialcue/utils/storage';
import { lessonApiService } from '../services/lessonApi';
import { ToastProvider, ErrorBoundary } from './socialcue/animations';
import { config, isFeatureEnabled } from '../config/appConfig';
import { trackError, trackVoiceError, trackApiError } from '../services/errorTracker';
import { trackEvent, trackVoicePracticeEvent, trackEngagement } from '../services/analyticsService';
import { startMonitoring, optimizeVoicePractice } from '../services/performanceService';
import { initializeMobileCompatibility, isMobile } from '../services/mobileCompatibilityService';
import { initializeAccessibility } from '../services/accessibilityService';
import HomeScreen from './socialcue/HomeScreen';
import ProgressScreen from './socialcue/ProgressScreen';
import SettingsScreen from './socialcue/SettingsScreen';
import ParentDashboard from './socialcue/ParentDashboard';
import ParentChildOverview from './socialcue/ParentChildOverview';
import LessonSession from './socialcue/LessonSession';
import AILessonSession from './socialcue/AILessonSession';
import AIPracticeSession from './AIPracticeSession';
import LessonsScreen from './socialcue/LessonsScreen';
import LearningPreferencesScreen from './socialcue/LearningPreferencesScreen';
import GoalsScreen from './socialcue/GoalsScreen';
import PracticeScreen from './socialcue/PracticeScreen';
import BottomNav from './socialcue/BottomNav';

// Feature flags
const VOICE_PRACTICE_ENABLED = isFeatureEnabled('voicePractice');

// Lazy load voice components for performance
const VoiceTestPage = lazy(() => import('./voice/VoiceTestPage'));
const VoicePracticeScreen = lazy(() => import('../screens/VoicePracticeScreen'));
const VoicePracticeSelection = lazy(() => import('./voice/VoicePracticeSelection'));

function SocialCueApp({ onLogout }) {
  
  // Check if we should return to a specific screen after reload
  const getInitialScreen = () => {
    const returnScreen = localStorage.getItem('socialcue_return_screen');
    if (returnScreen) {
      console.log('🔄 Returning to screen after reload:', returnScreen);
      localStorage.removeItem('socialcue_return_screen'); // Clean up
      return returnScreen;
    }
    return 'home';
  };

  const [currentScreen, setCurrentScreen] = useState(getInitialScreen());
  const [userData, setUserData] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [autoReadText, setAutoReadText] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  // Initialize analytics and error tracking
  useEffect(() => {
    if (config.features.devMode) {
      console.log('🔧 Social Cue App initialized with config:', config);
    }
    
    // Initialize services
    initializeMobileCompatibility();
    initializeAccessibility();
    
    // Start performance monitoring
    startMonitoring();
    
    // Optimize voice practice if enabled
    if (VOICE_PRACTICE_ENABLED) {
      optimizeVoicePractice();
    }
    
    // Track app initialization
    trackEvent('app_initialized', {
      voicePracticeEnabled: VOICE_PRACTICE_ENABLED,
      userRole: userData?.role,
      gradeLevel: userData?.grade || userData?.gradeLevel,
      deviceInfo: {
        isMobile: window.innerWidth < 768,
        userAgent: navigator.userAgent
      }
    });
  }, [userData]);
  
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
      const baseNavItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'lessons', label: 'Lessons', icon: BookOpen },
        { id: 'practice', label: 'Practice', icon: Mic },  // Changed to Mic icon for voice practice
        { id: 'goals', label: 'Goals', icon: Star },
        { id: 'progress', label: 'Progress', icon: TrendingUp }
      ];

      baseNavItems.push({ id: 'settings', label: 'Settings', icon: Settings });
      
      return baseNavItems;
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

  const handleNavigate = useCallback((screen, sid) => {
    console.log('═════════════════════════════════════');
    console.log('🔀 handleNavigate called');
    console.log('   Screen parameter:', screen);
    console.log('   SessionId parameter:', sid);
    console.log('   Current screen BEFORE:', currentScreen);
    console.log('   User role:', userData?.role);
    
    setCurrentScreen(screen);
    
    console.log('   setCurrentScreen called with:', screen);
    console.log('   New currentScreen will be:', screen);
    console.log('═════════════════════════════════════');
    
    // Handle voice practice navigation
    if (screen === 'voice-practice' && typeof sid === 'object') {
      setSessionData(sid);
      return;
    }
    
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
  }, [currentScreen, userData]);

  const navItems = getNavigationItems(userData?.role);

  // Memoize voice scenario to prevent recreation on every render
  const voiceScenario = useMemo(() => {
    if (currentScreen !== 'practice') return null;
    
    return {
      id: 'general-practice',
      title: 'Social Skills Practice',
      category: 'General Practice',
      description: 'Practice your social skills with Cue',
      context: "Hi! I'm Cue, your social coach! I'm here to help you practice your social skills through conversation. Let's get started with a quick chat!",
      difficulty: 'Beginner',
      icon: '💬'
    };
  }, [currentScreen]);
  
  // Stable callbacks to prevent VoicePracticeScreen re-renders
  const stableOnComplete = useCallback(() => {
    handleNavigate('home');
  }, []);
  
  const stableOnExit = useCallback(() => {
    handleNavigate('home');
  }, []);
  
  // Stable grade level and voice gender
  const stableGradeLevel = useMemo(() => {
    return userData?.grade || userData?.gradeLevel || '6';
  }, [userData?.grade, userData?.gradeLevel]);
  
  const stableVoiceGender = useMemo(() => {
    return userData?.voicePreference || 'female';
  }, [userData?.voicePreference]);

  if (!userData) return null;

  console.log('🎬 RENDERING MAIN APP');
  console.log('   currentScreen:', currentScreen);
  console.log('   sessionId:', sessionId);
  console.log('   VOICE_PRACTICE_ENABLED:', VOICE_PRACTICE_ENABLED);
  console.log('   Checks:');
  console.log('   - practice && !sessionId && !parent && enabled?', currentScreen === 'practice' && !sessionId && userData?.role !== 'parent' && VOICE_PRACTICE_ENABLED);
  console.log('   - lessonSession?', currentScreen === 'lessonSession');
  console.log('   - lessons?', currentScreen === 'lessons');
  console.log('   - home?', currentScreen === 'home');
  console.log('   - progress?', currentScreen === 'progress');
  console.log('   - settings?', currentScreen === 'settings');
  
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
            {console.log('✅ RENDERING LessonsScreen - Showing lesson list')}
            <LessonsScreen 
              userData={userData} 
              onNavigate={handleNavigate} 
              darkMode={darkMode} 
            />
          </ErrorBoundary>
        )}
        
        {/* LESSONS: Educational lesson session with text-based scenarios */}
        {currentScreen === 'lessonSession' && userData?.role !== 'parent' && (
          <ErrorBoundary darkMode={darkMode} onNavigate={handleNavigate}>
            <LessonSession 
              sessionId={userData?.currentSessionId || 1} 
              onNavigate={handleNavigate}
              onComplete={(data) => {
                console.log('Lesson session completed!', data);
                handleNavigate('lessons');
              }}
              onExit={() => {
                console.log('Lesson session exited');
                handleNavigate('lessons');
              }}
              darkMode={darkMode} 
              gradeLevel={userData.grade || "5"} 
              soundEffects={soundEffects}
              autoReadText={autoReadText}
              topicName={userData.topicName}
            />
          </ErrorBoundary>
        )}
        
        {currentScreen === 'ai-practice' && (
          <AIPracticeSession 
            category="AI Practice" 
            gradeLevel={userData.gradeLevel || "6-8"} 
            onComplete={() => handleNavigate('home')}
          />
        )}
        
        {/* Practice Screen */}
        {currentScreen === 'practice' && userData?.role !== 'parent' && (
          <ErrorBoundary darkMode={darkMode} onNavigate={handleNavigate}>
            <PracticeScreen 
              onNavigate={handleNavigate} 
              darkMode={darkMode}
            />
          </ErrorBoundary>
        )}
        
        {/* Voice Practice Selection Screen */}
        {currentScreen === 'voice-practice-selection' && userData?.role !== 'parent' && VOICE_PRACTICE_ENABLED && (
          <ErrorBoundary darkMode={darkMode} onNavigate={handleNavigate}>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading Voice Practice...</p>
                </div>
              </div>
            }>
              <VoicePracticeSelection
                gradeLevel={userData?.grade || userData?.gradeLevel || '6-8'}
                onSelectScenario={(scenario) => {
                  setSessionData({ scenario });
                  handleNavigate('voice-practice');
                }}
                onBack={() => handleNavigate('practice')}
                onNavigate={handleNavigate}
                darkMode={darkMode}
              />
            </Suspense>
          </ErrorBoundary>
        )}
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

        {/* Voice Practice Screen */}
        {currentScreen === 'voice-practice' && userData?.role !== 'parent' && VOICE_PRACTICE_ENABLED && (
          <ErrorBoundary darkMode={darkMode} onNavigate={handleNavigate}>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading Voice Practice...</p>
                </div>
              </div>
            }>
              {(() => {
                // Use ElevenLabs Widget for voice practice
                const ElevenLabsWidget = React.lazy(() => import('./ElevenLabsWidget'));
                
                return (
                  <ElevenLabsWidget
                    agentId={import.meta.env.VITE_ELEVENLABS_AGENT_ID}
                    scenario={sessionData?.scenario}
                    gradeLevel={userData?.grade || userData?.gradeLevel || '6-8'}
                    onClose={() => {
                      console.log('Voice practice widget closed');
                      trackVoicePracticeEvent('voice_practice_exited', {
                        reason: 'user_exit',
                        gradeLevel: userData?.grade || userData?.gradeLevel,
                        scenario: sessionData?.scenario
                      });
                      handleNavigate('voice-practice-selection');
                      setSessionData(null);
                    }}
                  />
                );
              })()}
            </Suspense>
          </ErrorBoundary>
        )}

        {/* Voice Test Page - Development only */}
        {currentScreen === 'voice-test' && import.meta.env.DEV && (
          <ErrorBoundary darkMode={darkMode} onNavigate={handleNavigate}>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading Voice Test...</p>
                </div>
              </div>
            }>
              <VoiceTestPage />
            </Suspense>
          </ErrorBoundary>
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