/**
 * Grade 9–12 Curriculum - Social Cue Practice (Enhanced Version)
 * Focus: SEL-rich, real-world social interactions
 * Additions: Tone detection, response feedback, correction suggestions
 */

const grade912Curriculum = {
    gradeRange: '9-12',
    ageRange: '14-18 years',
  
    timing: {
      pace: 'REAL-TIME',
      initialWait: 800,
      afterResponse: 100,
      helpTimeout: 2000,
      maxTurnLength: 20
    },
  
    themes: [
      {
        id: 'academic-interactions',
        title: 'Academic Settings',
        description: 'Professional conversations in academic contexts',
  
        lessons: [
          {
            id: 'teacher-communication',
            title: 'Talking with Teachers',
            difficulty: 'beginner',
            estimatedTime: '10 minutes',
            objectives: [
              'Use appropriate formality',
              'Ask for help clearly',
              'Advocate for yourself'
            ],
            scenarios: [
              {
                id: 'asking-for-help',
                title: 'Asking for Academic Help',
                context: 'Need clarification on assignment',
                aiRole: 'teacher',
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Let's practice talking with teachers. I'm your teacher. Approach me professionally!",
                    expectedResponse: ['excuse me', 'hi', 'hello', 'mr', 'ms', 'can i']
                  },
                  {
                    phase: 'practice',
                    prompt: "Hi! What can I help you with?",
                    expectedResponse: ['i was wondering', 'could you', 'i need', 'i\'m confused', 'can you explain'],
                    feedback: {
                      success: 'Professional! Clear communication!',
                      encouragement: 'Be specific about what you need help with.',
                      correction: 'Try asking politely and clearly — avoid sounding too casual or vague.'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Excellent! You advocate for yourself well."
                  }
                ]
              },
              {
                id: 'grade-discussion',
                title: 'Discussing a Grade',
                context: 'Concerned about a grade',
                aiRole: 'teacher',
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Practice discussing grades professionally. Stay calm and respectful!",
                    expectedResponse: ['hi', 'excuse me', 'i wanted', 'could we']
                  },
                  {
                    phase: 'practice',
                    prompt: "Sure, what's on your mind about the test?",
                    expectedResponse: ['i was', 'i thought', 'could you', 'i don\'t understand', 'can we review'],
                    feedback: {
                      success: 'Mature approach! Well handled!',
                      encouragement: 'Ask specific questions and stay respectful.',
                      correction: 'Avoid blaming language. Focus on your confusion or your goal to improve.'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Great! You handle difficult conversations well!"
                  }
                ]
              }
            ]
          }
        ]
      },
  
      {
        id: 'peer-relationships',
        title: 'Peer Relationships',
        description: 'Building and maintaining friendships',
  
        lessons: [
          {
            id: 'authentic-conversation',
            title: 'Authentic Conversations',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            objectives: [
              'Be genuine',
              'Share appropriately',
              'Create real connections'
            ],
            scenarios: [
              {
                id: 'deep-conversation',
                title: 'Having Real Talk',
                context: 'One-on-one with friend',
                aiRole: 'friend',
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Let's have an authentic conversation. I'm your friend. Be real with me!",
                    expectedResponse: ['hey', 'so', 'i wanted', 'can we']
                  },
                  {
                    phase: 'practice',
                    prompt: "Honestly, I've been really stressed about college apps. How are you handling it?",
                    expectedResponse: ['yeah', 'same', 'i feel', 'honestly', 'it\'s tough', 'i get it'],
                    feedback: {
                      success: 'Authentic! That builds trust!',
                      encouragement: 'Share how you really feel or show empathy.',
                      correction: 'Avoid dismissive replies like “you\'ll be fine.” Try relating more personally.'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Perfect! You create real connections!"
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
  
    characterModes: {
      peer: {
        personality: 'mature, authentic, relatable',
        language: 'natural, current, genuine',
        examples: [
          "That's real talk.",
          "I respect that perspective.",
          "Honestly, I hadn't thought of it that way."
        ]
      },
      professional: {
        personality: 'polished, respectful, appropriate',
        language: 'formal when needed, clear, direct',
        examples: [
          "I appreciate your time.",
          "That's a great question.",
          "Let me think about that."
        ]
      },
      mentor: {
        personality: 'supportive, experienced, honest',
        language: 'encouraging, constructive, real',
        examples: [
          "You're handling this well.",
          "Here's something to consider...",
          "That takes real maturity."
        ]
      }
    }
  };
  
  export default grade912Curriculum;
  






