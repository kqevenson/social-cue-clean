/**
 * Grade 9-12 Curriculum - Social Cue Practice
 * 9th through 12th Grade (High School)
 * 
 * Focus: Real-world social scenarios
 * Approach: Mature, practical, confidence-focused
 * Timing: Real-time pace (0.8s initial wait, 0.1s after response)
 */

export const grade912Curriculum = {
    gradeRange: '9-12',
    ageRange: '14-18 years',
    
    timing: {
      pace: 'REAL-TIME',
      initialWait: 800,
      afterResponse: 100,
      helpTimeout: 2000,
      maxTurnLength: 20 // words
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
                      encouragement: 'Be specific about what you need help with!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Excellent! You advocate for yourself well!"
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
                      encouragement: 'Ask specific questions and stay respectful!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Great! You handle difficult conversations well!"
                  }
                ]
              }
            ]
          },
          {
            id: 'class-participation',
            title: 'Class Participation',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Contribute to discussions',
              'Build on others\' ideas',
              'Disagree constructively'
            ],
            
            scenarios: [
              {
                id: 'class-discussion',
                title: 'Contributing to Discussion',
                context: 'Class discussing a topic',
                aiRole: 'classmate',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "We're having a class discussion. Add your perspective!",
                    expectedResponse: ['i think', 'what if', 'actually', 'to add']
                  },
                  {
                    phase: 'practice',
                    prompt: "I think the author's point was about isolation in modern society.",
                    expectedResponse: ['i agree', 'that\'s interesting', 'building on', 'or maybe', 'i see it'],
                    feedback: {
                      success: 'Thoughtful contribution!',
                      encouragement: 'Build on their idea or offer a different perspective!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Excellent! You participate effectively!"
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
                      encouragement: 'Share how you really feel or show empathy!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Perfect! You create real connections!"
                  }
                ]
              }
            ]
          },
          {
            id: 'supporting-friends',
            title: 'Supporting Friends',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Listen actively',
              'Offer support appropriately',
              'Know when to suggest help'
            ],
            
            scenarios: [
              {
                id: 'friend-struggling',
                title: 'Friend Going Through Tough Time',
                context: 'Friend seems upset',
                aiRole: 'friend',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Your friend seems down. Check in on them!",
                    expectedResponse: ['hey', 'are you', 'you seem', 'what\'s', 'is everything']
                  },
                  {
                    phase: 'practice',
                    prompt: "I don't know... just feeling overwhelmed with everything.",
                    expectedResponse: ['i hear', 'i\'m sorry', 'that sounds', 'want to', 'i\'m here'],
                    feedback: {
                      success: 'Supportive! Good friend!',
                      encouragement: 'Show empathy and offer to listen or help!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Great! You know how to be there for friends!"
                  }
                ]
              }
            ]
          }
        ]
      },
      
      {
        id: 'professional-skills',
        title: 'Professional Interactions',
        description: 'Work and professional settings',
        
        lessons: [
          {
            id: 'job-interview',
            title: 'Job Interview Skills',
            difficulty: 'advanced',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Present yourself professionally',
              'Answer questions clearly',
              'Show enthusiasm appropriately'
            ],
            
            scenarios: [
              {
                id: 'retail-interview',
                title: 'Retail Job Interview',
                context: 'Interview for part-time job',
                aiRole: 'interviewer',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Practice interviewing for a job. Be professional and confident!",
                    expectedResponse: ['hi', 'hello', 'thank you', 'nice to meet']
                  },
                  {
                    phase: 'practice',
                    prompt: "Tell me about a time you worked as part of a team.",
                    expectedResponse: ['in', 'when i', 'at', 'during', 'one time'],
                    feedback: {
                      success: 'Professional! Good specific example!',
                      encouragement: 'Give a specific example with details!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Excellent! You interview well!"
                  }
                ]
              }
            ]
          },
          {
            id: 'workplace-communication',
            title: 'Workplace Communication',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Communicate with coworkers',
              'Ask for help professionally',
              'Handle feedback'
            ],
            
            scenarios: [
              {
                id: 'first-day-work',
                title: 'First Day at Work',
                context: 'Starting a new job',
                aiRole: 'coworker',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "It's your first day at work. Introduce yourself to a coworker!",
                    expectedResponse: ['hi', 'hello', 'i\'m', 'nice to meet']
                  },
                  {
                    phase: 'practice',
                    prompt: "Hey! You're the new hire, right? Welcome! I'm Jamie.",
                    expectedResponse: ['thanks', 'yes', 'nice to', 'i\'m', 'great to'],
                    feedback: {
                      success: 'Professional and friendly!',
                      encouragement: 'Introduce yourself and show you\'re eager to learn!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Perfect! You make great first impressions!"
                  }
                ]
              }
            ]
          }
        ]
      },
      
      {
        id: 'conflict-management',
        title: 'Conflict Management',
        description: 'Handling difficult social situations',
        
        lessons: [
          {
            id: 'mature-disagreement',
            title: 'Mature Disagreement',
            difficulty: 'advanced',
            estimatedTime: '10 minutes',
            
            objectives: [
              'State position clearly',
              'Listen to understand',
              'Find compromise'
            ],
            
            scenarios: [
              {
                id: 'project-conflict',
                title: 'Group Project Disagreement',
                context: 'Disagreement about approach',
                aiRole: 'group member',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Let's handle a disagreement maturely. We don't agree on the project approach!",
                    expectedResponse: ['i understand', 'i see', 'i hear', 'what if']
                  },
                  {
                    phase: 'practice',
                    prompt: "I really think we should focus on the environmental angle, not economic.",
                    expectedResponse: ['i get', 'that\'s valid', 'what if', 'could we', 'maybe we'],
                    feedback: {
                      success: 'Mature! You seek compromise!',
                      encouragement: 'Acknowledge their view, then suggest compromise!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Excellent! You handle conflicts maturely!"
                  }
                ]
              }
            ]
          },
          {
            id: 'setting-boundaries',
            title: 'Setting Boundaries',
            difficulty: 'advanced',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Communicate limits clearly',
              'Stay firm but respectful',
              'Maintain relationships'
            ],
            
            scenarios: [
              {
                id: 'friendship-boundary',
                title: 'Friend Overstepping',
                context: 'Friend asking too much',
                aiRole: 'friend',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Practice setting boundaries. I'm asking for something unreasonable!",
                    expectedResponse: ['ok', 'ready', 'sure']
                  },
                  {
                    phase: 'practice',
                    prompt: "Can you write my essay for me? I'm so swamped.",
                    expectedResponse: ['i can\'t', 'that\'s not', 'i don\'t feel', 'i\'m not comfortable', 'i can help'],
                    feedback: {
                      success: 'Clear boundary! Still respectful!',
                      encouragement: 'Say no clearly but offer alternatives if you want!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Perfect! You set healthy boundaries!"
                  }
                ]
              }
            ]
          }
        ]
      },
      
      {
        id: 'social-awareness',
        title: 'Social Awareness',
        description: 'Understanding social dynamics',
        
        lessons: [
          {
            id: 'reading-situations',
            title: 'Reading Social Situations',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Assess group dynamics',
              'Know when to speak/listen',
              'Adapt to context'
            ],
            
            scenarios: [
              {
                id: 'party-navigation',
                title: 'Navigating Social Events',
                context: 'Party or social gathering',
                aiRole: 'acquaintance',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "You're at a party. Read the situation and engage appropriately!",
                    expectedResponse: ['hey', 'hi', 'what\'s up', 'how\'s it']
                  },
                  {
                    phase: 'practice',
                    prompt: "Oh hey! Having fun? The music's pretty loud, huh?",
                    expectedResponse: ['yeah', 'it is', 'pretty good', 'how about', 'you having'],
                    feedback: {
                      success: 'Natural! You adapted to the setting!',
                      encouragement: 'Match their energy and keep it casual!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Great! You navigate social events well!"
                  }
                ]
              }
            ]
          }
        ]
      },
      
      {
        id: 'digital-maturity',
        title: 'Digital Maturity',
        description: 'Professional online communication',
        
        lessons: [
          {
            id: 'professional-email',
            title: 'Professional Emails',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Use appropriate tone',
              'Structure clearly',
              'Be concise and polite'
            ],
            
            scenarios: [
              {
                id: 'email-teacher',
                title: 'Emailing a Teacher',
                context: 'Need to email about absence',
                aiRole: 'teacher',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Practice professional email communication. How would you start?",
                    expectedResponse: ['dear', 'hello', 'hi', 'good']
                  },
                  {
                    phase: 'practice',
                    prompt: "I received your email. What do you need regarding the missed class?",
                    expectedResponse: ['i was', 'i wanted', 'could i', 'would it', 'is there'],
                    feedback: {
                      success: 'Professional and clear!',
                      encouragement: 'Be specific and respectful in your request!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Excellent! Your email communication is professional!"
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