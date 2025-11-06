/**
 * useVoicePractice Hook
 * 
 * Custom React hook for managing voice practice sessions with ElevenLabs Conversational AI.
 * Handles connection lifecycle, transcript management, and state updates.
 * 
 * @module useVoicePractice
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import elevenLabsService from '../services/elevenLabsConversationService';

/**
 * Generate agent prompt for voice practice scenario
 * @param {string} gradeLevel - Grade level (e.g., '6', 'k2', '3-5')
 * @param {Object} scenario - Scenario object with title and context
 * @returns {string} Formatted agent prompt
 */
function generateAgentPrompt(gradeLevel, scenario) {
  const scenarioTitle = scenario?.title || 'Voice Practice';
  const scenarioContext = scenario?.context || scenario?.description || 'Practicing social skills';
  
  return `You are a warm, encouraging social skills coach for a grade ${gradeLevel} student.

CURRENT SCENARIO: ${scenarioTitle}
CONTEXT: ${scenarioContext}

YOUR ROLE:
- Guide the student through practicing this social situation
- Speak naturally like you are having a real conversation
- Use age-appropriate language for grade ${gradeLevel}
- Be patient and give them time to think
- Celebrate their efforts and progress
- Gently correct if they make social mistakes
- Keep responses concise, one to three sentences
- Ask open-ended questions to encourage practice

CONVERSATION FLOW:
1. Welcome them warmly and introduce the scenario
2. Set up the role-play situation clearly
3. Engage in five to eight back-and-forth exchanges
4. Provide specific, actionable feedback
5. End with encouragement and key takeaways

Remember: You are having a voice conversation, not writing text. Speak naturally!`;
}

/**
 * Custom hook for managing voice practice sessions
 * 
 * @param {Object} options - Hook options
 * @param {Object} options.scenario - Scenario object with title, context/description
 * @param {string} options.gradeLevel - Grade level (e.g., '6', 'k2', '3-5', '6-8', '9-12')
 * @returns {Object} Hook return value
 * @returns {boolean} returns.isConnected - Whether connected to conversation
 * @returns {boolean} returns.isListening - Whether user is currently speaking/listening
 * @returns {boolean} returns.isSpeaking - Whether agent is currently speaking
 * @returns {Array} returns.transcript - Array of message objects { role, text, timestamp }
 * @returns {string|null} returns.error - Current error message or null
 * @returns {Function} returns.startVoicePractice - Function to start voice practice session
 * @returns {Function} returns.endVoicePractice - Function to end voice practice session
 * 
 * @example
 * ```jsx
 * const {
 *   isConnected,
 *   isListening,
 *   isSpeaking,
 *   transcript,
 *   error,
 *   startVoicePractice,
 *   endVoicePractice
 * } = useVoicePractice({
 *   scenario: { title: 'Starting Conversations', context: 'Practice saying hello' },
 *   gradeLevel: '6'
 * });
 * ```
 */
export function useVoicePractice({ scenario, gradeLevel = '6' }) {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState(null);

  // Refs for cleanup
  const isInitializedRef = useRef(false);
  const eventHandlersRef = useRef([]);

  /**
   * Start voice practice session
   */
  const startVoicePractice = useCallback(async () => {
    try {
      // Reset error state
      setError(null);

      // Request microphone permission
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach(track => track.stop());
      } catch (micError) {
        if (micError.name === 'NotAllowedError' || micError.name === 'PermissionDeniedError') {
          throw new Error('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (micError.name === 'NotFoundError' || micError.name === 'DevicesNotFoundError') {
          throw new Error('No microphone found. Please connect a microphone and try again.');
        } else {
          throw new Error(`Microphone access error: ${micError.message}`);
        }
      }

      // Generate custom prompt
      const customPrompt = generateAgentPrompt(gradeLevel, scenario);

      // Initialize service
      await elevenLabsService.initialize(null, customPrompt);

      // Set up event handlers
      const handleMessage = ({ message, source }) => {
        setTranscript(prev => [
          ...prev,
          {
            role: source === 'user' ? 'user' : 'ai',
            text: message,
            timestamp: new Date(),
          },
        ]);
      };

      const handleModeChange = ({ mode }) => {
        // Mode can be 'speaking' (user speaking) or 'listening' (agent speaking/waiting)
        // When mode is 'speaking', user is speaking (isListening = true)
        // When mode is 'listening', agent is speaking or waiting (isSpeaking = true)
        setIsListening(mode === 'speaking');
        setIsSpeaking(mode === 'listening');
      };

      const handleStatusChange = ({ status }) => {
        // Update connection status based on status change
        if (status === 'connected') {
          setIsConnected(true);
        } else if (status === 'disconnected' || status === 'disconnecting') {
          setIsConnected(false);
          setIsListening(false);
          setIsSpeaking(false);
        }
      };

      const handleConnect = () => {
        setIsConnected(true);
        setError(null);
      };

      const handleDisconnect = () => {
        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
      };

      const handleError = (errorMessage, context) => {
        setError(errorMessage || 'An error occurred during the conversation.');
        console.error('Voice practice error:', errorMessage, context);
      };

      // Register event handlers
      elevenLabsService.on('onConnect', handleConnect);
      elevenLabsService.on('onDisconnect', handleDisconnect);
      elevenLabsService.on('onMessage', handleMessage);
      elevenLabsService.on('onModeChange', handleModeChange);
      elevenLabsService.on('onStatusChange', handleStatusChange);
      elevenLabsService.on('onError', handleError);

      // Store handlers for cleanup
      eventHandlersRef.current = [
        { event: 'onConnect', handler: handleConnect },
        { event: 'onDisconnect', handler: handleDisconnect },
        { event: 'onMessage', handler: handleMessage },
        { event: 'onModeChange', handler: handleModeChange },
        { event: 'onStatusChange', handler: handleStatusChange },
        { event: 'onError', handler: handleError },
      ];

      // Connect to conversation
      await elevenLabsService.connect();

      isInitializedRef.current = true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Failed to start voice practice:', err);
      
      // Reset states on error
      setIsConnected(false);
      setIsListening(false);
      setIsSpeaking(false);
    }
  }, [scenario, gradeLevel]);

  /**
   * End voice practice session
   */
  const endVoicePractice = useCallback(async () => {
    try {
      // Remove all event handlers
      eventHandlersRef.current.forEach(({ event, handler }) => {
        elevenLabsService.off(event, handler);
      });
      eventHandlersRef.current = [];

      // End conversation
      await elevenLabsService.endConversation();

      // Reset states
      setIsConnected(false);
      setIsListening(false);
      setIsSpeaking(false);
      setTranscript([]);
      setError(null);
      isInitializedRef.current = false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Failed to end voice practice:', err);
      
      // Reset states even on error
      setIsConnected(false);
      setIsListening(false);
      setIsSpeaking(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up event handlers
      eventHandlersRef.current.forEach(({ event, handler }) => {
        try {
          elevenLabsService.off(event, handler);
        } catch (err) {
          console.error('Error removing event handler:', err);
        }
      });
      eventHandlersRef.current = [];

      // End conversation if still active
      if (isInitializedRef.current) {
        elevenLabsService.endConversation().catch(err => {
          console.error('Error ending conversation on unmount:', err);
        });
      }
    };
  }, []);

  return {
    isConnected,
    isListening,
    isSpeaking,
    transcript,
    error,
    startVoicePractice,
    endVoicePractice,
  };
}

export default useVoicePractice;

