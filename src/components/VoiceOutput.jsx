import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Loader } from 'lucide-react';
import { textToSpeechElevenLabs } from '../services/elevenLabsService';

const VoiceOutput = ({ text, autoPlay = true, gradeLevel = '6-8', onComplete, onStart }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (text && autoPlay) {
      playAudio();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current = null;
      }
    };
  }, [text]);

  const playAudio = async () => {
    try {
      if (!text) return;

      setIsLoading(true);
      setError(null);

      if (onStart) onStart();

      const audioUrl = await textToSpeechElevenLabs(text, gradeLevel);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
        if (onComplete) onComplete();
      };

      audio.onerror = (e) => {
        setError('Failed to play audio');
        setIsLoading(false);
        setIsPlaying(false);
        console.error('Audio playback error:', e);
      };

      await audio.play();
    } catch (err) {
      console.error('ElevenLabs error:', err);
      setError(err.message || 'Failed to generate speech');
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="voice-output-controls">
      <button
        onClick={isPlaying ? stopAudio : playAudio}
        disabled={isLoading}
        className="voice-control-button"
        aria-label={isPlaying ? 'Stop speaking' : 'Play audio'}
      >
        {isLoading ? (
          <Loader className="w-5 h-5 animate-spin" />
        ) : isPlaying ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
        <span>{isLoading ? 'Loading...' : isPlaying ? 'Stop' : 'Play'}</span>
      </button>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default VoiceOutput;
