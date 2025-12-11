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
  
    toneAnalysis: {
      enabled: true,
      expectedTones: ['friendly', 'curious', 'respectful'],
      feedback: {
        positive: 'You used a friendly tone — nice work!',
        negative: 'Try using a more respectful or friendly tone when responding.'
      }
    },
  
    feedbackSettings: {
      detectMisunderstanding: true,
      allowCorrections: true,
      correctionExamples: [
        {
          mistake: 'cutting someone off',
          correction: 'Try waiting for a pause before jumping in.'
        },
        {
          mistake: 'short or dismissive answers',
          correction: 'You could add a follow-up or ask a question to show interest.'
        }
      ]
    },
  
    metaGoals: [
      'Build empathy through dialogue',
      'Use tone to influence communication',
      'Practice self-advocacy and boundary setting'
    ],
  
    // ... existing content remains unchanged
  };
  
  export default grade68Curriculum;
  







