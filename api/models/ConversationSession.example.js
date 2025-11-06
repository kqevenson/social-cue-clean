/**
 * ConversationSession Usage Examples
 * 
 * This file demonstrates how to use the ConversationSession class
 * for managing voice practice sessions in Social Cue.
 */

import ConversationSession from './ConversationSession.js';

// Example 1: Create a new session
const session = new ConversationSession({
  userId: 'user_123',
  gradeLevel: '6',
  scenario: 'Making friends at lunch',
  scenarioDetails: {
    description: 'Practice starting conversations with new classmates',
    location: 'School cafeteria',
    participants: ['You', 'New classmate']
  },
  initialDifficulty: 3,
  maxTurns: 8
});

// Start the session
session.start();

// Example 2: Add messages and track performance
const userMessage = session.addUserMessage("Hi, can I sit here?");
const responseTime = 2500; // milliseconds

session.updateMetrics(userMessage, responseTime, {
  isGoodResponse: true,
  isHelpRequest: false
});

session.addAIMessage("That's a great way to start! What would you say next?");

// Example 3: Check phase transitions
const shouldTransition = session.shouldTransitionPhase();
if (shouldTransition && shouldTransition.shouldTransition) {
  const newPhase = session.transitionToNextPhase();
  console.log(`Transitioned to phase: ${newPhase}`);
}

// Example 4: Calculate performance
const performanceScore = session.calculatePerformanceScore();
const pointsEarned = session.getPointsEarned();

console.log(`Performance Score: ${performanceScore}/100`);
console.log(`Points Earned: ${pointsEarned}`);

// Example 5: Save and load sessions
// Auto-save happens automatically, but you can also manually serialize:
const sessionData = session.toJSON();
localStorage.setItem('current_session', JSON.stringify(sessionData));

// Load a session:
const savedData = JSON.parse(localStorage.getItem('current_session'));
const loadedSession = ConversationSession.fromJSON(savedData);

// Example 6: Get user's session history
const userSessions = ConversationSession.getUserSessions('user_123');
console.log(`User has ${userSessions.length} sessions`);

// Example 7: Complete a session
session.complete();
const summary = session.getSummary();
console.log('Session Summary:', summary);

// Example 8: Delete a session
ConversationSession.delete(session.sessionId, 'user_123');

// Example 9: Integration with React component
/*
import { useState, useEffect } from 'react';
import ConversationSession from './api/models/ConversationSession.js';

function VoicePracticeComponent({ userId, scenario, gradeLevel }) {
  const [session, setSession] = useState(null);
  
  useEffect(() => {
    // Create new session when component mounts
    const newSession = new ConversationSession({
      userId,
      gradeLevel,
      scenario
    });
    newSession.start();
    setSession(newSession);
    
    return () => {
      // Auto-save happens automatically, but you can manually save here too
      if (session) {
        session.autoSave();
      }
    };
  }, [userId, scenario, gradeLevel]);
  
  const handleUserMessage = (content, responseTime) => {
    if (!session) return;
    
    const userMsg = session.addUserMessage(content);
    session.updateMetrics(userMsg, responseTime, {
      isGoodResponse: true
    });
    
    // Check for phase transitions
    const transition = session.shouldTransitionPhase();
    if (transition && transition.shouldTransition) {
      session.transitionToNextPhase();
    }
    
    setSession({ ...session }); // Trigger re-render
  };
  
  return (
    <div>
      <p>Phase: {session?.currentPhase}</p>
      <p>Exchanges: {session?.exchangeCount}</p>
      <p>Score: {session?.calculatePerformanceScore()}</p>
    </div>
  );
}
*/

