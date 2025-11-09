import React, { useState } from 'react';
import VoiceInput from './VoiceInput';
import VoiceOutput from './VoiceOutput';
import VoiceChat from './VoiceChat';

/**
 * ElevenLabsVoiceDemo - Test and demonstration component for ElevenLabs integration
 * 
 * This component demonstrates all three voice components working together
 * with ElevenLabs API integration and provides a testing interface.
 */
const ElevenLabsVoiceDemo = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [transcript, setTranscript] = useState('');
  const [ttsText, setTtsText] = useState('Hello! This is a test of the ElevenLabs text-to-speech functionality. You can hear the difference in voice quality compared to standard Web Speech API.');
  const [gradeLevel, setGradeLevel] = useState('6');
  const [useElevenLabs, setUseElevenLabs] = useState(true);

  const handleTranscript = (text) => {
    setTranscript(text);
    console.log('Transcript received:', text);
  };

  const handleError = (error, message) => {
    console.error('Voice error:', error, message);
  };

  const handleUserMessage = (message) => {
    console.log('User message:', message);
    
    // Simulate AI response with ElevenLabs
    setTimeout(() => {
      const responses = [
        "That's interesting! Tell me more about that.",
        "I understand. How did that make you feel?",
        "That sounds like a great experience!",
        "What would you do differently next time?",
        "That's a good point. What do you think about...?"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      console.log('AI would respond with ElevenLabs:', randomResponse);
    }, 1000);
  };

  const handleSystemMessage = (message) => {
    console.log('System message:', message);
  };

  const tabs = [
    { id: 'chat', label: 'Voice Chat', icon: '💬' },
    { id: 'input', label: 'Speech Input', icon: '🎤' },
    { id: 'output', label: 'ElevenLabs TTS', icon: '🔊' }
  ];

  const gradeLevels = [
    { value: 'K', label: 'Kindergarten' },
    { value: '1', label: '1st Grade' },
    { value: '2', label: '2nd Grade' },
    { value: '3', label: '3rd Grade' },
    { value: '4', label: '4th Grade' },
    { value: '5', label: '5th Grade' },
    { value: '6', label: '6th Grade' },
    { value: '7', label: '7th Grade' },
    { value: '8', label: '8th Grade' },
    { value: '9', label: '9th Grade' },
    { value: '10', label: '10th Grade' },
    { value: '11', label: '11th Grade' },
    { value: '12', label: '12th Grade' },
    { value: 'adult', label: 'Adult' }
  ];

  const getVoiceInfo = (grade) => {
    const gradeNum = parseInt(grade) || 6;
    
    if (gradeNum <= 2) return { voice: 'Rachel/Bella', description: 'Warm, friendly female voices' };
    if (gradeNum <= 5) return { voice: 'Elli', description: 'Clear, engaging voice' };
    if (gradeNum <= 8) return { voice: 'Callum/Charlotte', description: 'Professional, neutral voices' };
    return { voice: 'Josh/Nicole', description: 'Mature, natural voices' };
  };

  const voiceInfo = getVoiceInfo(gradeLevel);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">ElevenLabs Voice Components Demo</h1>
        <p className="text-gray-400">
          Test and demonstrate the Social Cue voice components with ElevenLabs integration
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold text-white mb-4">Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Grade Level Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Grade Level (affects voice selection)
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {gradeLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <div className="mt-2 text-xs text-gray-400">
              <p><strong>Voice:</strong> {voiceInfo.voice}</p>
              <p><strong>Description:</strong> {voiceInfo.description}</p>
            </div>
          </div>

          {/* ElevenLabs Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Voice Provider
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setUseElevenLabs(true)}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  useElevenLabs 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                ElevenLabs Premium
              </button>
              <button
                onClick={() => setUseElevenLabs(false)}
                className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                  !useElevenLabs 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Web Speech API
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {useElevenLabs ? (
                <p>✅ Using premium ElevenLabs voices</p>
              ) : (
                <p>⚠️ Using standard Web Speech API</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Voice Chat Tab */}
        {activeTab === 'chat' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Voice Chat Demo</h2>
            <p className="text-gray-400 mb-4">
              Complete voice conversation interface with ElevenLabs text-to-speech and Web Speech recognition.
            </p>
            <VoiceChat
              onUserMessage={handleUserMessage}
              onSystemMessage={handleSystemMessage}
              initialMessage="Hi! I'm your social skills coach. Let's practice having a conversation. What's your name?"
              gradeLevel={gradeLevel}
            />
          </div>
        )}

        {/* Speech Input Tab */}
        {activeTab === 'input' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Speech Input Demo</h2>
            <p className="text-gray-400 mb-4">
              Test speech-to-text functionality with real-time transcription.
            </p>
            
            <VoiceInput
              onTranscript={handleTranscript}
              onError={handleError}
              gradeLevel={gradeLevel}
            />

            {/* Transcript Display */}
            {transcript && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Transcript:</h3>
                <p className="text-white">{transcript}</p>
              </div>
            )}

            {/* Test Instructions */}
            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <h3 className="text-sm font-medium text-blue-200 mb-2">Test Instructions:</h3>
              <ul className="text-sm text-blue-300 space-y-1">
                <li>• Click the microphone button to start listening</li>
                <li>• Speak clearly and wait for transcription</li>
                <li>• Try saying: "Hello, my name is [your name]"</li>
                <li>• Test with different speaking speeds and volumes</li>
                <li>• Check error handling by denying microphone permission</li>
              </ul>
            </div>
          </div>
        )}

        {/* Text-to-Speech Tab */}
        {activeTab === 'output' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">ElevenLabs TTS Demo</h2>
            <p className="text-gray-400 mb-4">
              Test ElevenLabs text-to-speech with premium voices and Web Speech API fallback.
            </p>

            {/* Text Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Text to Speak:
              </label>
              <textarea
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={4}
                placeholder="Enter text to be spoken with ElevenLabs..."
              />
            </div>

            <VoiceOutput
              text={ttsText}
              onError={handleError}
              gradeLevel={gradeLevel}
            />

            {/* Voice Comparison */}
            <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <h3 className="text-sm font-medium text-green-200 mb-2">Voice Quality Comparison:</h3>
              <div className="text-sm text-green-300 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span><strong>ElevenLabs:</strong> Natural, human-like voices with emotion</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  <span><strong>Web Speech API:</strong> Standard browser voices, more robotic</span>
                </div>
              </div>
            </div>

            {/* Test Instructions */}
            <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <h3 className="text-sm font-medium text-green-200 mb-2">Test Instructions:</h3>
              <ul className="text-sm text-green-300 space-y-1">
                <li>• Click the play button to start speaking</li>
                <li>• Use pause/resume to control playback</li>
                <li>• Adjust speed, pitch, and volume in settings</li>
                <li>• Try different voice options</li>
                <li>• Test with different text lengths</li>
                <li>• Compare ElevenLabs vs Web Speech quality</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ElevenLabs Status */}
      <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <h3 className="text-sm font-medium text-blue-200 mb-2">ElevenLabs Integration Status:</h3>
        <div className="text-sm text-blue-300 space-y-1">
          <p>✅ <strong>API Key:</strong> {import.meta.env.VITE_ELEVENLABS_API_KEY ? 'Configured' : 'Not configured'}</p>
          <p>✅ <strong>Voice Selection:</strong> Grade-appropriate voices</p>
          <p>✅ <strong>Audio Caching:</strong> Performance optimization</p>
          <p>✅ <strong>Fallback System:</strong> Web Speech API backup</p>
          <p>✅ <strong>Error Handling:</strong> Graceful error recovery</p>
        </div>
      </div>

      {/* Browser Compatibility Info */}
      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
        <h3 className="text-sm font-medium text-yellow-200 mb-2">Browser Compatibility:</h3>
        <div className="text-sm text-yellow-300 space-y-1">
          <p>✅ <strong>Chrome:</strong> Full support for all features</p>
          <p>✅ <strong>Safari:</strong> Full support for all features</p>
          <p>✅ <strong>Edge:</strong> Full support for all features</p>
          <p>⚠️ <strong>Firefox:</strong> Limited speech recognition support</p>
          <p>❌ <strong>Internet Explorer:</strong> Not supported</p>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Debug Information:</h3>
        <div className="text-xs text-gray-400 space-y-1">
          <p>Grade Level: {gradeLevel}</p>
          <p>Active Tab: {activeTab}</p>
          <p>ElevenLabs Enabled: {useElevenLabs ? 'Yes' : 'No'}</p>
          <p>ElevenLabs API Key: {import.meta.env.VITE_ELEVENLABS_API_KEY ? 'Set' : 'Not Set'}</p>
          <p>Speech Recognition Support: {window.SpeechRecognition || window.webkitSpeechRecognition ? 'Yes' : 'No'}</p>
          <p>Speech Synthesis Support: {window.speechSynthesis ? 'Yes' : 'No'}</p>
          <p>User Agent: {navigator.userAgent}</p>
        </div>
      </div>
    </div>
  );
};

export default ElevenLabsVoiceDemo;
