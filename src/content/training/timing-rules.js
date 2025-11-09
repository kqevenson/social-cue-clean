/**
 * Social Cue Timing Rules
 * Grade-specific timing and pacing rules
 */

export const timingRules = {
    gradeRanges: {
      'K-2': {
        helpTimeout: 2000,
        afterResponse: 1000,
        maxTurnLength: 8,
        responseSpeed: 'slow',
        pauseTolerance: 'high',
        speechRate: 0.85,
        paceLabel: 'LIVELY'
      },
      '3-5': {
        helpTimeout: 2000,
        afterResponse: 800,
        maxTurnLength: 12,
        responseSpeed: 'moderate',
        pauseTolerance: 'moderate',
        speechRate: 0.90,
        paceLabel: 'MOMENTUM'
      },
      '6-8': {
        helpTimeout: 2500,
        afterResponse: 500,
        maxTurnLength: 15,
        responseSpeed: 'moderate',
        pauseTolerance: 'moderate',
        speechRate: 0.95,
        paceLabel: 'NATURAL'
      },
      '9-12': {
        helpTimeout: 3000,
        afterResponse: 500,
        maxTurnLength: 20,
        responseSpeed: 'natural',
        pauseTolerance: 'low',
        speechRate: 1.00,
        paceLabel: 'REAL-TIME'
      }
    },
    
    rapidMethod: {
      recognize: 'Detect pause after 2 seconds',
      assess: 'Determine if student needs help or is thinking',
      provide: 'Offer specific, actionable prompt',
      invite: 'Explicitly invite response ("Your turn!")',
      deliver: 'Praise attempt immediately'
    },
    
    helpPrompts: {
      gentle: [
        "Take your time. What would you like to say?",
        "It's okay to pause and think. Your turn!",
        "Need a hint? Try starting with..."
      ],
      specific: [
        "Try saying: 'Hi, my name is...'",
        "You could ask: 'What do you like to do?'",
        "Remember to make eye contact and smile!"
      ]
    }
  };
  
  /**
   * Get timing rules for specific grade level
   */
  export const getTimingForGrade = (gradeLevel) => {
    const gradeNum = parseInt(gradeLevel, 10);
    
    if (gradeNum <= 2) return timingRules.gradeRanges['K-2'];
    if (gradeNum <= 5) return timingRules.gradeRanges['3-5'];
    if (gradeNum <= 8) return timingRules.gradeRanges['6-8'];
    return timingRules.gradeRanges['9-12'];
  };
  
  export default timingRules;