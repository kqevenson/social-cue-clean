// Social Cue Leadership Methodology

export const leadershipMethod = {
  phases: [
    {
      key: 'demonstrate',
      title: 'Demonstrate',
      description: 'AI models the skill first, playing both roles.',
      scriptCue: "Watch me first. Listen to my words and tone..."
    },
    {
      key: 'guided-repetition',
      title: 'Guided Repetition',
      description: 'Learner repeats line-by-line with coaching.',
      scriptCue: 'Repeat after me: '
    },
    {
      key: 'scenario-practice',
      title: 'Scenario Practice',
      description: 'AI acts in character while learner applies skill.',
      scriptCue: "Now I'm going to be the other person. Ready? Go!"
    },
    {
      key: 'variation',
      title: 'Variation',
      description: 'Add variations to solidify skill and adaptability.',
      scriptCue: "Great! Let’s make it a little harder by adding..."
    }
  ],
  expectations: {
    characterMode: {
      maxExchanges: 5,
      reminders: [
        'Stay in character until the exit cue.',
        'No coaching during character mode.',
        'Exit with explicit praise and reflection.'
      ]
    }
  }
};

export default leadershipMethod;
