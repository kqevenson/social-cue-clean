import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import OnboardingScreen from './components/OnboardingScreen';
import SocialCueApp from './components/SocialCueApp';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [appState, setAppState] = useState('landing');
  const [userData, setUserData] = useState(null);

  // Check if user has already completed onboarding
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('socialCueUserData');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.userName && parsed.gradeLevel) {
          setUserData(parsed);
          setAppState('app');
        }
      }
    } catch (error) {
      console.error('Error loading stored user data:', error);
      // Clear corrupted data
      try {
        localStorage.removeItem('socialCueUserData');
      } catch (clearError) {
        console.error('Error clearing corrupted data:', clearError);
      }
    }
  }, []);

  const handleGetStarted = () => {
    setAppState('onboarding');
  };

  const handleOnboardingComplete = (data) => {
    try {
      console.log('Onboarding data received:', data);
      
      const userDataToSave = {
        userName: data.name || 'User',
        gradeLevel: data.gradeLevel || '6',
        role: data.role || 'learner',
        email: data.email || '',
        accountType: data.accountType || 'guest',
        childId: data.childId || null, // Add childId for parents
        streak: 0,
        totalSessions: 0,
        totalPoints: 0,
        confidenceScore: 0,
        completedSessions: [],
        lastActiveDate: new Date().toDateString()
      };

      console.log('Saving user data:', userDataToSave);
      localStorage.setItem('socialCueUserData', JSON.stringify(userDataToSave));
      setUserData(data);
      setAppState('app');
    } catch (error) {
      console.error('Error saving user data:', error);
      // Still proceed with app state change, but data might not be saved
      setUserData(data);
      setAppState('app');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      try {
        localStorage.clear();
        setUserData(null);
        setAppState('landing');
      } catch (error) {
        console.error('Error during logout:', error);
        // Still proceed with state changes
        setUserData(null);
        setAppState('landing');
      }
    }
  };

  return (
    <ErrorBoundary>
      {appState === 'landing' && <LandingPage onGetStarted={handleGetStarted} />}
      {appState === 'onboarding' && <OnboardingScreen onComplete={handleOnboardingComplete} />}
      {appState === 'app' && <SocialCueApp onLogout={handleLogout} />}
    </ErrorBoundary>
  );
}

export default App;