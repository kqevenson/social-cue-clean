/**
 * ElevenLabs Conversational AI Service
 * 
 * Service for managing real-time voice conversations with ElevenLabs agents.
 * Handles connection lifecycle, audio input/output, and error recovery.
 * 
 * @module elevenLabsService
 */

import { Conversation } from '@11labs/client';
import config from '../config/elevenlabs.config.js';

/**
 * ElevenLabs Conversational AI Service Class
 */
class ElevenLabsConversationService {
  constructor() {
    this.conversation = null;
    this.isConnected = false;
    this.isInitialized = false;
    this.customPrompt = null;
    this.eventHandlers = {
      onConnect: [],
      onDisconnect: [],
      onMessage: [],
      onError: [],
      onAudioInput: [],
      onAudioOutput: [],
      onModeChange: [],
      onStatusChange: [],
    };
    this.status = {
      connected: false,
      initialized: false,
      agentId: null,
      error: null,
      conversationId: null,
      mode: null,
    };
  }

  /**
   * Validate API key and configuration
   */
  validateConfig() {
    if (!config.apiKey) {
      throw new Error('ElevenLabs API key is not configured. Please set VITE_ELEVENLABS_API_KEY in your .env file.');
    }

    if (!config.apiKey.startsWith('sk_')) {
      throw new Error('Invalid ElevenLabs API key format. API key should start with "sk_".');
    }

    if (!config.agentId) {
      throw new Error('ElevenLabs Agent ID is not configured. Please set VITE_ELEVENLABS_AGENT_ID in your .env file.');
    }

    if (!config.agentId.startsWith('agent_')) {
      throw new Error('Invalid ElevenLabs Agent ID format. Agent ID should start with "agent_".');
    }

    return true;
  }

  /**
   * Check browser compatibility
   */
  checkBrowserCompatibility() {
    const issues = [];

    // Check for WebRTC support
    if (!window.RTCPeerConnection) {
      issues.push('WebRTC is not supported in this browser.');
    }

    // Check for getUserMedia support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      issues.push('Microphone access is not supported in this browser.');
    }

    // Check for AudioContext support
    if (!window.AudioContext && !window.webkitAudioContext) {
      issues.push('Web Audio API is not supported in this browser.');
    }

    if (issues.length > 0) {
      throw new Error(`Browser compatibility issues: ${issues.join(' ')}`);
    }

