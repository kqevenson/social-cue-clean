import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Settings, Clock, MessageCircle, Target, Calendar, Star, CheckCircle, Info, Zap, GraduationCap, Heart, Lightbulb } from 'lucide-react';
import { getUserData } from './utils/storage';

const LearningPreferencesScreen = ({ onNavigate, darkMode }) => {
  const [preferences, setPreferences] = useState({
    learningPace: 'self-paced',
    feedbackStyle: 'encouraging',
    challengeLevel: 'moderate',
    practiceFrequency: 'few-times-week'
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = getUserData();
    setUserData(user);
    
    // Load saved preferences from localStorage
    const savedPrefs = localStorage.getItem('learningPreferences');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  const learningPaceOptions = [
    {
      id: 'self-paced',
      label: 'Self-Paced',
      description: 'Learn at your own speed',
      icon: <Clock className="w-5 h-5" />,
      color: 'blue',
      details: 'Take your time with each concept. Perfect for building confidence and understanding.',
      recommended: userData?.gradeLevel === 'k2' || userData?.gradeLevel === '3-5'
    },
    {
      id: 'guided',
      label: 'Guided',
      description: 'Moderate progression with support',
      icon: <GraduationCap className="w-5 h-5" />,
      color: 'purple',
      details: 'Balanced learning with gentle nudges forward. Great for steady progress.',
      recommended: userData?.gradeLevel === '6-8'
    },
    {
      id: 'accelerated',
      label: 'Accelerated',
      description: 'Fast advancement when ready',
      icon: <Zap className="w-5 h-5" />,
      color: 'orange',
      details: 'Move quickly through concepts when you master them. For confident learners.',
      recommended: userData?.gradeLevel === '9-12'
    }
  ];

  const feedbackStyleOptions = [
    {
      id: 'encouraging',
      label: 'Encouraging',
      description: 'Lots of positive reinforcement',
      icon: <Heart className="w-5 h-5" />,
      color: 'pink',
      details: 'Focus on what you did well with gentle guidance for improvement.',
      recommended: userData?.gradeLevel === 'k2' || userData?.gradeLevel === '3-5'
    },
    {
      id: 'direct',
      label: 'Direct',
      description: 'Straightforward, matter-of-fact',
      icon: <Target className="w-5 h-5" />,
      color: 'blue',
      details: 'Clear, honest feedback without extra fluff. Gets straight to the point.',
      recommended: userData?.gradeLevel === '6-8' || userData?.gradeLevel === '9-12'
    },
    {
      id: 'detailed',
      label: 'Detailed',
      description: 'Comprehensive explanations',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'yellow',
      details: 'In-depth explanations of why answers are right or wrong with learning tips.',
      recommended: userData?.gradeLevel === '9-12'
    }
  ];

  const challengeLevelOptions = [
    {
      id: 'gradual',
      label: 'Gradual',
      description: 'Slow difficulty increases',
      icon: <Clock className="w-5 h-5" />,
      color: 'green',
      details: 'Take small steps up in difficulty. Build confidence with steady progress.',
      recommended: userData?.gradeLevel === 'k2' || userData?.gradeLevel === '3-5'
    },
    {
      id: 'moderate',
      label: 'Moderate',
      description: 'Balanced progression',
      icon: <Target className="w-5 h-5" />,
      color: 'blue',
      details: 'Challenge yourself appropriately. Good balance of comfort and growth.',
      recommended: true // Default recommendation
    },
    {
      id: 'aggressive',
      label: 'Aggressive',
      description: 'Rapid advancement when ready',
      icon: <Zap className="w-5 h-5" />,
      color: 'red',
      details: 'Push yourself hard when you master concepts. For ambitious learners.',
      recommended: userData?.gradeLevel === '9-12'
    }
  ];

  const practiceFrequencyOptions = [
    {
      id: 'daily',
      label: 'Daily',
      description: 'Practice every day',
      icon: <Calendar className="w-5 h-5" />,
      color: 'green',
      details: 'Build strong habits with daily practice. Best for rapid skill development.',
      recommended: userData?.gradeLevel === 'k2' || userData?.gradeLevel === '3-5'
    },
    {
      id: 'few-times-week',
      label: 'Few Times a Week',
      description: 'Practice 3-4 times per week',
      icon: <Clock className="w-5 h-5" />,
      color: 'blue',
      details: 'Balanced approach. Good for steady progress without overwhelming.',
      recommended: userData?.gradeLevel === '6-8'
    },
    {
      id: 'weekly',
      label: 'Weekly',
      description: 'Practice once per week',
      icon: <Calendar className="w-5 h-5" />,
      color: 'purple',
      details: 'Gentle pace. Perfect for busy schedules or casual learning.',
      recommended: userData?.gradeLevel === '9-12'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: darkMode ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600',
      purple: darkMode ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-600',
      orange: darkMode ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' : 'bg-orange-50 border-orange-200 text-orange-600',
      pink: darkMode ? 'bg-pink-500/20 border-pink-500/30 text-pink-400' : 'bg-pink-50 border-pink-200 text-pink-600',
      yellow: darkMode ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-600',
      green: darkMode ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-green-50 border-green-200 text-green-600',
      red: darkMode ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
    };
    return colorMap[color] || colorMap.blue;
  };

  const handlePreferenceChange = (category, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      // Save to localStorage first
      localStorage.setItem('learningPreferences', JSON.stringify(preferences));
      
      // Save to backend API
      const userId = localStorage.getItem('userId') || 'guest_' + Date.now();
      const response = await fetch(`http://localhost:3001/api/adaptive/preferences/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      
      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const renderOptionCard = (option, category, isSelected) => (
    <div
      key={option.id}
      onClick={() => handlePreferenceChange(category, option.id)}
      className={`cursor-pointer transition-all duration-200 ${
        isSelected 
          ? `${getColorClasses(option.color)} border-2` 
          : `${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'} border`
      } rounded-xl p-4 relative`}
    >
      {option.recommended && (
        <div className="absolute -top-2 -right-2">
          <div className={`${darkMode ? 'bg-green-500' : 'bg-green-500'} text-white text-xs px-2 py-1 rounded-full flex items-center gap-1`}>
            <Star className="w-3 h-3" />
            Recommended
          </div>
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className={`${getColorClasses(option.color)} p-2 rounded-lg`}>
          {option.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {option.label}
            </h3>
            {isSelected && <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
            {option.description}
          </p>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            {option.details}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="p-6 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => onNavigate('home')}
              className={`p-2 rounded-full transition-all ${
                darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-white/10' : 'bg-white'} border ${darkMode ? 'border-white/20' : 'border-gray-200'}`}>
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Learning Preferences
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Customize your learning experience
                </p>
              </div>
            </div>
          </div>

          {/* Save Status */}
          {saveStatus && (
            <div className={`mb-6 p-4 rounded-xl ${
              saveStatus === 'success' 
                ? `${darkMode ? 'bg-green-500/20 border-green-500/30' : 'bg-green-50 border-green-200'} border`
                : `${darkMode ? 'bg-red-500/20 border-red-500/30' : 'bg-red-50 border-red-200'} border`
            }`}>
              <div className="flex items-center gap-2">
                {saveStatus === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Info className="w-5 h-5 text-red-500" />
                )}
                <span className={`font-semibold ${
                  saveStatus === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {saveStatus === 'success' ? 'Preferences saved successfully!' : 'Failed to save preferences. Using local storage.'}
                </span>
              </div>
            </div>
          )}

          {/* Learning Pace */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-500" />
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Learning Pace
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {learningPaceOptions.map(option => 
                renderOptionCard(option, 'learningPace', preferences.learningPace === option.id)
              )}
            </div>
          </div>

          {/* Feedback Style */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-purple-500" />
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Feedback Style
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {feedbackStyleOptions.map(option => 
                renderOptionCard(option, 'feedbackStyle', preferences.feedbackStyle === option.id)
              )}
            </div>
          </div>

          {/* Challenge Level */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-orange-500" />
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Challenge Level
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {challengeLevelOptions.map(option => 
                renderOptionCard(option, 'challengeLevel', preferences.challengeLevel === option.id)
              )}
            </div>
          </div>

          {/* Practice Frequency */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-green-500" />
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Practice Frequency Goal
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {practiceFrequencyOptions.map(option => 
                renderOptionCard(option, 'practiceFrequency', preferences.practiceFrequency === option.id)
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-3 ${
                isSaving
                  ? `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-300 text-gray-500'} cursor-not-allowed`
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/50'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Preferences
                </>
              )}
            </button>
          </div>

          {/* Preview Section */}
          <div className={`mt-12 p-6 rounded-xl border ${
            darkMode ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              How Your Preferences Will Affect Your Learning
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Learning Pace:</strong> {learningPaceOptions.find(opt => opt.id === preferences.learningPace)?.details}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Feedback Style:</strong> {feedbackStyleOptions.find(opt => opt.id === preferences.feedbackStyle)?.details}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Challenge Level:</strong> {challengeLevelOptions.find(opt => opt.id === preferences.challengeLevel)?.details}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Practice Frequency:</strong> {practiceFrequencyOptions.find(opt => opt.id === preferences.practiceFrequency)?.details}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPreferencesScreen;
