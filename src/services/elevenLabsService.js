import { ElevenLabsClient } from 'elevenlabs';

if (!import.meta.env.VITE_ELEVENLABS_API_KEY) {
  console.error('VITE_ELEVENLABS_API_KEY is not set!');
}

const elevenlabs = new ElevenLabsClient({
  apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY,
});

const VOICE_IDS = {
  'k-2': 'pNInz6obpgDQGcFmaJgB',
  '3-5': 'EXAVITQu4vr4xnSDxMaL',
  '6-8': '21m00Tcm4TlvDq8ikWAM',
  '9-12': 'AZnzlk1XvdvUeBnXmlld',
};

export const textToSpeechElevenLabs = async (text, gradeLevel = '6-8') => {
  try {
    const voiceId = VOICE_IDS[gradeLevel] || VOICE_IDS['6-8'];

    const audio = await elevenlabs.generate({
      voice: voiceId,
      text,
      model_id: 'eleven_monolingual_v1',
    });

    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }

    const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);

    return audioUrl;
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    throw error;
  }
};

export const getVoiceSettings = (gradeLevel) => {
  const settings = {
    'k-2': { stability: 0.75, similarity_boost: 0.75 },
    '3-5': { stability: 0.7, similarity_boost: 0.75 },
    '6-8': { stability: 0.65, similarity_boost: 0.8 },
    '9-12': { stability: 0.6, similarity_boost: 0.8 },
  };

  return settings[gradeLevel] || settings['6-8'];
};
