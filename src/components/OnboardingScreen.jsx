import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle, Target, Clock, Heart, Zap } from 'lucide-react';
import ErrorToast from './ErrorToast';
import QuickTutorialModal from './socialcue/QuickTutorialModal';

function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    role: '',
    name: '',
    gradeLevel: '',
    email: '',
    password: ''
  });
  const [onboardingAnswers, setOnboardingAnswers] = useState({
    learningGoal: '',
    practiceFrequency: '',
    pace: '',
    feedbackStyle: '',
    challengeLevel: ''
  });
  const [isVisible, setIsVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [childUserId, setChildUserId] = useState('');
  const [childConnectionError, setChildConnectionError] = useState('');
  const [verifyingChild, setVerifyingChild] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [step]);

  // Validation functions
  const validateName = (name) => {
    if (!name || name.trim().length === 0) {
      return "Please enter your name";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    if (name.trim().length > 50) {
      return "Name must be less than 50 characters";
    }
    return null;
  };

  const validateEmail = (email) => {
    if (!email || email.trim().length === 0) {
      return "Please enter your email";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  };

  const validateGradeLevel = (gradeLevel) => {
    if (!gradeLevel) {
      return "Please select your grade level";
    }
    return null;
  };

  const validateRole = (role) => {
    if (!role) {
      return "Please select your role";
    }
    return null;
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    switch (stepNumber) {
      case 1:
        const roleError = validateRole(userData.role);
        if (roleError) newErrors.role = roleError;
        break;
      case 2:
        const nameError = validateName(userData.name);
        if (nameError) newErrors.name = nameError;
        break;
      case 3:
        const gradeError = validateGradeLevel(userData.gradeLevel);
        if (gradeError) newErrors.gradeLevel = gradeError;
        break;
      case 4:
        const emailError = validateEmail(userData.email);
        if (emailError) newErrors.email = emailError;
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const roles = [
    { 
      id: 'learner', 
      label: 'Learner', 
      description: 'I want to practice social skills'
    },
    { 
      id: 'parent', 
      label: 'Parent/Guardian', 
      description: 'I\'m here to support my learner'
    },
    { 
      id: 'teacher', 
      label: 'Teacher', 
      description: 'I want to help my learners'
    }
  ];

  const gradeLevels = [
    { id: 'k', label: 'Kindergarten' },
    { id: '1', label: '1st Grade' },
    { id: '2', label: '2nd Grade' },
    { id: '3', label: '3rd Grade' },
    { id: '4', label: '4th Grade' },
    { id: '5', label: '5th Grade' },
    { id: '6', label: '6th Grade' },
    { id: '7', label: '7th Grade' },
    { id: '8', label: '8th Grade' },
    { id: '9', label: '9th Grade' },
    { id: '10', label: '10th Grade' },
    { id: '11', label: '11th Grade' },
    { id: '12', label: '12th Grade' }
  ];

  const handleRoleSelect = (roleId) => {
    setUserData({ ...userData, role: roleId });
    setErrors({}); // Clear any previous errors
    
    if (roleId === 'learner') {
      setStep(2);
    } else {
      // Parents skip grade selection and go directly to name
      setStep(3);
    }
  };

  const handleGradeSelect = (gradeId) => {
    setUserData({ ...userData, gradeLevel: gradeId });
    setErrors({}); // Clear any previous errors
    setStep(3);
  };

  const handleNameSubmit = () => {
    if (validateStep(2)) {
      if (userData.role === 'learner') {
        setStep(4); // Go to learning goal for learners
      } else {
        setStep(4); // Go to child connection for parents
      }
    } else {
      setErrorMessage('Please fix the errors above');
      setShowErrorToast(true);
    }
  };

  const handleChildConnection = async () => {
    if (!childUserId.trim()) {
      setChildConnectionError('Please enter a User ID');
      return;
    }

    setVerifyingChild(true);
    setChildConnectionError('');

    try {
      // For demo purposes, accept any user ID
      // In production, you would verify against Firebase
      if (childUserId.length < 3) {
        setChildConnectionError('Please enter a valid User ID');
        setVerifyingChild(false);
        return;
      }

      // Success - store child ID and proceed to sign up
      setUserData({ ...userData, childId: childUserId });
      setStep(7); // Go to sign up step
      
    } catch (error) {
      console.error('Error verifying child:', error);
      setChildConnectionError('Something went wrong. Please try again.');
      setVerifyingChild(false);
    }
  };

  const handleSignUp = async () => {
    if (validateStep(4)) {
      setIsInitializing(true);
      try {
        const userId = `user_${Date.now()}`;
        const finalData = { 
          ...userData, 
          gradeLevel: userData.gradeLevel || 'adult',
          accountType: 'registered',
          userId: userId
        };

        // Initialize adaptive learning system
        await initializeAdaptiveLearning(userId, finalData, onboardingAnswers);
        
        onComplete(finalData);
      } catch (error) {
        console.error('Error completing signup:', error);
        setErrorMessage('Failed to complete signup. Please try again.');
        setShowErrorToast(true);
      } finally {
        setIsInitializing(false);
      }
    } else {
      setErrorMessage('Please fix the errors above');
      setShowErrorToast(true);
    }
  };

  const handleGuestContinue = async () => {
    setIsInitializing(true);
    try {
      const userId = `guest_${Date.now()}`;
      const finalData = { 
        ...userData, 
        gradeLevel: userData.gradeLevel || 'adult',
        accountType: 'guest',
        userId: userId
      };

      // Initialize adaptive learning system for guest users too
      await initializeAdaptiveLearning(userId, finalData, onboardingAnswers);
      
      onComplete(finalData);
    } catch (error) {
      console.error('Error completing guest signup:', error);
      setErrorMessage('Failed to complete setup. Please try again.');
      setShowErrorToast(true);
    } finally {
      setIsInitializing(false);
    }
  };

  const initializeAdaptiveLearning = async (userId, userData, answers) => {
    try {
      console.log('🚀 Initializing adaptive learning for user:', userId);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('http://localhost:3001/api/adaptive/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          userData: {
            name: userData.name,
            gradeLevel: userData.gradeLevel
          },
          onboardingAnswers: answers
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to initialize adaptive learning');
      }

      const result = await response.json();
      console.log('✅ Adaptive learning initialized:', result);
      
      // Store user ID for future use
      localStorage.setItem('userId', userId);
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('⚠️ Adaptive learning initialization timed out - continuing anyway');
      } else {
        console.error('❌ Error initializing adaptive learning:', error);
      }
      // Don't throw error - let user continue even if initialization fails
      // Store user ID locally so app can still function
      localStorage.setItem('userId', userId);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
      </div>

      <div 
        className="max-w-2xl w-full relative z-10"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.4s ease-out'
        }}
      >
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div 
              key={num}
              className={`h-2 rounded-full transition-all duration-300 ${
                step >= num ? 'w-12 bg-gradient-to-r from-blue-500 to-emerald-400' : 'w-8 bg-white/20'
              }`}
            />
          ))}
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12">
          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-xl font-bold mb-6">Welcome to</h2>
                
                {/* Wordmark - Copied from Landing Page */}
                <div className="flex items-end justify-center mb-8" style={{letterSpacing: '-2px'}}>
                  <span className="font-extrabold text-5xl text-white">Social</span>
                  <span className="font-extrabold text-5xl text-white" style={{marginRight: '6px'}}>C</span>
                  <div className="flex flex-col items-center justify-end" style={{marginBottom: '7px', height: '62px', gap: '10px'}}>
                    <div className="flex smile-eyes" style={{gap: '16px'}}>
                      <div className="rounded-full" style={{width: '7px', height: '7px', background: '#4A90E2'}}></div>
                      <div className="rounded-full" style={{width: '7px', height: '7px', background: '#4A90E2'}}></div>
                    </div>
                    <div className="smile-mouth" style={{
                      width: '35px',
                      height: '22px',
                      borderLeft: '5px solid #34D399',
                      borderRight: '5px solid #34D399',
                      borderBottom: '5px solid #34D399',
                      borderTop: 'none',
                      borderRadius: '0 0 17px 17px'
                    }}></div>
                  </div>
                  <span className="font-extrabold text-5xl text-white" style={{marginLeft: '6px'}}>e</span>
                </div>
                
                <h2 className="text-xl font-bold mb-6">Who are you?</h2>
              </div>

              <div className="space-y-4">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-bold mb-1">{role.label}</div>
                        <div className="text-gray-400 text-sm">{role.description}</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Grade Level (for learners only) */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">What grade are you in?</h2>
                <p className="text-gray-400 text-lg">This helps us personalize your experience</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {gradeLevels.map((grade) => (
                  <button
                    key={grade.id}
                    onClick={() => handleGradeSelect(grade.id)}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all font-semibold"
                  >
                    {grade.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="mt-6 text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 3: Name */}
          {step === 3 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">What's your name?</h2>
                <p className="text-gray-400 text-lg">We'll use this to personalize your experience</p>
              </div>

              <input
                type="text"
                placeholder="Enter your name"
                value={userData.name}
                onChange={(e) => {
                  setUserData({ ...userData, name: e.target.value });
                  if (errors.name) {
                    setErrors({ ...errors, name: null });
                  }
                }}
                className={`w-full px-6 py-4 bg-black/40 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-colors text-lg mb-2 ${
                  errors.name ? 'border-red-500 focus:border-red-500' : 'border-white/20 focus:border-blue-500'
                }`}
                autoFocus
              />
              
              {errors.name && (
                <div className="text-red-400 text-sm mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </div>
              )}

              <button
                onClick={handleNameSubmit}
                disabled={!userData.name.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setStep(userData.role === 'learner' ? 2 : 1)}
                className="mt-4 text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 4: Learning Goal */}
          {step === 4 && (
            userData.role === 'parent' ? (
              // Parent: Child Connection Step
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-3">Connect to Your Child</h2>
                  <p className="text-gray-400 text-lg">Enter your child's User ID to view their progress</p>
                </div>

                <div className="backdrop-blur-xl border rounded-2xl p-6 bg-white/5 border-white/20">
                  <label className="block text-sm font-bold mb-2 text-gray-300">
                    Child's User ID
                  </label>
                  <input
                    type="text"
                    value={childUserId}
                    onChange={(e) => setChildUserId(e.target.value)}
                    placeholder="test-user-123"
                    className="w-full px-4 py-3 rounded-xl border border-white/20 bg-black/40 text-white focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs mt-2 text-gray-500">
                    Your child can find their User ID in Settings → Account Info
                  </p>

                  {childConnectionError && (
                    <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
                      {childConnectionError}
                    </div>
                  )}

                  <button
                    onClick={handleChildConnection}
                    disabled={verifyingChild}
                    className={`w-full mt-6 bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-4 px-6 rounded-xl transition-all ${
                      verifyingChild ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                    }`}
                  >
                    {verifyingChild ? 'Verifying...' : 'Connect & Continue'}
                  </button>
                </div>

                <button
                  onClick={() => setStep(3)}
                  className="mt-6 text-gray-400 hover:text-white transition-colors"
                >
                  ← Back
                </button>
              </div>
            ) : (
              // Learner: Learning Goal Step
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-3">What's your learning goal?</h2>
                  <p className="text-gray-400 text-lg">This helps us personalize your experience</p>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'make-friends', label: 'Make New Friends', description: 'Learn to start conversations and build friendships' },
                    { id: 'confidence', label: 'Build Confidence', description: 'Feel more comfortable in social situations' },
                    { id: 'communication', label: 'Better Communication', description: 'Express yourself clearly and listen well' },
                    { id: 'teamwork', label: 'Teamwork Skills', description: 'Work better with others in groups' }
                  ].map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => {
                        setOnboardingAnswers({ ...onboardingAnswers, learningGoal: goal.id });
                        setStep(5);
                      }}
                      className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xl font-bold mb-1">{goal.label}</div>
                          <div className="text-gray-400 text-sm">{goal.description}</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setStep(3)}
                  className="mt-6 text-gray-400 hover:text-white transition-colors"
                >
                  ← Back
                </button>
              </div>
            )
          )}

          {/* Step 5: Practice Frequency */}
          {step === 5 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">How often do you want to practice?</h2>
                <p className="text-gray-400 text-lg">We'll remind you based on your preference</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'daily', label: 'Daily', description: 'Practice every day for quick progress', icon: <Clock className="w-6 h-6" /> },
                  { id: 'few-times-week', label: 'Few Times a Week', description: 'Practice 3-4 times per week', icon: <Target className="w-6 h-6" /> },
                  { id: 'weekly', label: 'Weekly', description: 'Practice once per week', icon: <Heart className="w-6 h-6" /> }
                ].map((freq) => (
                  <button
                    key={freq.id}
                    onClick={() => {
                      setOnboardingAnswers({ ...onboardingAnswers, practiceFrequency: freq.id });
                      setStep(6);
                    }}
                    className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-emerald-400">{freq.icon}</div>
                        <div>
                          <div className="text-xl font-bold mb-1">{freq.label}</div>
                          <div className="text-gray-400 text-sm">{freq.description}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(4)}
                className="mt-6 text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 6: Learning Pace */}
          {step === 6 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Do you prefer gentle guidance or quick challenges?</h2>
                <p className="text-gray-400 text-lg">This sets your learning pace</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'self-paced', label: 'Gentle Guidance', description: 'Take your time, build confidence slowly', icon: <Heart className="w-6 h-6" /> },
                  { id: 'guided', label: 'Balanced Approach', description: 'Steady progress with support', icon: <Target className="w-6 h-6" /> },
                  { id: 'accelerated', label: 'Quick Challenges', description: 'Fast-paced, push yourself hard', icon: <Zap className="w-6 h-6" /> }
                ].map((pace) => (
                  <button
                    key={pace.id}
                    onClick={() => {
                      setOnboardingAnswers({ ...onboardingAnswers, pace: pace.id });
                      setStep(7);
                    }}
                    className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-purple-400">{pace.icon}</div>
                        <div>
                          <div className="text-xl font-bold mb-1">{pace.label}</div>
                          <div className="text-gray-400 text-sm">{pace.description}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(5)}
                className="mt-6 text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 7: Sign Up or Guest */}
          {step === 7 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">Almost there, {userData.name}!</h2>
                <p className="text-gray-400 text-lg">Create an account to save your progress</p>
              </div>

              <div className="space-y-4 mb-6">
                <input
                  type="email"
                  placeholder="Email address"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />

                <input
                  type="password"
                  placeholder="Create password"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                onClick={handleSignUp}
                disabled={!userData.email.trim() || !userData.password.trim() || isInitializing}
                className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
              >
                {isInitializing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Setting up your learning...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black/40 text-gray-400">or</span>
                </div>
              </div>

              <button
                onClick={handleGuestContinue}
                disabled={isInitializing}
                className="w-full bg-white/5 border border-white/10 text-white font-semibold py-4 px-6 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isInitializing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Setting up your learning...
                  </>
                ) : (
                  'Continue as Guest'
                )}
              </button>

              <button
                onClick={() => setStep(userData.role === 'learner' ? 6 : 3)}
                className="mt-6 text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </button>

              {userData.role === 'learner' && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowTutorial(true)}
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    Take a quick tour of how adaptive learning works
                  </button>
                </div>
              )}

              <p className="text-center text-gray-500 text-xs mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes smileWiggle {
          0%, 100% { 
            transform: translateY(0) scaleY(1);
          }
          50% { 
            transform: translateY(-2px) scaleY(1.1);
          }
        }
        
        @keyframes eyeBlink {
          0%, 90%, 100% { 
            transform: scaleY(1);
          }
          95% { 
            transform: scaleY(0.1);
          }
        }
        .smile-mouth {
          animation: smileWiggle 3s ease-in-out infinite;
          transform-origin: top center;
        }
        
        .smile-eyes > div {
          animation: eyeBlink 6s ease-in-out infinite;
        }
        
        .smile-eyes > div:nth-child(2) {
          animation-delay: 0.15s;
        }
      `}</style>
      
      {/* Error Toast */}
      {showErrorToast && (
        <ErrorToast
          message={errorMessage}
          type="error"
          onClose={() => setShowErrorToast(false)}
          duration={4000}
        />
      )}

      <QuickTutorialModal 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        darkMode={true}
      />
    </div>
  );
}

export default OnboardingScreen;