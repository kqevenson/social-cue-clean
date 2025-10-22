import React, { useState, useEffect } from 'react';
import { lessonApiService } from '../../services/lessonApi';
import { getLearnerProfile } from '../../firebaseHelpers';
import LessonLoader from './animations/LessonLoader';
import LessonIntroduction from './lessons/LessonIntroduction';
import LessonExplanation from './lessons/LessonExplanation';
import LessonSummary from './lessons/LessonSummary';
import PracticeSession from './PracticeSession';

function AILessonSession({ sessionId, onNavigate, darkMode, gradeLevel, soundEffects, autoReadText }) {
  const [lessonState, setLessonState] = useState('loading'); // loading, introduction, explanation, practice, summary, error
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [practiceSessionComplete, setPracticeSessionComplete] = useState(false);

  useEffect(() => {
    loadAILesson();
  }, []);

  const loadAILesson = async () => {
    try {
      console.log('🤖 Loading AI lesson for session:', sessionId);
      
      // Get learner profile data for personalization
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const learnerId = userData.userId || 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      
      let learnerProfile = null;
      try {
        learnerProfile = await getLearnerProfile(learnerId);
        console.log('📊 Learner profile loaded:', learnerProfile);
      } catch (error) {
        console.log('⚠️ No learner profile found, using defaults');
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
        
        // Generate new lesson
        aiLesson = await lessonApiService.generateLesson(
          topicName,
          gradeLevel,
          currentSkillLevel,
          learnerStrengths,
          learnerWeaknesses
        );
        
        // Cache the lesson
        lessonApiService.cacheLesson(aiLesson, cacheKey);
      } else {
        console.log('📦 Using cached lesson:', aiLesson.introduction.title);
      }

      setLesson(aiLesson);
      setLessonState('introduction');
      
    } catch (error) {
      console.error('❌ Error loading AI lesson:', error);
      setError(error.message);
      setLessonState('error');
    }
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

  const handleRetry = () => {
    setError(null);
    setLessonState('loading');
    loadAILesson();
  };

  const handleUsePreMadeLesson = () => {
    console.log('🔄 Falling back to pre-made lesson');
    setLessonState('practice');
  };

  // Show loading screen
  if (lessonState === 'loading') {
    return <LessonLoader onComplete={() => {}} />;
  }

  // Show error screen
  if (lessonState === 'error') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-6">😔</div>
          <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all"
            >
              Try Again
            </button>
            <button
              onClick={handleUsePreMadeLesson}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-700 transition-all"
            >
              Use Pre-made Lesson
            </button>
          </div>
        </div>
      </div>
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
      />
    );
  }

  return null;
}

export default AILessonSession;

