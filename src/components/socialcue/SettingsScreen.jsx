import React, { useState, useEffect } from 'react';
import { getUserData, STORAGE_KEY } from './utils/storage';
import { Settings } from 'lucide-react';

function SettingsScreen({ userData, darkMode, onToggleDarkMode, soundEffects, onToggleSoundEffects, onLogout, onNavigate }) {
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);
  const [notifications, setNotifications] = useState(true);
  const [localSoundEffects, setLocalSoundEffects] = useState(soundEffects);
  const [name, setName] = useState(userData?.userName || 'Alex');
  const [email, setEmail] = useState('');

  useEffect(() => {
    setLocalDarkMode(darkMode);
  }, [darkMode]);

  useEffect(() => {
    setLocalSoundEffects(soundEffects);
  }, [soundEffects]);

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
    alert('Profile updated! ✅');
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
        </div>
      </div>
    </div>
  );
}

export default SettingsScreen;