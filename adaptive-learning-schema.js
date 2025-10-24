// Adaptive Learning System - Data Schema Definitions
// This file contains all data structure definitions for the adaptive learning system

/**
 * Difficulty levels for adaptive learning (1-5 scale)
 */
export const DIFFICULTY_LEVELS = {
  BEGINNER: 1,      // K-2 grade level, basic concepts
  ELEMENTARY: 2,     // 3-5 grade level, simple scenarios
  INTERMEDIATE: 3,   // 6-8 grade level, moderate complexity
  ADVANCED: 4,       // 9-12 grade level, complex situations
  EXPERT: 5          // Adult level, sophisticated scenarios
};

/**
 * Performance metrics for evaluating learner responses
 */
export const PERFORMANCE_METRICS = {
  RESPONSE_TIME: 'responseTime',        // Time taken to answer (seconds)
  ACCURACY: 'accuracy',                // Correctness of response (0-1)
  CONFIDENCE: 'confidence',            // Self-reported confidence (1-5)
  ENGAGEMENT: 'engagement',            // Level of engagement (1-5)
  COMPREHENSION: 'comprehension'       // Understanding level (1-5)
};

/**
 * Topic mastery levels
 */
export const MASTERY_LEVELS = {
  NOT_STARTED: 0,    // 0% mastery
  BEGINNER: 1,       // 1-25% mastery
  DEVELOPING: 2,     // 26-50% mastery
  PROFICIENT: 3,     // 51-75% mastery
  ADVANCED: 4,       // 76-90% mastery
  MASTER: 5          // 91-100% mastery
};

/**
 * Session types for tracking different learning activities
 */
export const SESSION_TYPES = {
  PRACTICE: 'practice',           // Regular practice sessions
  LESSON: 'lesson',               // Structured lessons
  ASSESSMENT: 'assessment',       // Formal assessments
  CHALLENGE: 'challenge',         // Real-world challenges
  REVIEW: 'review'                // Review sessions
};

/**
 * Challenge status for real-world practice tracking
 */
export const CHALLENGE_STATUS = {
  ACTIVE: 'active',               // Challenge is active and available
  ATTEMPTED: 'attempted',         // User has tried the challenge
  COMPLETED: 'completed',         // Challenge completed successfully
  SKIPPED: 'skipped',             // Challenge was skipped
  EXPIRED: 'expired'              // Challenge expired
};

/**
 * Learner profile schema
 */
export const LEARNER_PROFILE_SCHEMA = {
  learnerId: 'string',                    // Unique learner identifier
  userId: 'string',                       // Reference to user document
  currentLevel: 'number',                 // Current difficulty level (1-5)
  totalPoints: 'number',                  // Total points earned
  streak: 'number',                       // Current learning streak
  totalSessions: 'number',                // Total sessions completed
  badges: 'array',                        // Array of earned badges
  strengths: 'array',                     // Array of identified strengths
  needsWork: 'array',                     // Array of areas needing improvement
  preferences: 'object',                  // Learning preferences
  adaptiveSettings: 'object',             // Adaptive learning settings
  createdAt: 'timestamp',                 // Profile creation timestamp
  lastActive: 'timestamp',                // Last activity timestamp
  updatedAt: 'timestamp'                  // Last update timestamp
};

/**
 * Topic mastery schema
 */
export const TOPIC_MASTERY_SCHEMA = {
  masteryId: 'string',                    // Unique mastery record ID
  learnerId: 'string',                    // Reference to learner
  topicName: 'string',                    // Topic name (e.g., "Small Talk")
  topicId: 'string',                      // Topic identifier
  currentLevel: 'number',                // Current mastery level (0-5)
  percentComplete: 'number',              // Percentage complete (0-100)
  totalSessions: 'number',                // Sessions completed for this topic
  averageScore: 'number',                // Average score across sessions
  bestScore: 'number',                    // Best score achieved
  timeSpent: 'number',                    // Total time spent (seconds)
  lastPracticed: 'timestamp',            // Last practice session
  difficultyProgression: 'array',         // History of difficulty changes
  strengths: 'array',                     // Strengths in this topic
  weaknesses: 'array',                    // Areas needing work
  nextRecommendedLevel: 'number',         // Recommended next difficulty
  createdAt: 'timestamp',                // Record creation timestamp
  updatedAt: 'timestamp'                 // Last update timestamp
};