    return true;
  }

  /**
   * Request microphone permission
   */
  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      } else {
        throw new Error(`Microphone access error: ${error.message}`);
      }
    }
  }

  /**
   * Initialize conversation with agent
   * @param {string} agentId - Agent ID (optional, uses config if not provided)
   * @param {string} customPrompt - Custom prompt for the agent (optional)
   * @returns {Promise<void>}
   */
  async initialize(agentId = null, customPrompt = null) {
    try {
      // Validate configuration
      this.validateConfig();

      // Check browser compatibility
      this.checkBrowserCompatibility();

      // Request microphone permission
      await this.requestMicrophonePermission();

      const agentIdToUse = agentId || config.agentId;
      this.customPrompt = customPrompt;

      // Store initialization parameters - actual session starts with connect()
      this.isInitialized = true;
      this.status.initialized = true;
      this.status.agentId = agentIdToUse;

      return Promise.resolve();
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Connect to conversation (starts the session)
   * @returns {Promise<void>}
   */
  async connect() {
    if (!this.isInitialized) {
      throw new Error('Conversation not initialized. Call initialize() first.');
    }

    if (this.isConnected && this.conversation) {
      console.warn('Already connected to conversation.');
      return Promise.resolve();
    }

    try {
      const agentId = this.status.agentId || config.agentId;

      // Start session using Conversation.startSession
      this.conversation = await Conversation.startSession({
        apiKey: config.apiKey,
        agentId: agentId,
        voiceSettings: config.voiceSettings,
        conversationConfig: config.conversationConfig,
        customPrompt: this.customPrompt,
        onConnect: ({ conversationId }) => {
          this.isConnected = true;
          this.status.connected = true;
          this.status.conversationId = conversationId;
          this.status.error = null;
          this.eventHandlers.onConnect.forEach(handler => {
            try {
              handler({ conversationId });
            } catch (error) {
              console.error('Error in onConnect handler:', error);
            }
          });
        },
        onDisconnect: () => {
          this.isConnected = false;
          this.status.connected = false;
          this.eventHandlers.onDisconnect.forEach(handler => {
            try {
              handler();
            } catch (error) {
              console.error('Error in onDisconnect handler:', error);
            }
          });
        },
        onMessage: ({ message, source }) => {
          this.eventHandlers.onMessage.forEach(handler => {
            try {
              handler({ message, source });
            } catch (error) {
              console.error('Error in onMessage handler:', error);
            }
          });
        },
        onError: (message, context) => {
          this.handleError(new Error(message));
          this.eventHandlers.onError.forEach(handler => {
            try {
              handler(message, context);
            } catch (err) {
              console.error('Error in onError handler:', err);
            }
          });
        },
        onModeChange: ({ mode }) => {
          this.status.mode = mode;
          this.eventHandlers.onModeChange.forEach(handler => {
            try {
              handler({ mode });
            } catch (error) {
              console.error('Error in onModeChange handler:', error);
            }
          });
        },
        onStatusChange: ({ status }) => {
          this.status.connected = status === 'connected';
          this.eventHandlers.onStatusChange.forEach(handler => {
            try {
              handler({ status });
            } catch (error) {
              console.error('Error in onStatusChange handler:', error);
            }
          });
        },
        onAudio: (base64Audio) => {
          this.eventHandlers.onAudioOutput.forEach(handler => {
            try {
              handler(base64Audio);
            } catch (error) {
              console.error('Error in onAudioOutput handler:', error);
            }
          });
        },
      });

      // The connection is established when startSession resolves
      this.isConnected = true;
      this.status.connected = true;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Send message to agent
   * @param {string} text - Message text
   * @returns {Promise<void>}
   */
  async sendMessage(text) {
    if (!this.conversation) {
      throw new Error('Conversation not initialized. Call initialize() and connect() first.');
    }

    if (!this.isConnected) {
      throw new Error('Not connected to conversation. Call connect() first.');
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Message text is required and must be a non-empty string.');
    }

    try {
      // Use sendUserMessage method from the conversation instance
      if (typeof this.conversation.sendUserMessage === 'function') {
        this.conversation.sendUserMessage(text.trim());
      } else {
        throw new Error('sendUserMessage not available on conversation instance.');
      }
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * End conversation
   * @returns {Promise<void>}
   */
  async endConversation() {
    if (!this.conversation) {
      return Promise.resolve();
    }

    try {
      if (this.isConnected && typeof this.conversation.endSession === 'function') {
        await this.conversation.endSession();
      }
      this.conversation = null;
      this.isConnected = false;
      this.isInitialized = false;
      this.status.connected = false;
      this.status.initialized = false;
      this.status.agentId = null;
      this.status.conversationId = null;
      this.status.mode = null;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get current status
   * @returns {Object} Status object
   */
  getStatus() {
    return {
      ...this.status,
      isConnected: this.isConnected,
      isInitialized: this.isInitialized,
      customPrompt: this.customPrompt,
    };
  }

  /**
   * Add event handler
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   */
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      throw new Error(`Unknown event: ${event}. Available events: ${Object.keys(this.eventHandlers).join(', ')}`);
    }

    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function.');
    }

    this.eventHandlers[event].push(handler);
  }

  /**
   * Remove event handler
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function to remove
   */
  off(event, handler) {
    if (!this.eventHandlers[event]) {
      return;
    }

    const index = this.eventHandlers[event].indexOf(handler);
    if (index > -1) {
      this.eventHandlers[event].splice(index, 1);
    }
  }

  /**
   * Handle errors
   * @param {Error} error - Error object
   */
  handleError(error) {
    let errorMessage = 'An unknown error occurred.';

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    // Handle specific error types
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('NetworkError')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      errorMessage = 'Authentication failed. Please check your API key.';
    } else if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
      errorMessage = 'Access denied. Please check your API key permissions.';
    } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
    } else if (errorMessage.includes('500') || errorMessage.includes('server')) {
      errorMessage = 'Server error. Please try again later.';
    }

    this.status.error = errorMessage;
    console.error('ElevenLabs Service Error:', error);

    return errorMessage;
  }
}

// Create and export singleton instance
const elevenLabsService = new ElevenLabsConversationService();

export default elevenLabsService;
export { ElevenLabsConversationService };
