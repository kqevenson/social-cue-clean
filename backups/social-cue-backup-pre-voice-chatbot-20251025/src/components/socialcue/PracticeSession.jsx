import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, RotateCcw, Lightbulb, Volume2, VolumeX, Home, Info, Target } from 'lucide-react';
import { getUserData, STORAGE_KEY } from './utils/storage';
import { getGradeRange } from './utils/helpers';
import scenarios from './utils/scenarios';
import SuccessAnimation from './animations/SuccessAnimation';
import LoadingSpinner from './animations/LoadingSpinner';
import SessionResults from './SessionResults';
import { useToast, Button, AnimatedNumber, SmoothProgressBar } from './animations';
import { getFirestore, doc, updateDoc, collection, addDoc, getDoc, setDoc } from 'firebase/firestore';

function PracticeSession({ sessionId, onNavigate, darkMode, gradeLevel, soundEffects, autoReadText }) {
  // Configuration flags
  const USE_AI_EVALUATION = false; // Set to true when backend is deployed
  const USE_API = false; // Set to true when backend is ready
  const API_BASE_URL = 'http://localhost:3001';
  
  const [currentSituation, setCurrentSituation] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { showSuccess, showError } = useToast();
  const [totalPoints, setTotalPoints] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoRead, setAutoRead] = useState(autoReadText);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionResponses, setSessionResponses] = useState([]);
  const [aiEvaluation, setAiEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionResults, setSessionResults] = useState(null);
  const [showSessionResults, setShowSessionResults] = useState(false);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  const [lessonState, setLessonState] = useState('loading'); // 'loading', 'ready', 'error'
  const [aiGeneratedScenario, setAiGeneratedScenario] = useState(null);

  const gradeRange = getGradeRange(gradeLevel);
  const scenario = aiGeneratedScenario || scenarios[sessionId] || scenarios[1];
  const situation = scenario.situations[currentSituation];
  
  console.log('🔍 Current scenario:', scenario.title);
  console.log('🔍 Scenario situations count:', scenario.situations?.length || 0);
  console.log('🔍 Current situation index:', currentSituation);
  console.log('🔍 Current situation object:', situation);
  console.log('🔍 Current situation context:', situation?.context);
  console.log('🔍 Context type:', typeof situation?.context);
  
  // Navigation debugging
  console.log('🔵 Can go to next?', scenario.situations?.length > 0 && currentSituation < scenario.situations.length - 1);
  console.log('🔵 Can go back?', currentSituation > 0);
  console.log('🔵 Progress:', `${currentSituation + 1}/${scenario.situations?.length || 0}`);

  // Shuffle function to randomize answer positions
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle options for each situation
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [originalCorrectIndex, setOriginalCorrectIndex] = useState(null);

  useEffect(() => {
    if (situation && situation.options) {
      const shuffled = shuffleArray(situation.options);
      setShuffledOptions(shuffled);
      
      // Find the original correct answer index in the shuffled array
      const correctIndex = shuffled.findIndex(option => option.isGood);
      setOriginalCorrectIndex(correctIndex);
    }
  }, [currentSituation, situation]);

  // AI Scenario Generation
  useEffect(() => {
    const generateScenarios = async () => {
      try {
        console.log('🤖 Generating AI scenarios for:', sessionId);
        console.log('🔍 SESSION ID:', sessionId);
        console.log('🔍 GRADE LEVEL:', gradeLevel);
        
        // Don't generate if no sessionId
        if (!sessionId) {
          console.log('⚠️ No sessionId provided, using fallback scenarios');
          setLessonState('ready');
          return;
        }
        
        setLessonState('loading');

        // Call your backend API to generate scenarios
        const response = await fetch('http://localhost:3001/api/generate-lesson-simple', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: sessionId, // or get topic name from props
            gradeLevel: gradeLevel || '5',
            numScenarios: 5,
            timestamp: Date.now(), // Force new scenarios each time
            requestId: `${sessionId}-${Date.now()}-${Math.random()}`
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate scenarios');
        }

        const data = await response.json();
        console.log('✅ AI scenarios generated:', data);
        console.log('📊 Scenarios received:', data.scenarios?.length || 0);
        console.log('📊 Full scenarios data:', data.scenarios);
        
        // Detailed frontend logging
        console.log('🔵 Scenarios received from API:', data.scenarios?.length || 0);
        if (data.scenarios && data.scenarios.length > 0) {
          console.log('🔵 All scenarios:', data.scenarios.map(s => s.scenario?.substring(0, 30) + '...'));
          console.log('🔵 First scenario full:', data.scenarios[0]);
          console.log('🔵 Last scenario full:', data.scenarios[data.scenarios.length - 1]);
        }
        
        // Transform the API response to match our scenario format
        const transformedScenario = {
          id: sessionId,
          title: data.title || sessionId.replace(/-/g, ' '),
          situations: data.scenarios?.map((scenario, index) => ({
            id: index + 1,
            context: scenario.scenario, // API returns 'scenario', frontend expects 'context'
            prompt: "What should you do?",
            options: scenario.options?.map(option => ({
              text: option.text,
              isGood: option.isGood,
              points: option.points || 10,
              feedback: option.feedback,
              tip: option.feedback
            })) || []
          })) || [],
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          aiGenerated: true
        };
        
        console.log('🔄 Transformed scenarios count:', transformedScenario.situations.length);
        console.log('🔄 Transformed scenarios:', transformedScenario.situations);
        
        // Detailed transformation logging
        console.log('🔵 After transformation - all situations:', transformedScenario.situations.map((s, i) => `${i + 1}. ${s.context?.substring(0, 30)}...`));
        console.log('🔵 Transformation preserved all scenarios:', transformedScenario.situations.length === (data.scenarios?.length || 0));
        
        setAiGeneratedScenario(transformedScenario);
        setCurrentSituation(0); // Reset to first scenario when new scenarios are loaded
        console.log('🔍 SCENARIO SOURCE:', 'AI Generated');
        setLessonState('ready');
      } catch (error) {
        console.error('❌ Error generating scenarios:', error);
        console.log('🔍 SCENARIO SOURCE:', 'Hardcoded (fallback)');
        
        // Fallback to demo scenarios if AI fails
        setAiGeneratedScenario(null);
        setLessonState('ready');
        showError('Oops! Having trouble creating your practice session. Let\'s try that again!');
      }
    };

    if (sessionId) {
      generateScenarios();
    } else {
      console.log('⚠️ No sessionId, skipping AI generation');
      setLessonState('ready');
    }
  }, [sessionId, gradeLevel]);

  // AI Evaluation function with hardcoded fallback
  const evaluateResponse = async (scenario, userResponse, learnerContext, retryCount = 0) => {
    try {
      setIsEvaluating(true);
      
      // Use hardcoded feedback if AI evaluation is disabled
      if (!USE_AI_EVALUATION) {
        console.log('📝 Using hardcoded feedback (AI evaluation disabled)');
        return getHardcodedFeedback(scenario, userResponse);
      }
      
      // Check if API is available
      if (!API_BASE_URL) {
        console.warn('⚠️ API URL not configured, using hardcoded feedback');
        return getHardcodedFeedback(scenario, userResponse);
      }
      
      const response = await fetch(`${API_BASE_URL}/api/adaptive/evaluate-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: localStorage.getItem('userId') || 'guest_' + Date.now(),
          scenario: {
            id: scenario.id,
            title: scenario.title,
            context: scenario.context,
            prompt: scenario.prompt,
            options: scenario.options
          },
          userResponse: userResponse,
          learnerContext: {
            grade: gradeLevel,
            topicId: sessionId,
            topicName: scenario.title
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const evaluation = await response.json();
      return evaluation;
    } catch (error) {
      console.error('Error evaluating response:', error);
      
      // Retry once if this is the first attempt and API is enabled
      if (retryCount === 0 && USE_AI_EVALUATION) {
        console.log('🔄 Retrying AI evaluation in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return evaluateResponse(scenario, userResponse, learnerContext, 1);
      }
      
      // Always fall back to hardcoded feedback
      console.log('📝 Falling back to hardcoded feedback');
      return getHardcodedFeedback(scenario, userResponse);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Generate hardcoded feedback based on scenario and user response
  const getHardcodedFeedback = (scenario, userResponse) => {
    // Find the selected option
    const selectedOption = scenario.options.find(opt => opt.text === userResponse);
    
    if (selectedOption) {
      return {
        score: selectedOption.isGood ? 0.8 : 0.3,
        feedback: selectedOption.feedback || "Good thinking! Keep practicing.",
        comprehensionLevel: selectedOption.isGood ? "good" : "developing",
        strengths: selectedOption.isGood ? ["You made a thoughtful choice!"] : ["You're learning!"],
        areasForImprovement: selectedOption.isGood ? ["Keep up the great work!"] : ["Try thinking about what would be most helpful in this situation"],
        personalizedFeedback: selectedOption.feedback || "Every attempt helps you learn. You're doing great!",
        points: selectedOption.points || (selectedOption.isGood ? 10 : 0)
      };
    }
    
    // Fallback feedback if option not found
    return {
      score: 0.5,
      feedback: "Great effort! Keep practicing to improve your social skills.",
      comprehensionLevel: "basic",
      strengths: ["You're trying your best!"],
      areasForImprovement: ["Keep practicing different scenarios"],
      personalizedFeedback: "Every attempt helps you learn. You're doing great!",
      points: 5
    };
  };

  // Generate real-world challenge function
  const generateRealWorldChallenge = async (topicName, performance) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.log('⚠️ No userId found, skipping challenge creation');
        return;
      }

      // Validate input data
      if (!topicName || typeof topicName !== 'string') {
        console.error('Invalid topicName provided:', topicName);
        return;
      }

      // Create a challenge based on what they just learned
      const challenge = {
        id: Date.now(),
        title: `Practice: ${topicName}`,
        description: `Now that you've learned about ${topicName}, try using it in real life! Look for an opportunity today to apply what you learned.`,
        difficulty: performance >= 80 ? 'Intermediate' : 'Beginner',
        topic: topicName,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      // Save to localStorage immediately (no API calls for now)
      const existingChallenges = JSON.parse(localStorage.getItem('localChallenges') || '[]');
      existingChallenges.push(challenge);
      localStorage.setItem('localChallenges', JSON.stringify(existingChallenges));
      console.log('✅ Challenge saved locally:', challenge);
      showSuccess('🎯 Challenge created! Check your active challenges.');

      // Optionally sync to Firebase in background (if API is enabled)
      if (USE_API) {
        try {
          const db = getFirestore();
          const challengesRef = collection(db, `users/${userId}/challenges`);
          await addDoc(challengesRef, challenge);
          console.log('✅ Challenge synced to Firebase');
        } catch (firebaseError) {
          console.log('⚠️ Failed to sync challenge to Firebase:', firebaseError.message);
        }
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      showError('Failed to create challenge. Please try again.');
    }
  };

  // Update goal progress after session completion
  const updateGoalProgress = async (topicName, performance, pointsEarned) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.log('⚠️ No userId found, skipping goal progress update');
        return;
      }

      // Skip API calls for now, just log the progress
      console.log('📊 Goal progress update:', {
        topicName,
        performance,
        pointsEarned,
        userId
      });

      // TODO: Implement goal progress tracking when API is ready
      // For now, just show a success message
      showSuccess('📈 Progress tracked! Keep up the great work!');

    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  // Complete Practice Session function
  const completePracticeSession = async () => {
    try {
      setIsCompletingSession(true);
      
      // Calculate session metrics
      const scenariosCompleted = sessionResponses.length;
      const correctResponses = sessionResponses.filter(response => response.isCorrect).length;
      const accuracy = scenariosCompleted > 0 ? (correctResponses / scenariosCompleted) * 100 : 0;
      const averageResponseTime = scenariosCompleted > 0 
        ? sessionResponses.reduce((sum, response) => sum + response.responseTime, 0) / scenariosCompleted 
        : 0;
      
      // Calculate session duration (from first response to now)
      const sessionStartTime = sessionResponses.length > 0 ? sessionResponses[0].responseTime : Date.now();
      const sessionDuration = Date.now() - sessionStartTime;
      
      // Skip API call, generate local results
      console.log('📊 Session completed locally:', {
        scenariosCompleted,
        accuracy,
        averageResponseTime,
        sessionDuration
      });

      // Generate local session results
      const results = {
        aiAnalysis: {
          overallPerformance: `Great job! You completed ${scenariosCompleted} scenarios with ${Math.round(accuracy)}% accuracy.`,
          personalizedEncouragement: "Keep practicing to improve your social skills!",
          conceptsUnderstood: ["Basic social interactions", "Problem-solving"],
          areasToReview: ["Continue practicing different scenarios"]
        },
        nextDifficulty: 1,
        masteryLevel: Math.min(100, Math.round(accuracy)),
        sessionSummary: {
          totalScenarios: scenariosCompleted,
          correctAnswers: correctResponses,
          accuracy: Math.round(accuracy),
          timeSpent: Math.round(sessionDuration / 1000)
        },
        recommendations: [
          "Practice more scenarios to build confidence",
          "Try different social situations",
          "Keep up the great work!"
        ]
      };
      
      setSessionResults(results);
      setShowSessionResults(true);
      
      return results;
    } catch (error) {
      console.error('Error completing practice session:', error);
      // Return fallback results
      const fallbackResults = {
        aiAnalysis: {
          overallPerformance: "Good work completing the session!",
          personalizedEncouragement: "Keep practicing to improve your social skills!",
          conceptsUnderstood: ["Basic social interactions"],
          areasToReview: ["Continue practicing"]
        },
        nextDifficulty: 1,
        masteryLevel: 25,
        sessionSummary: {
          totalScenarios: sessionResponses.length,
          correctAnswers: sessionResponses.filter(r => r.isCorrect).length,
          accuracy: 50,
          timeSpent: 300
        },
        recommendations: ["Keep practicing!"]
      };
      
      setSessionResults(fallbackResults);
      setShowSessionResults(true);
      return fallbackResults;
    } finally {
      setIsCompletingSession(false);
    }
  };

  // Generate personalized goals based on session performance
  const generateSessionGoals = async (sessionResult) => {
    try {
      console.log('🎯 Generating session-based goals for:', sessionResult.scenarioTitle);
      
      // Get existing goals
      const existingGoals = JSON.parse(localStorage.getItem('socialcue_goals') || '[]');
      
      // Determine what skills to focus on based on performance
      const needsImprovement = sessionResult.finalScore < 70;
      const category = sessionResult.scenarioCategory;
      const scenarioTitle = sessionResult.scenarioTitle;
      
      // Generate 2-3 goals based on session performance
      const newGoals = [];
      
      if (needsImprovement) {
        // Focus on the skill they just practiced
        newGoals.push({
          id: Date.now() + Math.random(),
          title: `Practice More: ${scenarioTitle}`,
          description: `You scored ${sessionResult.finalScore}%. Let's practice this skill more! Try using what you learned in real conversations.`,
          category: category,
          status: "active",
          progress: 0,
          target: 3,
          relatedSessionId: sessionResult.sessionId,
          createdAt: new Date().toISOString(),
          source: "AI - Post Session"
        });
      } else {
        // Celebrate success and suggest next level
        newGoals.push({
          id: Date.now() + Math.random(),
          title: `Great Job on ${scenarioTitle}!`,
          description: `You scored ${sessionResult.finalScore}%! Now try using this skill with someone new today.`,
          category: category,
          status: "active",
          progress: 0,
          target: 1,
          relatedSessionId: sessionResult.sessionId,
          createdAt: new Date().toISOString(),
          source: "AI - Post Session"
        });
      }
      
      // Add related social skill goal
      const relatedGoal = getRelatedGoal(category, sessionResult.gradeLevel);
      if (relatedGoal) {
        newGoals.push({
          ...relatedGoal,
          id: Date.now() + Math.random() + 1,
          createdAt: new Date().toISOString()
        });
      }
      
      // Merge with existing goals (remove old AI-generated ones if too many)
      const activeAIGoals = existingGoals.filter(g => g.source?.includes('AI'));
      if (activeAIGoals.length > 6) {
        // Remove oldest AI goals
        const goalsToKeep = existingGoals.filter(g => !g.source?.includes('AI')).slice(-4);
        const updatedGoals = [...goalsToKeep, ...newGoals];
        localStorage.setItem('socialcue_goals', JSON.stringify(updatedGoals));
        console.log('🎯 Updated goals (removed old AI goals):', updatedGoals.length);
      } else {
        const updatedGoals = [...existingGoals, ...newGoals];
        localStorage.setItem('socialcue_goals', JSON.stringify(updatedGoals));
        console.log('🎯 Added new goals:', newGoals.length);
      }
      
    } catch (error) {
      console.error('Error generating session goals:', error);
    }
  };

  // Helper function for related goals by category
  const getRelatedGoal = (category, gradeLevel) => {
    const goalsByCategory = {
      'Starting Conversations': [
        {
          title: "Ask Open-Ended Questions",
          description: "Instead of yes/no questions, ask 'What do you like about...' or 'How was your...'",
          category: "Communication",
          target: 3
        },
        {
          title: "Share Something About Yourself",
          description: "After asking a question, share a similar experience or interest you have.",
          category: "Making Friends",
          target: 2
        }
      ],
      'Active Listening': [
        {
          title: "Use Body Language",
          description: "Face the person, maintain eye contact, and nod to show you're listening.",
          category: "Communication",
          target: 5
        },
        {
          title: "Ask Follow-Up Questions",
          description: "Show interest by asking more about what they just said.",
          category: "Communication",
          target: 3
        }
      ],
      'Emotional Awareness': [
        {
          title: "Name Your Feelings",
          description: "Practice saying 'I feel ___' when expressing emotions.",
          category: "Emotional Expression",
          target: 3
        },
        {
          title: "Notice Others' Feelings",
          description: "Pay attention to facial expressions and tone of voice to understand how others feel.",
          category: "Empathy",
          target: 4
        }
      ],
      'Making Friends': [
        {
          title: "Invite Someone to Join You",
          description: "Ask a classmate to sit with you at lunch or play together at recess.",
          category: "Social Participation",
          target: 2
        },
        {
          title: "Remember Personal Details",
          description: "Try to remember one thing someone told you and bring it up next time.",
          category: "Building Relationships",
          target: 3
        }
      ],
      'Handling Disagreements': [
        {
          title: "Use 'I' Statements",
          description: "Say 'I feel upset when...' instead of 'You always...'",
          category: "Conflict Resolution",
          target: 3
        },
        {
          title: "Take a Break When Upset",
          description: "Step away and calm down before responding when you feel angry.",
          category: "Self-Regulation",
          target: 2
        }
      ],
      'General': [
        {
          title: "Practice Active Listening",
          description: "Make eye contact and nod when someone is talking to you.",
          category: "Communication",
          target: 3
        },
        {
          title: "Start a Conversation",
          description: "Say hi to someone new and ask them one question about their interests.",
          category: "Making Friends",
          target: 1
        }
      ]
    };
    
    const categoryGoals = goalsByCategory[category] || goalsByCategory['General'];
    const randomGoal = categoryGoals[Math.floor(Math.random() * categoryGoals.length)];
    
    return {
      ...randomGoal,
      status: "active",
      progress: 0,
      source: "AI - Related Skill"
    };
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
      const anyFemale = voices.find(v => v.name.toLowerCase().includes('female'));
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

  useEffect(() => {
    if (autoRead && situation) {
      const context = getContent(situation.context);
      const prompt = getContent(situation.prompt);
      const optionsText = situation.options.map((opt, idx) => {
        const text = getContent(opt.text);
        return `Option ${String.fromCharCode(65 + idx)}: ${text}`;
      }).join('. ');
      const fullText = `${context}. ${prompt}. Here are your options. ${optionsText}`;
      setTimeout(() => speak(fullText), 500);
    }
    return () => stopSpeaking();
  }, [currentSituation, autoRead]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const getContent = (content) => {
    return typeof content === 'object' ? content[gradeRange] : content;
  };

  const handleOptionSelect = async (optionIndex) => {
    if (showFeedback) return;
    
    playSound('click');
    setSelectedOption(optionIndex);
    setShowFeedback(true);
    
    // Use shuffled options instead of original order
    const option = shuffledOptions[optionIndex];
    const startTime = Date.now();
    
    // Get the user's response text
    const userResponse = getContent(option.text);
    
    // Create learner context
    const learnerContext = {
      grade: gradeLevel,
      topicId: sessionId,
      topicName: getContent(scenario.title)
    };
    
    // Evaluate response with AI
    const evaluation = await evaluateResponse(situation, userResponse, learnerContext);
    setAiEvaluation(evaluation);
    
    // Store response data
    const responseData = {
      scenarioId: situation.id,
      scenarioText: getContent(situation.prompt),
      userResponse: userResponse,
      isCorrect: option.isGood,
      responseTime: Date.now() - startTime,
      aiEvaluation: evaluation
    };
    
    setSessionResponses(prev => [...prev, responseData]);
    
    if (option && option.isGood) {
      setTotalPoints(prev => prev + option.points);
      playSound('correct');
      setShowCelebration(true);
    } else {
      playSound('incorrect');
    }
  };

  const handleNext = async () => {
    stopSpeaking();
    playSound('click');
    
    console.log('🔵 handleNext called - currentSituation:', currentSituation);
    console.log('🔵 Total situations:', scenario.situations?.length || 0);
    console.log('🔵 Can advance?', scenario.situations?.length > 0 && currentSituation < scenario.situations.length - 1);
    
    if (scenario.situations?.length > 0 && currentSituation < scenario.situations.length - 1) {
      console.log('🔵 Advancing to next situation:', currentSituation + 1);
      
      // Start transition
      setIsTransitioning(true);
      
      // Fade out current scenario
      setTimeout(() => {
        setCurrentSituation(prev => prev + 1);
        setSelectedOption(null);
        setShowFeedback(false);
        setAiEvaluation(null); // Clear AI evaluation for next question
        
        // Fade in next scenario
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 200);
    } else {
      // Session complete - show celebration and complete session
      playSound('complete');
      showSuccess('🎉 Session completed! Great job!');
      
      // Calculate performance for challenge generation
      const performance = Math.round((totalPoints / (scenario.situations.length * 10)) * 100);
      
      // Generate a real-world challenge
      await generateRealWorldChallenge(scenario.title, performance);
      
      // Update goal progress
      await updateGoalProgress(scenario.title, performance, totalPoints);
      
      // Update local user data with validation
      const userData = getUserData();
      
      // Validate userData structure
      if (!userData || typeof userData !== 'object') {
        console.error('Invalid userData structure:', userData);
        return;
      }
      
      // Ensure required fields exist
      if (typeof userData.totalSessions !== 'number') {
        userData.totalSessions = 0;
      }
      if (typeof userData.confidenceScore !== 'number') {
        userData.confidenceScore = 0;
      }
      
      userData.totalSessions += 1;
      userData.confidenceScore = Math.min(100, userData.confidenceScore + 2);
      
      // Validate data before saving
      try {
        const jsonString = JSON.stringify(userData);
        // Test parsing to ensure it's valid JSON
        JSON.parse(jsonString);
        localStorage.setItem(STORAGE_KEY, jsonString);
        console.log('✅ User data saved successfully');
      } catch (jsonError) {
        console.error('JSON validation failed:', jsonError);
        console.error('Problematic userData:', userData);
        // Don't save invalid data
      }
      
      // Update last practice date in Firebase
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const db = getFirestore();
          const userRef = doc(db, 'users', userId);
          
          // Check if document exists before updating
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            await updateDoc(userRef, {
              lastPracticeDate: new Date().toISOString()
            });
            console.log('✅ Updated last practice date in Firebase');
          } else {
            // Document doesn't exist, create it
            await setDoc(userRef, {
              lastPracticeDate: new Date().toISOString(),
              createdAt: new Date().toISOString()
            });
            console.log('✅ Created user document with last practice date');
          }
        } catch (firebaseError) {
          console.error('Firebase error updating practice date:', firebaseError);
          // Continue without failing the session
        }
      }
      
      // Complete the session and show results
      await completePracticeSession();
      
      // Generate personalized goals based on this session
      await generateSessionGoals({
        sessionId,
        scenarioTitle: getContent(scenario.title),
        scenarioCategory: scenario.category || 'General',
        totalPoints,
        finalScore,
        completedAt: new Date().toISOString(),
        situations: scenario.situations.length,
        gradeLevel
      });
      
      // Set session complete after results are ready
      setSessionComplete(true);
    }
  };

  const handleBack = () => {
    stopSpeaking();
    playSound('click');
    if (currentSituation > 0) {
      setCurrentSituation(prev => prev - 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setAiEvaluation(null); // Clear AI evaluation when going back
    }
  };

  const handleRestart = () => {
    playSound('click');
    setCurrentSituation(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setTotalPoints(0);
    setSessionComplete(false);
  };

  const progressPercentage = scenario.situations?.length > 0 ? ((currentSituation + 1) / scenario.situations.length) * 100 : 0;
  const finalScore = scenario.situations?.length > 0 ? Math.round((totalPoints / (scenario.situations.length * 10)) * 100) : 0;
  const scenarioTitle = getContent(scenario.title);
  const situationContext = getContent(situation?.context || '');
  const situationPrompt = getContent(situation?.prompt || '');

  // Loading state while AI generates scenarios
  if (lessonState === 'loading') {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="fixed inset-0 opacity-20" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6 pb-24">
          <div className="max-w-2xl w-full">
            <div className={`backdrop-blur-xl border rounded-3xl p-8 text-center ${
              darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-lg'
            }`}>
              <div className="mb-6">
                <div className="text-7xl mb-4">🤖</div>
                <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Generating AI Scenarios...
                </h1>
                <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Creating personalized practice scenarios for you
                </p>
              </div>
              
              <div className="flex justify-center mb-6">
                <LoadingSpinner 
                  size="large" 
                  variant="icon" 
                  text="Creating your practice session..." 
                  darkMode={darkMode}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
                <p className={`text-lg font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                  Creating 5 unique scenarios...
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  This usually takes 8-12 seconds
                </p>
                <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  ✨ Each scenario is tailored to your learning level
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sessionComplete && !showSessionResults) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="fixed inset-0 opacity-20" style={{ background: scenario.background }}></div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6 pb-24">
          <div className="max-w-2xl w-full">
            <div className={`backdrop-blur-xl border rounded-3xl p-8 text-center ${
              darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-lg'
            }`}>
              <div className="mb-6">
                <div className="text-7xl mb-4">🎉</div>
                <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Practice Complete!
                </h1>
                <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{scenarioTitle}</p>
              </div>

              {isCompletingSession ? (
                <div className="mb-8">
                  <div className="flex justify-center mb-4">
                    <LoadingSpinner 
                      size="md" 
                      variant="icon" 
                      text="Analyzing your performance..." 
                      darkMode={darkMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className={`text-lg font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                      Calculating your progress...
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Generating personalized feedback
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-8">
                  <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                    {finalScore}%
                  </div>
                  <div className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {totalPoints} out of {scenario.situations.length * 10} points earned
                  </div>
                </div>
              )}

              {/* New Goals Notification */}
              {!isCompletingSession && (
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold text-blue-400">New Goals Added!</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    Check your Goals tab to see personalized recommendations based on this session.
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              {!isCompletingSession && (
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      // Reset and try again
                      setCurrentSituation(0);
                      setSelectedOption(null);
                      setShowFeedback(false);
                      setTotalPoints(0);
                      setSessionComplete(false);
                    }}
                    className={`flex-1 font-bold py-4 px-6 rounded-full border-2 transition-all ${
                      darkMode 
                        ? 'border-white/20 text-white hover:bg-white/10'
                        : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Try Again
                  </button>
                  
                  <button
                    onClick={() => onNavigate('progress')}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-4 px-6 rounded-full hover:shadow-lg transition-all"
                  >
                    View Progress →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Session Results Modal
  if (sessionComplete && showSessionResults && sessionResults) {
    return (
      <SessionResults
        sessionResults={sessionResults}
        scenarioTitle={scenarioTitle}
        finalScore={finalScore}
        darkMode={darkMode}
        onNavigate={onNavigate}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="fixed inset-0 opacity-10" style={{ background: scenario.background }}></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 pb-32">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => onNavigate('home')} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors ${
              darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}>
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{scenarioTitle}</h1>
            <div className="w-32"></div>
          </div>
          
          <div className="mb-2">
            <SmoothProgressBar 
              progress={progressPercentage} 
              duration={800}
              height="h-3"
              darkMode={darkMode}
              className="rounded-full overflow-hidden"
            />
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Situation {currentSituation + 1} of {scenario.situations?.length || 0}
          </div>
        </div>

        <div className={`backdrop-blur-xl border rounded-3xl p-8 mb-6 transition-all duration-300 ${
          isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        } ${darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-lg'}`}>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-24 h-24 rounded-xl flex-shrink-0 shadow-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                  {scenario.icon && React.createElement(scenario.icon, { className: "w-12 h-12 text-white" })}
                </div>
                <div className={`text-sm font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {gradeRange === 'k2' ? 'STORY' : 'SCENARIO'}
                </div>
              </div>
              <button onClick={() => {
                const optionsText = situation.options.map((opt, idx) => {
                  const text = getContent(opt.text);
                  return `Option ${String.fromCharCode(65 + idx)}: ${text}`;
                }).join('. ');
                const fullText = `${situationContext}. ${situationPrompt}. Here are your options. ${optionsText}`;
                toggleSpeech(fullText);
              }} className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
                isSpeaking ? 'bg-emerald-500 text-white' : darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}>
                {isSpeaking ? <><VolumeX className="w-5 h-5" /><span className="text-sm">Stop</span></> : 
                  <><Volume2 className="w-5 h-5" /><span className="text-sm">Read Aloud</span></>}
              </button>
            </div>

            <p className={`text-xl mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{situationContext}</p>
            <div className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{situationPrompt}</div>
          </div>

          <div className="space-y-3">
            {shuffledOptions.map((option, index) => {
              const optionText = getContent(option.text);
              return (
                <button key={index} onClick={() => handleOptionSelect(index)} disabled={showFeedback} className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  selectedOption === index ? (option.isGood ? 'border-emerald-500 bg-emerald-500/10 scale-105 shadow-lg' : 'border-red-500 bg-red-500/10 scale-105 shadow-lg') :
                  darkMode ? 'border-white/20 hover:border-white/40 hover:bg-white/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${showFeedback && selectedOption !== index ? 'opacity-50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedOption === index ? (option.isGood ? 'bg-emerald-500' : 'bg-red-500') : darkMode ? 'bg-white/10' : 'bg-gray-100'
                    }`}>
                      {selectedOption === index ? (option.isGood ? <CheckCircle className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />) : 
                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{String.fromCharCode(65 + index)}</span>}
                    </div>
                    <span className={`flex-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{optionText}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {showFeedback && (
          <div className={`backdrop-blur-xl border rounded-3xl p-6 mb-6 animate-fadeIn ${
            shuffledOptions[selectedOption] && shuffledOptions[selectedOption].isGood ? (darkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200') :
            (darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200')
          }`}>
            <div className="flex items-center justify-end mb-4">
              <button onClick={() => {
                const feedback = getContent(shuffledOptions[selectedOption].feedback);
                const proTip = shuffledOptions[selectedOption].proTip ? getContent(shuffledOptions[selectedOption].proTip) : '';
                const feedbackText = feedback + (proTip ? `. ${proTip}` : '');
                toggleSpeech(feedbackText);
              }} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                isSpeaking ? 'bg-blue-500 text-white' : darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}>
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>Read Feedback</span>
              </button>
            </div>

            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                shuffledOptions[selectedOption] && shuffledOptions[selectedOption].isGood ? 'bg-emerald-500' : 'bg-red-500'
              }`}>
                {shuffledOptions[selectedOption] && shuffledOptions[selectedOption].isGood ? <CheckCircle className="w-6 h-6 text-white" /> : <XCircle className="w-6 h-6 text-white" />}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold mb-2 ${
                  shuffledOptions[selectedOption] && shuffledOptions[selectedOption].isGood ? (darkMode ? 'text-emerald-400' : 'text-emerald-700') : (darkMode ? 'text-red-400' : 'text-red-700')
                }`}>
                  {shuffledOptions[selectedOption] && shuffledOptions[selectedOption].isGood ? 'Great Choice!' : "Let's Learn!"}
                </h3>
                <p className={`mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getContent(shuffledOptions[selectedOption].feedback)}
                </p>
                
                {!(shuffledOptions[selectedOption] && shuffledOptions[selectedOption].isGood) && shuffledOptions[selectedOption] && shuffledOptions[selectedOption].proTip && (
                  <div className={`flex items-start gap-3 p-4 rounded-xl mt-4 ${
                    darkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                      {getContent(shuffledOptions[selectedOption].proTip)}
                    </p>
                  </div>
                )}

                {/* AI Evaluation Feedback */}
                {aiEvaluation && !isEvaluating && (
                  <div className={`flex items-start gap-3 p-4 rounded-xl mt-4 ${
                    darkMode ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'
                  }`}>
                    <div className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5">🤖</div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-2 ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                        AI Feedback (Score: {Math.round(aiEvaluation.score * 100)}%)
                      </h4>
                      <p className={`text-sm mb-2 ${darkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                        {aiEvaluation.personalizedFeedback}
                      </p>
                      {aiEvaluation.strengths && aiEvaluation.strengths.length > 0 && (
                        <div className="mb-2">
                          <span className={`text-xs font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                            Strengths: 
                          </span>
                          <span className={`text-xs ml-1 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                            {aiEvaluation.strengths.join(', ')}
                          </span>
                        </div>
                      )}
                      {aiEvaluation.areasForImprovement && aiEvaluation.areasForImprovement.length > 0 && (
                        <div>
                          <span className={`text-xs font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                            Areas to improve: 
                          </span>
                          <span className={`text-xs ml-1 ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                            {aiEvaluation.areasForImprovement.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Loading indicator for AI evaluation */}
                {isEvaluating && (
                  <div className={`flex items-center gap-3 p-4 rounded-xl mt-4 ${
                    darkMode ? 'bg-gray-500/10 border border-gray-500/30' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="w-5 h-5 text-gray-500 flex-shrink-0">🤖</div>
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        AI is analyzing your response...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showFeedback && (
          <div className="flex gap-4 mb-6">
            {currentSituation > 0 && (
              <button onClick={handleBack} className={`flex-1 font-bold py-4 px-6 rounded-full border-2 transition-all flex items-center justify-center gap-2 ${
                darkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
              }`}>
                <ArrowLeft className="w-5 h-5" />
                Previous
              </button>
            )}
            <Button 
              onClick={handleNext} 
              variant="primary"
              size="lg"
              className={`${currentSituation > 0 ? 'flex-1' : 'w-full'} bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white font-bold py-4 px-6 rounded-full hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2`}
              darkMode={darkMode}
            >
              {scenario.situations?.length > 0 && currentSituation < scenario.situations.length - 1 ? 'Next Situation' : 'Complete'}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}

        <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="text-sm font-semibold">Score</div>
            <button onClick={() => setAutoRead(!autoRead)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              autoRead ? (darkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border border-emerald-300') :
              (darkMode ? 'bg-white/5 text-gray-400 border border-white/10' : 'bg-gray-100 text-gray-600 border border-gray-200')
            }`}>
              {autoRead ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              Auto-Read {autoRead ? 'On' : 'Off'}
            </button>
          </div>
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            {totalPoints} points
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
      
      {/* Celebration Animation */}
      {showCelebration && (
        <SuccessAnimation 
          points={situation.options[selectedOption]?.points || 10}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
}

export default PracticeSession;