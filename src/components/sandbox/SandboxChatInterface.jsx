import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';

const SandboxChatInterface = ({
  messages,
  isLoading,
  darkMode = true,
  inputMode = 'text',
  isVoiceConnected = false,
  isListening = false,
  currentTranscript = '',
  currentEmotion = null,
  onSendMessage,
  onToggleVoice,
  onSubmitVoice
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when switching to text mode
  useEffect(() => {
    if (inputMode === 'text' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'student'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : darkMode
                    ? 'bg-white/10 text-white rounded-bl-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.text}
              </p>
              <div className={`flex items-center gap-2 mt-1 ${
                message.role === 'student' ? 'justify-end' : 'justify-start'
              }`}>
                <span className={`text-xs ${
                  message.role === 'student'
                    ? 'text-white/60'
                    : darkMode ? 'text-white/40' : 'text-gray-400'
                }`}>
                  {formatTime(message.timestamp)}
                </span>
                {message.emotion && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    message.role === 'student'
                      ? 'bg-white/20 text-white/80'
                      : darkMode ? 'bg-white/5 text-white/60' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {message.emotion}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`rounded-2xl px-4 py-3 ${
              darkMode ? 'bg-white/10' : 'bg-gray-100'
            }`}>
              <div className="flex items-center gap-2">
                <Loader2 className={`w-4 h-4 animate-spin ${darkMode ? 'text-white/60' : 'text-gray-400'}`} />
                <span className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Voice transcript preview */}
        {inputMode === 'voice' && currentTranscript && (
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-blue-500/50 text-white rounded-br-md border-2 border-dashed border-blue-400">
              <p className="text-sm leading-relaxed italic">
                {currentTranscript}
              </p>
              <p className="text-xs text-white/60 mt-1">
                Listening... tap send when ready
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Current emotion indicator */}
      {currentEmotion && inputMode === 'voice' && (
        <div className={`px-4 py-2 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
              Detected: {currentEmotion.name} ({Math.round(currentEmotion.score * 100)}%)
            </span>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className={`p-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
        {inputMode === 'text' ? (
          /* Text input */
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Say what's on your mind..."
                disabled={isLoading}
                rows={1}
                className={`w-full px-4 py-3 rounded-2xl resize-none transition-colors ${
                  darkMode
                    ? 'bg-white/10 text-white placeholder-white/40 focus:bg-white/15'
                    : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>

            {/* Voice toggle button */}
            <button
              type="button"
              onClick={onToggleVoice}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                darkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white/60'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                inputText.trim() && !isLoading
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : darkMode
                    ? 'bg-white/10 text-white/30'
                    : 'bg-gray-100 text-gray-300'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        ) : (
          /* Voice input */
          <div className="flex items-center gap-3">
            {/* Voice status */}
            <div className={`flex-1 px-4 py-3 rounded-2xl ${
              darkMode ? 'bg-white/10' : 'bg-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <span className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                  {isListening ? 'Listening...' : 'Voice mode ready'}
                </span>
              </div>
            </div>

            {/* Switch to text button */}
            <button
              type="button"
              onClick={onToggleVoice}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isVoiceConnected
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : darkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white/60'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
              }`}
            >
              <MicOff className="w-5 h-5" />
            </button>

            {/* Send voice button */}
            <button
              type="button"
              onClick={onSubmitVoice}
              disabled={!currentTranscript || isLoading}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                currentTranscript && !isLoading
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : darkMode
                    ? 'bg-white/10 text-white/30'
                    : 'bg-gray-100 text-gray-300'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SandboxChatInterface;