/**
 * Session history schema
 */
export const SESSION_HISTORY_SCHEMA = {
  sessionId: 'string',                    // Unique session identifier
  learnerId: 'string',                    // Reference to learner
  topicId: 'string',                      // Topic identifier
  topicName: 'string',                    // Topic display name
  sessionType: 'string',                  // Type of session (practice, lesson, etc.)
  difficulty: 'number',                   // Difficulty level used (1-5)
  questionsAnswered: 'array',            // Array of question responses
  totalQuestions: 'number',               // Total questions in session
  correctAnswers: 'number',              // Number of correct answers
  score: 'number',                       // Session score (0-100)
  timeSpent: 'number',                   // Total time spent (seconds)
  pointsEarned: 'number',                // Points earned from session
  performanceMetrics: 'object',           // Detailed performance metrics
  adaptiveInsights: 'object',             // AI-generated insights
  completedAt: 'timestamp',               // Session completion timestamp
  createdAt: 'timestamp'                 // Session creation timestamp
};

/**
 * Question response schema
 */
export const QUESTION_RESPONSE_SCHEMA = {
  questionId: 'string',                   // Question identifier
  questionText: 'string',                 // Question text
  selectedAnswer: 'string',               // Answer selected by learner
  correctAnswer: 'string',                // Correct answer
  isCorrect: 'boolean',                   // Whether answer was correct
  responseTime: 'number',                 // Time to answer (seconds)
  confidence: 'number',                   // Self-reported confidence (1-5)
  points: 'number',                      // Points earned for this question
  feedback: 'string',                     // Feedback provided
  aiInsights: 'object',                   // AI-generated insights
  timestamp: 'timestamp'                 // Response timestamp
};

/**
 * Real-world challenge schema
 */
export const REAL_WORLD_CHALLENGE_SCHEMA = {
  challengeId: 'string',                  // Unique challenge identifier
  learnerId: 'string',                   // Reference to learner
  topicName: 'string',                   // Topic this challenge relates to
  lessonTopic: 'string',                 // Specific lesson topic
  challengeText: 'string',               // Challenge description
  timeframe: 'string',                   // When to complete (e.g., "this week")
  tips: 'array',                         // Array of helpful tips
  status: 'string',                      // Challenge status
  attempts: 'array',                     // Array of attempt records
  attemptCount: 'number',                // Number of attempts made
  lastAttemptAt: 'timestamp',            // Last attempt timestamp
  completedAt: 'timestamp',              // Completion timestamp
  completionNotes: 'string',             // Notes from completion
  pointsAwarded: 'number',               // Points awarded for completion
  createdAt: 'timestamp',                // Challenge creation timestamp
  updatedAt: 'timestamp'                 // Last update timestamp
};

/**
 * Adaptive settings schema
 */
export const ADAPTIVE_SETTINGS_SCHEMA = {
  learnerId: 'string',                   // Reference to learner
  autoAdjustDifficulty: 'boolean',       // Auto-adjust difficulty based on performance
  preferredDifficulty: 'number',          // Preferred difficulty level (1-5)
  learningPace: 'string',                // Learning pace preference
  challengeFrequency: 'string',          // How often to generate challenges
  feedbackStyle: 'string',               // Preferred feedback style
  reminderSettings: 'object',            // Reminder preferences
  privacySettings: 'object',             // Privacy preferences
  createdAt: 'timestamp',                // Settings creation timestamp
  updatedAt: 'timestamp'                 // Last update timestamp
};

/**
 * Progress insights schema
 */
export const PROGRESS_INSIGHTS_SCHEMA = {
  insightId: 'string',                   // Unique insight identifier
  learnerId: 'string',                   // Reference to learner
  insightType: 'string',                 // Type of insight
  title: 'string',                       // Insight title
  description: 'string',                 // Insight description
  data: 'object',                        // Supporting data
  recommendations: 'array',               // Actionable recommendations
  priority: 'string',                    // Priority level
  isRead: 'boolean',                     // Whether learner has read it
  createdAt: 'timestamp',               // Insight creation timestamp
  expiresAt: 'timestamp'                 // When insight expires
};

/**
 * Analytics data schema
 */
