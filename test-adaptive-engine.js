// Test script for adaptive learning engine
import dotenv from 'dotenv';
import { evaluateLearnerResponse } from './adaptive-learning-engine.js';

dotenv.config();

console.log('🧪 Testing Adaptive Learning Engine...');
console.log('API Key loaded:', !!process.env.ANTHROPIC_API_KEY);

const testData = {
  question: "What should you do when someone is sad?",
  selectedAnswer: "Ask them if they want to talk about it",
  correctAnswer: "Ask them if they want to talk about it",
  responseTime: 15,
  difficulty: 2,
  gradeLevel: "3-5",
  learnerProfile: {
    strengths: ["listening"],
    needsWork: ["comforting others"]
  }
};

try {
  console.log('🤖 Testing evaluateLearnerResponse...');
  const result = await evaluateLearnerResponse(testData);
  console.log('✅ Success!', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
