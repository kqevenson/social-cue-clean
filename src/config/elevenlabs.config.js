/**
 * ElevenLabs Configuration
 * 
 * Configuration for ElevenLabs Conversational AI SDK
 * 
 * @module elevenlabsConfig
 */

const config = {
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
  agentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID,
  
  voiceSettings: {
    stability: 0.75,
    similarity_boost: 0.8,
    style: 0.3,
    use_speaker_boost: true,
  },
  
  conversationConfig: {
    maxDuration: 600, // Maximum conversation duration in seconds (10 minutes)
    silenceThreshold: 3000, // Silence threshold in milliseconds (3 seconds)
    interruptionThreshold: 1500, // Interruption threshold in milliseconds (1.5 seconds)
  },
};

// Validate configuration
if (!config.apiKey) {
  console.warn('⚠️ VITE_ELEVENLABS_API_KEY is not set');
}

if (!config.agentId) {
  console.warn('⚠️ VITE_ELEVENLABS_AGENT_ID is not set');
}

export default config;

