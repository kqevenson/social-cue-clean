import React, { useState, useEffect } from 'react';
import { getUserData, STORAGE_KEY } from './utils/storage';
import { Settings, Shield, Lock, Download, Trash2, Users, Clock, Bell, Mail } from 'lucide-react';
import { useToast } from './animations';

function SettingsScreen({ userData, darkMode, onToggleDarkMode, soundEffects, onToggleSoundEffects, onLogout, onNavigate }) {
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);
  const [notifications, setNotifications] = useState(true);
  const [localSoundEffects, setLocalSoundEffects] = useState(soundEffects);
  const [name, setName] = useState(userData?.userName || 'Alex');
  const [email, setEmail] = useState('');
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    shareProgressWithEducators: true,
    allowAnonymousDataCollection: true,
    showProgressToParents: true,
    includeDetailedSessionData: true
  });
  
  // Parental controls state
  const [parentalControls, setParentalControls] = useState({
    dailyTimeLimit: 30,
    sessionsPerDay: 3,
    availableTopics: ['small-talk', 'making-friends', 'conflict-resolution', 'empathy', 'active-listening'],
    blockedDifficultyLevels: [],
    ageAppropriateContentOnly: true,
    requireApprovalForChallenges: false,
    notifyOnSessionCompletion: true
  });
  
  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    weeklyProgressSummary: true,
    streakReminders: true,
    newChallengeNotifications: true,
    sessionCompletionCelebrations: true,
    streakMilestoneAlerts: true,
    challengeReminders: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setLocalDarkMode(darkMode);
  }, [darkMode]);

  useEffect(() => {
    setLocalSoundEffects(soundEffects);
  }, [soundEffects]);

  // Load privacy settings and parental controls on mount
  useEffect(() => {
    loadPrivacySettings();
    if (userData?.role === 'parent') {
      loadParentalControls();
    }
  }, [userData?.userId]);

  const loadPrivacySettings = async () => {
    try {
      const userId = userData?.userId || localStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch(`/api/user/privacy/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPrivacySettings(data.privacy);
        }
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const loadParentalControls = async () => {
    try {
      const userId = userData?.userId || localStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch(`/api/user/parental-controls/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setParentalControls(data.controls);
        }
      }
    } catch (error) {
      console.error('Error loading parental controls:', error);
    }
  };

  const handleToggleDarkMode = () => {
    const newValue = !localDarkMode;
    setLocalDarkMode(newValue);
    onToggleDarkMode(newValue);
  };

  const handleToggleSoundEffects = () => {
    const newValue = !localSoundEffects;
    setLocalSoundEffects(newValue);
    onToggleSoundEffects(newValue);
  };

  const handleSaveProfile = () => {
    const currentData = getUserData();
    currentData.userName = name;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
    showToast('Profile updated! ✅', 'success');
  };

  const handlePrivacySettingChange = async (setting, value) => {
    const newSettings = { ...privacySettings, [setting]: value };
    setPrivacySettings(newSettings);

    try {
      const userId = userData?.userId || localStorage.getItem('userId');
      const response = await fetch(`/api/user/privacy/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        showToast('Privacy settings updated', 'success');
      } else {
        showToast('Failed to update privacy settings', 'error');
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      showToast('Failed to update privacy settings', 'error');
    }
  };

  const handleParentalControlChange = async (setting, value) => {
    const newControls = { ...parentalControls, [setting]: value };
    setParentalControls(newControls);

    try {
      const userId = userData?.userId || localStorage.getItem('userId');
      const response = await fetch(`/api/user/parental-controls/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newControls)
      });

      if (response.ok) {
        showToast('Parental controls updated', 'success');
      } else {
        showToast('Failed to update parental controls', 'error');
      }
    } catch (error) {
      console.error('Error updating parental controls:', error);
      showToast('Failed to update parental controls', 'error');
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      const userId = userData?.userId || localStorage.getItem('userId');
      const response = await fetch(`/api/user/export-data/${userId}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `social-cue-data-${userData?.userName || 'user'}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('Data exported successfully!', 'success');
      } else {
        showToast('Failed to export data', 'error');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('Failed to export data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsLoading(true);
    try {
      const userId = userData?.userId || localStorage.getItem('userId');
      const response = await fetch(`/api/user/delete-account/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast('Account deleted successfully', 'success');
        // Clear local storage and redirect to onboarding
        localStorage.clear();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showToast('Failed to delete account', 'error');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast('Failed to delete account', 'error');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      onLogout(); // Call the prop to trigger logout in parent
    }
  };

  return (
    <div className="pb-24 px-6 py-8">
      <h1 className={`text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
      
      <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
        darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profile</h2>
        <div className="space-y-4">
          <div>
            <label className={`text-sm block mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                darkMode 
                  ? 'bg-black/40 border-white/20 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              }`}
            />
          </div>
          <div>
            <label className={`text-sm block mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</label>
            <input 
              type="email" 
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                darkMode 
                  ? 'bg-black/40 border-white/20 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
              }`}
            />
          </div>
          <button 
            onClick={handleSaveProfile}
            className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Account Info - only for learners */}
      {userData?.role !== 'parent' && (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
          darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Account Info
          </h2>
          <div className="space-y-3">
            <div>
              <label className={`text-sm block mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Your User ID
              </label>
              <div className={`flex items-center gap-2 p-3 rounded-xl ${darkMode ? 'bg-black/40' : 'bg-gray-50'}`}>
                <code className={`flex-1 font-mono text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {userData?.userId || 'guest_' + Date.now()}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(userData?.userId || 'guest_' + Date.now());
                    alert('User ID copied!');
                  }}
                  className={`px-3 py-1 rounded-lg text-sm font-bold ${
                    darkMode ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  Copy
                </button>
              </div>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Share this with your parent to connect their account
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
        darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Preferences</h2>
        <div className="space-y-4">
          <div className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
            darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
          }`} onClick={handleToggleDarkMode}>
            <div>
              <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dark Mode</div>
              <div className={darkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>Use dark theme for the app</div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${localDarkMode ? 'bg-emerald-500' : 'bg-gray-400'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localDarkMode ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>
          <div className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
            darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
          }`} onClick={() => setNotifications(!notifications)}>
            <div>
              <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</div>
              <div className={darkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>Get reminded to practice</div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${notifications ? 'bg-emerald-500' : 'bg-gray-400'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>
          <div className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
            darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
          }`} onClick={handleToggleSoundEffects}>
            <div>
              <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Sound Effects</div>
              <div className={darkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>Play sounds during sessions</div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${localSoundEffects ? 'bg-emerald-500' : 'bg-gray-400'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${localSoundEffects ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>
          <div className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
            darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
          }`} onClick={() => onNavigate('learning-preferences')}>
            <div>
              <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Learning Preferences</div>
              <div className={darkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>Customize your learning experience</div>
            </div>
            <Settings className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Privacy & Data Section */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
        darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <Shield className={`w-6 h-6 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Privacy & Data</h2>
        </div>
        <div className="space-y-4">
          <div className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
            darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
          }`} onClick={() => handlePrivacySettingChange('shareProgressWithEducators', !privacySettings.shareProgressWithEducators)}>
            <div>
              <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Share Progress with Educators</div>
              <div className={darkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>Allow teachers to see your learning progress</div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${privacySettings.shareProgressWithEducators ? 'bg-emerald-500' : 'bg-gray-400'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${privacySettings.shareProgressWithEducators ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>
          <div className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
            darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
          }`} onClick={() => handlePrivacySettingChange('allowAnonymousDataCollection', !privacySettings.allowAnonymousDataCollection)}>
            <div>
              <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Anonymous Usage Data</div>
              <div className={darkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>Help improve the app with anonymous usage data</div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${privacySettings.allowAnonymousDataCollection ? 'bg-emerald-500' : 'bg-gray-400'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${privacySettings.allowAnonymousDataCollection ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>
          <div className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
            darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
          }`} onClick={() => handlePrivacySettingChange('showProgressToParents', !privacySettings.showProgressToParents)}>
            <div>
              <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Show Progress to Parents</div>
              <div className={darkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>Let parents see your learning progress</div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${privacySettings.showProgressToParents ? 'bg-emerald-500' : 'bg-gray-400'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${privacySettings.showProgressToParents ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>
          <div className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
            darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
          }`} onClick={() => handlePrivacySettingChange('includeDetailedSessionData', !privacySettings.includeDetailedSessionData)}>
            <div>
              <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Detailed Session Data</div>
              <div className={darkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>Include detailed data in progress reports</div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${privacySettings.includeDetailedSessionData ? 'bg-emerald-500' : 'bg-gray-400'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${privacySettings.includeDetailedSessionData ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <button 
              onClick={handleExportData}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl transition-all ${
                darkMode ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Download className="w-5 h-5" />
              {isLoading ? 'Exporting...' : 'Download My Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Parental Controls Section - Only for parents */}
      {userData?.role === 'parent' && (
        <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
          darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <Users className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Parental Controls</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className={`text-sm block mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Daily Practice Time Limit</label>
              <select 
                value={parentalControls.dailyTimeLimit}
                onChange={(e) => handleParentalControlChange('dailyTimeLimit', parseInt(e.target.value))}
                className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                  darkMode 
                    ? 'bg-black/40 border-white/20 text-white focus:border-purple-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                }`}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={0}>Unlimited</option>
              </select>
            </div>
            <div>
              <label className={`text-sm block mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sessions Per Day</label>
              <select 
                value={parentalControls.sessionsPerDay}
                onChange={(e) => handleParentalControlChange('sessionsPerDay', parseInt(e.target.value))}
                className={`w-full border rounded-xl px-4 py-3 focus:outline-none transition-colors ${
                  darkMode 
                    ? 'bg-black/40 border-white/20 text-white focus:border-purple-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                }`}
              >
                <option value={1}>1 session</option>
                <option value={2}>2 sessions</option>
                <option value={3}>3 sessions</option>
                <option value={5}>5 sessions</option>
                <option value={10}>10 sessions</option>
                <option value={0}>Unlimited</option>
              </select>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
              darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
            }`} onClick={() => handleParentalControlChange('ageAppropriateContentOnly', !parentalControls.ageAppropriateContentOnly)}>
              <div>
                <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Age-Appropriate Content Only</div>
                <div className={darkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>Filter content to be age-appropriate</div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${parentalControls.ageAppropriateContentOnly ? 'bg-emerald-500' : 'bg-gray-400'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${parentalControls.ageAppropriateContentOnly ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
              darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
            }`} onClick={() => handleParentalControlChange('requireApprovalForChallenges', !parentalControls.requireApprovalForChallenges)}>
              <div>
                <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Require Approval for Challenges</div>
                <div className={darkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>Approve challenges before child can start them</div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${parentalControls.requireApprovalForChallenges ? 'bg-emerald-500' : 'bg-gray-400'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${parentalControls.requireApprovalForChallenges ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
              darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
            }`} onClick={() => handleParentalControlChange('notifyOnSessionCompletion', !parentalControls.notifyOnSessionCompletion)}>
              <div>
                <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notify on Session Completion</div>
                <div className={darkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>Get notified when child completes sessions</div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${parentalControls.notifyOnSessionCompletion ? 'bg-emerald-500' : 'bg-gray-400'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${parentalControls.notifyOnSessionCompletion ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Section */}
      <div className={`backdrop-blur-xl border rounded-2xl p-6 mb-6 ${
        darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <Bell className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h2>
        </div>
        <div className="space-y-4">
          <div className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
            darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
          }`} onClick={() => setNotificationPrefs({...notificationPrefs, weeklyProgressSummary: !notificationPrefs.weeklyProgressSummary})}>
            <div>
              <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Weekly Progress Summary</div>
              <div className={darkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>Get weekly progress updates via email</div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${notificationPrefs.weeklyProgressSummary ? 'bg-emerald-500' : 'bg-gray-400'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationPrefs.weeklyProgressSummary ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>
          <div className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
            darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
          }`} onClick={() => setNotificationPrefs({...notificationPrefs, streakReminders: !notificationPrefs.streakReminders})}>
            <div>
              <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Streak Reminders</div>
              <div className={darkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>Get reminded to maintain your practice streak</div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${notificationPrefs.streakReminders ? 'bg-emerald-500' : 'bg-gray-400'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationPrefs.streakReminders ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>
          <div className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
            darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
          }`} onClick={() => setNotificationPrefs({...notificationPrefs, newChallengeNotifications: !notificationPrefs.newChallengeNotifications})}>
            <div>
              <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>New Challenge Notifications</div>
              <div className={darkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>Get notified when new challenges are available</div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${notificationPrefs.newChallengeNotifications ? 'bg-emerald-500' : 'bg-gray-400'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationPrefs.newChallengeNotifications ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>
          <div className={`flex items-center justify-between p-4 rounded-xl transition-colors cursor-pointer ${
            darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
          }`} onClick={() => setNotificationPrefs({...notificationPrefs, sessionCompletionCelebrations: !notificationPrefs.sessionCompletionCelebrations})}>
            <div>
              <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Session Completion Celebrations</div>
              <div className={darkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>Show celebration animations when completing sessions</div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${notificationPrefs.sessionCompletionCelebrations ? 'bg-emerald-500' : 'bg-gray-400'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationPrefs.sessionCompletionCelebrations ? 'right-1' : 'left-1'}`}></div>
            </div>
          </div>
        </div>
      </div>

      <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
        darkMode ? 'bg-white/8 border-white/20' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>About</h2>
        <div className="space-y-3">
          <button 
            onClick={() => alert('Privacy Policy - Coming soon!')}
            className={`w-full text-left p-4 rounded-xl transition-all ${
              darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <span className={darkMode ? 'text-white' : 'text-gray-900'}>Privacy Policy</span>
          </button>
          <button 
            onClick={() => alert('Terms of Service - Coming soon!')}
            className={`w-full text-left p-4 rounded-xl transition-all ${
              darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <span className={darkMode ? 'text-white' : 'text-gray-900'}>Terms of Service</span>
          </button>
          <button 
            onClick={() => alert('Help & Support - Contact us at support@socialcue.app')}
            className={`w-full text-left p-4 rounded-xl transition-all ${
              darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <span className={darkMode ? 'text-white' : 'text-gray-900'}>Help & Support</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full text-left p-4 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all font-bold"
          >
            Log Out
          </button>
          
          {/* Delete Account Button */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
            <button 
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl transition-all font-bold ${
                showDeleteConfirm 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : darkMode 
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                    : 'bg-red-50 hover:bg-red-100 text-red-600'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Trash2 className="w-5 h-5" />
              {isLoading ? 'Deleting...' : showDeleteConfirm ? 'Confirm Delete Account' : 'Delete My Account'}
            </button>
            {showDeleteConfirm && (
              <p className={`text-sm mt-2 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ⚠️ This action cannot be undone. All your data will be permanently deleted.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsScreen;