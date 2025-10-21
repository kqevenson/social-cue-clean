import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    role: '',
    name: '',
    gradeLevel: '',
    email: '',
    password: ''
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [step]);

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
    if (roleId === 'learner') {
      setStep(2);
    } else {
      setStep(3);
    }
  };

  const handleGradeSelect = (gradeId) => {
    setUserData({ ...userData, gradeLevel: gradeId });
    setStep(3);
  };

  const handleNameSubmit = () => {
    if (userData.name.trim()) {
      setStep(4);
    }
  };

  const handleSignUp = () => {
    if (userData.email.trim() && userData.password.trim()) {
      const finalData = { 
        ...userData, 
        gradeLevel: userData.gradeLevel || 'adult',
        accountType: 'registered'
      };
      onComplete(finalData);
    }
  };

  const handleGuestContinue = () => {
    const finalData = { 
      ...userData, 
      gradeLevel: userData.gradeLevel || 'adult',
      accountType: 'guest'
    };
    onComplete(finalData);
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
          {[1, 2, 3, 4].map((num) => (
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
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-lg mb-6"
                autoFocus
              />

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

          {/* Step 4: Sign Up or Guest */}
          {step === 4 && (
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
                disabled={!userData.email.trim() || !userData.password.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
              >
                Create Account
                <ArrowRight className="w-5 h-5" />
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
                className="w-full bg-white/5 border border-white/10 text-white font-semibold py-4 px-6 rounded-xl hover:bg-white/10 transition-all"
              >
                Continue as Guest
              </button>

              <button
                onClick={() => setStep(3)}
                className="mt-6 text-gray-400 hover:text-white transition-colors"
              >
                ← Back
              </button>

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
    </div>
  );
}

export default OnboardingScreen;