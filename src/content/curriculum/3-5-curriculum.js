/**
 * Grade 3-5 Curriculum - Social Cue Practice
 * 3rd through 5th Grade
 * 
 * Focus: Building conversation skills
 * Approach: Structured, encouraging, interactive
 * Timing: Momentum pace (1.5s initial wait, 0.3s after response)
 */

export const grade35Curriculum = {
    gradeRange: '3-5',
    ageRange: '8-11 years',
    
    timing: {
      pace: 'MOMENTUM',
      initialWait: 1500,
      afterResponse: 300,
      helpTimeout: 2000,
      maxTurnLength: 15 // words
    },
    
    themes: [
      {
        id: 'conversations',
        title: 'Starting Conversations',
        description: 'Opening conversations and keeping them going',
        
        lessons: [
          {
            id: 'conversation-starters',
            title: 'Good Conversation Starters',
            difficulty: 'beginner',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Ask open-ended questions',
              'Find common interests',
              'Use friendly tone'
            ],
            
            scenarios: [
              {
                id: 'lunch-table',
                title: 'Cafeteria Chat',
                context: 'Sitting at lunch with classmates',
                aiRole: 'classmate',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Let's practice starting conversations! I'll be eating lunch. Try talking to me!",
                    expectedResponse: ['hi', 'hello', 'hey', 'what']
                  },
                  {
                    phase: 'practice',
                    prompt: "Hey! Oh, you're in my math class, right?",
                    expectedResponse: ['yes', 'yeah', 'yep', 'what', 'do you', 'did you'],
                    feedback: {
                      success: 'Great! You kept the conversation going!',
                      encouragement: 'Try asking me a question about school or lunch!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Nice job! You know how to start friendly conversations!"
                  }
                ]
              },
              {
                id: 'recess-conversation',
                title: 'Playground Talk',
                context: 'Recess time with peers',
                aiRole: 'friend',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Practice starting a conversation at recess! What would you say?",
                    expectedResponse: ['hi', 'hey', 'what', 'do you', 'wanna']
                  },
                  {
                    phase: 'practice',
                    prompt: "Oh hi! I was just about to play basketball.",
                    expectedResponse: ['cool', 'can i', 'that sounds', 'i like', 'do you'],
                    feedback: {
                      success: 'Perfect! You showed interest!',
                      encouragement: 'Try asking about what they like or if you can join!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Excellent! You're great at starting conversations!"
                  }
                ]
              }
            ]
          },
          {
            id: 'asking-questions',
            title: 'Asking Good Questions',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Ask "What, Why, How" questions',
              'Show genuine interest',
              'Follow up on answers'
            ],
            
            scenarios: [
              {
                id: 'hobby-talk',
                title: 'Learning About Hobbies',
                context: 'Friend mentions their hobby',
                aiRole: 'friend',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Let's practice asking questions! I'll tell you about my hobby. Ask me about it!",
                    expectedResponse: ['what', 'which', 'why', 'how', 'tell me']
                  },
                  {
                    phase: 'practice',
                    prompt: "I love building Lego sets! I just finished a huge castle.",
                    expectedResponse: ['how', 'what', 'that sounds', 'cool', 'how long', 'which'],
                    feedback: {
                      success: 'Great question! That shows you care!',
                      encouragement: 'Ask me something like "How long did it take?" or "What\'s your favorite part?"'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Awesome! You ask really good questions!"
                  }
                ]
              }
            ]
          }
        ]
      },
      
      {
        id: 'listening',
        title: 'Active Listening',
        description: 'Showing you are listening and care',
        
        lessons: [
          {
            id: 'responding-appropriately',
            title: 'Good Responses',
            difficulty: 'beginner',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Say "That\'s cool" or "Interesting"',
              'Make eye contact',
              'Nod and react appropriately'
            ],
            
            scenarios: [
              {
                id: 'friend-story',
                title: 'Listening to a Story',
                context: 'Friend tells you about their weekend',
                aiRole: 'friend',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Let's practice listening! I'll tell you about my weekend. Show me you're listening!",
                    expectedResponse: ['ok', 'sure', 'yeah', 'go ahead']
                  },
                  {
                    phase: 'practice',
                    prompt: "This weekend I went to the zoo and saw baby pandas! They were so cute!",
                    expectedResponse: ['cool', 'wow', 'that sounds', 'awesome', 'really', 'what'],
                    feedback: {
                      success: 'Perfect! That shows you were listening!',
                      encouragement: 'Try saying "That\'s cool!" or "Wow!" or ask a question!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Great listening! You made me feel heard!"
                  }
                ]
              }
            ]
          },
          {
            id: 'showing-interest',
            title: 'Showing Interest',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Use body language',
              'Ask follow-up questions',
              'Share related experiences'
            ],
            
            scenarios: [
              {
                id: 'book-discussion',
                title: 'Book Talk',
                context: 'Friend tells you about a book they read',
                aiRole: 'friend',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Practice showing interest! I'll talk about a book. Show you care!",
                    expectedResponse: ['ok', 'yeah', 'sure', 'ready']
                  },
                  {
                    phase: 'practice',
                    prompt: "I'm reading this amazing book about space explorers! It's so good!",
                    expectedResponse: ['what', 'cool', 'i like', 'tell me', 'sounds', 'which'],
                    feedback: {
                      success: 'Excellent! You showed real interest!',
                      encouragement: 'Ask "What\'s it about?" or say "I like space too!"'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Perfect! You know how to show interest in others!"
                  }
                ]
              }
            ]
          }
        ]
      },
      
      {
        id: 'joining-groups',
        title: 'Joining Groups',
        description: 'How to join conversations and activities',
        
        lessons: [
          {
            id: 'reading-the-room',
            title: 'When to Join',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Wait for a pause',
              'Ask "Can I join?"',
              'Listen before speaking'
            ],
            
            scenarios: [
              {
                id: 'group-conversation',
                title: 'Joining a Group Chat',
                context: 'Kids talking in a circle',
                aiRole: 'group member',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Let's practice joining a group! I'm talking with friends. How would you join?",
                    expectedResponse: ['hi', 'hey', 'can i', 'mind if', 'what are']
                  },
                  {
                    phase: 'practice',
                    prompt: "...and then we went to the arcade! Oh, hey! Do you want to join us?",
                    expectedResponse: ['yes', 'sure', 'thanks', 'what', 'sounds fun'],
                    feedback: {
                      success: 'Nice! You joined smoothly!',
                      encouragement: 'Say yes and ask what they\'re talking about!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Great job! You know how to join groups nicely!"
                  }
                ]
              }
            ]
          },
          {
            id: 'group-games',
            title: 'Joining Games',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Wait for right moment',
              'Ask politely',
              'Accept the answer gracefully'
            ],
            
            scenarios: [
              {
                id: 'playground-game',
                title: 'Playground Game',
                context: 'Kids playing a game',
                aiRole: 'player',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Practice asking to join a game! I'm playing kickball. What do you say?",
                    expectedResponse: ['can i', 'can i play', 'may i', 'mind if']
                  },
                  {
                    phase: 'practice',
                    prompt: "We're playing kickball! Want to be on my team?",
                    expectedResponse: ['yes', 'sure', 'thanks', 'yeah', 'that sounds'],
                    feedback: {
                      success: 'Perfect! You accepted nicely!',
                      encouragement: 'Say "Yes, thanks!" or "Sure, that sounds fun!"'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Awesome! You're great at joining games!"
                  }
                ]
              }
            ]
          }
        ]
      },
      
      {
        id: 'problem-solving',
        title: 'Solving Problems',
        description: 'Handling conflicts and disagreements',
        
        lessons: [
          {
            id: 'disagreements',
            title: 'When You Disagree',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Say "I see it differently"',
              'Explain your view calmly',
              'Listen to other side'
            ],
            
            scenarios: [
              {
                id: 'game-rules',
                title: 'Disagreeing About Rules',
                context: 'Disagreement during a game',
                aiRole: 'player',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Let's practice disagreeing nicely! I'll say a rule. You disagree politely!",
                    expectedResponse: ['ok', 'ready', 'sure']
                  },
                  {
                    phase: 'practice',
                    prompt: "I think we should play with three outs, not four.",
                    expectedResponse: ['i think', 'actually', 'i thought', 'maybe', 'what if'],
                    feedback: {
                      success: 'Great! You disagreed respectfully!',
                      encouragement: 'Try "I think we should..." or "Actually, I thought..."'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Excellent! You can disagree while staying friends!"
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    
    characterModes: {
      classmate: {
        personality: 'friendly, curious, relatable',
        language: 'age-appropriate, casual',
        examples: [
          "That's so cool!",
          "I totally get that!",
          "Same! That happens to me too!"
        ]
      },
      friend: {
        personality: 'supportive, fun, understanding',
        language: 'warm, enthusiastic',
        examples: [
          "You're really good at that!",
          "Want to hang out sometime?",
          "That sounds awesome!"
        ]
      },
      teammate: {
        personality: 'collaborative, encouraging, fair',
        language: 'positive, team-focused',
        examples: [
          "Nice job, teammate!",
          "We can do this together!",
          "Great teamwork!"
        ]
      }
    }
  };
  
  export default grade35Curriculum;