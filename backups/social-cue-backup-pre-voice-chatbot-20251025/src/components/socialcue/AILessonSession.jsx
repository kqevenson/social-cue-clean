import React, { useState, useEffect } from 'react';
import { lessonApiService } from '../../services/lessonApi';
import { getLearnerProfile } from '../../firebaseHelpers';
import adaptiveErrorHandler from '../../services/adaptiveErrorHandler';
import LessonLoader from './animations/LessonLoader';
import LessonIntroduction from './lessons/LessonIntroduction';
import LessonExplanation from './lessons/LessonExplanation';
import LessonSummary from './lessons/LessonSummary';
import PracticeSession from './PracticeSession';
import { ErrorBoundaryFallback } from './animations/ErrorBoundaryFallback';
import { ToastNotification } from './animations';
import { LessonSkeleton } from './animations/SkeletonScreens';

function AILessonSession({ sessionId, onNavigate, darkMode, gradeLevel, soundEffects, autoReadText }) {
  const [lessonState, setLessonState] = useState('loading'); // loading, introduction, explanation, practice, summary, error
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('general');
  const [pointsEarned, setPointsEarned] = useState(0);
  const [practiceSessionComplete, setPracticeSessionComplete] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');
  const [showToast, setShowToast] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [fallbackMode, setFallbackMode] = useState(false);

  useEffect(() => {
    loadAILesson();
    
    // Listen for network status changes
    const handleNetworkChange = (event) => {
      setIsOnline(event.detail.isOnline);
      if (event.detail.isOnline && fallbackMode) {
        showToastMessage('Connection restored! AI features are back online.', 'success');
        adaptiveErrorHandler.resetFallbackMode();
        setFallbackMode(false);
      }
    };
    
    window.addEventListener('networkStatusChange', handleNetworkChange);
    
    return () => {
      window.removeEventListener('networkStatusChange', handleNetworkChange);
    };
  }, [fallbackMode]);

  const showToastMessage = (message, type = 'info', duration = 4000) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const loadAILesson = async () => {
    try {
      console.log('🤖 Loading AI lesson for session:', sessionId);
      
      // Check for interrupted session first
      const interruptedSession = adaptiveErrorHandler.resumeInterruptedSession();
      if (interruptedSession) {
        showToastMessage('Resuming your previous session...', 'info');
      }
      
      // Get learner profile data for personalization
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const learnerId = userData.userId || 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      
      let learnerProfile = null;
      try {
        learnerProfile = await getLearnerProfile(learnerId);
        console.log('📊 Learner profile loaded:', learnerProfile);
      } catch (error) {
        console.log('⚠️ No learner profile found, using defaults');
        showToastMessage('Using default settings - your progress will still be saved', 'warning');
      }

      // Generate cache key
      const topicName = getTopicName(sessionId);
      const currentSkillLevel = learnerProfile?.currentLevel || 1;
      const learnerStrengths = learnerProfile?.strengths || ['general social skills'];
      const learnerWeaknesses = learnerProfile?.needsWork || ['general social skills'];
      
      const cacheKey = lessonApiService.generateCacheKey(
        topicName, 
        gradeLevel, 
        currentSkillLevel, 
        learnerStrengths, 
        learnerWeaknesses
      );

      // Check cache first
      let aiLesson = lessonApiService.getCachedLesson(cacheKey);
      
      if (!aiLesson) {
        console.log('🔄 No cached lesson found, generating new one...');
        
        // Show loading screen
        setLessonState('loading');
        
        // Check if we should use fallback mode
        if (!isOnline || adaptiveErrorHandler.fallbackMode) {
          console.log('🔄 Using fallback lesson generation');
          setFallbackMode(true);
          showToastMessage('Using basic lesson mode - AI features unavailable', 'warning');
          
          // Create a basic lesson structure
          aiLesson = createFallbackLesson(topicName, gradeLevel);
        } else {
          try {
            // Generate new lesson with error handling
            aiLesson = await adaptiveErrorHandler.retryOperation(
              () => lessonApiService.generateLesson(
                topicName,
                gradeLevel,
                currentSkillLevel,
                learnerStrengths,
                learnerWeaknesses
              ),
              'lesson_generation',
              { topicName, gradeLevel, currentSkillLevel }
            );
            
            // Cache the lesson
            lessonApiService.cacheLesson(aiLesson, cacheKey);
            showToastMessage('AI lesson generated successfully!', 'success');
          } catch (error) {
            console.warn('AI lesson generation failed, using fallback:', error);
            setFallbackMode(true);
            showToastMessage('Using basic lesson mode - AI unavailable', 'warning');
            aiLesson = createFallbackLesson(topicName, gradeLevel);
          }
        }
      } else {
        console.log('📦 Using cached lesson:', aiLesson.introduction.title);
        showToastMessage('Loading your personalized lesson...', 'info');
      }

      setLesson(aiLesson);
      setLessonState('introduction');
      
    } catch (error) {
      console.error('❌ Error loading AI lesson:', error);
      const errorType = adaptiveErrorHandler.classifyError(error);
      setErrorType(errorType);
      setError(error);
      setLessonState('error');
      showToastMessage(adaptiveErrorHandler.getUserFriendlyMessage(error, errorType), 'error');
    }
  };

  const createFallbackLesson = (topicName, gradeLevel) => {
    console.log('🔄 Creating fallback lesson for:', topicName);
    
    return {
      introduction: {
        title: `${topicName} Practice`,
        description: `Let's practice ${topicName.toLowerCase()} skills together!`,
        objectives: [
          'Understand basic social skills',
          'Practice making good choices',
          'Learn from feedback'
        ],
        estimatedTime: '5-10 minutes'
      },
      explanation: {
        title: `What is ${topicName}?`,
        content: `${topicName} is an important social skill that helps us interact well with others.`,
        keyPoints: [
          'Be respectful to others',
          'Listen carefully',
          'Think before you act'
        ]
      },
      practice: {
        scenarios: [
          {
            context: 'You are at school and want to make a new friend.',
            prompt: 'What should you do?',
            options: [
              {
                text: 'Walk up and introduce yourself',
                isGood: true,
                feedback: 'Great choice! Introducing yourself is a good way to start a friendship.',
                points: 10
              },
              {
                text: 'Wait for them to talk to you first',
                isGood: false,
                feedback: 'Sometimes it\'s okay to wait, but being friendly first can help make friends.',
                proTip: 'Try saying "Hi, I\'m [your name]. What\'s your name?"'
              }
            ]
          }
        ]
      },
      summary: {
        title: 'Great job practicing!',
        message: 'You\'ve completed the practice session. Keep practicing these skills!',
        nextSteps: [
          'Try these skills with friends',
          'Practice at home',
          'Come back for more practice'
        ]
      },
      isFallback: true
    };
  };

  const getTopicName = (sessionId) => {
    const topicMap = {
      1: 'Making Friends',
      2: 'Active Listening',
      3: 'Body Language',
      4: 'Small Talk',
      5: 'Conflict Resolution',
      6: 'Teamwork',
      7: 'Empathy',
      8: 'Assertiveness'
    };
    return topicMap[sessionId] || 'Social Skills';
  };

  const handleStartLesson = () => {
    setLessonState('explanation');
  };

  const handleStartPractice = () => {
    setLessonState('practice');
  };

  const handlePracticeComplete = (points) => {
    setPointsEarned(points);
    setPracticeSessionComplete(true);
    setLessonState('summary');
  };

  const handleCompleteLesson = () => {
    onNavigate('home');
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setError(null);
    setLessonState('loading');
    
    try {
      await loadAILesson();
      showToastMessage('Retry successful!', 'success');
    } catch (error) {
      showToastMessage('Retry failed. Using basic mode.', 'warning');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleUsePreMadeLesson = () => {
    console.log('🔄 Falling back to pre-made lesson');
    setFallbackMode(true);
    setError(null);
    setLessonState('practice');
    showToastMessage('Using basic lesson mode', 'info');
  };

  const handleSessionInterruption = () => {
    const sessionData = {
      sessionId,
      lessonState,
      pointsEarned,
      timestamp: new Date().toISOString()
    };
    
    adaptiveErrorHandler.handleSessionInterruption(sessionData);
    showToastMessage('Session saved - you can resume later', 'info');
  };

  // Show loading screen
  if (lessonState === 'loading') {
    return <LessonLoader onComplete={() => {}} />;
  }

  // Show error screen
  if (lessonState === 'error') {
    return (
      <>
        <ErrorBoundaryFallback
          error={error}
          errorType={errorType}
          onRetry={handleRetry}
          onFallback={handleUsePreMadeLesson}
          showDetails={false}
        />
        {isRetrying && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-xl p-6 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-white">Retrying...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Show lesson introduction
  if (lessonState === 'introduction') {
    return (
      <LessonIntroduction 
        lesson={lesson} 
        onStart={handleStartLesson}
      />
    );
  }

  // Show lesson explanation
  if (lessonState === 'explanation') {
    return (
      <LessonExplanation 
        lesson={lesson} 
        onStartPractice={handleStartPractice}
      />
    );
  }

  // Show practice session
  if (lessonState === 'practice') {
    return (
      <PracticeSession
        sessionId={sessionId}
        onNavigate={onNavigate}
        darkMode={darkMode}
        gradeLevel={gradeLevel}
        soundEffects={soundEffects}
        autoReadText={autoReadText}
        aiLesson={lesson}
        onComplete={handlePracticeComplete}
      />
    );
  }

  // Show lesson summary
  if (lessonState === 'summary') {
    return (
      <LessonSummary
        lesson={lesson}
        pointsEarned={pointsEarned}
        onComplete={handleCompleteLesson}
        sessionId={sessionId}
      />
    );
  }

  return (
    <>
      {/* Toast Notifications */}
      {showToast && (
        <ToastNotification
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
          duration={4000}
        />
      )}
      
      {/* Network Status Indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-4 bg-red-500/90 backdrop-blur text-white px-3 py-2 rounded-lg text-sm z-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Offline Mode</span>
          </div>
        </div>
      )}
      
      {/* Fallback Mode Indicator */}
      {fallbackMode && (
        <div className="fixed top-4 right-4 bg-yellow-500/90 backdrop-blur text-white px-3 py-2 rounded-lg text-sm z-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span>Basic Mode</span>
          </div>
        </div>
      )}
      
      {/* Session Interruption Handler */}
      {lessonState !== 'error' && lessonState !== 'loading' && (
        <div 
          className="fixed inset-0 z-40"
          onBeforeUnload={handleSessionInterruption}
        />
      )}
    </>
  );
}

export default AILessonSession;

