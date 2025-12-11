/**
 * Hume EVI (Empathic Voice Interface) Service
 * Real-time voice listening with transcription and emotion analysis
 */

import { apiPath } from '../utils/apiBase';

const HUME_EVI_SOCKET_URL = 'wss://api.hume.ai/v0/evi/chat';

class HumeEviService {
  constructor() {
    this.socket = null;
    this.mediaRecorder = null;
    this.audioStream = null;
    this.isConnected = false;
    this.accessToken = null;

    // Callbacks
    this.onTranscript = null;
    this.onEmotion = null;
    this.onError = null;
    this.onConnectionChange = null;
  }

  /**
   * Get access token from backend
   */
  async getAccessToken() {
    try {
      const response = await fetch(apiPath('/api/hume/access-token'));
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || 'Failed to get Hume access token');
      }
      const data = await response.json();
      return data.accessToken;
    } catch (error) {
      console.error('❌ Failed to get Hume access token:', error);
      throw error;
    }
  }

  /**
   * Initialize microphone stream
   */
  async initMicrophone() {
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      console.log('🎤 Microphone initialized');
      return true;
    } catch (error) {
      console.error('❌ Microphone access denied:', error);
      if (this.onError) {
        this.onError({ type: 'microphone', message: 'Microphone access denied' });
      }
      return false;
    }
  }

  /**
   * Connect to Hume EVI WebSocket
   */
  async connect() {
    try {
      // Get access token
      this.accessToken = await this.getAccessToken();

      // Initialize microphone
      const micReady = await this.initMicrophone();
      if (!micReady) return false;

      // Connect to WebSocket
      const wsUrl = `${HUME_EVI_SOCKET_URL}?access_token=${this.accessToken}`;
      this.socket = new WebSocket(wsUrl);

      return new Promise((resolve, reject) => {
        this.socket.onopen = () => {
          console.log('🔌 Connected to Hume EVI');
          this.isConnected = true;
          if (this.onConnectionChange) {
            this.onConnectionChange(true);
          }

          // Start sending audio
          this.startAudioStream();
          resolve(true);
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.socket.onerror = (error) => {
          console.error('❌ Hume EVI WebSocket error:', error);
          if (this.onError) {
            this.onError({ type: 'websocket', message: 'Connection error' });
          }
          reject(error);
        };

        this.socket.onclose = () => {
          console.log('🔌 Disconnected from Hume EVI');
          this.isConnected = false;
          if (this.onConnectionChange) {
            this.onConnectionChange(false);
          }
        };
      });
    } catch (error) {
      console.error('❌ Failed to connect to Hume EVI:', error);
      if (this.onError) {
        this.onError({ type: 'connection', message: error.message });
      }
      return false;
    }
  }

  /**
   * Start streaming audio to Hume EVI
   */
  startAudioStream() {
    if (!this.audioStream || !this.socket) return;

    // Create MediaRecorder with appropriate format
    const options = { mimeType: 'audio/webm;codecs=opus' };

    try {
      this.mediaRecorder = new MediaRecorder(this.audioStream, options);
    } catch (e) {
      // Fallback for Safari
      this.mediaRecorder = new MediaRecorder(this.audioStream);
    }

    this.mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0 && this.socket?.readyState === WebSocket.OPEN) {
        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result.split(',')[1];
          this.socket.send(JSON.stringify({
            type: 'audio_input',
            data: base64Audio
          }));
        };
        reader.readAsDataURL(event.data);
      }
    };

    // Send audio chunks every 100ms
    this.mediaRecorder.start(100);
    console.log('🎙️ Audio streaming started');
  }

  /**
   * Handle incoming messages from Hume EVI
   */
  handleMessage(message) {
    console.log('📨 Hume EVI message:', message.type);

    switch (message.type) {
      case 'user_message':
        // User speech transcription
        if (message.message?.content) {
          const transcript = message.message.content;
          console.log('🗣️ Transcript:', transcript);

          if (this.onTranscript) {
            this.onTranscript(transcript);
          }
        }

        // Prosody/emotion data
        if (message.models?.prosody?.scores) {
          const emotions = message.models.prosody.scores;
          this.processEmotions(emotions);
        }
        break;

      case 'assistant_message':
        // We don't need assistant responses for coaching mode
        // Just analyzing user speech
        break;

      case 'user_interruption':
        console.log('👋 User interruption detected');
        break;

      case 'error':
        console.error('❌ Hume EVI error:', message);
        if (this.onError) {
          this.onError({ type: 'api', message: message.message || 'Unknown error' });
        }
        break;
    }
  }

  /**
   * Process emotion scores from prosody
   */
  processEmotions(scores) {
    // Sort emotions by score
    const sortedEmotions = Object.entries(scores)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score);

    const topEmotions = sortedEmotions.slice(0, 5);
    const dominantEmotion = sortedEmotions[0];

    console.log('😊 Emotions:', topEmotions.map(e => `${e.name}: ${(e.score * 100).toFixed(1)}%`).join(', '));

    if (this.onEmotion) {
      this.onEmotion({
        dominant: dominantEmotion,
        top: topEmotions,
        all: scores
      });
    }
  }

  /**
   * Disconnect from Hume EVI
   */
  disconnect() {
    // Stop media recorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.mediaRecorder = null;

    // Stop audio stream
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
    }
    this.audioStream = null;

    // Close WebSocket
    if (this.socket) {
      this.socket.close();
    }
    this.socket = null;

    this.isConnected = false;
    console.log('🔌 Hume EVI disconnected');
  }
}

// Singleton instance
const humeEviService = new HumeEviService();

export default humeEviService;
export { HumeEviService };
