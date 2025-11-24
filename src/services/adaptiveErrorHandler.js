const adaptiveErrorHandler = {
  fallbackMode: false,

  classifyError() {
    return "general";
  },

  getUserFriendlyMessage() {
    return "Something went wrong. Using simple lesson mode.";
  },

  resetFallbackMode() {
    this.fallbackMode = false;
  },

  resumeInterruptedSession() {
    return null;
  },

  async retryOperation(fn) {
    try {
      return await fn();
    } catch (err) {
      this.fallbackMode = true;
      throw err;
    }
  },

  handleSessionInterruption() {}
};

export default adaptiveErrorHandler;
