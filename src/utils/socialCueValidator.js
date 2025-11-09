import contentService from '../services/contentService';

class SocialCueValidator {
  constructor() {
    this.logs = [];
    this.startTime = Date.now();
  }

  /**
   * Validate individual AI response
   */
  validateResponse(response, gradeLevel) {
    const validation = contentService.validateResponse(response, gradeLevel);

    const log = {
      timestamp: Date.now() - this.startTime,
      response,
      gradeLevel,
      ...validation
    };

    this.logs.push(log);

    // Console output with color coding
    if (validation.errors.length > 0) {
      console.error('❌ VALIDATION FAILED:', {
        response,
        errors: validation.errors,
        wordCount: validation.wordCount,
        limit: validation.limit
      });
    } else if (!validation.hasTurnSignal) {
      console.warn('⚠️ WARNING: Missing turn signal', response);
    } else {
      console.log('✅ VALID:', response);
    }

    return validation;
  }

  /**
   * Validate entire session against targets
   */
  validateSession() {
    const sessionLength = (Date.now() - this.startTime) / 1000; // seconds
    const totalExchanges = this.logs.length;
    const failedValidations = this.logs.filter(log => log.errors.length > 0).length;
    const avgWordCount = this.logs.reduce((sum, log) => sum + log.wordCount, 0) / totalExchanges;

    const target = contentService.timingRules.sessionTargets;

    const validation = {
      sessionLength,
      totalExchanges,
      failedValidations,
      successRate: ((totalExchanges - failedValidations) / totalExchanges * 100).toFixed(1),
      avgWordCount: avgWordCount.toFixed(1),

      // Check against targets (for 10-min session)
      meetsExchangeTarget: totalExchanges >= target.totalExchanges.min,
      exchangeTargetDiff: totalExchanges - target.totalExchanges.target,

      // Estimate for 10 minutes
      projectedExchanges: Math.round((totalExchanges / sessionLength) * 600),

      // Issues
      commonIssues: this.getCommonIssues()
    };

    console.log('📊 SESSION VALIDATION:', validation);

    return validation;
  }

  /**
   * Get most common issues
   */
  getCommonIssues() {
    const issues = {};

    this.logs.forEach(log => {
      log.errors.forEach(error => {
        issues[error] = (issues[error] || 0) + 1;
      });
    });

    return Object.entries(issues)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([issue, count]) => ({ issue, count }));
  }

  /**
   * Export full report
   */
  exportReport() {
    return {
      summary: this.validateSession(),
      logs: this.logs,
      exportTime: new Date().toISOString()
    };
  }
}

export default SocialCueValidator;

