// Storage utilities
export const STORAGE_KEY = 'socialCueUserData';

export const getDefaultUserData = () => ({
  userName: 'Alex',
  streak: 7,
  totalSessions: 24,
  confidenceScore: 89,
  lastActiveDate: new Date().toDateString(),
  completedSessions: [{ id: 2, progress: 45 }]
});

export const getUserData = () => {
  try {
    // First try to get regular user data
    let stored = localStorage.getItem(STORAGE_KEY);
    let parsed = null;
    
    if (stored) {
      parsed = JSON.parse(stored);
    }
    
    // If no regular user data, try to get guest data
    if (!parsed || typeof parsed !== 'object') {
      console.log('🔍 No regular user data, checking for guest data...');
      const guestStored = localStorage.getItem('socialCueGuestData');
      if (guestStored) {
        parsed = JSON.parse(guestStored);
        console.log('✅ Found guest data:', parsed);
      }
    }
    
    // If still no data, create default
    if (!parsed || typeof parsed !== 'object') {
      console.log('🔍 No user data found, creating default...');
      const defaultData = getDefaultUserData();
      saveUserData(defaultData);
      return defaultData;
    }
    
    // Validate the parsed data structure
    if (!parsed || typeof parsed !== 'object') {
      console.warn('Invalid user data structure, using defaults');
      const defaultData = getDefaultUserData();
      saveUserData(defaultData);
      return defaultData;
    }
    
    console.log('✅ Returning user data:', parsed);
    return parsed;
  } catch (error) {
    console.error('Failed to load user data:', error);
    const defaultData = getDefaultUserData();
    saveUserData(defaultData);
    return defaultData;
  }
};

export const getSessionProgress = (sessionId) => {
  try {
    const userData = getUserData();
    if (!userData || !userData.completedSessions) {
      return 0;
    }
    
    const session = userData.completedSessions.find(s => s.id === sessionId);
    return session ? (session.progress || 0) : 0;
  } catch (error) {
    console.error('Failed to get session progress:', error);
    return 0;
  }
};

export const saveUserData = (userData) => {
  try {
    if (!userData || typeof userData !== 'object') {
      console.error('Invalid user data provided for saving');
      return false;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Failed to save user data:', error);
    
    // Check if localStorage is available
    if (error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
    } else if (error.name === 'SecurityError') {
      console.error('localStorage access denied (private browsing mode)');
    }
    
    return false;
  }
};

// Check if localStorage is available
export const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.warn('localStorage is not available:', error);
    return false;
  }
};

// Clear all user data (for testing/debugging)
export const clearUserData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear user data:', error);
    return false;
  }
};