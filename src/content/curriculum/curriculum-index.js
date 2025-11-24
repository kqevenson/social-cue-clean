const curriculum = {
  'start-a-conversation': {
    id: 'start-a-conversation',
    icon: '💬',
    category: 'initiating-connections',
    title: {
      K: 'Say Hi to a New Friend',
      1: 'Start a Chat at School',
      2: 'Talk to Someone New',
      3: 'Say Hello with Confidence',
      4: 'Greet Someone at Recess',
      5: 'Start a Conversation at Lunch',
      6: 'Start a Conversation at Lunch',
      7: 'Say Hi Without Feeling Awkward',
      8: 'Talk to Someone You Don’t Know Yet',
      9: 'Break the Ice Naturally',
      10: 'Start Conversations with Ease',
      11: 'Confidently Say Hi in New Settings',
      12: 'Spark Small Talk with Confidence'
    },
    description: {
      K: 'You want to say hi to someone new during playtime.',
      1: 'You see a classmate and want to talk to them.',
      2: 'You want to say something friendly to someone at school.',
      3: 'You want to talk to someone you haven’t met before.',
      4: 'You’re at recess and see someone standing alone.',
      5: 'You’re walking into the lunchroom and want to sit with someone.',
      6: 'You want to start a conversation with someone new at lunch.',
      7: 'You’re walking into class and want to say hey to someone you don’t know well.',
      8: 'You see someone at lunch and want to talk, but aren’t sure how.',
      9: 'You’re in a group and want to join the conversation without it feeling weird.',
      10: 'You’re around people you don’t know well and want to start chatting.',
      11: 'You walk into a club meeting or class and want to break the ice.',
      12: 'You’re at an event and want to make small talk with someone near you.'
    },
    learningObjectives: [
      'Feel comfortable saying hi to someone new',
      'Think of simple questions to ask',
      'Practice smiling and showing interest',
      'Know how to join a conversation politely'
    ],
    setupPrompt: `Let’s practice starting a conversation in a real-world situation. Think about how you'd feel walking up to someone new. What’s something friendly you could say to start? Let’s try!`,
    estimatedDuration: 5,
    characterRole: 'Coach Cue'
  },

  'handle-rejection': {
    id: 'handle-rejection',
    icon: '🚫',
    category: 'managing-emotions',
    title: {
      K: 'When Someone Says “No”',
      1: 'If Someone Doesn’t Want to Play',
      2: 'Hearing “No” and Staying Calm',
      3: 'When Friends Say No',
      4: 'It’s Okay to Feel Left Out',
      5: 'When You’re Not Picked',
      6: 'If Someone Doesn’t Want to Talk',
      7: 'Handling Awkward Reactions',
      8: 'If Someone Isn’t Interested',
      9: 'Coping with Rejection Calmly',
      10: 'Taking “No” without Overthinking',
      11: 'Keeping Your Cool When Ignored',
      12: 'Stay Confident Through Social Rejection'
    },
    description: {
      K: 'You asked someone to play, but they said no.',
      1: 'You asked a classmate to play and they said they don’t want to.',
      2: 'You waved at someone and they didn’t wave back.',
      3: 'You tried to sit with someone and they said the seat was saved.',
      4: 'You invited someone to a game and they said they didn’t want to.',
      5: 'You asked a group if you could join and they said no.',
      6: 'You texted someone and they didn’t respond.',
      7: 'You said hi to someone in the hall and they ignored you.',
      8: 'You asked a question and the person brushed you off.',
      9: 'You tried joining a group and they didn’t include you.',
      10: 'You sent a message and never heard back.',
      11: 'You tried making plans and the other person wasn’t interested.',
      12: 'You asked someone out or invited them somewhere and they turned you down.'
    },
    learningObjectives: [
      'Recognize different types of rejection',
      'Understand how to manage feelings in the moment',
      'Learn phrases to stay kind and confident',
      'Know how to respond without overreacting'
    ],
    setupPrompt: `Let’s practice what to say and how to act when someone says no. Think of a time someone didn’t include you. What could you say or think to stay calm and kind?`,
    estimatedDuration: 6,
    characterRole: 'Coach Cue'
  },

  'making-friends': {
    id: 'making-friends',
    icon: '🤝',
    category: 'initiating-connections',
    title: {
      K: 'Making New Friends',
      1: 'Becoming Friends with Classmates',
      2: 'How to Make a New Friend',
      3: 'Meeting New People',
      4: 'Becoming Friends at Recess',
      5: 'Making Friends at Lunch',
      6: 'Making Friends at School',
      7: 'Becoming Friends Without Feeling Awkward',
      8: 'Starting New Friendships',
      9: 'How to Talk and Make Friends',
      10: 'Making Friends with Confidence',
      11: 'Building New Friendships',
      12: 'Connecting and Making New Friends'
    },
    description: {
      K: 'You want to play with someone and become friends.',
      1: 'You want to become friends with a classmate.',
      2: 'You want to make a new friend at school.',
      3: 'You want to get to know someone new.',
      4: 'You meet someone new at recess and want to be friends.',
      5: 'You sit near someone new and want to talk to them.',
      6: 'You want to make a new friend at lunch.',
      7: 'You pass someone in the hall and want to become friends.',
      8: 'You\'re in class or lunch and want to form a new friendship.',
      9: 'You want to join a group and make friends naturally.',
      10: 'You want to make new friends in a new situation.',
      11: 'You want to form a new friendship in class or a club.',
      12: 'You want to build a connection and become friends with someone new.'
    },
    learningObjectives: [
      'Learn how to introduce yourself naturally',
      'Practice showing interest in others',
      'Understand how friendships form',
      'Build confidence in social interactions'
    ],
    setupPrompt: `Let's practice how to make a new friend. Think about someone you'd like to talk to. What's one friendly thing you could say to start building a connection?`,
    estimatedDuration: 6,
    characterRole: 'Coach Cue'
  }
};

export default curriculum;
