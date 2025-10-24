# Adaptive Learning System Backend

This directory contains the complete adaptive learning system backend for the Social Cue app. The system uses AI-powered analysis to personalize learning experiences and track learner progress.

## 📁 File Structure

### Core Files

1. **`adaptive-learning-schema.js`** - Data structure definitions and validation
2. **`adaptive-learning-engine.js`** - AI-powered learning intelligence functions
3. **`firebase-adaptive-service.js`** - Firebase Firestore operations
4. **`adaptive-learning-routes.js`** - Express API endpoints

### Integration

- **`server.js`** - Main Express server (updated to include adaptive routes)

## 🧠 Adaptive Learning Features

### AI-Powered Analysis
- **Response Evaluation**: Analyzes individual learner responses using Claude AI
- **Session Analysis**: Comprehensive analysis of complete practice sessions
- **Difficulty Adjustment**: Automatically adjusts difficulty based on performance
- **Progress Insights**: Generates personalized learning insights and recommendations
- **Real-World Challenges**: Creates age-appropriate challenges for real-world practice

### Performance Tracking
- **Learner Profiles**: Complete learner profiles with strengths, weaknesses, and preferences
- **Topic Mastery**: Tracks mastery levels (0-5) for each social skills topic
- **Session History**: Detailed history of all practice sessions with performance metrics
- **Progress Analytics**: Comprehensive analytics and learning velocity tracking

### Adaptive Features
- **Dynamic Difficulty**: Automatically adjusts difficulty (1-5) based on performance
- **Personalized Recommendations**: AI-generated next steps and focus areas
- **Badge System**: Automatic badge awarding based on achievements
- **Real-World Integration**: Connects practice to real-world application

## 🚀 API Endpoints

### Response Evaluation
- `POST /api/adaptive/evaluate-response` - Evaluate a single learner response
- `POST /api/adaptive/complete-session` - Analyze a complete practice session

### Session Recommendations
- `GET /api/adaptive/next-session/:userId/:topicId` - Get next session recommendations
- `GET /api/adaptive/progress-insights/:userId` - Get personalized progress insights
- `GET /api/adaptive/mastery-dashboard/:userId` - Get mastery dashboard data

### Real-World Challenges
- `POST /api/adaptive/generate-challenge` - Generate a new real-world challenge
- `POST /api/adaptive/complete-challenge` - Mark a challenge as complete
- `GET /api/adaptive/active-challenges/:userId` - Get active challenges

### Settings & Analytics
- `PUT /api/adaptive/preferences/:userId` - Update adaptive learning preferences
- `GET /api/adaptive/analytics/:userId` - Get comprehensive analytics

## 📊 Data Schema

### Learner Profile
```javascript
{
  learnerId: string,
  userId: string,
  currentLevel: number,        // 1-5 difficulty level
  totalPoints: number,
  streak: number,
  totalSessions: number,
  badges: array,
  strengths: array,
  needsWork: array,
  preferences: object,
  adaptiveSettings: object
}
```

### Topic Mastery
```javascript
{
  masteryId: string,
  learnerId: string,
  topicName: string,
  currentLevel: number,       // 0-5 mastery level
  percentComplete: number,    // 0-100%
  totalSessions: number,
  averageScore: number,
  bestScore: number,
  timeSpent: number,
  strengths: array,
  weaknesses: array,
  nextRecommendedLevel: number
}
```

### Session History
```javascript
{
  sessionId: string,
  learnerId: string,
  topicId: string,
  topicName: string,
  sessionType: string,
  difficulty: number,
  questionsAnswered: array,
  totalQuestions: number,
  correctAnswers: number,
  score: number,
  timeSpent: number,
  pointsEarned: number,
  performanceMetrics: object,
  adaptiveInsights: object
}
```

### Real-World Challenge
```javascript
{
  challengeId: string,
  learnerId: string,
  topicName: string,
  challengeText: string,
  timeframe: string,
  tips: array,
  successCriteria: string,
  difficulty: number,
  status: string,
  attempts: array,
  attemptCount: number,
  completedAt: timestamp
}
```

## 🔧 Configuration

