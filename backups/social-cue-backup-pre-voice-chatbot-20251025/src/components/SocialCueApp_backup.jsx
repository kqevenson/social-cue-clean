import React, { useState, useEffect } from 'react';
import { Home, Target, TrendingUp, Settings, Heart, Brain, MessageCircle, Trophy, Star, Zap, ArrowLeft } from 'lucide-react';

// Storage utilities
const STORAGE_KEY = 'socialCueUserData';

const getUserData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    const defaultData = {
      userName: 'Alex',
      grade: '6',
      streak: 1,
      totalSessions: 0,
      totalPoints: 0,
      confidenceScore: 0,
      completedSessions: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  } catch (error) {
    return {
      userName: 'Alex',
      grade: '6',
      streak: 1,
      totalSessions: 0,
      totalPoints: 0,
      confidenceScore: 0,
      completedSessions: []
    };
  }
};

const saveUserData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const getGradeRange = (grade) => {
  const num = parseInt(grade) || 5;
  if (num <= 2) return 'k2';
  if (num <= 5) return '3-5';
  if (num <= 8) return '6-8';
  return '9-12';
};

// Scenarios database
const scenarios = {
  1: {
    id: 1,
    title: 'Starting Conversations',
    description: 'Learn to break the ice confidently',
    color: '#4A90E2',
    situations: [
      {
        id: 1,
        context: {
          k2: "You see a kid sitting alone at lunch. You want to be friends.",
          '3-5': "You're at lunch and notice a classmate sitting alone.",
          '6-8': "During lunch, you notice someone new sitting by themselves.",
          '9-12': "At lunch, you see an acquaintance sitting alone."
        },
        options: [
          {
            text: {
              k2: "Hi! Can I sit with you? I like your backpack!",
              '3-5': "Hey! Mind if I sit here?",
              '6-8': "Hey, is this seat taken?",
              '9-12': "Mind if I join you?"
            },
            feedback: {
              k2: "Great job! You were friendly and said something nice!",
              '3-5': "Perfect! You asked politely and showed friendliness.",
              '6-8': "Excellent! You were respectful and casual.",
              '9-12': "Well done! You showed social awareness and respect."
            },
            isGood: true,
            points: 10
          },
          {
            text: {
              k2: "*Sit down without saying anything*",
              '3-5': "*Just sit down*",
              '6-8': "*Sit without acknowledgment*",
              '9-12': "*Take seat without greeting*"
            },
            feedback: {
              k2: "Oops! It's important to say hi first!",
              '3-5': "Not quite! Always ask before sitting.",
              '6-8': "That's awkward! Always acknowledge someone first.",
              '9-12': "This could seem presumptuous. A greeting is important."
            },
            isGood: false,
            points: 0
          }
        ]
      }
    ]
  },
  2: {
    id: 2,
    title: 'Active Listening',
    description: 'Master the art of truly hearing others',
    color: '#34D399',
    situations: [
      {
        id: 1,
        context: {
          k2: "Your friend is telling you about their weekend.",
          '3-5': "A classmate is sharing a story about their pet.",
          '6-8': "Someone is telling you about a problem they're having.",
          '9-12': "A friend is discussing something important to them."
        },
        options: [
          {
            text: {
              k2: "*Look at them and nod*",
              '3-5': "*Make eye contact and respond*",
              '6-8': "*Maintain eye contact and ask follow-up*",
              '9-12': "*Actively engage with thoughtful responses*"
            },
            feedback: {
              k2: "Perfect! Looking at someone shows you care!",
              '3-5': "Great! Eye contact shows you're listening.",
              '6-8': "Excellent! You're showing genuine interest.",
              '9-12': "Outstanding! Active listening builds connections."
            },
            isGood: true,
            points: 10
          },
          {
            text: {
              k2: "*Look around the room*",
              '3-5': "*Check phone while they talk*",
              '6-8': "*Interrupt with your own story*",
              '9-12': "*Change the subject immediately*"
            },
            feedback: {
              k2: "Oops! Look at them when they talk!",
              '3-5': "Not good! Put phone away when someone's talking.",
              '6-8': "That's rude! Let them finish before sharing.",
              '9-12': "Poor form! This shows disrespect."
            },
            isGood: false,
            points: 0
          }
        ]
      }
    ]
  }
};

// This is just a reference file - copy the content into your Cursor project
// at src/components/SocialCueApp.jsx

// The actual implementation should use your existing SocialCueApp code from Cursor
// Just add the onLogout prop to connect it to the router

export default function SocialCueAppReference() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">SocialCueApp.jsx Reference</h1>
        <div className="bg-white/5 rounded-2xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Instructions:</h2>
          <ol className="space-y-3 text-gray-300">
            <li>1. Use your existing SocialCueApp code from Cursor</li>
            <li>2. Add onLogout as a prop: function SocialCueApp(props) ...</li>
            <li>3. Update logout handler to call: props.onLogout()</li>
            <li>4. Export as: export default SocialCueApp</li>
          </ol>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-2xl p-6">
          <p className="text-yellow-200">
            <strong>Note:</strong> This artifact is for reference only. 
            Copy the patterns above into your actual SocialCueApp.jsx file in Cursor, 
            keeping all your custom features and components.
          </p>
        </div>
      </div>
    </div>
  );
}