export const ANALYTICS_SCHEMA = {
  learnerId: 'string',                   // Reference to learner
  period: 'string',                      // Time period (daily, weekly, monthly)
  startDate: 'timestamp',                // Period start date
  endDate: 'timestamp',                  // Period end date
  totalSessions: 'number',              // Total sessions in period
  totalTimeSpent: 'number',             // Total time spent (seconds)
  averageScore: 'number',               // Average score across sessions
  topicsPracticed: 'array',             // Topics practiced
  difficultyProgression: 'array',       // Difficulty changes
  strengths: 'array',                   // Identified strengths
  weaknesses: 'array',                  // Areas needing work
  achievements: 'array',                // Achievements unlocked
  challengesCompleted: 'number',        // Real-world challenges completed
  engagementScore: 'number',            // Overall engagement score
  learningVelocity: 'number',           // Learning progress rate
  createdAt: 'timestamp'                // Analytics generation timestamp
};

/**
 * Badge definitions
 */
export const BADGE_DEFINITIONS = {
  FIRST_SESSION: {
    id: 'first_session',
    name: 'Getting Started',
    description: 'Completed your first practice session',
    icon: '🎯',
    points: 10
  },
  STREAK_MASTER: {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintained a 7-day learning streak',
    icon: '🔥',
    points: 50
  },
  HIGH_SCORE_MASTER: {
    id: 'high_score_master',
    name: 'High Score Master',
    description: 'Achieved 90% or higher on a session',
    icon: '⭐',
    points: 25
  },
  PRACTICE_CHAMPION: {
    id: 'practice_champion',
    name: 'Practice Champion',
    description: 'Completed 10 practice sessions',
    icon: '🏆',
    points: 100
  },
  TOPIC_EXPERT: {
    id: 'topic_expert',
    name: 'Topic Expert',
    description: 'Achieved mastery level 5 in a topic',
    icon: '🎓',
    points: 200
  },
  CHALLENGE_COMPLETER: {
    id: 'challenge_completer',
    name: 'Challenge Completer',
    description: 'Completed a real-world challenge',
    icon: '🎪',
    points: 75
  }
};

/**
 * Validation functions for schema compliance
 */
export const validateLearnerProfile = (profile) => {
  const required = ['learnerId', 'userId', 'currentLevel', 'totalPoints', 'streak', 'totalSessions'];
  return required.every(field => profile.hasOwnProperty(field));
};

export const validateTopicMastery = (mastery) => {
  const required = ['masteryId', 'learnerId', 'topicName', 'currentLevel', 'percentComplete'];
  return required.every(field => mastery.hasOwnProperty(field));
};

export const validateSessionHistory = (session) => {
  const required = ['sessionId', 'learnerId', 'topicId', 'sessionType', 'difficulty', 'score'];
  return required.every(field => session.hasOwnProperty(field));
};

export const validateChallenge = (challenge) => {
  const required = ['challengeId', 'learnerId', 'topicName', 'challengeText', 'status'];
  return required.every(field => challenge.hasOwnProperty(field));
};

/**
 * Default values for new records
 */
export const DEFAULT_VALUES = {
  LEARNER_PROFILE: {
    currentLevel: DIFFICULTY_LEVELS.BEGINNER,
    totalPoints: 0,
    streak: 0,
    totalSessions: 0,
    badges: [],
    strengths: [],
    needsWork: [],
    preferences: {},
    adaptiveSettings: {
      autoAdjustDifficulty: true,
      preferredDifficulty: DIFFICULTY_LEVELS.BEGINNER,
      learningPace: 'moderate',
      challengeFrequency: 'weekly',
      feedbackStyle: 'encouraging'
    }
  },
  TOPIC_MASTERY: {
    currentLevel: MASTERY_LEVELS.NOT_STARTED,
    percentComplete: 0,
    totalSessions: 0,
    averageScore: 0,
    bestScore: 0,
    timeSpent: 0,
    difficultyProgression: [],
    strengths: [],
    weaknesses: [],
    nextRecommendedLevel: DIFFICULTY_LEVELS.BEGINNER
  },
  ADAPTIVE_SETTINGS: {
    autoAdjustDifficulty: true,
    preferredDifficulty: DIFFICULTY_LEVELS.BEGINNER,
    learningPace: 'moderate',
    challengeFrequency: 'weekly',
    feedbackStyle: 'encouraging',
    reminderSettings: {
      dailyReminder: true,
      weeklyReport: true,
      challengeReminder: true
    },
    privacySettings: {
      shareProgress: false,
      shareAchievements: true
    }
  }
};
