class AIDebugger {
  constructor() {
    this.logs = [];
    this.enabled = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
  }

  /**
   * Log AI response with validation details
   */
  logResponse(response, gradeLevel, validation = { warnings: [] }) {
    if (!this.enabled) return;

    const safeResponse = String(response ?? '').trim();
    const wordCount = safeResponse.length ? safeResponse.split(/\s+/).length : 0;

    const log = {
      timestamp: new Date(),
      response: safeResponse,
      gradeLevel,
      wordCount,
      validation,
      issues: []
    };

    if (wordCount > this.getWordLimit(gradeLevel)) {
      log.issues.push(`TOO LONG: ${wordCount} words`);
    }

    if ((safeResponse.match(/\?/g) || []).length > 1) {
      log.issues.push('MULTIPLE QUESTIONS');
    }

    if (!this.hasTurnSignal(safeResponse)) {
      log.issues.push('MISSING TURN SIGNAL');
    }

    this.logs.push(log);

    if (log.issues.length > 0) {
      console.error('❌ AI Response Issues:', log);
    } else if (validation?.warnings?.length > 0) {
      console.warn('⚠️ AI Response Warnings:', log);
    } else {
      console.log('✅ AI Response OK:', log);
    }
  }

  /**
   * Log timing event
   */
  logTiming(event, duration) {
    if (!this.enabled) return;
    console.log(`⏱️ ${event}: ${duration}ms`);
  }

  /**
   * Get word limit for grade
   */
  getWordLimit(gradeLevel) {
    const limits = { 'K-2': 8, '3-5': 12, '6-8': 15, '9-12': 20 };
    return limits[gradeLevel] || 15;
  }

  /**
   * Check if response has turn signal
   */
  hasTurnSignal(response) {
    const signals = ['Your turn', 'Go ahead', 'Now you try', 'What would you say'];
    return signals.some((signal) => response.includes(signal));
  }

  /**
   * Export logs for analysis
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const totalResponses = this.logs.length;
    if (totalResponses === 0) {
      return {
        totalResponses: 0,
        responsesWithIssues: 0,
        successRate: '100.0',
        avgWordCount: '0.0',
        commonIssues: []
      };
    }

    const responsesWithIssues = this.logs.filter((log) => log.issues.length > 0).length;
    const avgWordCount = this.logs.reduce((sum, log) => sum + log.wordCount, 0) / totalResponses;

    return {
      totalResponses,
      responsesWithIssues,
      successRate: ((totalResponses - responsesWithIssues) / totalResponses * 100).toFixed(1),
      avgWordCount: avgWordCount.toFixed(1),
      commonIssues: this.getCommonIssues()
    };
  }

  /**
   * Get most common issues
   */
  getCommonIssues() {
    const issueCounts = {};

    this.logs.forEach((log) => {
      log.issues.forEach((issue) => {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      });
    });

    return Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));
  }
}

export default new AIDebugger();
