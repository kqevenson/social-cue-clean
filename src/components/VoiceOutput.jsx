import React, { useEffect } from 'react';
import { useVoice } from '../hooks/useVoiceConversation';
import { generateVoicePrompt } from '../services/CleanVoiceService';

const VoiceOutput = ({
  response,
  mode = 'coach', // 'coach', 'peer', 'feedback'
  gradeLevel = '6-8',
  persona = '', // optional: 'shy', 'confident', etc.
}) => {
  const { speak } = useVoice();

  useEffect(() => {
    const speakResponse = async () => {
      if (!response) return;

      try {
        const voicePrompt = await generateVoicePrompt({
          transcript: response,
          phase: mode,
          gradeLevel,
          persona,
        });

        // Truncate to ~200 characters to avoid ElevenLabs errors
        const safePrompt = voicePrompt?.slice(0, 200);

        speak(`Speaking: ${safePrompt}`);
      } catch (error) {
        console.error('❌ Failed to generate voice prompt:', error);

        // Fallback to direct transcript
        speak(`Speaking: ${response.slice(0, 200)}`);
      }
    };

    speakResponse();
  }, [response, mode, gradeLevel, persona, speak]);

  return null;
};

export default VoiceOutput;
