import React, { useState, useEffect } from 'react';
import NewLandingPage from './components/NewLandingPage';
import OnboardingScreen from './components/OnboardingScreen';
import SocialCueApp from './components/SocialCueApp';

function App() {
  const [appState, setAppState] = useState('landing');
  const [userData, setUserData] = useState(null);

  // Check if user has already completed onboarding
  useEffect(() => {
    const storedUser = localStorage.getItem('socialCueUserData');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.name && parsed.gradeLevel) {
          setUserData(parsed);
          setAppState('app');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
  }, []);

  const handleGetStarted = () => {
    setAppState('onboarding');
  };

  const handleOnboardingComplete = (data) => {
    const userDataToSave = {
      name: data.name || 'User',
      gradeLevel: data.gradeLevel || '6',
      role: data.role || 'learner',
      email: data.email || '',
      accountType: data.accountType || 'guest',
      streak: 0,
      totalSessions: 0,
      totalPoints: 0,
      confidenceScore: 0,
      completedSessions: [],
      lastActiveDate: new Date().toDateString()
    };

    localStorage.setItem('socialCueUserData', JSON.stringify(userDataToSave));
    setUserData(data);
    setAppState('app');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.clear();
      setUserData(null);
      setAppState('landing');
    }
  };

  if (appState === 'landing') {
    return <NewLandingPage onGetStarted={handleGetStarted} />;
  }

  if (appState === 'onboarding') {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (appState === 'app') {
    return <SocialCueApp onLogout={handleLogout} />;
  }

  return null;
}

export default App;