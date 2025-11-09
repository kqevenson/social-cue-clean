import React, { useState } from 'react';
import VoiceInput from './VoiceInput';
import VoiceOutput from './VoiceOutput';
import VoiceChat from './VoiceChat';

/**
 * VoiceComponentsDemo - Test and demonstration component
 * 
 * This component demonstrates all three voice components working together
 * and provides a testing interface for development.
 */
const VoiceComponentsDemo = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [transcript, setTranscript] = useState('');
  const [ttsText, setTtsText] = useState('Hello! This is a test of the text-to-speech functionality. You can adjust the speed, pitch, and volume using the settings.');
  const [gradeLevel, setGradeLevel] = useState('6');

  const handleTranscript = (text) => {
    setTranscript(text);
    console.log('Transcript received:', text);
  };

  const handleError = (error, message) => {
    console.error('Voice error:', error, message);
  };

  const handleUserMessage = (message) => {
    console.log('User message:', message);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's interesting! Tell me more about that.",
        "I understand. How did that make you feel?",
        "That sounds like a great experience!",
        "What would you do differently next time?",
        "That's a good point. What do you think about...?"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      // In a real app, this would be handled by the VoiceChat component
      console.log('AI would respond:', randomResponse);
    }, 1000);
  };

  const handleSystemMessage = (message) => {
    console.log('System message:', message);
  };

  const tabs = [
    { id: 'chat', label: 'Voice Chat', icon: '💬' },
    { id: 'input', label: 'Speech Input', icon: '🎤' },
    { id: 'output', label: 'Text-to-Speech', icon: '🔊' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Voice Components Demo</h1>
        <p className="text-gray-400">
          Test and demonstrate the Social Cue voice components
        </p>
      </div>

      {/* Grade Level Selector */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Grade Level (affects voice settings)
        </label>
        <select
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="K">Kindergarten</option>
          <option value="1">1st Grade</option>
          <option value="2">2nd Grade</option>
          <option value="3">3rd Grade</option>
          <option value="4">4th Grade</option>
          <option value="5">5th Grade</option>
          <option value="6">6th Grade</option>
          <option value="7">7th Grade</option>
          <option value="8">8th Grade</option>
          <option value="9">9th Grade</option>
          <option value="10">10th Grade</option>
          <option value="11">11th Grade</option>
          <option value="12">12th Grade</option>
          <option value="adult">Adult</option>
        </select>
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
              Complete voice conversation interface with speech-to-text and text-to-speech.
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
            <h2 className="text-xl font-semibold text-white mb-4">Text-to-Speech Demo</h2>
            <p className="text-gray-400 mb-4">
              Test text-to-speech functionality with adjustable voice settings.
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
                placeholder="Enter text to be spoken..."
              />
            </div>

            <VoiceOutput
              text={ttsText}
              onError={handleError}
              gradeLevel={gradeLevel}
            />

            {/* Test Instructions */}
            <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <h3 className="text-sm font-medium text-green-200 mb-2">Test Instructions:</h3>
              <ul className="text-sm text-green-300 space-y-1">
                <li>• Click the play button to start speaking</li>
                <li>• Use pause/resume to control playback</li>
                <li>• Adjust speed, pitch, and volume in settings</li>
                <li>• Try different voice options</li>
                <li>• Test with different text lengths</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Browser Compatibility Info */}
      <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
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
          <p>Speech Recognition Support: {window.SpeechRecognition || window.webkitSpeechRecognition ? 'Yes' : 'No'}</p>
          <p>Speech Synthesis Support: {window.speechSynthesis ? 'Yes' : 'No'}</p>
          <p>User Agent: {navigator.userAgent}</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceComponentsDemo;
