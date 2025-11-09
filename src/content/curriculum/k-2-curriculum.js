/**
 * K-2 Curriculum - Social Cue Practice
 * Kindergarten through 2nd Grade
 * 
 * Focus: Foundational social skills
 * Approach: Playful, simple, concrete
 * Timing: Lively pace (2s initial wait, 0.5s after response)
 */

export const k2Curriculum = {
    gradeRange: 'K-2',
    ageRange: '5-8 years',
    
    timing: {
      pace: 'LIVELY',
      initialWait: 2000,
      afterResponse: 500,
      helpTimeout: 2000,
      maxTurnLength: 10 // words
    },
    
    themes: [
      {
        id: 'greetings',
        title: 'Saying Hello',
        description: 'Basic greetings and introductions',
        
        lessons: [
          {
            id: 'hello-basics',
            title: 'Hello and Goodbye',
            difficulty: 'beginner',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Say "hello" with eye contact',
              'Wave when greeting',
              'Say "goodbye" at end'
            ],
            
            scenarios: [
              {
                id: 'meeting-friend',
                title: 'Meeting a Friend',
                context: 'You see your friend at the playground',
                aiRole: 'friend',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Hi! I'm your practice buddy! Let's practice saying hello. Ready?",
                    expectedResponse: ['yes', 'ok', 'yeah', 'ready']
                  },
                  {
                    phase: 'practice',
                    prompt: "Great! I'll be your friend at the playground. Say hi to me!",
                    expectedResponse: ['hi', 'hello', 'hey'],
                    feedback: {
                      success: 'Nice! You said hello!',
                      encouragement: 'Try saying "hi" or "hello"!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Awesome job! You said hello like a friend!"
                  }
                ]
              },
              {
                id: 'meeting-new-kid',
                title: 'Meeting Someone New',
                context: 'There is a new kid in your class',
                aiRole: 'new student',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Let's practice meeting someone new! I'll be a new kid. Ready?",
                    expectedResponse: ['yes', 'ok', 'ready']
                  },
                  {
                    phase: 'practice',
                    prompt: "Hi! I'm new here.",
                    expectedResponse: ['hi', 'hello', 'hey', 'welcome'],
                    feedback: {
                      success: 'Great! You welcomed me!',
                      encouragement: 'Say hi to the new kid!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Perfect! You're friendly to new people!"
                  }
                ]
              }
            ]
          },
          {
            id: 'my-name-is',
            title: 'Telling Your Name',
            difficulty: 'beginner',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Say "My name is..."',
              'Ask "What\'s your name?"',
              'Remember to listen'
            ],
            
            scenarios: [
              {
                id: 'introduce-yourself',
                title: 'Introducing Yourself',
                context: 'Someone asks your name',
                aiRole: 'friendly person',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Let's practice telling your name! Ready?",
                    expectedResponse: ['yes', 'ok', 'ready']
                  },
                  {
                    phase: 'practice',
                    prompt: "Hi! What's your name?",
                    expectedResponse: ['name', 'my name', "i'm", 'im'],
                    feedback: {
                      success: 'Great! You told me your name!',
                      encouragement: 'Try saying "My name is..."'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Awesome! You know how to say your name!"
                  }
                ]
              }
            ]
          }
        ]
      },
      
      {
        id: 'sharing',
        title: 'Sharing and Taking Turns',
        description: 'Learning to share and wait for your turn',
        
        lessons: [
          {
            id: 'asking-nicely',
            title: 'Asking to Play',
            difficulty: 'beginner',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Say "Can I play?"',
              'Say "please"',
              'Wait for answer'
            ],
            
            scenarios: [
              {
                id: 'join-game',
                title: 'Joining a Game',
                context: 'Friends are playing a game',
                aiRole: 'friend playing',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Let's practice asking to play! I'll be playing a game. Ready?",
                    expectedResponse: ['yes', 'ok', 'ready']
                  },
                  {
                    phase: 'practice',
                    prompt: "I'm playing with blocks! They look fun, right?",
                    expectedResponse: ['can i', 'can i play', 'please', 'may i'],
                    feedback: {
                      success: 'Nice asking!',
                      encouragement: 'Try "Can I play?"'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Great! You asked nicely to play!"
                  }
                ]
              }
            ]
          },
          {
            id: 'taking-turns',
            title: 'Waiting Your Turn',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Say "Your turn"',
              'Wait patiently',
              'Say "My turn now?"'
            ],
            
            scenarios: [
              {
                id: 'playground-turn',
                title: 'Slide Turn',
                context: 'Waiting for the slide',
                aiRole: 'friend on slide',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Let's practice taking turns! Ready?",
                    expectedResponse: ['yes', 'ok', 'ready']
                  },
                  {
                    phase: 'practice',
                    prompt: "Whee! The slide is fun! Are you waiting for a turn?",
                    expectedResponse: ['yes', 'my turn', 'can i', 'is it my turn'],
                    feedback: {
                      success: 'Good waiting!',
                      encouragement: 'Say "Is it my turn?"'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Perfect! You know how to take turns!"
                  }
                ]
              }
            ]
          }
        ]
      },
      
      {
        id: 'feelings',
        title: 'Talking About Feelings',
        description: 'Expressing emotions with words',
        
        lessons: [
          {
            id: 'happy-sad',
            title: 'Happy and Sad',
            difficulty: 'beginner',
            estimatedTime: '10 minutes',
            
            objectives: [
              'Say "I feel happy"',
              'Say "I feel sad"',
              'Recognize feelings in others'
            ],
            
            scenarios: [
              {
                id: 'feeling-happy',
                title: 'When You Feel Happy',
                context: 'Something good happened',
                aiRole: 'friend',
                
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Let's talk about feeling happy! Ready?",
                    expectedResponse: ['yes', 'ok', 'ready']
                  },
                  {
                    phase: 'practice',
                    prompt: "I got a gold star today! I feel happy! How do you feel?",
                    expectedResponse: ['happy', 'good', 'great', 'i feel'],
                    feedback: {
                      success: 'Nice! You told me how you feel!',
                      encouragement: 'Try "I feel happy" or "I feel good"'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Great job! You can talk about feelings!"
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    
    characterModes: {
      friend: {
        personality: 'friendly, playful, encouraging',
        language: 'simple, enthusiastic',
        examples: [
          "Yay! That's so fun!",
          "Ooh, I like that!",
          "Cool! What else?"
        ]
      },
      teacher: {
        personality: 'kind, patient, helpful',
        language: 'clear, supportive',
        examples: [
          "Good job trying!",
          "That's a great start!",
          "Let's try again together!"
        ]
      },
      parent: {
        personality: 'warm, patient, loving',
        language: 'gentle, encouraging',
        examples: [
          "I'm proud of you!",
          "You're doing great!",
          "That's my kiddo!"
        ]
      }
    }
  };
  
  export default k2Curriculum;