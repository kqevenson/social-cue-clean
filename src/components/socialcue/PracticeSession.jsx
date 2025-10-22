import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, RotateCcw, Lightbulb, Volume2, VolumeX, Home, Info, Sparkles, BookOpen, Target, Trophy } from 'lucide-react';
import { getUserData, STORAGE_KEY } from './utils/storage';
import { getGradeRange } from './utils/helpers';
import { lessonApiService } from '../../services/lessonApi';
import { apiService } from '../../services/api';
import { getLearnerProfile } from '../../firebaseHelpers';
import SuccessAnimation from './animations/SuccessAnimation';
import LoadingSpinner from './animations/LoadingSpinner';
import { saveSession, updateLearnerProgress, updateTopicMastery, addBadge, saveLessonProgress, getLessonProgress, updateLessonStep, markLessonComplete, saveQuestionAnswer, saveLessonData, getLessonData, linkLessonProgressToData, loadLessonData, clearLessonProgress, saveRealWorldChallenge, updateChallengeStats, testFirebaseConnection } from '../../firebaseHelpers';
import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import ResumePrompt from './lessons/ResumePrompt';

// Enhanced Loading Screen Component
const EnhancedLoadingScreen = ({ topicName, darkMode, onNavigate }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [showCancel, setShowCancel] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const getTopicSpecificMessages = (topic) => {
    const messageSets = {
      'Small Talk Basics': [
        "Creating conversation starters just for you...",
        "Finding the perfect ice-breaker topics...",
        "Tailoring small talk for your age group...",
        "Adding real-world chat scenarios...",
        "Almost ready to help you chat!"
      ],
      'Active Listening': [
        "Building listening skills just for you...",
        "Creating scenarios to practice attention...",
        "Adding empathy-building exercises...",
        "Tailoring for your listening style...",
        "Almost ready to help you listen better!"
      ],
      'Reading Body Language': [
        "Analyzing body language cues for you...",
        "Creating scenarios to read expressions...",
        "Adding nonverbal communication tips...",
        "Tailoring for your observation skills...",
        "Almost ready to help you read people!"
      ],
      'Building Confidence': [
        "Building your confidence toolkit...",
        "Creating empowering scenarios...",
        "Adding self-assurance exercises...",
        "Tailoring for your comfort zone...",
        "Almost ready to boost your confidence!"
      ],
      'Conflict Resolution': [
        "Creating peace-making scenarios...",
        "Building problem-solving exercises...",
        "Adding communication strategies...",
        "Tailoring conflict resolution for you...",
        "Almost ready to help you solve conflicts!"
      ]
    };
    
    return messageSets[topic] || [
      "Creating your personalized lesson...",
      "Choosing perfect scenarios for you...",
      "Tailoring content to your grade level...",
      "Adding real-world examples...",
      "Almost ready..."
    ];
  };

  const loadingMessages = getTopicSpecificMessages(topicName);

  const getTopicSpecificTips = (topic) => {
    const tipSets = {
      'Small Talk Basics': [
        { icon: "💡", title: "Did you know?", text: "Small talk helps build friendships and confidence" },
        { icon: "🎯", title: "Tip:", text: "Ask open-ended questions to keep conversations flowing" },
        { icon: "🌟", title: "Fun fact:", text: "Most people love talking about their hobbies and interests" },
        { icon: "🤝", title: "Remember:", text: "A simple 'How was your day?' can start great conversations" },
        { icon: "💪", title: "You've got this!", text: "Every conversation is a chance to make a new friend" }
      ],
      'Active Listening': [
        { icon: "💡", title: "Did you know?", text: "Good listeners are remembered as great friends" },
        { icon: "🎯", title: "Tip:", text: "Make eye contact and nod to show you're paying attention" },
        { icon: "🌟", title: "Fun fact:", text: "People feel valued when you really listen to them" },
        { icon: "🤝", title: "Remember:", text: "Asking follow-up questions shows you care" },
        { icon: "💪", title: "You've got this!", text: "Being a good listener makes you a great friend" }
      ],
      'Reading Body Language': [
        { icon: "💡", title: "Did you know?", text: "Body language says more than words sometimes" },
        { icon: "🎯", title: "Tip:", text: "Watch for facial expressions and posture changes" },
        { icon: "🌟", title: "Fun fact:", text: "Crossed arms might mean someone feels defensive" },
        { icon: "🤝", title: "Remember:", text: "Open posture usually means someone is friendly" },
        { icon: "💪", title: "You've got this!", text: "Reading body language helps you understand others better" }
      ],
      'Building Confidence': [
        { icon: "💡", title: "Did you know?", text: "Confidence is a skill you can practice and improve" },
        { icon: "🎯", title: "Tip:", text: "Stand tall and speak clearly to feel more confident" },
        { icon: "🌟", title: "Fun fact:", text: "Even confident people feel nervous sometimes" },
        { icon: "🤝", title: "Remember:", text: "Your opinion matters just as much as anyone else's" },
        { icon: "💪", title: "You've got this!", text: "Confidence grows with every new experience" }
      ],
      'Conflict Resolution': [
        { icon: "💡", title: "Did you know?", text: "Most conflicts can be solved by talking calmly" },
        { icon: "🎯", title: "Tip:", text: "Listen to both sides before deciding what to do" },
        { icon: "🌟", title: "Fun fact:", text: "Compromise means everyone gets something they want" },
        { icon: "🤝", title: "Remember:", text: "Saying sorry shows you care about the friendship" },
        { icon: "💪", title: "You've got this!", text: "Solving conflicts makes friendships stronger" }
      ]
    };
    
    return tipSets[topic] || [
      { icon: "💡", title: "Did you know?", text: "Practice makes progress, not perfect" },
      { icon: "🎯", title: "Tip:", text: "Everyone gets nervous in social situations sometimes" },
      { icon: "🌟", title: "Fun fact:", text: "Good listeners are great friends" },
      { icon: "🤝", title: "Remember:", text: "Every conversation is a chance to grow" },
      { icon: "💪", title: "You've got this!", text: "Social skills get easier with practice" }
    ];
  };

  const educationalTips = getTopicSpecificTips(topicName);

  useEffect(() => {
    // Rotate messages every 3 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 3000);

    // Rotate tips every 4 seconds
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % educationalTips.length);
    }, 4000);

    // Update elapsed time every second
    const timeInterval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Show cancel button after 10 seconds
    const cancelTimeout = setTimeout(() => {
      setShowCancel(true);
    }, 10000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(tipInterval);
      clearInterval(timeInterval);
      clearTimeout(cancelTimeout);
    };
  }, []);

  const progressPercentage = Math.min((timeElapsed / 15) * 100, 95); // Max 95% until actually ready
  const estimatedTimeLeft = Math.max(15 - timeElapsed, 0);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} flex items-center justify-center p-6`}>
      <div className="max-w-lg w-full text-center">
        {/* Animated Icon with enhanced effects */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/20 animate-spin"></div>
            {/* Inner pulsing circle */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center animate-pulse">
              <Sparkles className="w-12 h-12 text-yellow-400 animate-bounce" />
            </div>
            {/* Progress ring */}
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 animate-spin" style={{ animationDuration: '2s' }}></div>
          </div>
        </div>

        {/* Dynamic Loading Message */}
        <div className="mb-6">
          <h2 className={`text-2xl font-bold mb-4 transition-all duration-500 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
            {loadingMessages[messageIndex]}
          </h2>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-2 mb-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i === (Math.floor(Date.now() / 800) % 3) 
                    ? `${darkMode ? 'bg-blue-400' : 'bg-blue-600'} animate-pulse` 
                    : `${darkMode ? 'bg-gray-600' : 'bg-gray-400'}`
                }`}
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-3 mb-3`}>
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          {/* Time estimation */}
          <div className="flex justify-between text-sm">
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              This usually takes 10-15 seconds
            </span>
            {estimatedTimeLeft > 0 && (
              <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>
                Ready in ~{estimatedTimeLeft}s
              </span>
            )}
          </div>
        </div>

        {/* Educational Tip */}
        <div className={`mb-8 p-6 rounded-2xl border transition-all duration-500 ${
          darkMode 
            ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30' 
            : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-2xl">{educationalTips[tipIndex].icon}</span>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              {educationalTips[tipIndex].title}
            </h3>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {educationalTips[tipIndex].text}
          </p>
        </div>

        {/* Cancel Button (appears after 10 seconds) */}
        {showCancel && (
          <div className="animate-fadeIn">
            <button
              onClick={() => onNavigate('home')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105 ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Taking too long? Go Back
            </button>
          </div>
        )}

        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/20 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400/20 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-yellow-400/20 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
};

function PracticeSession({ sessionId, onNavigate, darkMode, gradeLevel, soundEffects, autoReadText, topicName }) {
  // Validate required props
  if (!topicName) {
    console.error('PracticeSession: topicName is required but not provided');
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Oops! Missing Information</h2>
          <p className="text-lg mb-6">We need to know which lesson you want to practice.</p>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Helper functions for Firebase saving
  const getUserId = () => {
    let guestId = localStorage.getItem('guestUserId');
    if (!guestId) {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 11);
      guestId = `guest_${timestamp}_${randomStr}`;
      localStorage.setItem('guestUserId', guestId);
      console.log('✅ Created guest ID:', guestId);
    }
    return guestId;
  };

  const saveLessonProgress = async (sessionId, topicName, points, maxPoints) => {
    try {
      const learnerId = getUserId();
      const score = Math.round((points / maxPoints) * 100);
      const progressData = {
        learnerId: learnerId,
        topicName: topicName,
        lessonId: sessionId,
        completionPercentage: score,
        totalPoints: points,
        maxPoints: maxPoints,
        completed: true,
        lastAccessedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = doc(db, 'lesson_progress', `${learnerId}_${sessionId}`);
      await setDoc(docRef, progressData, { merge: true });
      console.log('✅ Saved to Firebase lesson_progress');
      return true;
    } catch (error) {
      console.error('❌ Error saving progress:', error);
      return false;
    }
  };

  const saveChallenge = async (topicName) => {
    try {
      const learnerId = getUserId();
      const challenge = {
        learnerId: learnerId,
        challengeText: `Try using these ${topicName} skills in real life!`,
        topic: topicName,
        difficulty: 'medium',
        timeframe: 'This week',
        tips: [
          'Start small with someone you trust',
          'Remember what you practiced',
          'Don\'t worry if it feels awkward at first'
        ],
        status: 'active',
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'real_world_challenges'), challenge);
      console.log('✅ Saved to Firebase real_world_challenges');
      return docRef.id;
    } catch (error) {
      console.error('❌ Error saving challenge:', error);
      return null;
    }
  };

  // Lesson state
  const [lessonState, setLessonState] = useState('loading'); // loading, introduction, concepts, practice, summary, error
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState(null);
  
  // Resume state
  const [currentStep, setCurrentStep] = useState(1); // 1: introduction, 2: concepts, 3: practice
  const [resuming, setResuming] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [showQuickReview, setShowQuickReview] = useState(false);
  
  // Challenge state
  const [challengeStatus, setChallengeStatus] = useState(null); // null, 'saving', 'saved', 'error'
  const [challengeId, setChallengeId] = useState(null);
  
  // Practice state
  const [currentSituation, setCurrentSituation] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [personalizedFeedback, setPersonalizedFeedback] = useState(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoRead, setAutoRead] = useState(autoReadText);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Firebase integration state
  const [sessionData, setSessionData] = useState({
    questionsAnswered: [],
    startTime: Date.now(),
    learnerId: null,
    topicId: sessionId,
    difficulty: 1
  });
  const [isSavingToFirebase, setIsSavingToFirebase] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Lesson progress state
  const [lessonProgress, setLessonProgress] = useState(null);
  const [stepsCompleted, setStepsCompleted] = useState([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedLessonData, setSavedLessonData] = useState(null);
  const [questionsAnswered, setQuestionsAnswered] = useState([]);

  const gradeRange = getGradeRange(gradeLevel);

  // Initialize Firebase session data and load AI lesson
  useEffect(() => {
    const initializeLesson = async () => {
      setIsLoadingProgress(true);
      const userData = getUserData();
      const learnerId = userData.userId || 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      
      console.log('🎯 Initializing AI lesson session for learner:', learnerId);
      
      try {
        // Check if lesson is already in progress
        const existingProgress = await getLessonProgress(learnerId, topicName);
        
        if (existingProgress && existingProgress.status === 'in_progress') {
          console.log('📚 Found in-progress lesson, resuming from step:', existingProgress.currentStep);
          
          // RESUME MODE
          setResuming(true);
          setCurrentStep(existingProgress.currentStep || 1);
          setLessonProgress(existingProgress);
          setStepsCompleted(existingProgress.stepsCompleted || []);
          setQuestionsAnswered(existingProgress.questionsAnswered || []);
          
          // Try to load saved lesson data using lessonDataId
          if (existingProgress.lessonDataId) {
            try {
              const savedLesson = await loadLessonData(existingProgress.lessonDataId);
              if (savedLesson) {
                console.log('✅ Loaded saved lesson data, jumping to step:', existingProgress.currentStep);
                setLesson(savedLesson);
                
                // Jump to appropriate lesson state based on current step
                if (existingProgress.currentStep === 1) {
                  setLessonState('introduction');
                } else if (existingProgress.currentStep === 2) {
                  setLessonState('concepts');
                } else if (existingProgress.currentStep === 3) {
                  setLessonState('practice');
                }
                
                // Show resume banner
                setShowResumeBanner(true);
                setTimeout(() => setShowResumeBanner(false), 5000);
                
                return; // Exit early - we're resuming
              }
            } catch (error) {
              console.warn('⚠️ Failed to load saved lesson data, will regenerate:', error);
            }
          }
          
          // Fallback: try old lesson data format
          const savedData = await getLessonData(learnerId, topicName);
          if (savedData) {
            console.log('💾 Found saved lesson data (old format), using cached lesson');
            setLesson(savedData.lesson);
            setSavedLessonData(savedData);
            
            // Jump to appropriate step
            if (existingProgress.currentStep === 1) {
              setLessonState('introduction');
            } else if (existingProgress.currentStep === 2) {
              setLessonState('concepts');
            } else if (existingProgress.currentStep === 3) {
              setLessonState('practice');
            }
            
            // Show resume banner
            setShowResumeBanner(true);
            setTimeout(() => setShowResumeBanner(false), 5000);
            
            return;
          }
          
          // If no saved data found, show resume prompt for regeneration
          console.log(`🔄 No saved lesson data, showing resume prompt`);
          setShowResumePrompt(true);
          return;
        } else {
          console.log('📚 Starting new lesson');
          // Create new lesson progress
          const newProgress = {
            lessonId: `${(topicName || '').toLowerCase().replace(/\s+/g, '-')}-${gradeRange}-${Date.now()}`,
            lessonTopic: topicName,
            gradeLevel: gradeRange,
            status: 'in_progress',
            currentStep: 1,
            stepsCompleted: [],
            practiceScore: null,
            totalPoints: 0,
            realWorldChallengeAccepted: false,
            realWorldChallengeCompleted: false
          };
          
          await saveLessonProgress(learnerId, newProgress);
          setLessonProgress(newProgress);
          setCurrentStep(1);
          setStepsCompleted([]);
        }
        
        setSessionData(prev => ({
          ...prev,
          learnerId,
          startTime: Date.now()
        }));

        // Load AI lesson
        await loadAILesson(learnerId);
        
      } catch (error) {
        console.error('❌ Error initializing lesson:', error);
        setError('Failed to initialize lesson. Please try again.');
        setLessonState('error');
      } finally {
        setIsLoadingProgress(false);
      }
    };

    initializeLesson();
    
    // Sync backup progress when component mounts
    syncBackupProgress();
  }, [topicName, gradeRange]);

  // Function to save lesson progress with offline support
  const saveLessonProgressToFirebase = async (stepNumber, completed = false) => {
    if (!lessonProgress) return;
    
    try {
      const userData = getUserData();
      const learnerId = userData.userId || sessionData.learnerId;
      
      const newStepsCompleted = completed ? [...stepsCompleted, stepNumber] : stepsCompleted;
      const newCurrentStep = completed ? Math.min(stepNumber + 1, 3) : stepNumber;
      
      await updateLessonStep(learnerId, topicName, newCurrentStep, newStepsCompleted);
      
      setStepsCompleted(newStepsCompleted);
      setCurrentStep(newCurrentStep);
      
      console.log(`💾 Saved lesson progress: Step ${stepNumber} ${completed ? 'completed' : 'updated'}`);
    } catch (error) {
      console.error('❌ Error saving lesson progress:', error);
      
      // Save to localStorage as backup
      try {
        const backupProgress = {
          learnerId: sessionData.learnerId,
          topicName,
          currentStep: stepNumber,
          stepsCompleted: completed ? [...stepsCompleted, stepNumber] : stepsCompleted,
          timestamp: Date.now(),
          error: error.message
        };
        
        const existingBackup = JSON.parse(localStorage.getItem('lessonProgressBackup') || '[]');
        const updatedBackup = existingBackup.filter(p => p.topicName !== topicName);
        updatedBackup.push(backupProgress);
        localStorage.setItem('lessonProgressBackup', JSON.stringify(updatedBackup));
        
        console.log('💾 Saved progress to localStorage backup');
      } catch (backupError) {
        console.error('❌ Error saving to localStorage backup:', backupError);
      }
      
      // Don't throw error - progress saving shouldn't block user
    }
  };

  // Function to sync backup progress to Firebase
  const syncBackupProgress = async () => {
    try {
      const backupProgress = JSON.parse(localStorage.getItem('lessonProgressBackup') || '[]');
      if (backupProgress.length === 0) return;
      
      console.log('🔄 Syncing backup progress to Firebase...');
      
      for (const progress of backupProgress) {
        try {
          await updateLessonStep(progress.learnerId, progress.topicName, progress.currentStep, progress.stepsCompleted);
          console.log(`✅ Synced progress for ${progress.topicName}`);
        } catch (error) {
          console.error(`❌ Error syncing progress for ${progress.topicName}:`, error);
        }
      }
      
      // Clear backup after successful sync
      localStorage.removeItem('lessonProgressBackup');
      console.log('✅ All backup progress synced successfully');
    } catch (error) {
      console.error('❌ Error syncing backup progress:', error);
    }
  };

  // Function to complete a lesson step
  const completeLessonStep = async (stepNumber, finalScore = null, pointsEarned = 0) => {
    if (!lessonProgress) return;
    
    try {
      const userData = getUserData();
      const learnerId = userData.userId || sessionData.learnerId;
      
      const newStepsCompleted = [...stepsCompleted, stepNumber];
      
      // If this is the final step (practice), mark lesson as complete
      if (stepNumber === 3 && finalScore !== null) {
        await markLessonComplete(learnerId, topicName, finalScore, pointsEarned);
        setLessonProgress(prev => ({
          ...prev,
          status: 'completed',
          practiceScore: finalScore,
          totalPoints: pointsEarned,
          completedAt: new Date().toISOString()
        }));
      } else {
        // Update step progress
        await updateLessonStep(learnerId, topicName, Math.min(stepNumber + 1, 3), newStepsCompleted);
      }
      
      setStepsCompleted(newStepsCompleted);
      setCurrentStep(Math.min(stepNumber + 1, 3));
      
      console.log(`✅ Completed lesson step ${stepNumber}`);
    } catch (error) {
      console.error('❌ Error completing lesson step:', error);
    }
  };

  const loadAILesson = async (learnerId, isResume = false) => {
    try {
      console.log('🤖 Loading AI lesson for topic:', topicName || sessionId);
      
      // Get learner profile data for personalization
      let learnerProfile = null;
      try {
        learnerProfile = await getLearnerProfile(learnerId);
        console.log('📊 Learner profile loaded:', learnerProfile);
      } catch (error) {
        console.log('⚠️ No learner profile found, using defaults');
      }

      // Generate cache key with date for daily caching
      const today = new Date().toISOString().split('T')[0];
      const currentSkillLevel = learnerProfile?.currentLevel || 1;
      const learnerStrengths = learnerProfile?.strengths || ['general social skills'];
      const learnerWeaknesses = learnerProfile?.needsWork || ['general social skills'];
      
      const cacheKey = `lesson_${topicName || sessionId}_${gradeLevel}_${today}`;

      // Check cache first
      let aiLesson = lessonApiService.getCachedLesson(cacheKey);
      
      if (!aiLesson) {
        console.log('🔄 No cached lesson found, generating new one...');
        
        // Generate new lesson
        aiLesson = await lessonApiService.generateLesson(
          topicName || getTopicName(sessionId),
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
      
      // Save lesson data for future resume (only if not resuming)
      if (!isResume) {
        try {
          const lessonDataId = await saveLessonData(learnerId, topicName, aiLesson);
          await linkLessonProgressToData(learnerId, topicName, lessonDataId);
          console.log('💾 Lesson data saved for resume functionality');
        } catch (error) {
          console.warn('⚠️ Failed to save lesson data:', error);
          // Don't fail the lesson loading if saving fails
        }
      }
      
      if (showResumePrompt) {
        setShowResumePrompt(false);
      } else if (isResume) {
        // When resuming, jump to the appropriate step
        if (currentStep === 1) {
          setLessonState('introduction');
        } else if (currentStep === 2) {
          setLessonState('concepts');
        } else if (currentStep === 3) {
          setLessonState('practice');
        }
      } else {
        setLessonState('introduction');
      }
      
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

  // Sound effect functions
  const playSound = (type) => {
    if (!soundEffects) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'correct') {
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } else if (type === 'incorrect') {
      oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } else if (type === 'complete') {
      const playNote = (freq, startTime, duration) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      playNote(523.25, audioContext.currentTime, 0.2);
      playNote(659.25, audioContext.currentTime + 0.15, 0.2);
      playNote(783.99, audioContext.currentTime + 0.3, 0.2);
      playNote(1046.50, audioContext.currentTime + 0.45, 0.4);
    } else if (type === 'click') {
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    }
  };

  const getVoiceSettings = (grade) => {
    const gradeNum = parseInt(grade) || 5;
    if (gradeNum <= 2) return { rate: 0.75, pitch: 1.08 };
    if (gradeNum <= 5) return { rate: 0.8, pitch: 1.03 };
    if (gradeNum <= 8) return { rate: 0.85, pitch: 1.0 };
    return { rate: 0.9, pitch: 0.98 };
  };

  const speak = (text) => {
    window.speechSynthesis.cancel();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voiceSettings = getVoiceSettings(gradeLevel);
    
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = 1;
    utterance.lang = 'en-US';

    const selectVoice = (voices) => {
      const warmVoices = ['Samantha', 'Karen', 'Moira', 'Victoria', 'Google US English Female'];
      for (const voiceName of warmVoices) {
        const voice = voices.find(v => v.name.includes(voiceName));
        if (voice) {
          utterance.voice = voice;
          return;
        }
      }
      const anyFemale = voices.find(v => (v.name || '').toLowerCase().includes('female'));
      if (anyFemale) utterance.voice = anyFemale;
    };

    let voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        selectVoice(voices);
      };
    } else {
      selectVoice(voices);
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleSpeech = (text) => {
    if (isSpeaking) stopSpeaking();
    else speak(text);
  };

  // Auto-read functionality for practice scenarios
  useEffect(() => {
    if (autoRead && lessonState === 'practice' && lesson?.practiceScenarios?.[currentSituation]) {
      const scenario = lesson.practiceScenarios[currentSituation];
      const fullText = `${scenario.situation}. ${scenario.question}. Here are your options. ${scenario.options.map((opt, idx) => `Option ${String.fromCharCode(65 + idx)}: ${opt.text}`).join('. ')}`;
      setTimeout(() => speak(fullText), 500);
    }
    return () => stopSpeaking();
  }, [currentSituation, autoRead, lessonState]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  // Sync offline challenges and test Firebase connection when component mounts
  useEffect(() => {
    const initializeFirebase = async () => {
      // Test Firebase connection first
      const isFirebaseWorking = await testFirebaseConnection();
      if (!isFirebaseWorking) {
        console.warn('⚠️ Firebase connection test failed - challenges may not sync properly');
      }
      
      // Then sync offline challenges
      syncOfflineChallenges();
    };
    
    initializeFirebase();
  }, []);

  const handleOptionSelect = async (optionIndex) => {
    if (showFeedback) return;
    
    playSound('click');
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    setIsGeneratingFeedback(true);
    setFeedbackError(null);
    
    const scenario = lesson.practiceScenarios[currentSituation];
    const option = scenario.options[optionIndex];
    const isCorrect = option.quality === 'excellent';
    const pointsEarned = option.quality === 'excellent' ? 10 : option.quality === 'good' ? 5 : 0;
    
    // Track question response for Firebase
    const questionResponse = {
      questionId: `q${currentSituation + 1}`,
      userAnswer: `option_${String.fromCharCode(65 + optionIndex)}`,
      isCorrect,
      timeToAnswer: Math.round((Date.now() - sessionData.startTime) / 1000),
      pointsEarned,
      choiceQuality: option.quality,
      aiFeedback: null // Will be set after feedback generation
    };
    
    console.log('📝 Recording question response:', questionResponse);
    
    setSessionData(prev => ({
      ...prev,
      questionsAnswered: [...prev.questionsAnswered, questionResponse]
    }));
    
    if (isCorrect) {
      setTotalPoints(prev => prev + pointsEarned);
      playSound('correct');
      setShowCelebration(true);
    } else {
      playSound('incorrect');
    }

    // Save question answer to Firebase
    await saveQuestionAnswerToFirebase(currentSituation, optionIndex, isCorrect, pointsEarned);

    // Generate personalized feedback
    try {
      console.log('🤖 Generating personalized feedback...');
      
      // Get learner profile for personalization
      const userData = getUserData();
      const learnerId = userData.userId || 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      let learnerProfile = null;
      
      try {
        learnerProfile = await getLearnerProfile(learnerId);
      } catch (error) {
        console.log('⚠️ No learner profile found, using defaults for feedback');
      }

      // Find the correct answer (excellent option)
      const correctAnswer = scenario.options.find(opt => opt.quality === 'excellent');
      
      const feedbackData = await apiService.generatePersonalizedFeedback({
        scenarioContext: scenario.situation,
        question: scenario.question,
        studentChoice: option.text,
        correctAnswer: correctAnswer?.text || scenario.options[0].text,
        choiceQuality: option.quality,
        gradeLevel: gradeLevel,
        studentStrengths: learnerProfile?.strengths || ['general social skills'],
        studentWeaknesses: learnerProfile?.needsWork || ['general social skills'],
        previousPerformance: learnerProfile?.totalSessions ? `${learnerProfile.totalSessions} sessions completed` : 'new learner'
      });

      console.log('✅ Personalized feedback generated:', feedbackData);
      setPersonalizedFeedback(feedbackData);
      
      // Update session data with AI feedback
      setSessionData(prev => ({
        ...prev,
        questionsAnswered: prev.questionsAnswered.map((q, index) => 
          index === prev.questionsAnswered.length - 1 
            ? { ...q, aiFeedback: feedbackData }
            : q
        )
      }));
      
      
    } catch (error) {
      console.error('❌ Error generating personalized feedback:', error);
      setFeedbackError('Unable to generate personalized feedback. Using standard feedback.');
      // Fallback to original feedback from lesson
      setPersonalizedFeedback({
        feedback: option.feedback || 'Good thinking! Keep practicing to improve your social skills.',
        skillHighlight: option.quality === 'excellent' ? 'Great social skills!' : 'Social skills practice',
        realWorldTip: option.tip || 'Try this approach in real life situations.',
        encouragement: 'You\'re doing great! Keep learning and growing.'
      });
      
      // Store fallback feedback in session data
      const fallbackFeedback = {
        feedback: option.feedback || 'Good thinking! Keep practicing to improve your social skills.',
        skillHighlight: option.quality === 'excellent' ? 'Great social skills!' : 'Social skills practice',
        realWorldTip: option.tip || 'Try this approach in real life situations.',
        encouragement: 'You\'re doing great! Keep learning and growing.',
        fallback: true
      };
      
      setSessionData(prev => ({
        ...prev,
        questionsAnswered: prev.questionsAnswered.map((q, index) => 
          index === prev.questionsAnswered.length - 1 
            ? { ...q, aiFeedback: fallbackFeedback }
            : q
        )
      }));
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  // Firebase save function
  const saveSessionToFirebase = async () => {
    if (!sessionData.learnerId) {
      console.log('⚠️ No learner ID, skipping Firebase save');
      return;
    }

    setIsSavingToFirebase(true);
    setSaveError(null);

    try {
      console.log('🚀 Starting Firebase save process for learner:', sessionData.learnerId);
      
      const timeSpent = Math.round((Date.now() - sessionData.startTime) / 1000);
      const totalQuestions = lesson.practiceScenarios.length;
      const correctAnswers = sessionData.questionsAnswered.filter(q => q.isCorrect).length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      
      const sessionPayload = {
        learnerId: sessionData.learnerId,
        topicId: sessionData.topicId,
        topicName: lesson.topic,
        lessonId: lesson.id, // Track AI lesson ID
        completedAt: new Date().toISOString(),
        score,
        totalQuestions,
        correctAnswers,
        timeSpent,
        difficulty: gradeLevel,
        pointsEarned: totalPoints,
        questionsAnswered: sessionData.questionsAnswered
      };

      console.log('💾 Step 1: Saving session to Firebase...');
      console.log('📊 Session Stats:', {
        score: `${score}%`,
        correctAnswers: `${correctAnswers}/${totalQuestions}`,
        timeSpent: `${timeSpent}s`,
        pointsEarned: totalPoints
      });

      // Save session to Firebase
      const sessionId = await saveSession(sessionPayload);
      console.log('✅ Step 1 Complete: Session saved with ID:', sessionId);

      // Update learner progress
      console.log('🔄 Step 2: Updating learner progress...');
      const progressUpdates = {
        totalPoints: totalPoints,
        totalSessions: 1,
        streak: 1,
        lastActive: new Date().toISOString()
      };
      
      await updateLearnerProgress(sessionData.learnerId, progressUpdates);
      console.log('✅ Step 2 Complete: Learner progress updated');

      // Update topic mastery
      console.log('📚 Step 3: Updating topic mastery...');
      await updateTopicMastery(sessionData.learnerId, lesson.topic, {
        score,
        timeSpent
      });
      console.log('✅ Step 3 Complete: Topic mastery updated');

      // Check for badges
      console.log('🏆 Step 4: Checking for badges...');
      if (score >= 90) {
        await addBadge(sessionData.learnerId, 'high_score_master');
        console.log('🏆 High score badge earned!');
      }
      if (sessionData.questionsAnswered.length >= 5) {
        await addBadge(sessionData.learnerId, 'practice_champion');
        console.log('🏆 Practice champion badge earned!');
      }
      console.log('✅ Step 4 Complete: Badge check finished');

      setSaveSuccess(true);
      console.log('🎉 All Firebase operations completed successfully!');

    } catch (error) {
      console.error('❌ Firebase save failed:', error);
      
      let userMessage = 'Failed to save progress. Please try again.';
      
      if (error.message.includes('permission')) {
        userMessage = 'Permission denied. Please check your connection.';
      } else if (error.message.includes('network')) {
        userMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('quota')) {
        userMessage = 'Storage limit reached. Please contact support.';
      }
      
      setSaveError(userMessage);
    } finally {
      setIsSavingToFirebase(false);
    }
  };

  const handleNext = async () => {
    stopSpeaking();
    playSound('click');
    
    if (currentSituation < lesson.practiceScenarios.length - 1) {
      setCurrentSituation(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setSessionComplete(true);
      playSound('complete');
      
      // Save to localStorage (existing functionality)
      const userData = getUserData();
      userData.totalSessions += 1;
      userData.confidenceScore = Math.min(100, userData.confidenceScore + 2);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      
      // Save to Firebase
      saveSessionToFirebase();
      
      // Add Firebase saving for lesson progress and challenges
      await saveLessonProgress(sessionId, topicName, totalPoints, lesson.practiceScenarios.length * 10);
      await saveChallenge(topicName);
      
      // Move to summary
      setLessonState('summary');
    }
  };

  const handleBack = () => {
    stopSpeaking();
    playSound('click');
    if (currentSituation > 0) {
      setCurrentSituation(prev => prev - 1);
      setSelectedOption(null);
      setShowFeedback(false);
    }
  };

  const handleRestart = () => {
    playSound('click');
    setCurrentSituation(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setTotalPoints(0);
    setSessionComplete(false);
    setLessonState('introduction');
  };

  const handleRetry = () => {
    setError(null);
    setLessonState('loading');
    loadAILesson(sessionData.learnerId);
  };

  // Resume handlers
  const handleResumeContinue = () => {
    setShowResumePrompt(false);
    // Continue from current step
    if (currentStep === 1) {
      setLessonState('introduction');
    } else if (currentStep === 2) {
      setLessonState('concepts');
    } else if (currentStep === 3) {
      setLessonState('practice');
    }
  };

  // Challenge handlers
  const handleAcceptChallenge = async () => {
    try {
      setChallengeStatus('saving');
      console.log('💪 Accepting challenge...');
      
      const userData = getUserData();
      const learnerId = userData?.userId || 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      
      const challengeData = {
        lessonTopic: lesson.topic,
        challengeText: lesson.summary.realWorldChallenge,
        timeframe: 'Try this week',
        tips: lesson.summary.keyTakeaway ? [lesson.summary.keyTakeaway] : [],
        status: 'active'
      };
      
      try {
        const savedChallengeId = await saveRealWorldChallenge(learnerId, challengeData);
        
        // Update learner stats
        await updateChallengeStats(learnerId, 'accepted');
        
        setChallengeId(savedChallengeId);
        setChallengeStatus('saved');
        
        console.log('✅ Challenge accepted and saved:', savedChallengeId);
        
        // Update lesson progress with challenge info
        if (lessonProgress) {
          const progressUpdate = {
            activeChallengeId: savedChallengeId,
            challengeStatus: 'active',
            realWorldChallengeAccepted: true
          };
          
          await updateLessonStep(learnerId, lesson.topic, 3, progressUpdate);
        }
        
      } catch (firebaseError) {
        console.error('❌ Firebase save failed with detailed error:', firebaseError);
        console.error('❌ Error code:', firebaseError.code);
        console.error('❌ Error message:', firebaseError.message);
        console.error('❌ Challenge data:', challengeData);
        
        // Fallback to offline caching
        const cachedId = cacheChallengeOffline({ ...challengeData, learnerId }, 'active');
        setChallengeId(cachedId);
        setChallengeStatus('error'); // Show "saved locally" message
        
        console.log('✅ Challenge cached offline:', cachedId);
      }
      
    } catch (error) {
      console.error('❌ Error accepting challenge:', error);
      setChallengeStatus('error');
    }
  };

  const handleSkipChallenge = async () => {
    try {
      setChallengeStatus('saving');
      console.log('⏭️ Skipping challenge...');
      
      const userData = getUserData();
      const learnerId = userData?.userId || 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      
      const challengeData = {
        lessonTopic: lesson.topic,
        challengeText: lesson.summary.realWorldChallenge,
        timeframe: 'Try this week',
        tips: lesson.summary.keyTakeaway ? [lesson.summary.keyTakeaway] : [],
        status: 'skipped'
      };
      
      try {
        const savedChallengeId = await saveRealWorldChallenge(learnerId, challengeData);
        
        // Update learner stats
        await updateChallengeStats(learnerId, 'skipped');
        
        setChallengeId(savedChallengeId);
        setChallengeStatus('saved');
        
        console.log('✅ Challenge skipped and saved:', savedChallengeId);
        
      } catch (firebaseError) {
        console.error('❌ Firebase save failed with detailed error:', firebaseError);
        console.error('❌ Error code:', firebaseError.code);
        console.error('❌ Error message:', firebaseError.message);
        console.error('❌ Challenge data:', challengeData);
        
        // Fallback to offline caching
        const cachedId = cacheChallengeOffline({ ...challengeData, learnerId }, 'skipped');
        setChallengeId(cachedId);
        setChallengeStatus('error'); // Show "saved locally" message
        
        console.log('✅ Challenge cached offline:', cachedId);
      }
      
    } catch (error) {
      console.error('❌ Error skipping challenge:', error);
      setChallengeStatus('error');
    }
  };

  // Offline challenge caching
  const cacheChallengeOffline = (challengeData, status) => {
    try {
      const cachedChallenges = JSON.parse(localStorage.getItem('pending_challenges') || '[]');
      const challengeToCache = {
        ...challengeData,
        status,
        cachedAt: Date.now(),
        id: `cached_${Date.now()}`
      };
      
      cachedChallenges.push(challengeToCache);
      localStorage.setItem('pending_challenges', JSON.stringify(cachedChallenges));
      
      console.log('💾 Challenge cached offline:', challengeToCache.id);
      return challengeToCache.id;
    } catch (error) {
      console.error('❌ Error caching challenge offline:', error);
      return null;
    }
  };

  // Sync offline challenges when online
  const syncOfflineChallenges = async () => {
    try {
      const cachedChallenges = JSON.parse(localStorage.getItem('pending_challenges') || '[]');
      
      if (cachedChallenges.length === 0) return;
      
      console.log('🔄 Syncing offline challenges...', cachedChallenges.length);
      
      for (const cachedChallenge of cachedChallenges) {
        try {
          await saveRealWorldChallenge(cachedChallenge.learnerId, cachedChallenge);
          await updateChallengeStats(cachedChallenge.learnerId, cachedChallenge.status === 'active' ? 'accepted' : 'skipped');
          
          console.log('✅ Synced offline challenge:', cachedChallenge.id);
        } catch (error) {
          console.error('❌ Error syncing offline challenge:', error);
        }
      }
      
      // Clear cached challenges after sync
      localStorage.removeItem('pending_challenges');
      console.log('✅ All offline challenges synced');
      
    } catch (error) {
      console.error('❌ Error syncing offline challenges:', error);
    }
  };

  const handleResumeReview = () => {
    setShowResumePrompt(false);
    setLessonState('concepts'); // Go to concepts for review
  };

  const handleResumeRestart = async () => {
    try {
      const userData = getUserData();
      const learnerId = userData.userId || sessionData.learnerId;
      
      // Clear lesson progress
      await clearLessonProgress(learnerId, topicName);
      
      // Reset state
      setLessonProgress(null);
      setCurrentStep(1);
      setStepsCompleted([]);
      setQuestionsAnswered([]);
      setShowResumePrompt(false);
      
      // Start fresh
      setLessonState('introduction');
    } catch (error) {
      console.error('Error restarting lesson:', error);
    }
  };

  // Function to save individual question answer
  const saveQuestionAnswerToFirebase = async (questionId, selectedOption, wasCorrect, points) => {
    try {
      const userData = getUserData();
      const learnerId = userData.userId || sessionData.learnerId;
      
      const questionData = {
        questionId,
        selectedOption,
        wasCorrect,
        points
      };
      
      await saveQuestionAnswer(learnerId, topicName, questionData);
      
      // Update local state
      setQuestionsAnswered(prev => {
        const existing = prev.findIndex(q => q.questionId === questionId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = questionData;
          return updated;
        } else {
          return [...prev, questionData];
        }
      });
      
      console.log('✅ Question answer saved successfully');
    } catch (error) {
      console.error('❌ Error saving question answer:', error);
    }
  };

  // Navigation handlers
  const handleStartLesson = async () => {
    setLessonState('concepts');
    await completeLessonStep(1); // Complete step 1 (introduction)
  };

  const handleStartPractice = async () => {
    setLessonState('practice');
    await completeLessonStep(2); // Complete step 2 (concepts)
  };

  const handleCompleteLesson = async () => {
    // Calculate final score and points
    const finalScore = Math.round((sessionData.questionsAnswered.filter(q => q.isCorrect).length / sessionData.questionsAnswered.length) * 100);
    const pointsEarned = totalPoints;
    
    await completeLessonStep(3, finalScore, pointsEarned); // Complete step 3 (practice)
    onNavigate('home');
  };

  // Show resume banner if resuming
  if (showResumeBanner && resuming) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} flex items-center justify-center p-6`}>
        <div className="max-w-md w-full text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center animate-pulse">
              <Sparkles className="w-12 h-12 text-yellow-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4 text-blue-400">
            Continuing from Step {currentStep}...
          </h2>
          
          <p className="text-gray-400 mb-8">
            Welcome back! We're picking up where you left off.
          </p>
          
          {currentStep > 1 && (
            <button
              onClick={() => setShowQuickReview(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
            >
              Quick Review
            </button>
          )}
          
          <button
            onClick={() => setShowResumeBanner(false)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Continue to Lesson
          </button>
        </div>
      </div>
    );
  }

  // Show quick review if requested
  if (showQuickReview && lesson) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} p-6`}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => setShowQuickReview(false)}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Lesson
            </button>
            <h1 className="text-3xl font-bold mb-2">Quick Review</h1>
            <p className="text-gray-400">Here's what you've learned so far:</p>
          </div>
          
          <div className="space-y-6">
            {currentStep >= 2 && (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 text-blue-300">Learning Module</h3>
                <div className="space-y-3">
                  <h4 className="font-semibold">{lesson.introduction.title}</h4>
                  <p className="text-gray-300">{lesson.introduction.objective}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {lesson.explanation.keyPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-gray-300">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {currentStep >= 3 && (
              <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 text-green-300">Practice Session</h3>
                <p className="text-gray-300">
                  You've been practicing {lesson.practiceScenarios.length} scenarios to build your skills.
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowQuickReview(false)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Step {currentStep}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show resume prompt if lesson is in progress
  if (showResumePrompt && lessonProgress && lesson) {
    return (
      <ResumePrompt
        lessonProgress={lessonProgress}
        lessonData={{ lesson }}
        onContinue={handleResumeContinue}
        onReview={handleResumeReview}
        onRestart={handleResumeRestart}
        darkMode={darkMode}
      />
    );
  }

  // Step Indicator Component
  const StepIndicator = () => {
    const steps = [
      { id: 1, name: 'Learning Module', state: lessonState === 'introduction' ? 'current' : stepsCompleted.includes(1) ? 'completed' : 'upcoming' },
      { id: 2, name: 'Key Concepts', state: lessonState === 'concepts' ? 'current' : stepsCompleted.includes(2) ? 'completed' : 'upcoming' },
      { id: 3, name: 'Practice Session', state: lessonState === 'practice' ? 'current' : stepsCompleted.includes(3) ? 'completed' : 'upcoming' }
    ];

    return (
      <div className={`mb-8 p-6 rounded-2xl border ${
        darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                step.state === 'completed' 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : step.state === 'current'
                  ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                  : 'bg-gray-200 border-gray-300 text-gray-500'
              }`}>
                {step.state === 'completed' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <span className="font-bold text-sm">{step.id}</span>
                )}
              </div>

              {/* Step Label */}
              <div className={`ml-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <div className={`text-sm font-medium ${
                  step.state === 'current' ? 'text-blue-400' : 
                  step.state === 'completed' ? 'text-green-400' : 'text-gray-500'
                }`}>
                  {step.name}
                </div>
                <div className={`text-xs ${
                  step.state === 'current' ? 'text-blue-300' : 
                  step.state === 'completed' ? 'text-green-300' : 'text-gray-400'
                }`}>
                  {step.state === 'completed' ? 'Completed' : 
                   step.state === 'current' ? 'In Progress' : 'Upcoming'}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  step.state === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced loading screen with animated progress
  if (lessonState === 'loading') {
    return <EnhancedLoadingScreen topicName={topicName} darkMode={darkMode} onNavigate={onNavigate} />;
  }

  // Show error screen
  if (lessonState === 'error') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-6">😔</div>
          <h2 className="text-2xl font-bold mb-4">Oops! Having trouble creating your lesson.</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-700 transition-all"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show lesson introduction
  if (lessonState === 'introduction') {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <StepIndicator />
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {lesson.introduction.title}
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
            
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-8"></div>
          </div>

          {/* Lesson Card */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 mb-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">{lesson.introduction.title}</h2>
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <BookOpen className="w-5 h-5" />
                <span className="text-lg font-semibold">{lesson.topic}</span>
              </div>
            </div>

            {/* Objective */}
            <div className="mb-8">
              <div className="flex items-start gap-4">
                <Target className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-3 text-green-400">What You'll Learn</h3>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {lesson.introduction.objective}
                  </p>
                </div>
              </div>
            </div>

            {/* Why It Matters */}
            <div className="mb-8">
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-3 text-purple-400">Why This Matters</h3>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {lesson.introduction.whyItMatters}
                  </p>
                </div>
              </div>
            </div>

            {/* Time Estimate */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-5 h-5 text-yellow-400">⏱️</div>
              <span className="text-lg font-semibold text-yellow-400">
                Estimated Time: {lesson.introduction.estimatedTime}
              </span>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={handleStartLesson}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
              >
                Let's Begin!
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            </div>
            <p className="text-sm text-gray-500">Step 1 of 4: Introduction</p>
          </div>
        </div>
      </div>
    );
  }

  // Show key concepts
  if (lessonState === 'concepts') {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <StepIndicator />
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => {
                  saveLessonProgressToFirebase(currentStep);
                  onNavigate('home');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm"
              >
                <Home className="w-4 h-4" />
                Save & Exit
              </button>
              <div className="flex-1"></div>
            </div>
            <h1 className="text-3xl font-bold mb-4">{lesson.introduction.title}</h1>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
          </div>

          {/* Main Concept */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <BookOpen className="w-8 h-8 text-blue-400 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-4 text-blue-400">Main Concept</h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {lesson.explanation.mainConcept}
                </p>
              </div>
            </div>
          </div>

          {/* Key Points */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-6 text-green-400">Key Points to Remember</h2>
                <div className="space-y-4">
                  {lesson.explanation.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <p className="text-lg text-gray-300 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <XCircle className="w-8 h-8 text-orange-400 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-6 text-orange-400">Common Mistakes to Avoid</h2>
                <div className="space-y-4">
                  {lesson.explanation.commonMistakes.map((mistake, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-bold">!</span>
                      </div>
                      <p className="text-lg text-gray-300 leading-relaxed">{mistake}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Start Practice Button */}
          <div className="text-center mb-8">
            <button
              onClick={handleStartPractice}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-3 mx-auto"
            >
              Start Practice Scenarios
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            </div>
            <p className="text-sm text-gray-500">Step 2 of 4: Key Concepts</p>
          </div>
        </div>
      </div>
    );
  }

  // Show practice scenarios
  if (lessonState === 'practice') {
    const scenario = lesson.practiceScenarios[currentSituation];
    const progressPercentage = ((currentSituation + 1) / lesson.practiceScenarios.length) * 100;

    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="fixed inset-0 opacity-20" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></div>
        
        <div className="relative z-10 p-6 pb-24">
          <div className="max-w-4xl mx-auto">
            <StepIndicator />
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {lesson.topic}
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Question {currentSituation + 1} of {lesson.practiceScenarios.length}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleSpeech(`${scenario.situation}. ${scenario.question}`)}
                  className={`p-2 rounded-full transition-all ${
                    darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => onNavigate('home')}
                  className={`p-2 rounded-full transition-all ${
                    darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <Home className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className={`w-full rounded-full h-2 mb-2 ${
                darkMode ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{Math.round(progressPercentage)}% Complete</span>
                <span>{totalPoints} Points Earned</span>
              </div>
            </div>

            {/* Scenario Card */}
            <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-8 ${
              darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-lg'
            }`}>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{currentSituation + 1}</span>
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Practice Scenario
                    </h2>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Choose the best response
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className={`text-lg leading-relaxed mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {scenario.situation}
                  </p>
                  <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {scenario.question}
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {scenario.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={showFeedback}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                      selectedOption === index 
                        ? option.quality === 'excellent' 
                          ? 'bg-emerald-500/20 border-emerald-500' 
                          : 'bg-orange-500/20 border-orange-500'
                        : selectedOption !== null 
                          ? 'opacity-50 border-white/10' 
                          : 'border-white/10 hover:border-blue-500/50 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        selectedOption === index 
                          ? option.quality === 'excellent' 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-orange-500 text-white'
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {option.text}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            {showFeedback && (
              <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-8 ${
                selectedOption !== null && scenario.options[selectedOption].quality === 'excellent'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-orange-500/10 border-orange-500/30'
              }`}>
                {isGeneratingFeedback ? (
                  <div className="flex items-center justify-center gap-4 py-8">
                    <LoadingSpinner size="md" />
                    <div>
                      <h3 className="text-xl font-bold text-blue-400 mb-2">Thinking about your answer...</h3>
                      <p className="text-gray-400">Creating personalized feedback just for you</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4 mb-4">
                    {scenario.options[selectedOption].quality === 'excellent' ? (
                      <CheckCircle className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-8 h-8 text-orange-400 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h3 className={`text-2xl font-bold mb-3 ${
                        scenario.options[selectedOption].quality === 'excellent' 
                          ? 'text-emerald-400' 
                          : 'text-orange-400'
                      }`}>
                        {personalizedFeedback?.skillHighlight || 
                         (scenario.options[selectedOption].quality === 'excellent' ? 'Great Choice!' : 'Let\'s Learn!')}
                      </h3>
                      
                      {/* Personalized Feedback */}
                      <div className="mb-4">
                        <p className={`text-lg leading-relaxed mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {personalizedFeedback?.feedback || scenario.options[selectedOption].feedback}
                        </p>
                        
                        {/* Real World Tip */}
                        {personalizedFeedback?.realWorldTip && (
                          <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30 mb-4">
                            <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-bold text-blue-400 mb-1">Try This in Real Life:</p>
                              <p className="text-sm text-blue-300">{personalizedFeedback.realWorldTip}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Encouragement */}
                        {personalizedFeedback?.encouragement && (
                          <div className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                            <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            <p className="text-sm text-emerald-300 font-medium">{personalizedFeedback.encouragement}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Fallback to original tip if no personalized feedback */}
                      {!personalizedFeedback?.realWorldTip && scenario.options[selectedOption].tip && (
                        <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                          <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0" />
                          <p className="text-sm text-blue-300">{scenario.options[selectedOption].tip}</p>
                        </div>
                      )}
                      
                      {/* Error message if feedback generation failed */}
                      {feedbackError && (
                        <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/30 mt-4">
                          <Info className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                          <p className="text-xs text-yellow-300">{feedbackError}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4">
              <button 
                onClick={handleBack} 
                disabled={currentSituation === 0}
                className={`flex-1 font-bold py-4 px-6 rounded-full border-2 transition-all flex items-center justify-center gap-2 ${
                  darkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                } ${currentSituation === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>
              <button 
                onClick={handleNext} 
                disabled={!showFeedback}
                className={`flex-1 bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-4 px-6 rounded-full hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                  !showFeedback ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {currentSituation < lesson.practiceScenarios.length - 1 ? 'Next Question' : 'Finish Practice'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Success Animation */}
        {showCelebration && (
          <SuccessAnimation onComplete={() => setShowCelebration(false)} />
        )}
      </div>
    );
  }

  // Show lesson summary
  if (lessonState === 'summary') {
    const finalScore = Math.round((totalPoints / (lesson.practiceScenarios.length * 10)) * 100);

    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h1 className="text-3xl font-bold">Lesson Complete!</h1>
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="w-16 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mx-auto"></div>
          </div>

          {/* Points Earned */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-3xl p-8 mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 text-yellow-400">⭐</div>
              <h2 className="text-2xl font-bold text-yellow-400">Points Earned</h2>
              <div className="w-8 h-8 text-yellow-400">⭐</div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">+{totalPoints}</div>
            <div className="text-2xl font-bold text-white mb-2">{finalScore}% Score</div>
            <p className="text-lg text-gray-300">Great job completing the lesson!</p>
          </div>

          {/* What You Learned */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-4 text-green-400">What You Learned</h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  {lesson.summary.whatYouLearned}
                </p>
              </div>
            </div>
          </div>

          {/* Key Takeaway */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <Lightbulb className="w-8 h-8 text-blue-400 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-4 text-blue-400">Key Takeaway</h2>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                  <p className="text-xl text-blue-300 font-semibold leading-relaxed">
                    "{lesson.summary.keyTakeaway}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Real World Challenge */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <Target className="w-8 h-8 text-purple-400 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4 text-purple-400">Your Challenge</h2>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 mb-6">
                  <p className="text-lg text-purple-300 leading-relaxed">
                    {lesson.summary.realWorldChallenge}
                  </p>
                </div>
                
                {/* Challenge Actions */}
                {!challengeStatus && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleAcceptChallenge}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-3"
                    >
                      <Target className="w-5 h-5" />
                      I'll Try This! 🎯
                    </button>
                    <button
                      onClick={handleSkipChallenge}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3"
                    >
                      Maybe Later
                    </button>
                  </div>
                )}
                
                {/* Challenge Status */}
                {challengeStatus === 'saving' && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-center gap-3">
                      <LoadingSpinner size="sm" />
                      <span className="text-blue-300 font-medium">Saving your challenge...</span>
                    </div>
                  </div>
                )}
                
                {challengeStatus === 'saved' && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <span className="text-green-300 font-medium">
                        Challenge saved! {challengeId ? '🎯' : '✅'}
                      </span>
                    </div>
                  </div>
                )}
                
                {challengeStatus === 'error' && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-center gap-3">
                      <XCircle className="w-6 h-6 text-red-400" />
                      <span className="text-red-300 font-medium">
                        Challenge saved locally, will sync soon
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Next Topic */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8 mb-8">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4 text-gray-300">Ready for More?</h2>
              <p className="text-lg text-gray-400 mb-4">Next recommended topic:</p>
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 rounded-2xl p-4">
                <p className="text-xl font-bold text-blue-400">{lesson.summary.nextTopic}</p>
              </div>
            </div>
          </div>

          {/* Firebase Save Status */}
          {isSavingToFirebase && (
            <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center justify-center gap-3">
                <LoadingSpinner size="sm" />
                <span className="text-sm font-semibold text-blue-300">
                  Saving your progress...
                </span>
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-300">
                  Progress saved successfully! 🎉
                </span>
              </div>
            </div>
          )}

          {saveError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center justify-center gap-3">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-semibold text-red-300">
                  Save failed: {saveError}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button 
              onClick={handleRestart} 
              disabled={isSavingToFirebase}
              className={`flex-1 font-bold py-4 px-6 rounded-full border-2 transition-all flex items-center justify-center gap-2 ${
                darkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
              } ${isSavingToFirebase ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </button>
            <button 
              onClick={handleCompleteLesson} 
              disabled={isSavingToFirebase}
              className={`flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-6 rounded-full hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                isSavingToFirebase ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Home className="w-5 h-5" />
              Finish Lesson
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
            <p className="text-sm text-gray-500">Step 4 of 4: Complete!</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default PracticeSession;