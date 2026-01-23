# Social Cue App - Firestore Database Schema

This document defines the database structure for storing learner progress data in the Social Cue app.

## Overview

The database uses Firestore collections to organize different types of data:
- **USERS**: Basic user information and authentication
- **LEARNER_PROFILES**: Detailed progress tracking for each learner
- **SESSION_HISTORY**: Records of completed practice sessions
- **TOPIC_MASTERY**: Progress tracking for specific social skills topics

---

## 1. USERS Collection

**Purpose**: Store basic user information and authentication data

**Document ID**: Auto-generated (Firebase will create unique IDs)

### Fields:
```javascript
{
  userId: "auto-generated-id",           // Unique identifier
  name: "Sarah Johnson",                 // User's display name
  email: "sarah@example.com",            // Email (optional for guest users)
  role: "learner",                       // "learner" | "parent" | "teacher"
  gradeLevel: "6-8",                     // "K-2" | "3-5" | "6-8" | "9-12"
  createdAt: "2024-01-15T10:30:00Z",    // Timestamp when account was created
  lastActive: "2024-01-20T14:22:00Z"     // Last time user was active
}
```

### Example Document:
```javascript
{
  userId: "user_abc123",
  name: "Alex Chen",
  email: "alex.chen@school.edu",
  role: "learner",
  gradeLevel: "6-8",
  createdAt: "2024-01-15T10:30:00Z",
  lastActive: "2024-01-20T14:22:00Z"
}
```

---

## 2. LEARNER_PROFILES Collection

**Purpose**: Track detailed progress and achievements for each learner

**Document ID**: Same as userId (one-to-one relationship with USERS)

### Fields:
```javascript
{
  learnerId: "user_abc123",              // References userId from USERS
  currentLevel: 3,                       // Difficulty level (1-5 scale)
  totalPoints: 1250,                     // Total points earned
  streak: 7,                            // Consecutive days of practice
  badges: [                              // Array of earned badges
    "first_session",
    "week_streak",
    "small_talk_master"
  ],
  strengths: [                           // Skill areas they excel in
    "active_listening",
    "empathy"
  ],
  needsWork: [                           // Skill areas to improve
    "public_speaking",
    "conflict_resolution"
  ]
}
```

### Example Document:
```javascript
{
  learnerId: "user_abc123",
  currentLevel: 3,
  totalPoints: 1250,
  streak: 7,
  badges: [
    "first_session",
    "week_streak",
    "small_talk_master",
    "listening_pro"
  ],
  strengths: [
    "active_listening",
    "empathy",
    "teamwork"
  ],
  needsWork: [
    "public_speaking",
    "conflict_resolution"
  ]
}
```

---

## 3. SESSION_HISTORY Collection

**Purpose**: Record all completed practice sessions with detailed results

**Document ID**: Auto-generated

### Fields:
```javascript
{
  sessionId: "session_xyz789",           // Auto-generated unique ID
  learnerId: "user_abc123",             // References learner
  topicId: "small_talk_basics",          // Topic/skill practiced
  completedAt: "2024-01-20T14:22:00Z",  // When session was completed
  score: 85,                            // Percentage correct (0-100)
  timeSpent: 420,                       // Time in seconds
  questionsAnswered: [                  // Array of question responses
    {
      questionId: "q1",
      userAnswer: "option_b",
      isCorrect: true,
      timeToAnswer: 15
    },
    {
      questionId: "q2", 
      userAnswer: "option_a",
      isCorrect: false,
      timeToAnswer: 22
    }
  ],
  difficulty: 2                         // Difficulty level (1-5)
}
```

### Example Document:
```javascript
{
  sessionId: "session_xyz789",
  learnerId: "user_abc123",
  topicId: "small_talk_basics",
  completedAt: "2024-01-20T14:22:00Z",
  score: 85,
  timeSpent: 420,
  questionsAnswered: [
    {
      questionId: "q1",
      userAnswer: "option_b",
      isCorrect: true,
      timeToAnswer: 15
    },
    {
      questionId: "q2",
      userAnswer: "option_a", 
      isCorrect: false,
      timeToAnswer: 22
    },
    {
      questionId: "q3",
      userAnswer: "option_c",
      isCorrect: true,
      timeToAnswer: 18
    }
  ],
  difficulty: 2
}
```

---

## 4. TOPIC_MASTERY Collection

**Purpose**: Track progress and mastery level for each social skills topic

**Document ID**: Auto-generated

### Fields:
```javascript
{
  masteryId: "mastery_def456",          // Auto-generated unique ID
  learnerId: "user_abc123",             // References learner
  topicName: "Small Talk",              // Human-readable topic name
  currentLevel: 3,                      // Mastery level (1-5)
  percentComplete: 75,                   // Progress percentage (0-100)
  lastPracticed: "2024-01-20T14:22:00Z", // Last practice session
  totalSessions: 12                     // Total sessions completed
}
```

### Example Document:
```javascript
{
  masteryId: "mastery_def456",
  learnerId: "user_abc123", 
  topicName: "Small Talk",
  currentLevel: 3,
  percentComplete: 75,
  lastPracticed: "2024-01-20T14:22:00Z",
  totalSessions: 12
}
```

---

## Database Relationships

```
USERS (1) ←→ (1) LEARNER_PROFILES
   ↓
   (1) ←→ (Many) SESSION_HISTORY
   ↓  
   (1) ←→ (Many) TOPIC_MASTERY
```

### Key Relationships:
- Each USER has exactly one LEARNER_PROFILE
- Each USER can have many SESSION_HISTORY records
- Each USER can have many TOPIC_MASTERY records
- SESSION_HISTORY and TOPIC_MASTERY are linked by learnerId

---

## Query Patterns

### Common Queries:
1. **Get user's progress**: Query LEARNER_PROFILES by learnerId
2. **Get recent sessions**: Query SESSION_HISTORY by learnerId, order by completedAt
3. **Get topic mastery**: Query TOPIC_MASTERY by learnerId and topicName
4. **Get all topics for user**: Query TOPIC_MASTERY by learnerId
5. **Get session statistics**: Aggregate SESSION_HISTORY by learnerId

### Indexes Needed:
- SESSION_HISTORY: learnerId + completedAt (descending)
- TOPIC_MASTERY: learnerId + topicName
- TOPIC_MASTERY: learnerId + lastPracticed (descending)

---

## Security Rules (Future Implementation)

```javascript
// Example Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /learner_profiles/{learnerId} {
      allow read, write: if request.auth != null && request.auth.uid == learnerId;
    }
    
    match /session_history/{sessionId} {
      allow read, write: if request.auth != null && 
        resource.data.learnerId == request.auth.uid;
    }
    
    match /topic_mastery/{masteryId} {
      allow read, write: if request.auth != null && 
        resource.data.learnerId == request.auth.uid;
    }
  }
}
```

