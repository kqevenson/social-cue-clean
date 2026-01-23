// Test script to verify localStorage functionality
// Run this in browser console to test

console.log('=== Testing localStorage User Data ===');

// Test 1: Check current localStorage
console.log('Current localStorage:', localStorage.getItem('socialCueUserData'));

// Test 2: Simulate saving user data
const testUserData = {
  userName: 'TestUser',
  gradeLevel: '6',
  role: 'learner',
  email: 'test@example.com',
  accountType: 'guest',
  streak: 0,
  totalSessions: 0,
  totalPoints: 0,
  confidenceScore: 0,
  completedSessions: [],
  lastActiveDate: new Date().toDateString()
};

console.log('Saving test data:', testUserData);
localStorage.setItem('socialCueUserData', JSON.stringify(testUserData));

// Test 3: Verify it was saved
const savedData = JSON.parse(localStorage.getItem('socialCueUserData'));
console.log('Retrieved data:', savedData);
console.log('User name:', savedData?.userName);

// Test 4: Clear and test default
console.log('Clearing localStorage...');
localStorage.removeItem('socialCueUserData');

// Test 5: Check what happens when no data exists
const noData = localStorage.getItem('socialCueUserData');
console.log('After clearing:', noData);

console.log('=== Test Complete ===');

