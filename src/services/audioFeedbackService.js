class AudioFeedbackService {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = {
      yourTurn: this.createToneSound(440, 0.1), // A4
      thinking: this.createToneSound(330, 0.1), // E4
      correct: this.createToneSound(554.37, 0.15), // C#5
      helpNeeded: this.createToneSound(220, 0.2) // A3
    };
  }

  createToneSound(frequency, duration) {
    return () => {
      if (!this.audioContext) return;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      const startTime = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
  }

  playYourTurn() {
    this.sounds.yourTurn();
  }

  playThinking() {
    this.sounds.thinking();
  }

  playCorrect() {
    this.sounds.correct();
  }

  playHelpNeeded() {
    this.sounds.helpNeeded();
  }
}

export default new AudioFeedbackService();
