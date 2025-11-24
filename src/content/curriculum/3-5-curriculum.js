/**
 * Grade 3-5 Curriculum - Social Cue Practice
 * 3rd through 5th Grade
 * 
 * Focus: Building conversation skills, active listening, and respectful disagreement
 * New: Expanded SEL depth, tone-aware prompts, dynamic feedback
 */

export const grade35Curriculum = {
    gradeRange: '3-5',
    ageRange: '8-11 years',
  
    timing: {
      pace: 'MOMENTUM',
      initialWait: 1500,
      afterResponse: 300,
      helpTimeout: 2000,
      maxTurnLength: 15
    },
  
    themes: [
      // Existing themes here (Starting Conversations, Listening, Joining Groups, Problem Solving)
      // Leave unchanged unless you want to revise them
  
      {
        id: 'self-expression',
        title: 'Expressing Yourself Clearly',
        description: 'Helping students feel confident sharing ideas',
        lessons: [
          {
            id: 'feelings-opinions',
            title: 'Sharing Feelings & Opinions',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            objectives: [
              'Use “I feel…” or “I think…” statements',
              'Explain why calmly',
              'Respect others’ views'
            ],
            scenarios: [
              {
                id: 'favorite-subject',
                title: 'Classroom Opinions',
                context: 'Sharing your favorite subject in class',
                aiRole: 'classmate',
                phases: [
                  {
                    phase: 'intro',
                    prompt: "We're sharing our favorite subjects! Use an 'I feel' or 'I think' sentence to join in.",
                    expectedResponse: ['i think', 'i feel', 'my favorite']
                  },
                  {
                    phase: 'practice',
                    prompt: "I think science is the best because of the cool experiments. What do you think?",
                    expectedResponse: ['i like', 'i think', 'math', 'reading', 'because'],
                    feedback: {
                      success: 'Awesome! You shared your opinion respectfully.',
                      encouragement: 'Try starting with “I think…” or explain why you like it.'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "Great job expressing yourself! Everyone’s opinion matters."
                  }
                ]
              }
            ]
          }
        ]
      },
  
      {
        id: 'feedback-and-tone',
        title: 'Tone and Thoughtful Responses',
        description: 'Practicing tone and giving kind feedback',
        lessons: [
          {
            id: 'kind-feedback',
            title: 'Giving Helpful Feedback',
            difficulty: 'intermediate',
            estimatedTime: '10 minutes',
            objectives: [
              'Use kind words when giving opinions',
              'Say one nice thing and one suggestion',
              'Be specific, not mean'
            ],
            scenarios: [
              {
                id: 'art-project-feedback',
                title: 'Commenting on Work',
                context: 'Classmate shows you their drawing',
                aiRole: 'classmate',
                phases: [
                  {
                    phase: 'intro',
                    prompt: "Your classmate wants feedback on their art. Give a kind compliment and a suggestion.",
                    expectedResponse: ['i like', 'maybe you could', 'what if', 'cool', 'great job']
                  },
                  {
                    phase: 'practice',
                    prompt: "Here's my drawing! I worked really hard on the tree. What do you think?",
                    expectedResponse: ['i like', 'the tree', 'what if you added', 'maybe next time'],
                    feedback: {
                      success: 'That was very thoughtful and kind!',
                      encouragement: 'Try saying something nice, then suggest a small idea!'
                    }
                  },
                  {
                    phase: 'complete',
                    prompt: "You gave great feedback! That helps your classmate get better."
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






