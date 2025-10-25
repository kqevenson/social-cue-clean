import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Star, Target, Users, Heart, Zap, Shield, ArrowRight, CheckCircle, PlayCircle, RotateCcw, Eye, HelpCircle, User, Volume2, VolumeX, Lightbulb } from 'lucide-react';
import { getAllLessonProgress, getLessonProgressStats, clearLessonProgress, getActiveChallenges, updateChallengeStatus, updateChallengeStats } from '../../firebaseHelpers';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { getUserData, saveUserData } from './utils/storage';
import ProgressCircle from './progress/ProgressCircle';
import ProgressBar from './progress/ProgressBar';
import StatusBadge from './progress/StatusBadge';
import ProgressStats from './progress/ProgressStats';
import CelebrationAnimation from './progress/CelebrationAnimation';
import ActiveChallengesSection from './ActiveChallengesSection';
import { VoiceOutput } from '../voice';

// Challenge Card Component
const ChallengeCard = ({ challenge, onComplete, onSkip, onLogAttempt, darkMode }) => {
  const [showTips, setShowTips] = useState(false);
  
  const getTopicIcon = (topic) => {
    const iconMap = {
      'Small Talk Basics': Users,
      'Active Listening': Heart,
      'Starting Conversations': Zap,
      'Joining Group Conversations': Users,
      'Reading Body Language': Eye,
      'Asking Questions': HelpCircle,
      'Sharing About Yourself': User,
      'Handling Disagreements': Shield,
      'Making Friends': Users,
      'Expressing Feelings': Heart,
      'Giving Compliments': Star,
      'Receiving Compliments': Star
    };
    return iconMap[topic] || Target;
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    const now = new Date();
    const created = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - created;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return 'This week';
  };

  const TopicIcon = getTopicIcon(challenge.lessonTopic);

  return (
    <div className={`bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-3xl p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Challenge Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-purple-500/20 p-3 rounded-2xl">
          <TopicIcon className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-purple-300">{challenge.lessonTopic}</span>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
              {challenge.timeframe || 'Try this week'}
            </span>
            {challenge.attemptCount > 0 && (
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-500/20 text-blue-500">
                {challenge.attemptCount} {challenge.attemptCount === 1 ? 'attempt' : 'attempts'}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            Added {formatTimeAgo(challenge.createdAt)}
          </span>
        </div>
      </div>

      {/* Challenge Text */}
      <div className="mb-4">
        <p className="text-lg leading-relaxed text-gray-200">
          {challenge.challengeText}
        </p>
      </div>

      {/* Tips Section */}
      {showTips && challenge.tips && challenge.tips.length > 0 && (
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
          <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 Tips for Success:</h4>
          <ul className="space-y-1">
            {challenge.tips.map((tip, idx) => (
              <li key={idx} className="text-sm text-blue-200 flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onLogAttempt(challenge.id)}
          className={`flex-1 font-bold py-3 px-6 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
            darkMode 
              ? 'border-white/20 text-white hover:bg-white/10'
              : 'border-gray-300 text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Target className="w-5 h-5" />
          I Tried This
        </button>
        <button
          onClick={() => onComplete(challenge.id)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Mark as Complete
        </button>
        
        {challenge.tips && challenge.tips.length > 0 && (
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium py-3 px-4 rounded-2xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showTips ? 'Hide Tips' : 'View Tips'}
          </button>
        )}
        
        <button
          onClick={() => onSkip(challenge.id)}
          className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 font-medium py-3 px-4 rounded-2xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
        >
          Skip
        </button>
      </div>
    </div>
  );
};

function LessonsScreen({ userData, onNavigate, darkMode }) {
  const [lessonProgress, setLessonProgress] = useState([]);
  const [progressStats, setProgressStats] = useState(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [progressError, setProgressError] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [lessonToRestart, setLessonToRestart] = useState(null);
  
  // Active challenges state
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [challengesError, setChallengesError] = useState(null);
  const [showTips, setShowTips] = useState(null);
  
  // Completion modal state
  const [completingChallenge, setCompletingChallenge] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  
  // Attempt logging state
  const [loggingAttempt, setLoggingAttempt] = useState(null);
  const [attemptNotes, setAttemptNotes] = useState('');
  
  // Lesson progress state
  const [firebaseLessonProgress, setFirebaseLessonProgress] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Voice state management
  const [voiceGender, setVoiceGender] = useState(() => {
    const userData = JSON.parse(localStorage.getItem('socialcue_user') || '{}');
    const gender = userData.voicePreference || 'female';
    console.log('📚 LessonsScreen voiceGender initialized:', gender);
    return gender;
  });
  const [playingSection, setPlayingSection] = useState(null);

  // getUserId function to generate consistent user IDs
  const getUserId = () => {
    // Try to get existing guest ID from localStorage (NOT sessionStorage)
    let guestId = localStorage.getItem('guestUserId');
    
    if (!guestId) {
      // Generate new one
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 11);
      guestId = `guest_${timestamp}_${randomStr}`;
      
      // Save permanently to localStorage
      localStorage.setItem('guestUserId', guestId);
      console.log('✅ Created new guest ID:', guestId);
    } else {
      console.log('✅ Using existing guest ID:', guestId);
    }
    
    return guestId;
  };

  const learnerId = getUserId();

  const [lessons, setLessons] = useState([
    {
      id: 'small-talk',
      title: 'Small Talk Mastery',
      topic: 'Small Talk Basics',
      description: 'Learn to start conversations and keep them flowing naturally',
      duration: '10-15 min',
      difficulty: 'Beginner',
      icon: Users,
      topics: ['Starting conversations', 'Finding common ground', 'Ending politely'],
      points: 50
    },
    {
      id: 'active-listening',
      title: 'Active Listening',
      topic: 'Active Listening',
      description: 'Develop skills to truly hear and understand others',
      duration: '12-18 min',
      difficulty: 'Intermediate',
      icon: Heart,
      topics: ['Paying attention', 'Asking good questions', 'Showing empathy'],
      points: 75
    },
    {
      id: 'body-language',
      title: 'Body Language',
      topic: 'Reading Body Language',
      description: 'Understand and use nonverbal communication effectively',
      duration: '15-20 min',
      difficulty: 'Intermediate',
      icon: Target,
      topics: ['Reading cues', 'Posture and gestures', 'Eye contact'],
      points: 60
    },
    {
      id: 'confidence-building',
      title: 'Building Confidence',
      topic: 'Building Confidence',
      description: 'Develop self-assurance in social situations',
      duration: '20-25 min',
      difficulty: 'Advanced',
      icon: Shield,
      topics: ['Positive self-talk', 'Overcoming fears', 'Assertiveness'],
      points: 100
    },
    {
      id: 'conflict-resolution',
      title: 'Conflict Resolution',
      topic: 'Conflict Resolution',
      description: 'Learn to handle disagreements and find solutions',
      duration: '18-22 min',
      difficulty: 'Advanced',
      icon: Zap,
      topics: ['Staying calm', 'Finding compromise', 'Apologizing'],
      points: 90
    }
  ]);

  const [completedLessons, setCompletedLessons] = useState([]);

  useEffect(() => {
    // Load completed lessons from localStorage or Firebase
    const saved = localStorage.getItem('completedLessons');
    if (saved) {
      try {
        setCompletedLessons(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading completed lessons:', error);
      }
    }
  }, []);

  const handleStartLesson = (lessonId) => {
    console.log('Starting lesson:', lessonId);
    
    if (!lessonId) {
      console.error('Lesson ID is undefined');
      return;
    }
    
    // Check if this lesson was just completed to trigger celebration
    const progress = getLessonProgressData(lessonId);
    if (progress && progress.status === 'completed') {
      setShowCelebration(true);
    }
    
    // Navigate to practice session with the lesson topic
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) {
      console.error('Lesson not found:', lessonId);
      return;
    }
    
    if (!lesson.topic) {
      console.error('Lesson topic is missing for lesson:', lessonId);
      return;
    }
    
    console.log('Starting lesson with topic:', lesson.topic);
    
    // Map lesson ID to session ID for PracticeSession and pass topicName
    const sessionIdMap = {
      'small-talk': 1,
      'active-listening': 2,
      'body-language': 3,
      'confidence-building': 4,
      'conflict-resolution': 5
    };
    
    // Update user data with the correct topicName before navigating
    const userData = getUserData();
    const updatedUserData = { ...userData, topicName: lesson.topic };
    saveUserData(updatedUserData);
    
    onNavigate('practice', sessionIdMap[lessonId] || 1);
  };

  const handleRestartLesson = (lesson) => {
    setLessonToRestart(lesson);
    setShowRestartModal(true);
  };

  // Challenge handling functions
  const handleChallengeComplete = async (challengeId, notes) => {
    try {
      console.log('✅ Marking challenge as complete:', challengeId);
      
      const challengeRef = doc(db, 'real_world_challenges', challengeId);
      await updateDoc(challengeRef, {
        status: 'completed',
        completedAt: serverTimestamp(),
        completionNotes: notes || null,
        updatedAt: serverTimestamp()
      });
      
      // Update learner stats
      const userData = getUserData();
      const learnerId = userData.userId || getUserId();
      await updateChallengeStats(learnerId, 'completed');
      
      // Remove from active challenges
      setActiveChallenges(prev => prev.filter(c => c.id !== challengeId));
      setCompletingChallenge(null);
      setCompletionNotes('');
      
      console.log('🎉 Challenge completed successfully!');
      
    } catch (error) {
      console.error('❌ Error completing challenge:', error);
    }
  };

  const handleChallengeSkip = async (challengeId) => {
    try {
      console.log('⏭️ Skipping challenge:', challengeId);
      
      await updateChallengeStatus(challengeId, 'skipped', 'Skipped by user');
      
      // Update learner stats
      const userData = getUserData();
      const learnerId = userData.userId || getUserId();
      await updateChallengeStats(learnerId, 'skipped');
      
      // Remove from active challenges
      setActiveChallenges(prev => prev.filter(c => c.id !== challengeId));
      
      console.log('✅ Challenge skipped successfully');
      
    } catch (error) {
      console.error('❌ Error skipping challenge:', error);
    }
  };

  const handleLogAttempt = async (challengeId, notes) => {
    try {
      console.log('🎯 Logging attempt for challenge:', challengeId);
      
      const challengeRef = doc(db, 'real_world_challenges', challengeId);
      const challenge = activeChallenges.find(c => c.id === challengeId);
      
      // Get existing attempts or create empty array
      const currentAttempts = challenge?.attempts || [];
      
      // Add new attempt
      const newAttempt = {
        timestamp: serverTimestamp(),
        notes: notes || null,
        attemptNumber: currentAttempts.length + 1
      };
      
      await updateDoc(challengeRef, {
        attempts: [...currentAttempts, newAttempt],
        lastAttemptAt: serverTimestamp(),
        attemptCount: currentAttempts.length + 1,
        updatedAt: serverTimestamp()
      });

      // Update local state
      setActiveChallenges(prev => prev.map(c => 
        c.id === challengeId 
          ? { ...c, attempts: [...currentAttempts, newAttempt], attemptCount: currentAttempts.length + 1 }
          : c
      ));
      
      setLoggingAttempt(null);
      setAttemptNotes('');
      
      console.log('✅ Attempt logged for challenge:', challengeId);
    } catch (error) {
      console.error('❌ Error logging attempt:', error);
    }
  };

  const confirmRestartLesson = async () => {
    if (!lessonToRestart) return;
    
    try {
      const userData = getUserData();
      const learnerId = userData.userId || getUserId();
      
      console.log('Restarting lesson:', lessonToRestart.topic);
      
      // Clear lesson progress
      await clearLessonProgress(learnerId, lessonToRestart.topic);
      
      // Reload progress data
      await loadProgressData();
      
      // Close modal
      setShowRestartModal(false);
      setLessonToRestart(null);
      
      console.log(`🔄 Restarted lesson: ${lessonToRestart.topic}`);
    } catch (error) {
      console.error('Error restarting lesson:', error);
    }
  };

  const cancelRestartLesson = () => {
    setShowRestartModal(false);
    setLessonToRestart(null);
  };

  const isCompleted = (lessonId) => completedLessons.includes(lessonId);

  // Load lesson progress on component mount (non-blocking)
  useEffect(() => {
    const loadLessonProgress = async () => {
      try {
        setIsLoadingProgress(true);
        setProgressError(null);
        
        const userData = getUserData();
        const learnerId = userData.userId || getUserId();
        
        console.log('📚 Loading lesson progress for learner:', learnerId);
        
        // Load all lesson progress with timeout
        const progressPromise = getAllLessonProgress(learnerId);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Progress loading timeout')), 5000)
        );
        
        const progress = await Promise.race([progressPromise, timeoutPromise]);
        setLessonProgress(progress);
        
        // Load progress statistics
        const stats = await getLessonProgressStats(learnerId);
        setProgressStats(stats);
        
        console.log('📊 Lesson progress loaded successfully:', { progress, stats });
        
        // Try to sync any backup progress
        try {
          const backupProgress = JSON.parse(localStorage.getItem('lessonProgressBackup') || '[]');
          if (backupProgress.length > 0) {
            console.log('🔄 Found backup progress, attempting to sync...');
            // The sync will happen in PracticeSession when user starts a lesson
          }
        } catch (error) {
          console.error('❌ Error checking backup progress:', error);
        }
      } catch (error) {
        console.error('❌ Error loading lesson progress:', error);
        console.log('🔄 Progress loading failed, continuing without progress data');
        
        // Set fallback values instead of error state
        setLessonProgress([]);
        setProgressStats({
          totalLessons: lessons.length,
          completedLessons: 0,
          inProgressLessons: 0,
          notStartedLessons: lessons.length,
          completionPercentage: 0,
          totalPointsEarned: 0,
          averageScore: 0
        });
        
        // Set a warning message but don't block the UI
        setProgressError('Progress unavailable - showing lessons without progress data');
        
        // Retry loading in background after 3 seconds
        setTimeout(() => {
          console.log('🔄 Retrying progress load in background...');
          loadLessonProgress();
        }, 3000);
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadLessonProgress();
  }, []);

  // Load active challenges when userData is available
  useEffect(() => {
    const loadActiveChallenges = async () => {
      try {
        setLoadingChallenges(true);
        setChallengesError(null);
        
        const challenges = await getActiveChallenges(learnerId);
        console.log('✅ Loaded challenges:', challenges.length);
        setActiveChallenges(challenges);
      } catch (error) {
        console.error('❌ Error loading challenges:', error);
        setChallengesError(error.message);
      } finally {
        setLoadingChallenges(false);
      }
    };

    loadActiveChallenges();
  }, [learnerId]);

  // Load lesson progress from Firebase
  const loadLessonProgress = async () => {
    try {
      setLoadingProgress(true);
      console.log('🔍 Loading lesson progress for learner:', learnerId);

      // Query lesson progress - filter by learnerId
      const q = query(
        collection(db, 'lesson_progress'),
        where('learnerId', '==', learnerId)
      );

      const querySnapshot = await getDocs(q);
      const progress = [];
      
      console.log('📊 Raw lesson progress docs:', querySnapshot.size);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Lesson doc:', doc.id, data);  // Check console to see actual fields!
        
        // Adapt these field names to match your actual Firebase structure
        progress.push({
          lessonId: doc.id,
          topicName: data.topicName || data.topic || data.lessonTitle || data.lessonTopic || 'Unknown Topic',
          status: (data.completionPercentage >= 100 || data.completed || data.status === 'completed') ? 'completed' : 'in_progress',
          progress: data.completionPercentage || data.progress || data.currentStep || 0,
          lastUpdated: data.lastAccessedAt || data.lastUpdated || data.updatedAt || data.createdAt
        });
      });

      // Sort by last updated (most recent first)
      progress.sort((a, b) => {
        const aTime = a.lastUpdated?.toMillis?.() || 0;
        const bTime = b.lastUpdated?.toMillis?.() || 0;
        return bTime - aTime;
      });

      console.log(`✅ Found ${progress.length} lesson progress records`);
      console.log('📊 Processed progress:', progress);
      setFirebaseLessonProgress(progress);
    } catch (error) {
      console.error('❌ Error loading lesson progress:', error);
    } finally {
      setLoadingProgress(false);
    }
  };

  // Load lesson progress when learnerId is available
  useEffect(() => {
    loadLessonProgress();
  }, [learnerId]);

  // Get progress for a specific lesson
  const getLessonProgressData = (lessonId) => {
    return lessonProgress.find(p => 
      (p.lessonTopic || '').toLowerCase().replace(/\s+/g, '-') === lessonId ||
      (p.lessonTopic || '').toLowerCase().includes((lessonId || '').toLowerCase())
    );
  };

  // Get lesson status and button text
  const getLessonStatus = (lessonId) => {
    // If progress loading failed, show all lessons as not started
    if (progressError) {
      return {
        status: 'not_started',
        buttonText: 'Start Lesson',
        buttonIcon: PlayCircle,
        statusColor: 'bg-gray-600',
        statusText: 'Not Started',
        progressPercentage: 0,
        currentStep: 1,
        totalSteps: 3,
        stepsCompleted: []
      };
    }

    const progress = getLessonProgressData(lessonId);
    
    if (!progress) {
      return {
        status: 'not_started',
        buttonText: 'Start Lesson',
        buttonIcon: PlayCircle,
        statusColor: 'bg-gray-600',
        statusText: 'Not Started',
        progressPercentage: 0,
        currentStep: 1,
        totalSteps: 3,
        stepsCompleted: []
      };
    }
    
    if (progress.status === 'completed') {
      return {
        status: 'completed',
        buttonText: 'Review Lesson',
        buttonIcon: RotateCcw,
        statusColor: 'bg-green-600',
        statusText: 'Completed',
        progressPercentage: 100,
        currentStep: 3,
        totalSteps: 3,
        stepsCompleted: [1, 2, 3],
        completedAt: progress.completedAt
      };
    }
    
    if (progress.status === 'in_progress') {
      const stepsCompleted = progress.stepsCompleted || [];
      const progressPercentage = Math.round((stepsCompleted.length / 3) * 100);
      
      return {
        status: 'in_progress',
        buttonText: 'Continue Lesson',
        buttonIcon: PlayCircle,
        statusColor: 'bg-blue-600',
        statusText: `Step ${progress.currentStep} of 3`,
        progressPercentage,
        currentStep: progress.currentStep || 1,
        totalSteps: 3,
        stepsCompleted
      };
    }
    
    return {
      status: 'not_started',
      buttonText: 'Start Lesson',
      buttonIcon: PlayCircle,
      statusColor: 'bg-gray-600',
      statusText: 'Not Started',
      progressPercentage: 0,
      currentStep: 1,
      totalSteps: 3,
      stepsCompleted: []
    };
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-400/20';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/20';
      case 'Advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  // Show loading state only if we don't have lessons data
  if (!lessons || lessons.length === 0) {
    return (
      <div className={`min-h-screen p-6 ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Loading lessons...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No blocking error state - lessons will always show

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <CelebrationAnimation 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)} 
      />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold">Lessons</h1>
          </div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Personalized social skills lessons powered by AI, tailored to your grade level and learning style.
          </p>
        </div>

        {/* Active Challenges Section */}
        <ActiveChallengesSection darkMode={darkMode} />
        
        {/* Original Conditional Section (commented out for debugging) */}
        {/* {activeChallenges.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-purple-400">
                Your Active Challenges ({activeChallenges.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {activeChallenges.slice(0, 4).map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onComplete={handleChallengeComplete}
                  onSkip={handleChallengeSkip}
                  onLogAttempt={setLoggingAttempt}
        darkMode={darkMode}
      />
              ))}
            </div>
            
            {activeChallenges.length > 4 && (
              <div className="text-center">
                <button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-medium py-3 px-6 rounded-2xl transition-all duration-200 hover:scale-105">
                  View All Challenges ({activeChallenges.length})
                </button>
              </div>
            )}
          </section>
        )}

        {/* Loading State for Challenges */}
        {loadingChallenges && (
          <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-purple-400">Your Active Challenges</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-3xl p-6 animate-pulse">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-gray-700 rounded-2xl w-12 h-12"></div>
                    <div className="flex-1">
                      <div className="bg-gray-700 rounded h-4 w-32 mb-2"></div>
                      <div className="bg-gray-700 rounded h-3 w-20"></div>
          </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="bg-gray-700 rounded h-4 w-full"></div>
                    <div className="bg-gray-700 rounded h-4 w-3/4"></div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-gray-700 rounded-2xl h-10 flex-1"></div>
                    <div className="bg-gray-700 rounded-2xl h-10 flex-1"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Error State for Challenges */}
        {challengesError && (
          <section className="mb-8">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Target className="w-5 h-5 text-red-400" />
                <span className="text-red-300 font-medium">Unable to load challenges</span>
            </div>
              <p className="text-red-200 text-sm mb-4">
                Your challenges will appear here once you complete a lesson.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium py-2 px-4 rounded-xl transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          </section>
        )}

        {/* Progress Warning Banner */}
        {progressError && (
          <div className={`mb-6 p-4 rounded-2xl border ${darkMode ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'}`}>
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚠️</div>
            <div className="flex-1">
                <h3 className={`font-semibold ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                  Progress Unavailable
              </h3>
                <p className={`text-sm ${darkMode ? 'text-orange-200' : 'text-orange-600'}`}>
                  {progressError}. You can still start and continue lessons.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isLoadingProgress ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-400"></div>
                ) : (
            <button
                    onClick={() => {
                      setProgressError(null);
                      setIsLoadingProgress(true);
                      // Retry loading progress
                      setTimeout(() => {
                        window.location.reload();
                      }, 100);
                    }}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      darkMode 
                        ? 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30' 
                        : 'bg-orange-200 text-orange-700 hover:bg-orange-300'
                    }`}
                  >
                    Retry
            </button>
                )}
          </div>
        </div>
          </div>
        )}

        {/* Progress Stats */}
        {!progressError && (
          <div className="mb-8">
            <div className="text-center py-8">
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {firebaseLessonProgress.length} of {firebaseLessonProgress.length} Lessons
              </p>
            </div>

            {/* In Progress Section */}
            <div className="mb-6">
              <div className={`flex items-center gap-2 mb-3 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                <h3 className="font-bold">In Progress</h3>
              </div>
              {firebaseLessonProgress.filter(l => l.status === 'in_progress').length > 0 ? (
                <div className="space-y-3">
                  {firebaseLessonProgress.filter(l => l.status === 'in_progress').map((lesson) => (
                    <div 
                      key={lesson.lessonId}
                      className={`p-4 rounded-xl border ${
                        darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {lesson.topicName}
                        </span>
                        <span className={`text-sm font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {Math.round(lesson.progress)}%
              </span>
            </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${
                        darkMode ? 'bg-white/10' : 'bg-gray-200'
                      }`}>
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                          style={{ width: `${lesson.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 rounded-xl ${
                  darkMode ? 'bg-white/5' : 'bg-gray-50'
                }`}>
                  <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    0 Active lessons
                  </p>
                </div>
              )}
            </div>

            {/* Completed Section */}
            <div>
              <div className={`flex items-center gap-2 mb-3 ${
                darkMode ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                <CheckCircle className="w-4 h-4" />
                <h3 className="font-bold">Completed</h3>
              </div>
              {firebaseLessonProgress.filter(l => l.status === 'completed').length > 0 ? (
                <div className="space-y-3">
                  {firebaseLessonProgress.filter(l => l.status === 'completed').map((lesson) => (
                    <div 
                      key={lesson.lessonId}
                      className={`p-4 rounded-xl border ${
                        darkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {lesson.topicName}
                        </span>
                        <CheckCircle className={`w-5 h-5 ${
                          darkMode ? 'text-emerald-400' : 'text-emerald-600'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 rounded-xl ${
                  darkMode ? 'bg-white/5' : 'bg-gray-50'
                }`}>
                  <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    0 Completed lessons
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Learning Path Section */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-blue-400">Your Learning Path</h2>
          </div>
        </section>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            {lessons.map((lesson) => {
              const Icon = lesson.icon;
            const completed = isCompleted(lesson.id);
            const lessonStatus = getLessonStatus(lesson.id);
            const StatusIcon = lessonStatus.buttonIcon;
              
              return (
                <div
                  key={lesson.id}
                className={`backdrop-blur-xl border rounded-3xl p-6 transition-all hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                    darkMode 
                      ? 'bg-white/8 border-white/20 hover:border-blue-500/50 hover:bg-white/10' 
                      : 'bg-white border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-lg'
                  } ${lessonStatus.status === 'completed' ? 'ring-2 ring-emerald-500/50' : ''} ${
                    lessonStatus.status === 'in_progress' ? 'ring-1 ring-blue-500/30' : ''
                  }`}
                  onClick={() => handleStartLesson(lesson.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleStartLesson(lesson.id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${lesson.title} lesson - ${lessonStatus.statusText}. Click to ${(lessonStatus.buttonText || '').toLowerCase()}.`}
                >
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-3 rounded-xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                        <Icon className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{lesson.title}</h3>
                        <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getDifficultyColor(lesson.difficulty)}`}>
                          {lesson.difficulty}
                        </span>
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {lesson.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badge and Restart Button */}
                    <div className="flex flex-col gap-2 items-end">
                      <StatusBadge 
                        status={lessonStatus.status} 
                        size="sm" 
                        animated={true}
                      />
                      {(lessonStatus.status === 'in_progress' || lessonStatus.status === 'completed') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestartLesson(lesson);
                          }}
                          className={`p-1 rounded-full transition-all hover:scale-110 ${
                          darkMode 
                            ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/20' 
                            : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                          }`}
                        title="Restart Lesson"
                        aria-label="Restart lesson"
                        >
                        <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                {/* Description Section */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className={`text-sm leading-relaxed flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {lesson.description}
                  </p>
                    
                    {/* Voice toggle for this lesson */}
                    <button
                      onClick={() => setPlayingSection(playingSection === lesson.id ? null : lesson.id)}
                      className={`ml-3 p-2 rounded-lg transition-all ${
                        playingSection === lesson.id 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                      title={playingSection === lesson.id ? 'Stop reading' : 'Read lesson'}
                    >
                      {playingSection === lesson.id ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* Voice Output for Description */}
                  {playingSection === lesson.id && (
                    <div className="mt-3">
                      <VoiceOutput
                        text={`${lesson.title}. ${lesson.description}`}
                        voiceGender={voiceGender}
                        autoPlay={true}
                        onComplete={() => setPlayingSection(null)}
                        onError={(error) => console.error('Voice error:', error)}
                        onStart={() => console.log('🎤 Starting lesson audio with voiceGender:', voiceGender)}
                      />
                    </div>
                  )}
                </div>

                {/* Topics Section */}
                <div className="mb-4">
                  <p className={`text-xs font-bold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    TOPICS COVERED:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {lesson.topics.map((topic, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                  {/* Progress Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Progress
                      </span>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {lessonStatus.progressPercentage}%
                      </span>
                    </div>
                  <ProgressBar 
                    progress={lessonStatus.progressPercentage}
                    status={lessonStatus.status}
                    height="sm"
                    showSteps={lessonStatus.status === 'in_progress'}
                    currentStep={lessonStatus.currentStep}
                    totalSteps={lessonStatus.totalSteps}
                    animated={true}
                      />
                    </div>

                {/* Footer Section */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {lessonStatus.status === 'completed' ? 'Completed' : `${lesson.points} points`}
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-400 font-medium">
                      {lessonStatus.buttonText}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
                  </div>

        {/* Bottom Info */}
        <div className={`mt-8 p-4 rounded-2xl border ${darkMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <div>
              <h4 className="font-bold text-blue-400 mb-1">Personalized Learning</h4>
              <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                Each lesson is generated specifically for your grade level and learning style. 
                Start any lesson to begin your personalized learning journey!
              </p>
                    </div>
                    </div>
                    </div>
                  </div>

      {/* Restart Confirmation Modal */}
      {showRestartModal && lessonToRestart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-2xl p-6 ${
            darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-orange-600" />
              </div>
              
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Restart Lesson?
              </h3>
              
              <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                This will clear your progress for "{lessonToRestart.title}" and start over from the beginning.
              </p>
              
              <div className="flex gap-3">
                  <button
                  onClick={cancelRestartLesson}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                
                <button
                  onClick={confirmRestartLesson}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Restart
                  </button>
                </div>
          </div>
        </div>
        </div>
      )}

      {/* Challenge Completion Modal */}
      {completingChallenge && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => {
            setCompletingChallenge(null);
            setCompletionNotes('');
          }}
        >
          <div 
            className={`max-w-lg w-full rounded-3xl p-6 ${darkMode ? 'bg-gray-900 border border-white/20' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Complete Challenge
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  How did it go?
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {activeChallenges.find(c => c.id === completingChallenge)?.challengeText}
              </p>
              </div>

            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Notes (Optional)
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="How did it feel? What did you learn?"
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Share what worked well or what you'd like to improve next time
              </p>
              </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCompletingChallenge(null);
                  setCompletionNotes('');
                }}
                className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                  darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleChallengeComplete(completingChallenge, completionNotes)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                Complete ✨
              </button>
            </div>
              </div>
              </div>
      )}

      {/* Attempt Logging Modal */}
      {loggingAttempt && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => {
            setLoggingAttempt(null);
            setAttemptNotes('');
          }}
        >
          <div 
            className={`max-w-lg w-full rounded-3xl p-6 ${darkMode ? 'bg-gray-900 border border-white/20' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
            </div>
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Log Practice Attempt
                </h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Great job trying!
                </p>
              </div>
              </div>

            <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {activeChallenges.find(c => c.id === loggingAttempt)?.challengeText}
              </p>
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                How did it go? (Optional)
              </label>
              <textarea
                value={attemptNotes}
                onChange={(e) => setAttemptNotes(e.target.value)}
                placeholder="What happened? How did you feel?"
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Keep practicing! Each attempt helps you improve
              </p>
          </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setLoggingAttempt(null);
                  setAttemptNotes('');
                }}
                className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                  darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleLogAttempt(loggingAttempt, attemptNotes)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all"
              >
                Log Attempt 🎯
              </button>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}

export default LessonsScreen;
