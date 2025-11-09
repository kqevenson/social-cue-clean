import { getAllLessons, getTotalLessons } from '../content/curriculum/curriculum-index.js';

class ProgressService {
  constructor() {
    this.storageKey = 'socialcue_progress';
  }

  /**
   * Get student progress
   */
  getProgress(studentId) {
    const allProgress = this.loadProgress();
    return allProgress[studentId] || {
      completedLessons: [],
      lessonScores: {},
      totalPracticeTime: 0,
      lastPracticed: null
    };
  }

  /**
   * Mark lesson as completed
   */
  completeLesson(studentId, gradeLevel, lessonId, score) {
    if (!studentId || !gradeLevel || !lessonId) {
      console.warn('ProgressService.completeLesson called with missing data');
      return;
    }

    const progress = this.getProgress(studentId);

    const lessonKey = `${gradeLevel}-${lessonId}`;

    if (!progress.completedLessons.includes(lessonKey)) {
      progress.completedLessons.push(lessonKey);
    }

    const previousAttempts = progress.lessonScores[lessonKey]?.attempts || 0;

    progress.lessonScores[lessonKey] = {
      score,
      completedAt: new Date().toISOString(),
      attempts: previousAttempts + 1
    };

    progress.lastPracticed = new Date().toISOString();

    this.saveProgress(studentId, progress);
  }

  /**
   * Get next recommended lesson
   */
  getNextLesson(studentId, gradeLevel) {
    const progress = this.getProgress(studentId);
    const allLessons = getAllLessons(gradeLevel);

    if (!allLessons?.length) {
      return null;
    }

    const uncompleted = allLessons.find((lesson) => {
      const lessonKey = `${gradeLevel}-${lesson.id}`;
      return !progress.completedLessons.includes(lessonKey);
    });

    return uncompleted || allLessons[0];
  }

  /**
   * Get completion percentage
   */
  getCompletionRate(studentId, gradeLevel) {
    const progress = this.getProgress(studentId);
    const totalLessons = getTotalLessons(gradeLevel);

    if (!totalLessons) {
      return 0;
    }

    const completedForGrade = progress.completedLessons.filter((key) =>
      key.startsWith(`${gradeLevel}-`)
    ).length;

    return (completedForGrade / totalLessons) * 100;
  }

  /**
   * Load from localStorage
   */
  loadProgress() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to load progress:', error);
      return {};
    }
  }

  /**
   * Save to localStorage
   */
  saveProgress(studentId, progress) {
    if (!studentId) {
      console.warn('ProgressService.saveProgress called without studentId');
      return;
    }

    try {
      const allProgress = this.loadProgress();
      allProgress[studentId] = progress;
      localStorage.setItem(this.storageKey, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }
}

export default new ProgressService();

