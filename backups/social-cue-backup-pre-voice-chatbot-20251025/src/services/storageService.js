// Storage Service for Social Cue App
// Handles localStorage operations with error handling and data validation

class StorageService {
  constructor() {
    this.storageKey = 'socialCueApp';
  }

  // Generic storage methods
  setItem(key, value) {
    try {
      const data = JSON.stringify(value);
      localStorage.setItem(`${this.storageKey}_${key}`, data);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`${this.storageKey}_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  removeItem(key) {
    try {
      localStorage.removeItem(`${this.storageKey}_${key}`);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  // Clear all app data
  clearAll() {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.storageKey)
      );
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  // User-specific methods
  saveUserData(userData) {
    return this.setItem('userData', userData);
  }

  getUserData() {
    return this.getItem('userData', {});
  }

  saveOnboardingData(onboardingData) {
    return this.setItem('onboardingData', onboardingData);
  }

  getOnboardingData() {
    return this.getItem('onboardingData', {});
  }

  // Progress tracking
  saveProgress(progress) {
    return this.setItem('progress', progress);
  }

  getProgress() {
    return this.getItem('progress', {
      completedSessions: 0,
      currentStreak: 0,
      totalTimeSpent: 0
    });
  }

  // Session history
  saveSessionHistory(sessions) {
    return this.setItem('sessionHistory', sessions);
  }

  getSessionHistory() {
    return this.getItem('sessionHistory', []);
  }

  // App preferences
  savePreferences(preferences) {
    return this.setItem('preferences', preferences);
  }

  getPreferences() {
    return this.getItem('preferences', {
      theme: 'dark',
      notifications: true,
      soundEnabled: true
    });
  }
}

// Export singleton instance
export default new StorageService();
