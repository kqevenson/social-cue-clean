/**
 * Introduction Scripts - Grade-Specific Opening Dialogues
 * CORRECTED VERSION with both onboarding AND scenario-specific scripts
 */

export const introductionScripts = {
    'K-2': {
      // General onboarding (used when first opening the app)
      greeting: "Hi! I'm Cue, and I'm so excited to practice with you today!",
      introduction: "I help friends learn how to talk with other people. We're going to play some fun games where we practice saying hi, making friends, and having good conversations!",
      safety: "This is a safe place to try new things. There are no wrong answers, and we can practice as many times as you want!",
      consent: "Are you ready to practice with me?",
      firstPrompt: "Let's start with something fun! Can you tell me your favorite thing to play?",
      
      // Scenario-specific scripts (used for voice practice sessions)
      scenarios: {
        'starting-conversation': {
          intro: "Let's practice saying hello! Can you say hi to me?",
          afterResponse: "Yay! Great job! You said hi! That's so nice! Now let's pretend I'm a new friend at school."
        },
        'making-friends': {
          intro: "Let's practice making new friends! Can you say 'Hi, want to play?'",
          afterResponse: "Wow! That was so friendly! You're doing great! Now I'll be a kid on the playground."
        },
        'paying-attention': {
          intro: "Let's practice being a good listener! When I talk, you look at me and nod. Ready?",
          afterResponse: "Perfect! You looked right at me! That's how we show we're listening! Now let's try it for real."
        },
        'asking-help': {
          intro: "Sometimes we need help. Let's practice asking nicely! Can you say 'Can you help me, please?'",
          afterResponse: "Great job! You asked so nicely! People love to help when you're polite! Now let's pretend you need help with something."
        },
        'joining-group': {
          intro: "Let's practice joining friends who are playing! Can you say 'Can I play too?'",
          afterResponse: "Wonderful! You asked so nicely! That's how we join in! Now I'll pretend to be kids playing."
        }
      }
    },
  
    '3-5': {
      // General onboarding
      greeting: "Hey there! I'm Cue, your practice coach!",
      introduction: "I'm here to help you get really good at starting conversations, making friends, and talking with people in different situations.",
      safety: "This is a totally safe space—no one else is watching, and there are no wrong answers. We're just going to practice together!",
      consent: "Sound good?",
      firstPrompt: "Let's start! What's one thing you'd like to get better at when talking to people?",
      
      // Scenario-specific scripts
      scenarios: {
        'starting-conversation': {
          intro: "Okay! Imagine you see someone new at recess. What could you say to start talking with them?",
          afterResponse: "Nice! That's a friendly way to start. What else could you add to show you're interested? Let me be that new kid for a minute."
        },
        'making-friends': {
          intro: "Picture this: there's a new student in your class. How would you introduce yourself and try to be friends?",
          afterResponse: "Good thinking! You're being friendly and showing interest. Let's try this out - I'll be the new student."
        },
        'paying-attention': {
          intro: "Let's practice being a really good listener. I'm going to tell you about my weekend, and you show me you're paying attention. Ready?",
          afterResponse: "I could tell you were really listening! What did you do to show that? Great! Now let's practice with a real conversation."
        },
        'asking-help': {
          intro: "Sometimes we need help with homework or a problem. How would you ask your teacher for help in a good way?",
          afterResponse: "That's a respectful way to ask! What made that approach effective? Awesome! Let me be your teacher for this practice."
        },
        'joining-group': {
          intro: "You see a group of classmates playing a game at recess. How would you join them?",
          afterResponse: "Smart approach! You're being polite and showing interest. Let's try it - I'll be part of the group."
        }
      }
    },
  
    '6-8': {
      // General onboarding
      greeting: "Hi, I'm Cue.",
      introduction: "I'm an AI coach designed to help you practice social situations before you face them in real life. Whether it's talking to new people, handling awkward moments, or building confidence—we'll practice it here first.",
      safety: "This is completely private, and you can practice anything you want. No judgment, just practice.",
      consent: "Where do you want to start?",
      firstPrompt: "What's a social situation you want to practice today?",
      
      // Scenario-specific scripts
      scenarios: {
        'starting-conversation': {
          intro: "Picture this: there's a new student sitting alone at lunch. How would you approach them and start a conversation?",
          afterResponse: "That's a solid opener. It's friendly without being too intense. How would you keep the conversation going? Alright, let's run through this - I'll be the new student."
        },
        'making-friends': {
          intro: "You've noticed someone in your class who seems cool and shares some of your interests. What's your approach for getting to know them better?",
          afterResponse: "Good strategy! You're balancing friendliness with respect for their space. Let's try it out - I'll be that person."
        },
        'paying-attention': {
          intro: "Imagine a friend is telling you about something important that happened to them. How do you show them you're really listening and you care?",
          afterResponse: "Those are great active listening techniques! Which one do you think is most important? Cool! Let's practice - I'll tell you about something that happened."
        },
        'asking-help': {
          intro: "You're stuck on a group project and need to ask your teammates for help without seeming clueless. How would you approach that?",
          afterResponse: "That's a mature way to handle it. You're being honest without putting yourself down. Nice! Let me be one of your teammates."
        },
        'joining-group': {
          intro: "There's a group conversation happening in the hallway about a topic you're interested in. How do you join without it being awkward?",
          afterResponse: "Smart timing and approach! You're reading the room well. Let's practice - I'll be part of that group."
        }
      }
    },
  
    '9-12': {
      // General onboarding
      greeting: "Hi, I'm Cue.",
      introduction: "I'm here to help you refine your communication and social skills—whether that's for job interviews, college, relationships, or daily interactions. Think of this as a rehearsal space where you can try different approaches and get real feedback.",
      safety: "This is a private space to practice and experiment. Everything we discuss stays here.",
      consent: "What would you like to focus on?",
      firstPrompt: "Tell me about a situation you want to prepare for or improve.",
      
      // Scenario-specific scripts
      scenarios: {
        'starting-conversation': {
          intro: "You notice someone in your class who seems to share your interests. What's your strategy for initiating a conversation?",
          afterResponse: "Thoughtful approach. You're balancing friendliness with respect for their space. What factors would influence your timing and tone? Let's try this - I'll be that person."
        },
        'making-friends': {
          intro: "You want to expand your social circle and there's someone you'd like to get to know better. How do you build that connection authentically?",
          afterResponse: "That shows social intelligence. You're being genuine rather than forced. How would you gauge their receptiveness? Let's run through this scenario."
        },
        'paying-attention': {
          intro: "In a serious conversation, someone is sharing something personal with you. How do you demonstrate empathy and engagement through your listening?",
          afterResponse: "Those are sophisticated listening skills. Which techniques do you find most effective in building trust? Let's practice this - I'll share something with you."
        },
        'asking-help': {
          intro: "You need assistance with a complex problem—maybe academic, social, or personal. How do you ask for help in a way that's effective and maintains your confidence?",
          afterResponse: "That's a mature approach. You're being clear about what you need without apologizing for needing support. Well done. Let me play the role of someone who can help."
        },
        'joining-group': {
          intro: "You're interested in joining a conversation or group activity. How do you assess the situation and integrate yourself naturally?",
          afterResponse: "That demonstrates strong social awareness. You're reading social cues and timing your entry well. Let's practice - I'll be part of the group."
        }
      }
    }
  };
  
  export const getIntroductionSequence = (gradeLevel) => {
    const match = gradeLevel?.match(/\d+/);
    const grade = match ? parseInt(match[0], 10) : 6;
  
    let gradeRange;
  
    if (grade <= 2) gradeRange = 'K-2';
    else if (grade <= 5) gradeRange = '3-5';
    else if (grade <= 8) gradeRange = '6-8';
    else gradeRange = '9-12';
  
    const script = introductionScripts[gradeRange];
  
    return {
      fullIntro: `${script.greeting} ${script.introduction} ${script.safety} ${script.consent}`,
      firstPrompt: script.firstPrompt,
      gradeRange,
      scenarios: script.scenarios // Also return scenarios for voice practice
    };
  };
  
  export default introductionScripts;