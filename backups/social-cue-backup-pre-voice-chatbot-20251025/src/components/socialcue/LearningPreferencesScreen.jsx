import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Clock, MessageCircle, Target, Calendar, CheckCircle, Star } from 'lucide-react';
import { getUserData } from './utils/storage';

const LearningPreferencesScreen = ({ darkMode, onNavigate, gradeLevel }) => {
  const [preferences, setPreferences] = useState({
    learningPace: 'self-paced',
    feedbackStyle: 'encouraging',
    challengeLevel: 'moderate',
    practiceFrequency: 'few-times-week'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const currentUserData = getUserData();
      setUserData(currentUserData);
      
      const userId = currentUserData.userId || 'guest_' + Date.now();
      
      const response = await fetch(`http://localhost:3001/api/adaptive/preferences/${userId}`);
      const data = await response.json();
      
      if (data.success && data.preferences) {
        setPreferences({
          learningPace: data.preferences.learningPace || 'self-paced',
          feedbackStyle: data.preferences.feedbackStyle || 'encouraging',
          challengeLevel: data.preferences.challengeLevel || 'moderate',
          practiceFrequency: data.preferences.practiceFrequency || 'few-times-week'
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const userId = userData.userId || 'guest_' + Date.now();
      
      const response = await fetch(`http://localhost:3001/api/adaptive/preferences/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Preferences saved successfully! ✅');
      } else {
        alert('Error saving preferences. Please try again.');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getRecommendation = (option, category) => {
    const grade = parseInt(gradeLevel) || 5;
    
    if (category === 'learningPace') {
      if (grade <= 3 && option === 'self-paced') return 'Recommended for younger learners';
      if (grade >= 6 && option === 'accelerated') return 'Recommended for older learners';
    }
    
    if (category === 'challengeLevel') {
      if (grade <= 3 && option === 'gradual') return 'Recommended for younger learners';
      if (grade >= 6 && option === 'aggressive') return 'Recommended for older learners';
    }
    
    if (category === 'practiceFrequency') {
      if (grade <= 3 && option === 'daily') return 'Recommended for younger learners';
      if (grade >= 6 && option === 'few-times-week') return 'Recommended for older learners';
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-3 relative">
              <div className="absolute inset-0 border-2 border-purple-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading preferences...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="pb-24 px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => onNavigate('settings')}
            className={`p-2 rounded-xl transition-all ${
              darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Learning Preferences
          </h1>
        </div>

        {/* Learning Pace Section */}
        <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
          darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Clock className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Learning Pace
            </h2>
          </div>
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Choose how quickly you want to progress through lessons
          </p>
          
          <div className="space-y-3">
            {[
              { value: 'self-paced', label: 'Self-Paced', description: 'Progress at your own speed' },
              { value: 'guided', label: 'Guided', description: 'Balanced progression with guidance' },
              { value: 'accelerated', label: 'Accelerated', description: 'Rapid advancement when ready' }
            ].map((option) => {
              const isSelected = preferences.learningPace === option.value;
              const recommendation = getRecommendation(option.value, 'learningPace');
              
              return (
                <div
                  key={option.value}
                  onClick={() => updatePreference('learningPace', option.value)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? darkMode
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-blue-500 bg-blue-50'
                      : darkMode
                      ? 'border-white/20 hover:border-white/40'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {option.label}
                        </h3>
                        {recommendation && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Style Section */}
        <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
          darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Feedback Style
            </h2>
          </div>
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Choose how you prefer to receive feedback on your responses
          </p>
          
          <div className="space-y-3">
            {[
              { 
                value: 'encouraging', 
                label: 'Encouraging', 
                description: 'Lots of positive reinforcement and support',
                example: '"Great job! You\'re really improving!"'
              },
              { 
                value: 'direct', 
                label: 'Direct', 
                description: 'Straightforward, matter-of-fact feedback',
                example: '"That\'s correct. Good answer."'
              },
              { 
                value: 'detailed', 
                label: 'Detailed', 
                description: 'Comprehensive explanations and insights',
                example: '"Excellent! This shows you understand..."'
              }
            ].map((option) => {
              const isSelected = preferences.feedbackStyle === option.value;
              
              return (
                <div
                  key={option.value}
                  onClick={() => updatePreference('feedbackStyle', option.value)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? darkMode
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-green-500 bg-green-50'
                      : darkMode
                      ? 'border-white/20 hover:border-white/40'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {option.label}
                    </h3>
                    {isSelected && (
                      <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                    )}
                  </div>
                  <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {option.description}
                  </p>
                  <p className={`text-xs italic ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Example: {option.example}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Challenge Level Section */}
        <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
          darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Target className={`w-6 h-6 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Challenge Level
            </h2>
          </div>
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Choose how quickly difficulty increases
          </p>
          
          <div className="space-y-3">
            {[
              { value: 'gradual', label: 'Gradual', description: 'Slow difficulty increases' },
              { value: 'moderate', label: 'Moderate', description: 'Balanced progression (recommended)' },
              { value: 'aggressive', label: 'Aggressive', description: 'Rapid advancement when ready' }
            ].map((option) => {
              const isSelected = preferences.challengeLevel === option.value;
              const recommendation = getRecommendation(option.value, 'challengeLevel');
              
              return (
                <div
                  key={option.value}
                  onClick={() => updatePreference('challengeLevel', option.value)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? darkMode
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-orange-500 bg-orange-50'
                      : darkMode
                      ? 'border-white/20 hover:border-white/40'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {option.label}
                        </h3>
                        {recommendation && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Practice Frequency Section */}
        <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
          darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Calendar className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Practice Frequency Goal
            </h2>
          </div>
          <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            How often would you like to practice?
          </p>
          
          <div className="space-y-3">
            {[
              { value: 'daily', label: 'Daily', description: 'Practice every day' },
              { value: 'few-times-week', label: 'Few Times Per Week', description: 'Practice 2-3 times per week' },
              { value: 'weekly', label: 'Weekly', description: 'Practice once per week' }
            ].map((option) => {
              const isSelected = preferences.practiceFrequency === option.value;
              const recommendation = getRecommendation(option.value, 'practiceFrequency');
              
              return (
                <div
                  key={option.value}
                  onClick={() => updatePreference('practiceFrequency', option.value)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? darkMode
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-purple-500 bg-purple-50'
                      : darkMode
                      ? 'border-white/20 hover:border-white/40'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {option.label}
                        </h3>
                        {recommendation && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={() => onNavigate('settings')}
            className={`flex-1 font-bold py-4 px-6 rounded-full border-2 transition-all ${
              darkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={savePreferences}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-4 px-6 rounded-full hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningPreferencesScreen;