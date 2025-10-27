// Voice Practice Progress Tracking Service

class VoiceProgressService {
  constructor() {
    this.storageKey = 'socialcue_voice_progress';
    this.sessionsKey = 'voicePracticeSessions';
  }
  
  // Get all voice progress data
  getProgress() {
    const data = localStorage.getItem(this.storageKey);
    if (!data) {
      return this.initializeProgress();
    }
    return JSON.parse(data);
  }
  
  // Initialize progress structure
  initializeProgress() {
    const defaultProgress = {
      totalSessions: 0,
      totalMinutes: 0,
      totalPoints: 0,
      scenariosCompleted: [],
      streak: 0,
      lastPracticeDate: null,
      stats: {
        byDifficulty: {
          beginner: 0,
          intermediate: 0,
          advanced: 0
        },
        byCategory: {},
        averageSessionLength: 0,
        longestStreak: 0
      },
      milestones: {
        firstSession: false,
        tenSessions: false,
        thirtyMinutes: false,
        hundredMinutes: false,
        sevenDayStreak: false,
        allBeginner: false,
        allIntermediate: false
      }
    };
    
    this.saveProgress(defaultProgress);
    return defaultProgress;
  }
  
  // Save progress
  saveProgress(progress) {
    localStorage.setItem(this.storageKey, JSON.stringify(progress));
  }
  
  // Record a completed session
  recordSession(sessionData) {
    const progress = this.getProgress();
    const {
      scenarioId,
      scenarioTitle,
      difficulty,
      category,
      durationMinutes,
      points,
      completedAt
    } = sessionData;
    
    // Update totals
    progress.totalSessions += 1;
    progress.totalMinutes += durationMinutes || 0;
    progress.totalPoints += points || 0;
    
    // Track scenario completion
    if (!progress.scenariosCompleted.includes(scenarioId)) {
      progress.scenariosCompleted.push(scenarioId);
    }
    
    // Update stats by difficulty
    const difficultyKey = difficulty.toLowerCase();
    if (progress.stats.byDifficulty[difficultyKey] !== undefined) {
      progress.stats.byDifficulty[difficultyKey] += 1;
    }
    
    // Update stats by category
    if (category) {
      if (!progress.stats.byCategory[category]) {
        progress.stats.byCategory[category] = 0;
      }
      progress.stats.byCategory[category] += 1;
    }
    
    // Update average session length
    progress.stats.averageSessionLength = 
      progress.totalSessions > 0 
        ? Math.round(progress.totalMinutes / progress.totalSessions) 
        : 0;
    
    // Update streak
    progress.streak = this.calculateStreak(progress, completedAt);
    if (progress.streak > progress.stats.longestStreak) {
      progress.stats.longestStreak = progress.streak;
    }
    
    // Update last practice date
    progress.lastPracticeDate = completedAt;
    
    // Check and unlock milestones
    this.checkMilestones(progress);
    
    // Save
    this.saveProgress(progress);
    
    // Also save to sessions history
    this.saveSessionToHistory(sessionData);
    
    return progress;
  }
  
  // Calculate current streak
  calculateStreak(progress, currentDate) {
    if (!progress.lastPracticeDate) return 1;
    
    const lastDate = new Date(progress.lastPracticeDate);
    const today = new Date(currentDate);
    
    // Reset hours to compare dates only
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Same day - maintain streak
      return progress.streak > 0 ? progress.streak : 1;
    } else if (diffDays === 1) {
      // Consecutive day - increment streak
      return progress.streak + 1;
    } else {
      // Streak broken - reset to 1
      return 1;
    }
  }
  
  // Check and unlock milestones
  checkMilestones(progress) {
    // First session
    if (progress.totalSessions >= 1 && !progress.milestones.firstSession) {
      progress.milestones.firstSession = true;
      this.showMilestoneNotification('First Voice Practice! 🎉');
    }
    
    // Ten sessions
    if (progress.totalSessions >= 10 && !progress.milestones.tenSessions) {
      progress.milestones.tenSessions = true;
      this.showMilestoneNotification('10 Voice Sessions! 🌟');
    }
    
    // 30 minutes
    if (progress.totalMinutes >= 30 && !progress.milestones.thirtyMinutes) {
      progress.milestones.thirtyMinutes = true;
      this.showMilestoneNotification('30 Minutes of Practice! ⏱️');
    }
    
    // 100 minutes
    if (progress.totalMinutes >= 100 && !progress.milestones.hundredMinutes) {
      progress.milestones.hundredMinutes = true;
      this.showMilestoneNotification('100 Minutes of Practice! 🏆');
    }
    
    // 7 day streak
    if (progress.streak >= 7 && !progress.milestones.sevenDayStreak) {
      progress.milestones.sevenDayStreak = true;
      this.showMilestoneNotification('7 Day Streak! 🔥');
    }
    
    // All beginner scenarios
    const beginnerCount = progress.stats.byDifficulty.beginner;
    if (beginnerCount >= 3 && !progress.milestones.allBeginner) {
      progress.milestones.allBeginner = true;
      this.showMilestoneNotification('Beginner Master! 📚');
    }
    
    // All intermediate scenarios
    const intermediateCount = progress.stats.byDifficulty.intermediate;
    if (intermediateCount >= 3 && !progress.milestones.allIntermediate) {
      progress.milestones.allIntermediate = true;
      this.showMilestoneNotification('Intermediate Master! 🎓');
    }
  }
  
  // Show milestone notification (can be enhanced with toast)
  showMilestoneNotification(message) {
    console.log('🎊 Milestone:', message);
    // TODO: Show actual notification/toast in UI
  }
  
  // Save session to history
  saveSessionToHistory(sessionData) {
    const sessions = JSON.parse(localStorage.getItem(this.sessionsKey) || '[]');
    
    const sessionRecord = {
      ...sessionData,
      id: `session_${Date.now()}`,
      completedAt: sessionData.completedAt || new Date().toISOString()
    };
    
    sessions.unshift(sessionRecord);
    
    // Keep last 50 sessions
    localStorage.setItem(this.sessionsKey, JSON.stringify(sessions.slice(0, 50)));
  }
  
  // Get session history
  getSessionHistory(limit = 10) {
    const sessions = JSON.parse(localStorage.getItem(this.sessionsKey) || '[]');
    return sessions.slice(0, limit);
  }
  
  // Get stats for date range
  getStatsForRange(startDate, endDate) {
    const sessions = this.getSessionHistory(100);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.completedAt);
      return sessionDate >= start && sessionDate <= end;
    });
    
    return {
      sessionsCount: filteredSessions.length,
      totalMinutes: filteredSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0),
      totalPoints: filteredSessions.reduce((sum, s) => sum + (s.points || 0), 0),
      avgPoints: filteredSessions.length > 0 
        ? Math.round(filteredSessions.reduce((sum, s) => sum + (s.points || 0), 0) / filteredSessions.length)
        : 0
    };
  }
  
  // Get weekly stats (last 7 days)
  getWeeklyStats() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    return this.getStatsForRange(startDate, endDate);
  }
  
  // Get monthly stats
  getMonthlyStats() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    return this.getStatsForRange(startDate, endDate);
  }
  
  // Reset all progress (for testing)
  resetProgress() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.sessionsKey);
  }
}

export default new VoiceProgressService();