### Environment Variables
```bash
ANTHROPIC_API_KEY=your_claude_api_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### Difficulty Levels
- **Level 1**: Beginner (K-2 grade level)
- **Level 2**: Elementary (3-5 grade level)
- **Level 3**: Intermediate (6-8 grade level)
- **Level 4**: Advanced (9-12 grade level)
- **Level 5**: Expert (Adult level)

### Mastery Levels
- **Level 0**: Not Started (0% mastery)
- **Level 1**: Beginner (1-25% mastery)
- **Level 2**: Developing (26-50% mastery)
- **Level 3**: Proficient (51-75% mastery)
- **Level 4**: Advanced (76-90% mastery)
- **Level 5**: Master (91-100% mastery)

## 🎯 Usage Examples

### Evaluate a Response
```javascript
POST /api/adaptive/evaluate-response
{
  "learnerId": "user123",
  "question": "What should you do when someone is sad?",
  "selectedAnswer": "Ask them if they want to talk about it",
  "correctAnswer": "Ask them if they want to talk about it",
  "responseTime": 15,
  "difficulty": 2,
  "gradeLevel": "3-5",
  "learnerProfile": {
    "strengths": ["empathy"],
    "needsWork": ["initiating conversations"]
  }
}
```

### Complete a Session
```javascript
POST /api/adaptive/complete-session
{
  "sessionId": "session123",
  "learnerId": "user123",
  "topicId": "empathy",
  "topicName": "Empathy",
  "difficulty": 2,
  "totalQuestions": 5,
  "correctAnswers": 4,
  "score": 80,
  "timeSpent": 300,
  "pointsEarned": 40,
  "gradeLevel": "3-5"
}
```

### Generate a Challenge
```javascript
POST /api/adaptive/generate-challenge
{
  "learnerId": "user123",
  "topicName": "Empathy",
  "gradeLevel": "3-5",
  "currentLevel": 2,
  "strengths": ["listening"],
  "needsWork": ["comforting others"]
}
```

## 🔄 Adaptive Learning Flow

1. **Learner Response** → AI Evaluation → Performance Analysis
2. **Session Completion** → Comprehensive Analysis → Difficulty Adjustment
3. **Progress Tracking** → Mastery Updates → Personalized Recommendations
4. **Real-World Practice** → Challenge Generation → Application Tracking
5. **Continuous Learning** → Analytics → Adaptive Improvements

## 🏆 Badge System

### Available Badges
- **Getting Started** - First session completed
- **Streak Master** - 7-day learning streak
- **High Score Master** - 90%+ session score
- **Practice Champion** - 10 sessions completed
- **Topic Expert** - Level 5 mastery achieved
- **Challenge Completer** - Real-world challenge completed

## 📈 Analytics & Insights

### Performance Metrics
- Response time analysis
- Accuracy tracking
- Consistency scoring
- Learning velocity
- Engagement levels

### Adaptive Insights
- Strength identification
- Weakness analysis
- Learning strategy recommendations
- Difficulty progression tracking
- Real-world application suggestions

## 🛡️ Error Handling

All endpoints include comprehensive error handling:
- Input validation
- AI API error fallbacks
- Firebase operation error handling
- Graceful degradation
- User-friendly error messages

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install @anthropic-ai/sdk firebase
   ```

2. **Set Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start the Server**:
   ```bash
   npm run server
   ```

4. **Test the API**:
   ```bash
   curl http://localhost:3001/api/health
   curl http://localhost:3001/api/adaptive/progress-insights/test-user
   ```

## 🔧 Development

### Adding New Features
1. Define schema in `adaptive-learning-schema.js`
2. Implement AI logic in `adaptive-learning-engine.js`
3. Add Firebase operations in `firebase-adaptive-service.js`
4. Create API endpoints in `adaptive-learning-routes.js`
5. Update this README with new functionality

### Testing
- All endpoints include comprehensive logging
- Error handling with fallback responses
- Input validation and sanitization
- Performance monitoring and cost tracking

## 📝 Notes

- All AI operations use Claude Haiku for cost efficiency
- Firebase operations include offline support
- Real-world challenges are age-appropriate and safe
- Analytics are generated on-demand to save storage
- Badge system encourages continued engagement

This adaptive learning system provides a comprehensive, AI-powered approach to personalized social skills education that grows with each learner's needs and abilities.
