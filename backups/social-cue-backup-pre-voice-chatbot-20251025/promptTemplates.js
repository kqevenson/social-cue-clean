/**
 * Prompt Templates for Social Skills Lesson Generation
 * 
 * This file contains structured templates for generating AI-powered social skills lessons.
 * Each template provides topic-specific guidance, age-appropriate content, and learning objectives.
 * 
 * Usage:
 * 1. Import this module in your lesson generation endpoint
 * 2. Use the template for the specific topic to enhance the Claude prompt
 * 3. Templates ensure consistent, high-quality lesson generation across all topics
 * 
 * Adding New Templates:
 * 1. Follow the existing structure exactly
 * 2. Include all required fields (displayName, learningObjectives, keySkills, etc.)
 * 3. Ensure all grade levels (K-2, 3-5, 6-8, 9-12) are covered
 * 4. Test with different grade levels before deploying
 */

const promptTemplates = {
  'small-talk-basics': {
    displayName: 'Small Talk Basics',
    learningObjectives: {
      'K-2': 'Learn how to talk with friends and classmates about everyday things',
      '3-5': 'Practice starting and keeping casual conversations going',
      '6-8': 'Master the art of comfortable small talk with peers',
      '9-12': 'Develop confident conversation skills for various social settings'
    },
    keySkills: [
      'Asking open-ended questions',
      'Finding common interests',
      'Active listening and responding',
      'Keeping conversation flowing',
      'Reading social cues'
    ],
    commonMistakes: [
      'Only talking about yourself',
      'Asking yes/no questions only',
      'Not listening to responses',
      'Changing topics too quickly',
      'Forgetting to ask follow-up questions'
    ],
    scenarioContexts: {
      'K-2': ['playground', 'lunch table', 'classroom', 'after school'],
      '3-5': ['recess', 'group projects', 'lunch', 'school bus', 'sports practice'],
      '6-8': ['between classes', 'lunch period', 'clubs', 'social events', 'online chats'],
      '9-12': ['before class', 'study groups', 'part-time jobs', 'social gatherings', 'extracurriculars']
    },
    realWorldChallenges: {
      'K-2': 'Try starting a conversation with someone new at recess by asking about their favorite game or toy',
      '3-5': 'Practice small talk with a classmate you don\'t usually talk to - ask about their weekend or hobbies',
      '6-8': 'Start a casual conversation with someone in your class before the bell rings',
      '9-12': 'Initiate small talk with someone new in one of your extracurricular activities'
    },
    promptInstructions: `When generating lessons about small talk, focus on:
- Building comfort with casual conversation
- Teaching how to find common ground
- Emphasizing listening as much as talking
- Showing how to keep conversations natural and flowing
- Using age-appropriate social situations`
  },

  'active-listening': {
    displayName: 'Active Listening',
    learningObjectives: {
      'K-2': 'Learn to pay attention when others are talking and show you care',
      '3-5': 'Practice really listening and responding to what others say',
      '6-8': 'Master active listening techniques to build stronger friendships',
      '9-12': 'Develop advanced listening skills for meaningful connections'
    },
    keySkills: [
      'Making eye contact',
      'Nodding and verbal acknowledgment',
      'Asking follow-up questions',
      'Remembering what was said',
      'Showing empathy'
    ],
    commonMistakes: [
      'Interrupting while others talk',
      'Looking at phone or away',
      'Thinking about response instead of listening',
      'Changing subject immediately',
      'Not asking follow-up questions'
    ],
    scenarioContexts: {
      'K-2': ['story time', 'show and tell', 'talking with friends', 'listening to teacher'],
      '3-5': ['group discussions', 'friend sharing news', 'partner work', 'family conversations'],
      '6-8': ['peer conversations', 'group projects', 'friend venting', 'class discussions'],
      '9-12': ['deep conversations', 'supporting friends', 'academic discussions', 'relationship talks']
    },
    realWorldChallenges: {
      'K-2': 'When someone tells you something today, look at them and ask one question about what they said',
      '3-5': 'Practice active listening with a friend - ask at least two follow-up questions about what they share',
      '6-8': 'Have a conversation where you focus completely on listening - no phone, full attention',
      '9-12': 'Practice reflective listening - repeat back what someone said to show you understood'
    },
    promptInstructions: `When generating lessons about active listening, focus on:
- Teaching both verbal and non-verbal listening cues
- Emphasizing empathy and understanding
- Showing the difference between hearing and truly listening
- Building skills for asking meaningful follow-up questions
- Demonstrating how listening strengthens relationships`
  },

  'starting-conversations': {
    displayName: 'Starting Conversations',
    learningObjectives: {
      'K-2': 'Learn how to say hello and start talking with new friends',
      '3-5': 'Practice introducing yourself and finding conversation starters',
      '6-8': 'Master confident conversation initiation with peers and adults',
      '9-12': 'Develop sophisticated conversation starters for various social contexts'
    },
    keySkills: [
      'Making introductions',
      'Finding conversation starters',
      'Reading social situations',
      'Building confidence',
      'Following up after initial contact'
    ],
    commonMistakes: [
      'Being too pushy or aggressive',
      'Not reading social cues',
      'Using inappropriate conversation starters',
      'Giving up too quickly',
      'Not following up on initial contact'
    ],
    scenarioContexts: {
      'K-2': ['playground', 'classroom', 'birthday parties', 'playdates'],
      '3-5': ['new school', 'clubs', 'sports teams', 'neighborhood', 'family events'],
      '6-8': ['new classes', 'social events', 'community activities', 'camps', 'after-school programs'],
      '9-12': ['college visits', 'job interviews', 'networking events', 'volunteer work', 'social gatherings']
    },
    realWorldChallenges: {
      'K-2': 'Introduce yourself to someone new at recess and ask them to play',
      '3-5': 'Start a conversation with a new classmate by asking about their favorite subject',
      '6-8': 'Initiate a conversation with someone you don\'t know at a school event',
      '9-12': 'Practice introducing yourself to someone new in a professional or academic setting'
    },
    promptInstructions: `When generating lessons about starting conversations, focus on:
- Building confidence in social initiation
- Teaching appropriate conversation starters for different contexts
- Emphasizing reading social cues and situations
- Showing how to recover from awkward moments
- Demonstrating the importance of follow-up and relationship building`
  },

  'joining-group-conversations': {
    displayName: 'Joining Group Conversations',
    learningObjectives: {
      'K-2': 'Learn how to join in when friends are already talking',
      '3-5': 'Practice entering group discussions naturally and respectfully',
      '6-8': 'Master the art of joining group conversations without interrupting',
      '9-12': 'Develop sophisticated group entry skills for various social settings'
    },
    keySkills: [
      'Reading group dynamics',
      'Finding appropriate entry points',
      'Contributing meaningfully',
      'Respecting existing conversations',
      'Building on what others said'
    ],
    commonMistakes: [
      'Interrupting ongoing conversations',
      'Not listening to context before joining',
      'Dominating the conversation',
      'Making inappropriate comments',
      'Not contributing anything meaningful'
    ],
    scenarioContexts: {
      'K-2': ['lunch table', 'playground', 'classroom discussions', 'circle time'],
      '3-5': ['group projects', 'recess', 'lunch', 'class discussions', 'after-school activities'],
      '6-8': ['lunch period', 'clubs', 'study groups', 'social events', 'online group chats'],
      '9-12': ['study groups', 'clubs', 'social gatherings', 'academic discussions', 'professional networking']
    },
    realWorldChallenges: {
      'K-2': 'Join a conversation at lunch by listening first, then adding something related',
      '3-5': 'Practice joining a group discussion about a project by building on what others said',
      '6-8': 'Join a conversation at lunch by waiting for a natural pause and contributing thoughtfully',
      '9-12': 'Practice joining a professional or academic discussion by adding valuable insights'
    },
    promptInstructions: `When generating lessons about joining group conversations, focus on:
- Teaching social awareness and group dynamics
- Emphasizing respectful entry into existing conversations
- Showing how to contribute meaningfully to group discussions
- Building skills for reading social cues and timing
- Demonstrating the balance between participation and listening`
  },

  'reading-body-language': {
    displayName: 'Reading Body Language',
    learningObjectives: {
      'K-2': 'Learn to notice how people look and move when they talk',
      '3-5': 'Practice understanding what body language tells us about feelings',
      '6-8': 'Master reading non-verbal cues to better understand peers',
      '9-12': 'Develop advanced skills in interpreting body language and social signals'
    },
    keySkills: [
      'Observing facial expressions',
      'Reading posture and stance',
      'Noticing gestures and movements',
      'Understanding personal space',
      'Matching body language appropriately'
    ],
    commonMistakes: [
      'Misreading friendly gestures',
      'Not noticing discomfort signals',
      'Ignoring personal space boundaries',
      'Overthinking simple gestures',
      'Not considering cultural differences'
    ],
    scenarioContexts: {
      'K-2': ['playground', 'classroom', 'story time', 'group activities'],
      '3-5': ['group work', 'recess', 'lunch', 'presentations', 'social interactions'],
      '6-8': ['peer interactions', 'group projects', 'social events', 'classroom discussions'],
      '9-12': ['interviews', 'presentations', 'social gatherings', 'professional settings', 'dating situations']
    },
    realWorldChallenges: {
      'K-2': 'Notice how your friends look when they are happy or sad today',
      '3-5': 'Practice reading how someone feels by looking at their face and body before you talk to them',
      '6-8': 'Observe the body language of people in your class and see if it matches what they are saying',
      '9-12': 'Practice reading body language in professional or social situations to improve your social awareness'
    },
    promptInstructions: `When generating lessons about reading body language, focus on:
- Teaching observation skills and attention to detail
- Emphasizing the connection between emotions and body language
- Showing how to use body language reading to improve social interactions
- Building awareness of personal space and boundaries
- Demonstrating how to respond appropriately to non-verbal cues`
  },

  'asking-questions': {
    displayName: 'Asking Questions',
    learningObjectives: {
      'K-2': 'Learn how to ask questions to learn about friends and things',
      '3-5': 'Practice asking good questions that help conversations flow',
      '6-8': 'Master the art of asking meaningful questions in social situations',
      '9-12': 'Develop sophisticated questioning skills for various contexts'
    },
    keySkills: [
      'Forming open-ended questions',
      'Asking follow-up questions',
      'Showing genuine interest',
      'Asking appropriate questions for context',
      'Listening to answers before asking more'
    ],
    commonMistakes: [
      'Asking too many questions at once',
      'Not listening to answers',
      'Asking personal questions too soon',
      'Asking yes/no questions only',
      'Interrupting to ask questions'
    ],
    scenarioContexts: {
      'K-2': ['show and tell', 'playground', 'classroom', 'making new friends'],
      '3-5': ['group projects', 'getting to know classmates', 'presentations', 'lunch conversations'],
      '6-8': ['peer interactions', 'group work', 'social events', 'academic discussions'],
      '9-12': ['interviews', 'networking', 'academic research', 'professional conversations']
    },
    realWorldChallenges: {
      'K-2': 'Ask three questions to learn about a friend\'s favorite things',
      '3-5': 'Practice asking follow-up questions when someone tells you about their weekend',
      '6-8': 'Have a conversation where you ask thoughtful questions to really get to know someone',
      '9-12': 'Practice asking insightful questions in a professional or academic setting'
    },
    promptInstructions: `When generating lessons about asking questions, focus on:
- Teaching the difference between good and poor questions
- Emphasizing active listening before asking follow-up questions
- Showing how questions can deepen relationships and conversations
- Building skills for appropriate question timing and context
- Demonstrating how questions show interest and care for others`
  },

  'sharing-about-yourself': {
    displayName: 'Sharing About Yourself',
    learningObjectives: {
      'K-2': 'Learn how to tell friends about yourself and your interests',
      '3-5': 'Practice sharing personal information appropriately with peers',
      '6-8': 'Master the balance of sharing enough without oversharing',
      '9-12': 'Develop sophisticated self-disclosure skills for different relationships'
    },
    keySkills: [
      'Choosing appropriate information to share',
      'Timing self-disclosure appropriately',
      'Matching sharing level to relationship',
      'Being authentic while appropriate',
      'Building trust through sharing'
    ],
    commonMistakes: [
      'Oversharing personal information',
      'Not sharing anything personal',
      'Sharing inappropriate details',
      'Not considering the audience',
      'Sharing too much too soon'
    ],
    scenarioContexts: {
      'K-2': ['show and tell', 'making friends', 'playground', 'classroom sharing'],
      '3-5': ['getting to know classmates', 'group projects', 'presentations', 'lunch conversations'],
      '6-8': ['peer relationships', 'group work', 'social events', 'building friendships'],
      '9-12': ['dating', 'professional relationships', 'college applications', 'job interviews']
    },
    realWorldChallenges: {
      'K-2': 'Share something fun about yourself with a new friend',
      '3-5': 'Practice sharing one thing about yourself when meeting someone new',
      '6-8': 'Have a conversation where you share appropriately to build a new friendship',
      '9-12': 'Practice appropriate self-disclosure in a professional or academic setting'
    },
    promptInstructions: `When generating lessons about sharing about yourself, focus on:
- Teaching appropriate boundaries and privacy
- Emphasizing the importance of context and relationship level
- Showing how sharing builds trust and connection
- Building skills for authentic but appropriate self-disclosure
- Demonstrating how to read social cues about what to share when`
  },

  'handling-disagreements': {
    displayName: 'Handling Disagreements',
    learningObjectives: {
      'K-2': 'Learn how to disagree nicely and find solutions together',
      '3-5': 'Practice resolving conflicts with friends and classmates',
      '6-8': 'Master constructive disagreement and conflict resolution skills',
      '9-12': 'Develop advanced negotiation and conflict resolution abilities'
    },
    keySkills: [
      'Staying calm during disagreements',
      'Listening to different perspectives',
      'Finding common ground',
      'Expressing disagreement respectfully',
      'Working toward solutions'
    ],
    commonMistakes: [
      'Getting angry or defensive',
      'Not listening to other viewpoints',
      'Making personal attacks',
      'Giving up too easily',
      'Avoiding disagreements entirely'
    ],
    scenarioContexts: {
      'K-2': ['playground conflicts', 'sharing toys', 'group activities', 'classroom rules'],
      '3-5': ['group project decisions', 'recess games', 'lunch choices', 'classroom discussions'],
      '6-8': ['peer conflicts', 'group work disagreements', 'social situations', 'academic debates'],
      '9-12': ['relationship conflicts', 'academic disagreements', 'professional situations', 'family issues']
    },
    realWorldChallenges: {
      'K-2': 'Practice saying "I disagree" nicely when you have a different idea',
      '3-5': 'Work through a disagreement with a friend by listening and finding a solution together',
      '6-8': 'Handle a disagreement in a group project by staying calm and finding compromise',
      '9-12': 'Practice resolving a conflict in a professional or academic setting constructively'
    },
    promptInstructions: `When generating lessons about handling disagreements, focus on:
- Teaching emotional regulation and staying calm
- Emphasizing the value of different perspectives
- Showing how to disagree respectfully and constructively
- Building skills for finding compromise and solutions
- Demonstrating how healthy disagreement strengthens relationships`
  },

  'making-friends': {
    displayName: 'Making Friends',
    learningObjectives: {
      'K-2': 'Learn how to be friendly and make new friends',
      '3-5': 'Practice building friendships and being a good friend',
      '6-8': 'Master the skills of initiating and maintaining friendships',
      '9-12': 'Develop sophisticated relationship-building skills for various contexts'
    },
    keySkills: [
      'Being approachable and friendly',
      'Showing interest in others',
      'Being reliable and trustworthy',
      'Supporting friends through challenges',
      'Maintaining friendships over time'
    ],
    commonMistakes: [
      'Being too pushy or aggressive',
      'Not following through on commitments',
      'Only talking about yourself',
      'Giving up on friendships too quickly',
      'Not being supportive during tough times'
    ],
    scenarioContexts: {
      'K-2': ['playground', 'classroom', 'birthday parties', 'playdates'],
      '3-5': ['school', 'clubs', 'sports', 'neighborhood', 'family events'],
      '6-8': ['new schools', 'clubs', 'social events', 'online friendships', 'community activities'],
      '9-12': ['college', 'work', 'volunteer work', 'social groups', 'professional networking']
    },
    realWorldChallenges: {
      'K-2': 'Try to make a new friend at recess by being kind and sharing',
      '3-5': 'Practice being a good friend by supporting someone who is having a tough day',
      '6-8': 'Initiate a friendship with someone new at school or in an activity',
      '9-12': 'Practice building professional relationships or meaningful friendships in new settings'
    },
    promptInstructions: `When generating lessons about making friends, focus on:
- Teaching the fundamentals of friendship and connection
- Emphasizing the importance of being a good friend yourself
- Showing how to build trust and maintain relationships
- Building skills for supporting friends through challenges
- Demonstrating how friendships enrich life and provide support`
  },

  'expressing-feelings': {
    displayName: 'Expressing Feelings',
    learningObjectives: {
      'K-2': 'Learn how to tell others how you feel using words',
      '3-5': 'Practice expressing emotions clearly and appropriately',
      '6-8': 'Master emotional expression and communication skills',
      '9-12': 'Develop sophisticated emotional intelligence and communication'
    },
    keySkills: [
      'Identifying and naming emotions',
      'Expressing feelings clearly',
      'Using appropriate emotional language',
      'Sharing feelings at the right time',
      'Managing emotional intensity'
    ],
    commonMistakes: [
      'Bottling up emotions',
      'Expressing feelings inappropriately',
      'Not considering timing or context',
      'Using emotions to manipulate',
      'Not listening to others\' feelings'
    ],
    scenarioContexts: {
      'K-2': ['when upset', 'when happy', 'when frustrated', 'when excited'],
      '3-5': ['conflicts with friends', 'academic stress', 'family situations', 'peer pressure'],
      '6-8': ['relationship issues', 'academic pressure', 'family conflicts', 'social challenges'],
      '9-12': ['relationship communication', 'academic stress', 'family dynamics', 'professional situations']
    },
    realWorldChallenges: {
      'K-2': 'Practice telling someone how you feel when you are happy or sad',
      '3-5': 'Express your feelings clearly when you disagree with a friend',
      '6-8': 'Share your feelings about a difficult situation with a trusted friend or adult',
      '9-12': 'Practice expressing complex emotions in a professional or personal relationship'
    },
    promptInstructions: `When generating lessons about expressing feelings, focus on:
- Teaching emotional vocabulary and identification
- Emphasizing appropriate timing and context for emotional expression
- Showing how to express feelings constructively and clearly
- Building skills for emotional regulation and management
- Demonstrating how healthy emotional expression strengthens relationships`
  },

  'giving-compliments': {
    displayName: 'Giving Compliments',
    learningObjectives: {
      'K-2': 'Learn how to say nice things to make others feel good',
      '3-5': 'Practice giving sincere compliments to friends and classmates',
      '6-8': 'Master the art of giving meaningful, specific compliments',
      '9-12': 'Develop sophisticated skills in giving authentic praise and recognition'
    },
    keySkills: [
      'Being specific and genuine',
      'Choosing appropriate compliments',
      'Timing compliments well',
      'Recognizing effort and character',
      'Making compliments meaningful'
    ],
    commonMistakes: [
      'Giving fake or insincere compliments',
      'Only complimenting appearance',
      'Giving compliments too frequently',
      'Not being specific enough',
      'Expecting compliments in return'
    ],
    scenarioContexts: {
      'K-2': ['artwork', 'helping others', 'good behavior', 'sharing'],
      '3-5': ['academic work', 'kindness', 'effort', 'talents', 'helping others'],
      '6-8': ['achievements', 'character traits', 'effort', 'creativity', 'leadership'],
      '9-12': ['professional work', 'character', 'achievements', 'leadership', 'contributions']
    },
    realWorldChallenges: {
      'K-2': 'Give one sincere compliment to a friend today about something they did well',
      '3-5': 'Practice giving specific compliments about someone\'s effort or character',
      '6-8': 'Give a meaningful compliment to someone who might not hear many positive things',
      '9-12': 'Practice giving professional compliments or recognition in appropriate settings'
    },
    promptInstructions: `When generating lessons about giving compliments, focus on:
- Teaching the difference between genuine and fake praise
- Emphasizing the power of specific, meaningful compliments
- Showing how compliments can build others up and strengthen relationships
- Building skills for recognizing effort, character, and achievement
- Demonstrating how compliments create positive social environments`
  },

  'receiving-compliments': {
    displayName: 'Receiving Compliments',
    learningObjectives: {
      'K-2': 'Learn how to say thank you when someone says something nice',
      '3-5': 'Practice accepting compliments graciously and confidently',
      '6-8': 'Master the art of receiving praise with humility and gratitude',
      '9-12': 'Develop sophisticated skills in accepting recognition and praise'
    },
    keySkills: [
      'Accepting compliments graciously',
      'Saying thank you sincerely',
      'Not deflecting or dismissing praise',
      'Recognizing your own worth',
      'Sharing credit when appropriate'
    ],
    commonMistakes: [
      'Dismissing or deflecting compliments',
      'Not saying thank you',
      'Being overly modest',
      'Fishing for more compliments',
      'Not believing the compliment'
    ],
    scenarioContexts: {
      'K-2': ['artwork', 'helping others', 'good behavior', 'sharing'],
      '3-5': ['academic work', 'kindness', 'effort', 'talents', 'helping others'],
      '6-8': ['achievements', 'character traits', 'effort', 'creativity', 'leadership'],
      '9-12': ['professional work', 'character', 'achievements', 'leadership', 'contributions']
    },
    realWorldChallenges: {
      'K-2': 'Practice saying "Thank you" when someone gives you a compliment',
      '3-5': 'Accept a compliment graciously without dismissing it or being overly modest',
      '6-8': 'Practice receiving praise with confidence while staying humble',
      '9-12': 'Practice accepting professional recognition or praise in appropriate settings'
    },
    promptInstructions: `When generating lessons about receiving compliments, focus on:
- Teaching gracious acceptance of praise and recognition
- Emphasizing the importance of self-worth and confidence
- Showing how to accept compliments without dismissing or deflecting them
- Building skills for appropriate humility and gratitude
- Demonstrating how accepting praise gracefully strengthens relationships`
  }
};

