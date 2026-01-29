import React, { useState, useEffect } from 'react';
import { lessonApiService } from '../../services/lessonApi.js';
import { getLearnerProfile } from '../../firebaseHelpers';
import adaptiveErrorHandler from '../../services/adaptiveErrorHandler';
import LessonLoader from './animations/LessonLoader';
import LessonIntroduction from './lessons/LessonIntroduction';
import LessonExplanation from './lessons/LessonExplanation';
import LessonSummary from './lessons/LessonSummary';
import LessonVideoScene from '../lessons/LessonVideoScene';
import SpotTheCue from './lessons/SpotTheCue';
import AIPracticeSession from "../AIPracticeSession";
import { ErrorBoundaryFallback } from './animations/ErrorBoundaryFallback';
import { generateEmotionAwareMCQs } from "../../utils/generateEmotionAwareMCQs";
import { ToastNotification } from './animations';
import { LessonSkeleton } from './animations/SkeletonScreens';
import { normalizeLesson, createFallbackLesson } from '../../services/lessonNormalizer';

function AILessonSession({ sessionId, onNavigate, darkMode, gradeLevel, soundEffects, autoReadText }) {
  const [lessonState, setLessonState] = useState('loading'); // loading, introduction, explanation, practice, summary, error
  const [lesson, setLesson] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState('general');
  const [pointsEarned, setPointsEarned] = useState(0);
  const [practiceSessionComplete, setPracticeSessionComplete] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [videoEmotionData, setVideoEmotionData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');
  const [showToast, setShowToast] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load lesson data passed from LessonsScreen
  const storedLesson = JSON.parse(localStorage.getItem("currentLessonData") || "{}");
  console.log("📦 Retrieved lesson data:", storedLesson);
  console.log("📦 aiLesson:", storedLesson.aiLesson);
  console.log("📦 aiLesson type:", typeof storedLesson.aiLesson);
  console.log("📦 aiLesson keys:", storedLesson.aiLesson ? Object.keys(storedLesson.aiLesson) : null);
  const incomingLesson = storedLesson.aiLesson || null;
  const incomingVideo = storedLesson.videoUrl || null;

  const getTopicName = (sessionId) => {
    // Handle string sessionIds (like "small-talk")
    const topicMap = {
      'small-talk': 'Small Talk Mastery',
      'active-listening': 'Active Listening',
      'body-language': 'Body Language',
      'confidence-building': 'Building Confidence',
      'conflict-resolution': 'Conflict Resolution',
      1: 'Making Friends',
      2: 'Active Listening',
      3: 'Body Language',
      4: 'Small Talk',
      5: 'Conflict Resolution',
      6: 'Teamwork',
      7: 'Empathy',
      8: 'Assertiveness'
    };
    return topicMap[sessionId] || storedLesson.title || 'Social Skills';
  };

  const showToastMessage = (message, type = 'info', duration = 4000) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const loadLesson = async () => {
    try {
      setIsLoading(true);

      const lessonTitle = storedLesson.title || getTopicName(sessionId);
      const lessonId = storedLesson.id || sessionId;

      const res = await lessonApiService.startLesson({
        title: lessonTitle,
        lessonId: lessonId,
        gradeLevel: gradeLevel,
      });

      setLesson(normalizeLesson(res.lesson));
      setVideoUrl(res.videoUrl || null);
      setLessonState("introduction");
    } catch (err) {
      console.error("❌ Lesson load failed:", err);
      setError("Unable to load lesson");
      setLessonState("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Track lessonState changes
  useEffect(() => {
    console.log("🔄 lessonState changed to:", lessonState);
  }, [lessonState]);

  useEffect(() => {
    console.log("🔄 AILessonSession useEffect triggered", {
      sessionId,
      gradeLevel,
      hasIncomingLesson: !!incomingLesson,
      incomingLessonType: typeof incomingLesson,
      incomingLessonValue: incomingLesson
    });
    
    // Use stored lesson if available (already loaded by LessonsScreen)
    if (incomingLesson) {
      console.log("✅ Using stored lesson data:", {
        title: incomingLesson.title,
        id: incomingLesson.id,
        hasIntroduction: !!incomingLesson.introduction,
        hasPractice: !!incomingLesson.practice,
        keys: Object.keys(incomingLesson)
      });
      const normalized = normalizeLesson(incomingLesson);
      console.log("📦 Normalized lesson:", {
        hasLesson: !!normalized,
        lessonState: normalized ? Object.keys(normalized) : null
      });
      setLesson(normalized);
      setVideoUrl(incomingVideo);
      console.log("📦 Setting lessonState to 'introduction'");
      setLessonState("introduction");
      setIsLoading(false);
      return;
    }

    // Only fetch from API if no stored lesson
    console.log("⚠️ No stored lesson found, fetching from API...");
    loadLesson();
  }, [sessionId, gradeLevel]);

  const handleStartLesson = () => {
    setLessonState('explanation');
  };

  const handleStartPractice = () => {
    setLessonState('spot_the_cue');
  };

  const handleSpotTheCueComplete = (points) => {
    setPointsEarned((p) => p + (points || 0));
    setLessonState('scene_video');
  };

  const handleVideoSceneComplete = () => {
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
      // Reload lesson using new unified API
      const lessonTitle = storedLesson.title || getTopicName(sessionId);
      const lessonId = storedLesson.id || sessionId;
      
      const res = await lessonApiService.startLesson({
        title: lessonTitle,
        lessonId: lessonId,
        gradeLevel: gradeLevel,
      });
      
      setLesson(normalizeLesson(res.lesson));
      setVideoUrl(res.videoUrl || null);
      setLessonState("introduction");
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
    console.log("📦 Rendering introduction screen", {
      hasLesson: !!lesson,
      lessonType: typeof lesson,
      lessonKeys: lesson ? Object.keys(lesson) : null,
      hasIntroduction: lesson?.introduction ? Object.keys(lesson.introduction) : null
    });
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

  // Show Spot the Cue game
  if (lessonState === 'spot_the_cue') {
    return (
      <SpotTheCue
        lesson={lesson}
        gradeLevel={gradeLevel}
        darkMode={darkMode}
        onComplete={handleSpotTheCueComplete}
      />
    );
  }

  // Show video scene step
  if (lessonState === 'scene_video') {
    return (
      <LessonVideoScene
        gradeLevel={gradeLevel}
        videoUrl={incomingVideo}
        topicId={storedLesson.id}
        darkMode={darkMode}
        onContinue={handleVideoSceneComplete}
        onVideoAnalyzed={(emotionData) => {
          setVideoEmotionData(emotionData); // used by Patch 5
        }}
      />
    );
  }

  // Show practice session
  if (lessonState === 'practice') {
    // Generate emotion-aware MCQs before rendering practice
    let emotionMCQ = null;
    let enhancedLesson = lesson;

    if (lesson?.practice?.scenarios && videoEmotionData) {
      try {
        emotionMCQ = generateEmotionAwareMCQs({
          practiceScenarios: lesson.practice.scenarios,
          videoEmotionData,
          gradeLevel,
          topicId: lesson?.id || sessionId
        });

        // Update lesson with emotion-aware scenarios
        enhancedLesson = {
          ...lesson,
          practice: {
            ...lesson.practice,
            scenarios: emotionMCQ.updatedScenarios,
            dominantEmotion: emotionMCQ.dominantEmotion,
            difficultyLevel: emotionMCQ.difficultyApplied
          }
        };
      } catch (err) {
        console.warn("Error generating emotion-aware MCQs:", err);
        // Fallback to original lesson
        enhancedLesson = lesson;
      }
    }

    return (
      <AIPracticeSession
        sessionId={sessionId}
        onNavigate={onNavigate}
        darkMode={darkMode}
        gradeLevel={gradeLevel}
        soundEffects={soundEffects}
        autoReadText={autoReadText}
        aiLesson={enhancedLesson}
        onComplete={handlePracticeComplete}
        videoEmotionData={videoEmotionData}
        emotionMCQ={emotionMCQ}
      />
    );
  }

  // Show lesson summary
  if (lessonState === 'summary') {
    console.log("⚠️ Rendering summary screen - lessonState is 'summary'", {
      lessonState,
      hasLesson: !!lesson,
      pointsEarned
    });
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

