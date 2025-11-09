/**
 * Grade 6-8 Curriculum - Social Cue Practice
 * 6th through 8th Grade (Middle School)
 * 
 * Focus: Nuanced social situations
 * Approach: Natural, relatable, confidence-building
 * Timing: Natural pace (1s initial wait, 0.2s after response)
 */

export const grade68Curriculum = {
    gradeRange: '6-8',
    ageRange: '11-14 years',
    
    timing: {
      pace: 'NATURAL',
      initialWait: 1000,
      afterResponse: 200,
      helpTimeout: 2000,
      maxTurnLength: 15 // words
    },
    
    themes: [
      {
        id: 'peer-interactions',
        title: 'Peer Conversations',
        description: 'Natural conversations with peers',
        
        lessons: [
          {
            id: 'casual-conversation',
            title: 'Casual Small Talk',
            difficulty: 'beginner',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Start conversations naturally',
              'Find common ground quickly',
              'Keep conversation flowing'
            ],
            
            scenarios: [
              {
                id: 'before-class',
                title: 'Before Class Starts',
                context: 'Waiting for class to begin',
                aiRole: 'classmate',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Let's practice casual conversation. I'm a classmate. Start chatting!",
                    expectedResponse: ['hey', 'hi', 'what', 'did you']
                  },
                  {
                    phase: 'practice',
                    prompt: "Hey! Did you finish the math homework? It was tough.",
                    expectedResponse: ['yeah', 'yes', 'no', 'i thought', 'which', 'was it'],
                    feedback: {
                      success: 'Nice! Natural conversation!',
                      encouragement: 'Share your experience or ask about theirs!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Great! You handled that naturally!"
                  }
                ]
              },
              {
                id: 'hallway-chat',
                title: 'Hallway Conversation',
                context: 'Passing someone in the hall',
                aiRole: 'peer',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Practice a quick hallway chat. Keep it natural!",
                    expectedResponse: ['hey', 'hi', 'what\'s up', 'sup']
                  },
                  {
                    phase: 'practice',
                    prompt: "Oh hey! Are you going to the game Friday?",
                    expectedResponse: ['yeah', 'maybe', 'i don\'t know', 'are you', 'what game'],
                    feedback: {
                      success: 'Perfect! That felt natural!',
                      encouragement: 'Answer their question or show interest!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Awesome! Quick chats are important!"
                  }
                ]
              }
            ]
          },
          {
            id: 'deeper-conversations',
            title: 'Going Deeper',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Move beyond small talk',
              'Share personal thoughts',
              'Build connection'
            ],
            
            scenarios: [
              {
                id: 'lunch-conversation',
                title: 'Lunch Table Talk',
                context: 'Sitting with friends at lunch',
                aiRole: 'friend',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Let's have a deeper conversation. I'm your friend at lunch. Go deeper!",
                    expectedResponse: ['so', 'hey', 'what', 'how']
                  },
                  {
                    phase: 'practice',
                    prompt: "Ugh, I'm so stressed about the history project. How are you handling it?",
                    expectedResponse: ['yeah', 'me too', 'i feel', 'same', 'i\'m', 'what part'],
                    feedback: {
                      success: 'Great! You connected on a real level!',
                      encouragement: 'Share how you feel or ask what\'s stressing them!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Excellent! You can have meaningful conversations!"
                  }
                ]
              }
            ]
          }
        ]
      },
      
      {
        id: 'group-dynamics',
        title: 'Group Dynamics',
        description: 'Navigating group social situations',
        
        lessons: [
          {
            id: 'joining-conversations',
            title: 'Joining Group Conversations',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Read the group vibe',
              'Enter smoothly',
              'Contribute meaningfully'
            ],
            
            scenarios: [
              {
                id: 'friend-group',
                title: 'Joining Your Friend Group',
                context: 'Your friends are talking',
                aiRole: 'friend in group',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Practice joining a group conversation. Read the vibe first!",
                    expectedResponse: ['hey', 'hi', 'what are', 'what\'s']
                  },
                  {
                    phase: 'practice',
                    prompt: "...and I'm thinking about trying out for basketball. Oh hey! Want to join us?",
                    expectedResponse: ['yeah', 'sure', 'what', 'basketball', 'are you'],
                    feedback: {
                      success: 'Smooth! You joined naturally!',
                      encouragement: 'Show interest in what they were discussing!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Perfect! You read the room well!"
                  }
                ]
              }
            ]
          },
          {
            id: 'contributing-to-groups',
            title: 'Contributing to Group Talk',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Add to conversation',
              'Don\'t dominate',
              'Support others\' ideas'
            ],
            
            scenarios: [
              {
                id: 'group-project',
                title: 'Group Project Discussion',
                context: 'Planning a group project',
                aiRole: 'group member',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Let's plan a project together. Add your ideas!",
                    expectedResponse: ['ok', 'sure', 'what if', 'we could']
                  },
                  {
                    phase: 'practice',
                    prompt: "I think we should do our presentation on climate change. What do you think?",
                    expectedResponse: ['yeah', 'good idea', 'or', 'what if', 'we could also'],
                    feedback: {
                      success: 'Great! You contributed well!',
                      encouragement: 'Support their idea or add your own!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Excellent! You work well in groups!"
                  }
                ]
              }
            ]
          }
        ]
      },
      
      {
        id: 'conflict-resolution',
        title: 'Handling Conflicts',
        description: 'Managing disagreements and difficult situations',
        
        lessons: [
          {
            id: 'respectful-disagreement',
            title: 'Disagreeing Respectfully',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            
            objectives: [
              'State your view clearly',
              'Respect other perspectives',
              'Find common ground'
            ],
            
            scenarios: [
              {
                id: 'opinion-difference',
                title: 'Different Opinions',
                context: 'Friend has different view',
                aiRole: 'friend',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Practice disagreeing respectfully. I'll share an opinion. You disagree nicely!",
                    expectedResponse: ['ok', 'sure', 'ready']
                  },
                  {
                    phase: 'practice',
                    prompt: "I think homework should be banned. It's pointless.",
                    expectedResponse: ['i see', 'i get', 'but', 'though', 'actually', 'i think'],
                    feedback: {
                      success: 'Perfect! You disagreed while respecting them!',
                      encouragement: 'Try "I see your point, but..." or "I think differently because..."'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Great! You can disagree without being disagreeable!"
                  }
                ]
              }
            ]
          },
          {
            id: 'standing-up',
            title: 'Standing Up for Yourself',
            difficulty: 'advanced',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Use assertive language',
              'Stay calm',
              'Set boundaries'
            ],
            
            scenarios: [
              {
                id: 'peer-pressure',
                title: 'Handling Peer Pressure',
                context: 'Someone pressuring you',
                aiRole: 'peer',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Practice saying no. I'll pressure you. Stand firm but friendly!",
                    expectedResponse: ['ok', 'ready', 'sure']
                  },
                  {
                    phase: 'practice',
                    prompt: "Come on, everyone's doing it! Don't be lame.",
                    expectedResponse: ['no', 'i don\'t', 'i\'m not', 'that\'s not', 'i prefer'],
                    feedback: {
                      success: 'Strong! You stood up for yourself!',
                      encouragement: 'Say "I\'m not comfortable with that" or "No thanks"'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Excellent! You can stand firm respectfully!"
                  }
                ]
              }
            ]
          }
        ]
      },
      
      {
        id: 'reading-social-cues',
        title: 'Reading Social Cues',
        description: 'Understanding non-verbal communication',
        
        lessons: [
          {
            id: 'body-language',
            title: 'Reading Body Language',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Notice non-verbal signals',
              'Adjust your approach',
              'Respect boundaries'
            ],
            
            scenarios: [
              {
                id: 'reading-interest',
                title: 'Is Someone Interested?',
                context: 'Talking to someone new',
                aiRole: 'peer',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Practice reading cues. I'll show interest or disinterest. Notice it!",
                    expectedResponse: ['ok', 'ready', 'sure']
                  },
                  {
                    phase: 'practice',
                    prompt: "Yeah... uh huh... *looks at phone* ...sorry, what?",
                    expectedResponse: ['are you', 'should i', 'you seem', 'busy', 'is this'],
                    feedback: {
                      success: 'Good! You noticed they were distracted!',
                      encouragement: 'Try "Are you busy?" or "Should I let you go?"'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Great! You read social cues well!"
                  }
                ]
              }
            ]
          }
        ]
      },
      
      {
        id: 'digital-communication',
        title: 'Digital Communication',
        description: 'Text and online social skills',
        
        lessons: [
          {
            id: 'text-tone',
            title: 'Texting Appropriately',
            difficulty: 'beginner',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Use appropriate tone',
              'Read between the lines',
              'Know when to switch to talking'
            ],
            
            scenarios: [
              {
                id: 'group-chat',
                title: 'Group Chat Etiquette',
                context: 'Class group chat',
                aiRole: 'classmate',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Practice group chat skills. I'll text. Respond appropriately!",
                    expectedResponse: ['hey', 'hi', 'ok', 'yeah']
                  },
                  {
                    phase: 'practice',
                    prompt: "Did anyone get the notes from today? I was out sick.",
                    expectedResponse: ['yeah', 'i can', 'i\'ll send', 'sure', 'i have'],
                    feedback: {
                      success: 'Helpful! Good group chat member!',
                      encouragement: 'Offer to help or direct them to someone who can!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Perfect! You use group chats well!"
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
        personality: 'relatable, casual, authentic',
        language: 'age-appropriate slang, natural',
        examples: [
          "That's actually pretty cool.",
          "I totally get that.",
          "Honestly, same here."
        ]
      },
      friend: {
        personality: 'supportive, real, understanding',
        language: 'genuine, warm, direct',
        examples: [
          "Dude, that's rough.",
          "I'm here if you need to talk.",
          "That makes total sense."
        ]
      },
      teammate: {
        personality: 'collaborative, fair, motivated',
        language: 'encouraging, team-focused',
        examples: [
          "We've got this!",
          "Good thinking!",
          "Let's figure it out together."
        ]
      }
    }
  };
  
  export default grade68Curriculum;