/**
 * Validates that all prompt templates have the required structure and fields
 * @param {Object} templates - The templates object to validate
 * @returns {Object} - Validation result with isValid boolean and errors array
 */
function validateTemplates(templates) {
  const requiredFields = ['displayName', 'learningObjectives', 'keySkills', 'commonMistakes', 'scenarioContexts', 'realWorldChallenges', 'promptInstructions'];
  const requiredGrades = ['K-2', '3-5', '6-8', '9-12'];
  const errors = [];

  for (const [topicKey, template] of Object.entries(templates)) {
    // Check required fields
    for (const field of requiredFields) {
      if (!template[field]) {
        errors.push(`Template '${topicKey}' missing required field: ${field}`);
      }
    }

    // Check learning objectives have all grade levels
    if (template.learningObjectives) {
      for (const grade of requiredGrades) {
        if (!template.learningObjectives[grade]) {
          errors.push(`Template '${topicKey}' missing learning objective for grade: ${grade}`);
        }
      }
    }

    // Check scenario contexts have all grade levels
    if (template.scenarioContexts) {
      for (const grade of requiredGrades) {
        if (!template.scenarioContexts[grade] || !Array.isArray(template.scenarioContexts[grade])) {
          errors.push(`Template '${topicKey}' missing or invalid scenario contexts for grade: ${grade}`);
        }
      }
    }

    // Check real world challenges have all grade levels
    if (template.realWorldChallenges) {
      for (const grade of requiredGrades) {
        if (!template.realWorldChallenges[grade]) {
          errors.push(`Template '${topicKey}' missing real world challenge for grade: ${grade}`);
        }
      }
    }

    // Check arrays have content
    if (template.keySkills && (!Array.isArray(template.keySkills) || template.keySkills.length === 0)) {
      errors.push(`Template '${topicKey}' keySkills must be a non-empty array`);
    }

    if (template.commonMistakes && (!Array.isArray(template.commonMistakes) || template.commonMistakes.length === 0)) {
      errors.push(`Template '${topicKey}' commonMistakes must be a non-empty array`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Gets a specific template by topic key
 * @param {string} topicKey - The key for the topic template
 * @returns {Object|null} - The template object or null if not found
 */
function getTemplate(topicKey) {
  return promptTemplates[topicKey] || null;
}

/**
 * Gets all available template keys
 * @returns {Array} - Array of all topic keys
 */
function getAllTemplateKeys() {
  return Object.keys(promptTemplates);
}

/**
 * Gets the display name for a topic key
 * @param {string} topicKey - The key for the topic template
 * @returns {string|null} - The display name or null if not found
 */
function getDisplayName(topicKey) {
  const template = getTemplate(topicKey);
  return template ? template.displayName : null;
}

export {
  promptTemplates,
  validateTemplates,
  getTemplate,
  getAllTemplateKeys,
  getDisplayName
};
