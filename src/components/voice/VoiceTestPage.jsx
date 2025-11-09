import React, { useState } from 'react';
import VoiceInput from './VoiceInput';
import VoiceOutput from './VoiceOutput';

/**
 * VoiceTestPage - Test page for voice components
 * 
 * This page allows testing of VoiceInput and VoiceOutput components
 * with different grade levels and settings.
 */
const VoiceTestPage = () => {
  const [transcript, setTranscript] = useState('');
  const [testText, setTestText] = useState('Hello! This is a test of the voice system.');
  const [isListening, setIsListening] = useState(false);
  const [gradeLevel, setGradeLevel] = useState('6');
  const [voiceGender, setVoiceGender] = useState('female');

  const handleTranscript = (text) => {
    setTranscript(text);
    console.log('Transcript received:', text);
  };

  const handleError = (error, message) => {
    console.error('Voice error:', error, message);
    // You could add toast notifications here if needed
  };

  const handleSpeechStart = () => {
    console.log('Started speaking');
  };

  const handleSpeechEnd = () => {
    console.log('Finished speaking');
  };

  const handleSpeechError = (error) => {
    console.error('Speech error:', error);
    // You could add toast notifications here if needed
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Voice Components Test
        </h1>
        
        {/* Configuration */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">⚙️ Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Grade Level:</label>
              <select 
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Teacher Voice:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setVoiceGender('female')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    voiceGender === 'female' 
                      ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="text-lg mb-1">👩‍🏫</div>
                  <div className="text-sm">Female Teacher</div>
                  <div className="text-xs opacity-70">Charlotte</div>
                </button>
                <button
                  onClick={() => setVoiceGender('male')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    voiceGender === 'male' 
                      ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="text-lg mb-1">👨‍🏫</div>
                  <div className="text-sm">Male Teacher</div>
                  <div className="text-xs opacity-70">Callum</div>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Voice Provider Status:</label>
            <div className="text-sm text-gray-400">
              <p>✅ ElevenLabs API: {import.meta.env.VITE_ELEVENLABS_API_KEY ? 'Configured' : 'Not configured'}</p>
              <p>✅ Web Speech API: {window.speechSynthesis ? 'Available' : 'Not available'}</p>
              <p>✅ Speech Recognition: {window.SpeechRecognition || window.webkitSpeechRecognition ? 'Available' : 'Not available'}</p>
            </div>
          </div>
        </div>
        
        {/* Voice Output Test */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">🔊 Voice Output (ElevenLabs TTS)</h2>
          <p className="text-gray-400 mb-4">
            Test the text-to-speech functionality with ElevenLabs premium voices.
          </p>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-4 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows="3"
            placeholder="Enter text to speak..."
          />
          <VoiceOutput
            text={testText}
            voiceGender={voiceGender}
            autoPlay={false}
            onComplete={handleSpeechEnd}
            onStart={handleSpeechStart}
            onError={handleSpeechError}
          />
        </div>
        
        {/* Voice Input Test */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">🎤 Voice Input (Speech-to-Text)</h2>
          <p className="text-gray-400 mb-4">
            Test the speech-to-text functionality with Web Speech API.
          </p>
          <VoiceInput
            onTranscript={handleTranscript}
            onError={handleError}
            isListening={isListening}
            setIsListening={setIsListening}
            gradeLevel={gradeLevel}
          />
          <div className="mt-4 p-4 bg-gray-700 rounded-lg min-h-[100px]">
            <p className="text-sm text-gray-400 mb-2">Transcript:</p>
            <p className="text-lg">{transcript || 'Click microphone and speak...'}</p>
          </div>
        </div>
        
        {/* Combined Test */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">🔄 Combined Test</h2>
          <p className="text-gray-400 mb-4">
            Click the microphone, speak something, then the AI will repeat it back using {voiceGender === 'female' ? 'Charlotte' : 'Callum'}'s warm teacher voice.
          </p>
          <button
            onClick={() => {
              setIsListening(true);
              setTranscript('');
            }}
            className="bg-gradient-to-r from-blue-500 to-emerald-500 px-6 py-3 rounded-full font-bold hover:from-blue-600 hover:to-emerald-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Start Combined Test
          </button>
          {transcript && (
            <div className="mt-4">
              <p className="text-sm text-gray-400">You said:</p>
              <p className="text-lg mb-4 text-emerald-400 font-medium">{transcript}</p>
              <VoiceOutput
                text={`I heard you say: ${transcript}`}
                voiceGender={voiceGender}
                autoPlay={true}
                onComplete={() => console.log('AI finished speaking')}
                onStart={() => console.log('AI started speaking')}
                onError={(error) => console.error('AI speech error:', error)}
              />
            </div>
          )}
        </div>

        {/* Test Instructions */}
        <div className="p-6 bg-blue-900/20 border border-blue-500/30 rounded-xl">
          <h3 className="text-lg font-semibold text-blue-200 mb-3">Test Instructions:</h3>
          <div className="text-sm text-blue-300 space-y-2">
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
              <span><strong>Voice Output:</strong> Enter text and click play to hear warm teacher voice</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
              <span><strong>Voice Input:</strong> Click microphone and speak clearly</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
              <span><strong>Combined Test:</strong> Speak and hear AI repeat it back</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
              <span><strong>Teacher Voice:</strong> Choose between warm female (Charlotte) or male (Callum) teacher voices</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
              <span><strong>Consistent Experience:</strong> Same warm, encouraging voice for all ages K-12</span>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Debug Information:</h3>
          <div className="text-xs text-gray-400 space-y-1">
            <p>Grade Level: {gradeLevel}</p>
            <p>Voice Gender: {voiceGender}</p>
            <p>ElevenLabs API Key: {import.meta.env.VITE_ELEVENLABS_API_KEY ? 'Set' : 'Not Set'}</p>
            <p>ElevenLabs Enabled: {import.meta.env.VITE_USE_ELEVENLABS === 'true' ? 'Yes' : 'No'}</p>
            <p>Speech Recognition Support: {window.SpeechRecognition || window.webkitSpeechRecognition ? 'Yes' : 'No'}</p>
            <p>Speech Synthesis Support: {window.speechSynthesis ? 'Yes' : 'No'}</p>
            <p>User Agent: {navigator.userAgent}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceTestPage;
