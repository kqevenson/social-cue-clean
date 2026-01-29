// Practice Session scenarios
import { 
  MessageCircle, MessageSquare, Users, UserPlus, Speech, Smile,
  Ear, Eye, Heart, Headphones, Focus, Waves,
  User, Hand, Sparkles, Target,
  Star, Zap, TrendingUp, Award, Shield, Flame
} from 'lucide-react';

const scenarios = {
    1: {
      id: 1,
      icon: MessageCircle,
      title: {
        'k2': 'Making Friends',
        '3-5': 'Small Talk Mastery',
        '6-8': 'Conversation Skills',
        '9-12': 'Social Communication'
      },
      color: '#4A90E2',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      situations: [
        {
          id: 1,
          icon: UserPlus,
          context: {
            'k2': "You notice a classmate sitting by themselves at lunch. You'd like to be friendly and sit with them.",
            '3-5': "You're in the cafeteria and see someone from your class sitting alone. You're thinking about joining them.",
            '6-8': "During lunch, you notice someone new sitting by themselves. You'd like to introduce yourself.",
            '9-12': "At lunch, you see an acquaintance sitting alone. You're considering starting a conversation."
          },
          prompt: {
            'k2': "What would be a kind way to start?",
            '3-5': "How might you begin this conversation?",
            '6-8': "What would be a friendly approach?",
            '9-12': "How would you start this interaction?"
          },
          options: [
            {
              text: {
                'k2': "Hi! Can I sit with you? I like your backpack!",
                '3-5': "Hey! Mind if I sit here? I noticed we're working on the same science project.",
                '6-8': "Hey, is this seat taken? I noticed we have history class together.",
                '9-12': "Mind if I join you? I wanted to ask what you thought about today's discussion."
              },
              feedback: {
                'k2': "That's wonderful! You asked permission nicely and shared a compliment. When we notice something we like about someone and tell them, it helps both people feel good!",
                '3-5': "Excellent choice! You asked permission respectfully and found something you both have in common. Finding shared interests is one of the best ways to start conversations.",
                '6-8': "Really well done! You were polite by asking about the seat first, and mentioning your shared class creates an easy conversation starter.",
                '9-12': "That's a great approach! You showed respect by asking permission, and referencing the class discussion demonstrates genuine interest."
              },
              proTip: null,
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "Why don't you have any friends?",
                '3-5': "Why are you sitting alone? Don't you have any friends?",
                '6-8': "Are you always by yourself?",
                '9-12': "No one wanted to sit with you?"
              },
              feedback: {
                'k2': "Let's think about this together. When we ask questions like this, it might make the other person feel sad. Instead, we want to make people feel welcome and happy!",
                '3-5': "I understand you're curious, but this question could hurt their feelings. There are many reasons someone might be sitting alone. Let's focus on making them feel welcome instead.",
                '6-8': "This approach could make them feel uncomfortable. People sit alone for many reasons, and it's not our place to make assumptions.",
                '9-12': "This question makes an assumption that could be hurtful. Let's approach with openness and respect."
              },
              proTip: {
                'k2': "Here's a helpful tip: Try saying 'Hi, I'm [your name]! Want to be friends?' with a smile. This makes everyone feel comfortable!",
                '3-5': "Here's something to remember: Instead of asking why someone is alone, try 'What are you reading?' This shows interest without making assumptions.",
                '6-8': "A better approach: Lead with genuine curiosity like 'Want some company?' This shows friendliness while respecting their space.",
                '9-12': "Consider this: Opening with 'Mind if I sit?' respects their autonomy while conveying interest."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "*Just sit down without saying hi*",
                '3-5': "*Sit down without saying anything*",
                '6-8': "*Sit nearby without acknowledging them*",
                '9-12': "*Take a seat without verbal acknowledgment*"
              },
              feedback: {
                'k2': "Remember, it's important to say hello and let someone know you'd like to sit with them. Even a simple 'Hi!' and a smile can make someone feel welcome and happy.",
                '3-5': "It's important to greet people when we join them. Even a simple 'Hello!' shows respect and lets them know you're friendly.",
                '6-8': "When we share space with someone, a verbal greeting shows respect and awareness. Even a brief 'Hey' with eye contact signals that you're approachable.",
                '9-12': "Acknowledging someone verbally when entering their space demonstrates social awareness and respect."
              },
              proTip: {
                'k2': "Here's what works well: Before you sit down, look at them, smile, and say 'Hi!' in a friendly voice. Smiles and friendly greetings help people feel comfortable!",
                '3-5': "Try this next time: Say 'Hi, I'm [your name]!' as you approach. This simple introduction opens the door for conversation.",
                '6-8': "Remember this: A simple 'Hey' with eye contact and a smile goes a long way. It signals you're open to talking.",
                '9-12': "Keep this in mind: Verbal acknowledgment like 'Hey, how's it going?' establishes rapport and shows emotional intelligence."
              },
              isGood: false,
              points: 0
            }
          ]
        },
        {
          id: 2,
          icon: MessageSquare,
          context: {
            'k2': "Your new friend mentions they like dinosaurs. You like dinosaurs too!",
            '3-5': "The person you're talking with mentions they enjoy playing video games. You play games too!",
            '6-8': "They mention they're interested in photography. You've been curious about photography as well.",
            '9-12': "They bring up their interest in indie music. You're also familiar with the genre."
          },
          prompt: {
            'k2': "What could you say to keep the conversation going?",
            '3-5': "How might you continue this conversation?",
            '6-8': "What would be a good way to build on this?",
            '9-12': "How could you deepen this conversation?"
          },
          options: [
            {
              text: {
                'k2': "Cool! What's your favorite dinosaur? Mine is T-Rex!",
                '3-5': "Oh cool! What games do you play? I've been into Minecraft lately.",
                '6-8': "That's awesome! What kind of photography? I've been trying landscape shots.",
                '9-12': "Nice! What artists are you into? I've been exploring some underground acts lately."
              },
              feedback: {
                'k2': "That's wonderful! You showed excitement about their interest AND shared your own favorite. Now you both have something fun to talk about together!",
                '3-5': "Excellent work! You validated their interest and shared your own experience. This creates a balanced conversation where both people get to share.",
                '6-8': "Really well done! You acknowledged their interest with enthusiasm and contributed your own perspective. This creates space for genuine exchange of ideas.",
                '9-12': "That's an excellent response! You demonstrated both knowledge and curiosity while inviting them to share more."
              },
              proTip: null,
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "Dinosaurs are silly!",
                '3-5': "Video games are boring. Sports are better.",
                '6-8': "Photography is kind of basic now. Everyone does that.",
                '9-12': "Indie music is just unsuccessful mainstream music."
              },
              feedback: {
                'k2': "Let's think about this. When someone shares something they love, and we say something negative about it, it can hurt their feelings. Everyone has different interests!",
                '3-5': "I understand you might prefer other activities, but when we dismiss what someone else enjoys, it can make them feel bad. Everyone's interests are valid.",
                '6-8': "This kind of response can shut down conversation and make the other person feel judged. Showing respect for someone's interests doesn't mean you have to share them.",
                '9-12': "Dismissing someone's passion can damage the connection you're trying to build. Respect doesn't require agreement—it requires openness."
              },
              proTip: {
                'k2': "Here's something helpful: If you don't share the same interest, that's okay! You can say 'That's cool! Tell me about it!' Questions show you care.",
                '3-5': "Try this approach: Even if you're not interested in the same thing, ask 'What do you like about that?' This shows respect.",
                '6-8': "Remember this: Showing curiosity about unfamiliar interests demonstrates emotional maturity. Try 'That's interesting—what draws you to that?'",
                '9-12': "Consider this perspective: Asking 'What appeals to you about that?' demonstrates respect and can lead to unexpected insights."
              },
              isGood: false,
              points: 0
            }
          ]
        },
        {
          id: 3,
          icon: Users,
          context: {
            'k2': "You've had a nice time playing together, and now it's time to go.",
            '3-5': "You've been having a good conversation, and now you need to head to your next class.",
            '6-8': "The conversation has gone well, but you need to leave for your next commitment.",
            '9-12': "You've had a meaningful conversation, but you need to transition to your next activity."
          },
          prompt: {
            'k2': "What's a nice way to say goodbye?",
            '3-5': "How would you wrap up this conversation?",
            '6-8': "What would be an appropriate way to conclude?",
            '9-12': "How would you end this interaction positively?"
          },
          options: [
            {
              text: {
                'k2': "I had fun! Can we play again tomorrow?",
                '3-5': "It was nice talking! Want to hang out again?",
                '6-8': "This was great—we should definitely talk more. See you?",
                '9-12': "I really enjoyed this. We should continue this sometime—catch you later?"
              },
              feedback: {
                'k2': "That's perfect! You said something kind about your time together AND asked to meet again. This shows you enjoyed being with them and want to continue the friendship!",
                '3-5': "Wonderful! You acknowledged the positive experience and suggested future interaction. This leaves the conversation on a positive note.",
                '6-8': "Excellent conclusion! You affirmed that you valued the interaction and left the door open for future connection.",
                '9-12': "That's a very thoughtful way to end! You validated the conversation's worth and expressed interest in continuing the connection."
              },
              proTip: null,
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Walk away without saying bye*",
                '3-5': "*Look at your phone and leave*",
                '6-8': "*Gradually disengage without words*",
                '9-12': "*Check phone and drift away*"
              },
              feedback: {
                'k2': "Remember, it's important to say goodbye! A friendly 'Bye!' and a wave shows you care about your friend.",
                '3-5': "A simple goodbye shows you valued the conversation. It's an important way to show respect.",
                '6-8': "Verbal closure shows respect and social awareness. Even a brief farewell makes a difference.",
                '9-12': "Explicit closure demonstrates emotional intelligence and respect for the interaction you shared."
              },
              proTip: {
                'k2': "Here's what helps: Always wave and say 'See you later!' with a smile. It makes friends happy!",
                '3-5': "Try this: A simple 'See you around!' makes a big difference. It shows you care about the connection.",
                '6-8': "Remember: Brief farewell maintains grace. Even just 'Got to go, but this was cool!' works well.",
                '9-12': "Keep in mind: Explicit closure shows maturity. 'I need to run, but let's continue this' maintains the connection."
              },
              isGood: false,
              points: 0
            }
          ]
        },
        // SCENARIO 4: Keeping Conversations Going
        {
          id: 4,
          context: {
            'k2': "You started talking to someone and now it's quiet. What do you do?",
            '3-5': "You've been chatting for a minute, but now there's an awkward silence.",
            '6-8': "The conversation is dying down and you want to keep it going.",
            '9-12': "You're in a conversation that's starting to lose momentum."
          },
          prompt: {
            'k2': "What should you do?",
            '3-5': "How do you keep talking?",
            '6-8': "What's your next move?",
            '9-12': "How do you revive the conversation?"
          },
          options: [
            {
              text: {
                'k2': "What games do you like?",
                '3-5': "So, what are you into these days?",
                '6-8': "Have you been watching or reading anything good lately?",
                '9-12': "What have you been up to lately? Any new interests?"
              },
              feedback: {
                'k2': "Perfect! Asking about fun things keeps conversations going!",
                '3-5': "Great! Open-ended questions invite them to share more.",
                '6-8': "Excellent! This gives them multiple ways to respond.",
                '9-12': "Smart move! Open questions show interest and invite elaboration."
              },
              proTip: {
                'k2': "Pro Tip: Questions about fun things like toys, games, or favorite colors are always good!",
                '3-5': "Pro Tip: Ask questions that can't be answered with just 'yes' or 'no'!",
                '6-8': "Pro Tip: Give multiple options in your question - it makes it easier for them to respond!",
                '9-12': "Pro Tip: Open-ended questions that allow for multiple responses reduce pressure and encourage sharing."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Stay quiet and look down*",
                '3-5': "*Pull out a toy and play alone*",
                '6-8': "*Check your phone without saying anything*",
                '9-12': "*Look at your phone and scroll*"
              },
              feedback: {
                'k2': "Oops! Use your words! Try asking a question.",
                '3-5': "That ends the conversation! Try asking something instead.",
                '6-8': "This signals disinterest. Even if it's awkward, push through!",
                '9-12': "This kills the conversation entirely. Silence + phone = social exit."
              },
              proTip: {
                'k2': "Pro Tip: When you don't know what to say, ask about their favorite things!",
                '3-5': "Pro Tip: Silence feels awkward, but a simple question fixes it! Try: 'What's your favorite ___?'",
                '6-8': "Pro Tip: When awkward silence hits, default to curiosity. Ask about their day, weekend plans, or interests.",
                '9-12': "Pro Tip: Brief silences are normal, but the phone signals 'I'm done here.' Instead, ask a follow-up about something they mentioned."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "I like dinosaurs! Do you like dinosaurs?",
                '3-5': "I'm really into soccer right now. Do you play any sports?",
                '6-8': "I've been binging this show on Netflix. Are you watching anything?",
                '9-12': "I've been really into podcasts lately. Do you listen to any?"
              },
              feedback: {
                'k2': "Good! You shared something and asked about them!",
                '3-5': "Nice! Sharing your interests and asking about theirs is great!",
                '6-8': "Good approach! Share-then-ask creates reciprocity.",
                '9-12': "Solid! This models sharing while inviting them to reciprocate."
              },
              proTip: {
                'k2': "Pro Tip: Talking about what YOU like gives them ideas for what to say back!",
                '3-5': "Pro Tip: Share something about yourself, then ask them the same question!",
                '6-8': "Pro Tip: The 'share-then-ask' method works great: reveal something about yourself, then turn it into a question.",
                '9-12': "Pro Tip: Self-disclosure reduces power imbalance and makes conversations feel more equal and natural."
              },
              isGood: true,
              points: 8
            },
            {
              text: {
                'k2': "Okay, bye!",
                '3-5': "This is boring. I'm going to go.",
                '6-8': "Well, this is awkward. See ya.",
                '9-12': "This conversation is dead. I should probably go."
              },
              feedback: {
                'k2': "Wait! You just got started! Try one more question first.",
                '3-5': "Don't give up so fast! One good question can save a conversation.",
                '6-8': "You're bailing too soon! Awkward pauses are normal - push through them.",
                '9-12': "Conversations have natural lulls. Escaping at the first silence looks uncomfortable."
              },
              proTip: {
                'k2': "Pro Tip: Don't leave right away! Ask 'What do you like to do?' first.",
                '3-5': "Pro Tip: Give conversations at least 3 tries before deciding it's not working!",
                '6-8': "Pro Tip: Silence isn't failure. Try at least 2-3 questions before concluding it's not clicking.",
                '9-12': "Pro Tip: Social comfort comes from navigating awkwardness, not avoiding it. Give it 3-4 genuine attempts."
              },
              isGood: false,
              points: 2
            }
          ]
        },
        // SCENARIO 5: Joining an Ongoing Conversation
        {
          id: 5,
          context: {
            'k2': "Some kids are talking about a movie. You've seen it too!",
            '3-5': "A group is talking about something you know about.",
            '6-8': "You overhear a conversation about a topic you're interested in.",
            '9-12': "There's a group discussion happening about something relevant to you."
          },
          prompt: {
            'k2': "How do you join in?",
            '3-5': "What do you do?",
            '6-8': "How do you enter the conversation?",
            '9-12': "What's your approach?"
          },
          options: [
            {
              text: {
                'k2': "I saw that movie too! It was so cool!",
                '3-5': "Hey, I know about that! Can I join?",
                '6-8': "Oh, I've actually seen that - mind if I jump in?",
                '9-12': "Sorry to interrupt, but I couldn't help overhearing - I'm into this too. Mind if I join?"
              },
              feedback: {
                'k2': "Perfect! You shared that you have something in common!",
                '3-5': "Great! You found common ground and asked politely!",
                '6-8': "Excellent approach! You acknowledged interrupting and asked permission.",
                '9-12': "Ideal! You acknowledged the interruption, established relevance, and requested entry."
              },
              proTip: {
                'k2': "Pro Tip: When you like the same things as others, tell them! It helps you become friends.",
                '3-5': "Pro Tip: Always ask 'Can I join?' - it shows you're polite and friendly!",
                '6-8': "Pro Tip: The formula is: acknowledge interruption + establish common ground + ask permission.",
                '9-12': "Pro Tip: Successful group entry requires: acknowledgment of interruption, credential (why you're relevant), and explicit permission."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Push between them and start talking*",
                '3-5': "*Walk up and start talking about something else*",
                '6-8': "*Walk over and just start talking without acknowledging them*",
                '9-12': "*Insert yourself and immediately dominate the conversation*"
              },
              feedback: {
                'k2': "Whoa! That's too much! Say 'excuse me' first!",
                '3-5': "Not good! You need to ask if you can join their conversation!",
                '6-8': "That's intrusive! You need to acknowledge them and ask to join.",
                '9-12': "This is jarring and rude. You need to earn your spot, not take it."
              },
              proTip: {
                'k2': "Pro Tip: Always say 'excuse me' and wait for them to look at you before talking!",
                '3-5': "Pro Tip: Wait for a pause in the conversation, then ask politely: 'Can I talk with you guys?'",
                '6-8': "Pro Tip: Barging in makes people defensive. Wait for a pause, make eye contact, then ask to join.",
                '9-12': "Pro Tip: Forced entry creates resentment. Wait for a natural pause, acknowledge the group, then request inclusion."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "*Stand nearby and listen quietly*",
                '3-5': "*Hover at the edge of the group without saying anything*",
                '6-8': "*Lurk near the group hoping they notice you*",
                '9-12': "*Position yourself nearby and wait for them to invite you*"
              },
              feedback: {
                'k2': "Good listening, but they might not know you want to join! Use your words!",
                '3-5': "They might not realize you want to join! You have to ask!",
                '6-8': "This is passive and awkward. You need to actively ask to join.",
                '9-12': "Waiting for an invitation rarely works. You need to advocate for yourself."
              },
              proTip: {
                'k2': "Pro Tip: Listening is good, but then say: 'That sounds fun! Can I play/talk too?'",
                '3-5': "Pro Tip: It's okay to speak up! After listening for a moment, say: 'Can I join you guys?'",
                '6-8': "Pro Tip: Proximity ≠ participation. After a moment of listening, explicitly ask: 'Mind if I join?'",
                '9-12': "Pro Tip: Passive hovering signals insecurity. Brief observation is fine, but then verbally request entry."
              },
              isGood: false,
              points: 3
            },
            {
              text: {
                'k2': "That movie is boring! I like different movies!",
                '3-5': "Actually, that's not even that cool. You should try this instead.",
                '6-8': "Really? I thought that was kind of overrated honestly.",
                '9-12': "Interesting take, but I actually disagree completely. Here's why..."
              },
              feedback: {
                'k2': "Uh oh! That's not nice! Don't say mean things about what they like!",
                '3-5': "Bad move! Don't criticize what they're enjoying - it pushes them away!",
                '6-8': "Terrible entry! Leading with disagreement makes you seem contrarian.",
                '9-12': "This is social sabotage. Opening with opposition positions you as adversarial."
              },
              proTip: {
                'k2': "Pro Tip: Even if you don't like the same thing, say something nice first like 'Cool! I like ___!'",
                '3-5': "Pro Tip: When joining a group, agree or ask questions first. Save disagreements for later!",
                '6-8': "Pro Tip: Lead with curiosity or agreement, not contradiction. 'What did you like about it?' works better.",
                '9-12': "Pro Tip: Entry requires agreement or curiosity, not debate. Establish rapport before introducing dissent."
              },
              isGood: false,
              points: 0
            }
          ]
        },
        // SCENARIO 6: Handling Interruptions
        {
          id: 6,
          context: {
            'k2': "You're telling a story, but someone keeps interrupting you.",
            '3-5': "You're sharing something important, but a friend keeps cutting you off.",
            '6-8': "You're in the middle of explaining something, but someone keeps interrupting.",
            '9-12': "You're presenting an idea, but someone consistently interrupts your flow."
          },
          prompt: {
            'k2': "What should you do?",
            '3-5': "How do you handle this?",
            '6-8': "What's your response?",
            '9-12': "How do you manage this situation?"
          },
          options: [
            {
              text: {
                'k2': "Can I finish my story first?",
                '3-5': "Let me finish what I was saying, then I'll listen to you.",
                '6-8': "I'd like to finish my point first, then I'm happy to hear yours.",
                '9-12': "I appreciate your input - let me finish my thought, then I'll address your point."
              },
              feedback: {
                'k2': "Good job! You asked nicely to finish your story!",
                '3-5': "Perfect! You were polite but clear about needing to finish.",
                '6-8': "Excellent! You asserted yourself respectfully while showing you'll listen later.",
                '9-12': "Outstanding! You acknowledged their input while maintaining your speaking turn professionally."
              },
              proTip: {
                'k2': "Pro Tip: It's okay to ask to finish your story! Good friends will wait.",
                '3-5': "Pro Tip: Saying 'let me finish' shows you respect yourself and them!",
                '6-8': "Pro Tip: Acknowledging their input while finishing your thought shows maturity.",
                '9-12': "Pro Tip: Professional communication requires managing interruptions gracefully while staying focused."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Stop talking and get mad*",
                '3-5': "*Get upset and walk away*",
                '6-8': "*Yell at them to stop interrupting*",
                '9-12': "*Get visibly frustrated and shut down*"
              },
              feedback: {
                'k2': "Getting mad doesn't help! Try using your words to ask nicely.",
                '3-5': "Walking away ends the conversation. Try talking about it instead.",
                '6-8': "Yelling makes things worse. Stay calm and communicate clearly.",
                '9-12': "Shutting down doesn't solve the problem. Address it directly but calmly."
              },
              proTip: {
                'k2': "Pro Tip: When you feel mad, take a deep breath and use nice words!",
                '3-5': "Pro Tip: Instead of walking away, try saying: 'I feel frustrated when I get interrupted.'",
                '6-8': "Pro Tip: Stay calm and say: 'I need to finish my thought - can you wait?'",
                '9-12': "Pro Tip: Address the pattern directly: 'I notice interruptions happening - can we work on this?'"
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "*Just stop talking and let them talk*",
                '3-5': "*Give up and let them take over*",
                '6-8': "*Just stop and let them dominate the conversation*",
                '9-12': "*Passively let them control the discussion*"
              },
              feedback: {
                'k2': "Don't give up! Your story is important too!",
                '3-5': "You have a right to finish what you're saying! Don't give up!",
                '6-8': "Passive acceptance teaches them it's okay to interrupt you.",
                '9-12': "Passivity reinforces the interruption pattern. You deserve to be heard."
              },
              proTip: {
                'k2': "Pro Tip: Your stories and ideas are important! Don't let others stop you!",
                '3-5': "Pro Tip: You have the right to finish your thoughts! Practice saying 'Let me finish.'",
                '6-8': "Pro Tip: Setting boundaries teaches others how to treat you respectfully.",
                '9-12': "Pro Tip: Healthy relationships require mutual respect for speaking turns."
              },
              isGood: false,
              points: 2
            },
            {
              text: {
                'k2': "Fine, whatever! You talk!",
                '3-5': "Okay, fine! You obviously don't care what I have to say!",
                '6-8': "Whatever, clearly my opinion doesn't matter here.",
                '9-12': "I see my input isn't valued here. I'll just listen then."
              },
              feedback: {
                'k2': "That sounds angry! Try asking nicely to finish your story.",
                '3-5': "That sounds frustrated! Try explaining how you feel instead.",
                '6-8': "This passive-aggressive approach creates tension. Be direct instead.",
                '9-12': "Passive-aggressive responses damage relationships. Address the issue directly."
              },
              proTip: {
                'k2': "Pro Tip: When you feel frustrated, say 'I feel sad when I can't finish my story.'",
                '3-5': "Pro Tip: Try saying: 'I feel frustrated when I get interrupted. Can we take turns?'",
                '6-8': "Pro Tip: Direct communication works better: 'I'd like to finish my point. Can you wait?'",
                '9-12': "Pro Tip: Address the behavior, not the person: 'I notice interruptions happening - let's establish better turn-taking.'"
              },
              isGood: false,
              points: 1
            }
          ]
        },
        // SCENARIO 7: Giving Compliments
        {
          id: 7,
          context: {
            'k2': "You notice your friend did something really cool!",
            '3-5': "Someone in your class did something impressive that you noticed.",
            '6-8': "A classmate accomplished something you think is worth recognizing.",
            '9-12': "A peer did something that genuinely impressed you."
          },
          prompt: {
            'k2': "What could you say?",
            '3-5': "How do you show you noticed?",
            '6-8': "What would you say to them?",
            '9-12': "How do you acknowledge their achievement?"
          },
          options: [
            {
              text: {
                'k2': "Wow! You're really good at that!",
                '3-5': "That was amazing! You're really talented!",
                '6-8': "That was impressive! You clearly put a lot of effort into that.",
                '9-12': "That was really well done. I can tell you worked hard on that."
              },
              feedback: {
                'k2': "Perfect! You noticed something good about your friend!",
                '3-5': "Great! You recognized their effort and talent!",
                '6-8': "Excellent! You acknowledged both the result and the effort behind it.",
                '9-12': "Outstanding! You gave specific, meaningful recognition."
              },
              proTip: {
                'k2': "Pro Tip: When you see someone do something cool, tell them! It makes them feel good!",
                '3-5': "Pro Tip: Compliments about effort and talent make people feel proud!",
                '6-8': "Pro Tip: Specific compliments about both results and effort are most meaningful.",
                '9-12': "Pro Tip: Genuine recognition of effort and achievement strengthens relationships and builds confidence."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "I can do that too!",
                '3-5': "That's not that hard. I could do that.",
                '6-8': "That's pretty basic. I've done better.",
                '9-12': "That's okay, but it's not really that impressive."
              },
              feedback: {
                'k2': "That might make them feel sad! Try saying something nice instead.",
                '3-5': "That sounds like you're trying to be better than them. Focus on them!",
                '6-8': "This diminishes their achievement. A compliment should be about them, not you.",
                '9-12': "This undermines their accomplishment. Recognition should be genuine and focused on them."
              },
              proTip: {
                'k2': "Pro Tip: Focus on what THEY did well, not what you can do!",
                '3-5': "Pro Tip: Compliments are about celebrating THEM, not comparing to yourself!",
                '6-8': "Pro Tip: Good compliments focus entirely on the other person's achievement.",
                '9-12': "Pro Tip: Effective recognition is about them, not about establishing your own superiority."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "*Say nothing and walk away*",
                '3-5': "*Just watch without saying anything*",
                '6-8': "*Notice but don't acknowledge it*",
                '9-12': "*See it but don't comment*"
              },
              feedback: {
                'k2': "When you notice something good, tell them! It makes everyone happy!",
                '3-5': "If you think it's cool, let them know! Compliments make people feel good!",
                '6-8': "Noticing without acknowledging misses an opportunity to build connection.",
                '9-12': "Recognition costs nothing but means everything. Don't miss opportunities to build others up."
              },
              proTip: {
                'k2': "Pro Tip: When you see something cool, say 'Wow!' or 'That's awesome!'",
                '3-5': "Pro Tip: If you think it's impressive, tell them! It takes just a moment to make someone's day!",
                '6-8': "Pro Tip: Small acts of recognition strengthen relationships. Take the moment to acknowledge them.",
                '9-12': "Pro Tip: Recognition is a leadership skill. Take opportunities to build others up with genuine compliments."
              },
              isGood: false,
              points: 3
            },
            {
              text: {
                'k2': "That's cool! Can you teach me?",
                '3-5': "That's awesome! How did you learn to do that?",
                '6-8': "That's really impressive! I'd love to know more about how you did that.",
                '9-12': "That's excellent work. I'm curious about your process - would you mind sharing?"
              },
              feedback: {
                'k2': "Great! You gave a compliment AND asked to learn!",
                '3-5': "Perfect! You recognized them and showed interest in learning!",
                '6-8': "Excellent! You gave recognition while showing genuine curiosity about their skills.",
                '9-12': "Outstanding! You recognized their achievement while expressing interest in their expertise."
              },
              proTip: {
                'k2': "Pro Tip: Asking to learn shows you think they're really good at something!",
                '3-5': "Pro Tip: Compliments + questions show you're interested and think they're talented!",
                '6-8': "Pro Tip: Recognition + curiosity demonstrates respect for their abilities and knowledge.",
                '9-12': "Pro Tip: Acknowledging achievement while seeking knowledge shows intellectual humility and respect."
              },
              isGood: true,
              points: 12
            }
          ]
        },
        // SCENARIO 8: Receiving Compliments
        {
          id: 8,
          context: {
            'k2': "Someone says you did something really well!",
            '3-5': "A friend gives you a nice compliment about something you did.",
            '6-8': "Someone recognizes something you accomplished.",
            '9-12': "A peer gives you genuine recognition for your work."
          },
          prompt: {
            'k2': "How do you respond?",
            '3-5': "What do you say back?",
            '6-8': "How do you handle the compliment?",
            '9-12': "What's your response?"
          },
          options: [
            {
              text: {
                'k2': "Thank you! I worked really hard on that!",
                '3-5': "Thanks! I practiced a lot to get better at that.",
                '6-8': "Thank you! I put a lot of effort into that project.",
                '9-12': "Thank you, I appreciate that. I really enjoyed working on it."
              },
              feedback: {
                'k2': "Perfect! You said thank you and shared about your hard work!",
                '3-5': "Great response! You accepted the compliment and acknowledged your effort!",
                '6-8': "Excellent! You accepted the recognition graciously while acknowledging the work involved.",
                '9-12': "Outstanding! You accepted the compliment with grace and showed appreciation for the work itself."
              },
              proTip: {
                'k2': "Pro Tip: When someone says something nice, say 'Thank you!' and smile!",
                '3-5': "Pro Tip: Accepting compliments with 'Thank you' and sharing about your effort shows confidence!",
                '6-8': "Pro Tip: Graciously accepting recognition while acknowledging effort shows maturity and self-awareness.",
                '9-12': "Pro Tip: Accepting compliments with gratitude while showing appreciation for the process demonstrates emotional intelligence."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "No, I'm not good at that!",
                '3-5': "It's not that good. I'm not really talented.",
                '6-8': "No, it's not that impressive. Anyone could do that.",
                '9-12': "No, it's really not that good. I'm not very skilled at this."
              },
              feedback: {
                'k2': "Don't say that! When someone gives you a compliment, they mean it!",
                '3-5': "Don't put yourself down! If someone compliments you, they think you did well!",
                '6-8': "Dismissing compliments makes the person feel like their opinion doesn't matter.",
                '9-12': "Rejecting genuine recognition can damage relationships and your own self-esteem."
              },
              proTip: {
                'k2': "Pro Tip: When someone says you did well, believe them! Say 'Thank you!'",
                '3-5': "Pro Tip: Accepting compliments helps you feel confident! Try saying 'Thank you, that means a lot!'",
                '6-8': "Pro Tip: Accepting compliments gracefully shows confidence. Try: 'Thank you, I appreciate that.'",
                '9-12': "Pro Tip: Accepting recognition graciously shows self-worth and respect for the person giving it."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "You're better at it than me!",
                '3-5': "You're way more talented than I am!",
                '6-8': "You're much better at this than I am!",
                '9-12': "You're clearly more skilled at this than I am!"
              },
              feedback: {
                'k2': "That's nice about them, but you can be good at things too!",
                '3-5': "It's nice to recognize others, but don't forget to accept your own compliment!",
                '6-8': "While it's nice to acknowledge others, deflecting your compliment entirely misses the point.",
                '9-12': "Acknowledging others' skills is good, but completely deflecting recognition for yourself shows low self-worth."
              },
              proTip: {
                'k2': "Pro Tip: You can say 'Thank you!' AND say something nice about them too!",
                '3-5': "Pro Tip: Try 'Thank you! You're really good at it too!' This accepts your compliment AND compliments them!",
                '6-8': "Pro Tip: Accept your compliment first: 'Thank you! You're also really talented at this.'",
                '9-12': "Pro Tip: Accept recognition first, then acknowledge others: 'Thank you, that means a lot. You're also excellent at this.'"
              },
              isGood: false,
              points: 2
            },
            {
              text: {
                'k2': "*Just smile and look down*",
                '3-5': "*Feel embarrassed and don't say anything*",
                '6-8': "*Feel awkward and avoid eye contact*",
                '9-12': "*Feel uncomfortable and change the subject*"
              },
              feedback: {
                'k2': "It's okay to feel happy about compliments! Try saying 'Thank you!'",
                '3-5': "Compliments are meant to make you feel good! Don't be embarrassed - say thank you!",
                '6-8': "Accepting compliments is a skill. Practice saying 'Thank you' even when it feels awkward.",
                '9-12': "Learning to accept recognition gracefully is important for confidence and relationships."
              },
              proTip: {
                'k2': "Pro Tip: When someone says something nice, look at them and say 'Thank you!' with a smile!",
                '3-5': "Pro Tip: Practice saying 'Thank you!' when someone compliments you - it gets easier!",
                '6-8': "Pro Tip: Accepting compliments confidently is a skill that improves with practice. Start with 'Thank you.'",
                '9-12': "Pro Tip: Accepting recognition gracefully is a professional and personal skill. Practice responding with gratitude."
              },
              isGood: false,
              points: 4
            }
          ]
        },
        // SCENARIO 9: Ending Conversations Gracefully
        {
          id: 9,
          context: {
            'k2': "You need to go to lunch, but your friend is still talking.",
            '3-5': "You need to get to class, but the conversation is still going.",
            '6-8': "You have somewhere to be, but the person keeps talking.",
            '9-12': "You have another commitment, but the conversation is continuing."
          },
          prompt: {
            'k2': "How do you leave nicely?",
            '3-5': "What do you say?",
            '6-8': "How do you end this politely?",
            '9-12': "How do you transition out gracefully?"
          },
          options: [
            {
              text: {
                'k2': "I need to go to lunch now, but this was fun!",
                '3-5': "I have to get to class, but I really enjoyed talking with you!",
                '6-8': "I need to head out, but this conversation was really interesting.",
                '9-12': "I need to get to my next meeting, but I've really enjoyed our discussion."
              },
              feedback: {
                'k2': "Perfect! You explained why you need to go and said something nice!",
                '3-5': "Great! You gave a reason and showed you enjoyed the conversation!",
                '6-8': "Excellent! You provided context while acknowledging the value of the interaction.",
                '9-12': "Outstanding! You gave clear context while expressing appreciation for the conversation."
              },
              proTip: {
                'k2': "Pro Tip: Always say why you need to go and something nice about talking with them!",
                '3-5': "Pro Tip: Good endings have two parts: why you're leaving + something positive about the conversation!",
                '6-8': "Pro Tip: Graceful exits acknowledge both your needs and the value of the interaction.",
                '9-12': "Pro Tip: Professional exits balance personal needs with recognition of the conversation's value."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Just run away without saying anything*",
                '3-5': "*Walk away while they're still talking*",
                '6-8': "*Just leave without explanation*",
                '9-12': "*Abruptly walk away mid-conversation*"
              },
              feedback: {
                'k2': "That's not nice! Always say goodbye before leaving!",
                '3-5': "That's rude! You should explain why you're leaving!",
                '6-8': "Abrupt departures are disrespectful. Always provide context for leaving.",
                '9-12': "Abrupt exits damage relationships and show poor social skills."
              },
              proTip: {
                'k2': "Pro Tip: Always say 'I need to go now, bye!' before leaving!",
                '3-5': "Pro Tip: Say something like 'I have to go now, but thanks for talking!'",
                '6-8': "Pro Tip: Brief explanations show respect: 'I need to run, but this was great!'",
                '9-12': "Pro Tip: Professional exits require acknowledgment and context: 'I need to go, but I've enjoyed this.'"
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "This is boring, I'm leaving.",
                '3-5': "This conversation is getting boring. I'm going to go.",
                '6-8': "This is getting kind of boring. I should probably go.",
                '9-12': "This is becoming a bit tedious. I think I should go."
              },
              feedback: {
                'k2': "That's not nice! Don't say mean things about the conversation!",
                '3-5': "That's hurtful! Don't criticize the conversation when leaving!",
                '6-8': "This is unnecessarily harsh. You can leave without criticizing the conversation.",
                '9-12': "This is socially inappropriate. You can exit gracefully without negative commentary."
              },
              proTip: {
                'k2': "Pro Tip: When leaving, say something nice like 'I had fun!' instead of something mean!",
                '3-5': "Pro Tip: Focus on why YOU need to go, not what's wrong with the conversation!",
                '6-8': "Pro Tip: Good exits focus on your needs, not criticisms of the conversation.",
                '9-12': "Pro Tip: Professional exits focus on your commitments, not judgments about the interaction."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "*Just stand there and wait for them to stop*",
                '3-5': "*Wait uncomfortably hoping they'll finish*",
                '6-8': "*Stand there awkwardly not knowing what to do*",
                '9-12': "*Stay trapped in the conversation feeling obligated*"
              },
              feedback: {
                'k2': "You don't have to wait forever! It's okay to say you need to go!",
                '3-5': "It's okay to politely interrupt when you have somewhere to be!",
                '6-8': "You have a right to manage your time. Don't feel trapped in conversations.",
                '9-12': "Time management is important. You can politely exit conversations when needed."
              },
              proTip: {
                'k2': "Pro Tip: It's okay to say 'I need to go now!' when you have somewhere to be!",
                '3-5': "Pro Tip: Practice saying 'I need to go, but this was fun!' It's polite and honest!",
                '6-8': "Pro Tip: Managing your time respectfully is a valuable skill. Practice graceful exits.",
                '9-12': "Pro Tip: Asserting your time needs while maintaining respect is a key professional skill."
              },
              isGood: false,
              points: 3
            }
          ]
        }
      ]
    },
    // CATEGORY 2: ACTIVE LISTENING
    2: {
      id: 2,
      icon: Ear,
      title: {
        'k2': 'Listening Skills',
        '3-5': 'Active Listening',
        '6-8': 'Deep Listening',
        '9-12': 'Empathetic Listening'
      },
      color: '#34D399',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      situations: [
        // SCENARIO 1: Showing You're Listening (Body Language + Verbal)
        {
          id: 1,
          icon: Headphones,
          context: {
            'k2': "Your friend is telling you about their new puppy.",
            '3-5': "A classmate is sharing a story about their weekend trip.",
            '6-8': "Someone is telling you about a problem they're having at school.",
            '9-12': "A friend is discussing a challenge they're facing."
          },
          prompt: {
            'k2': "How do you show you're listening?",
            '3-5': "What do you do while they talk?",
            '6-8': "How do you demonstrate active listening?",
            '9-12': "What signals engagement?"
          },
          options: [
            {
              text: {
                'k2': "*Look at them and nod* That sounds fun!",
                '3-5': "*Make eye contact and smile* Tell me more!",
                '6-8': "*Maintain eye contact and nod* I can see why that's frustrating.",
                '9-12': "*Lean in slightly and maintain eye contact* That sounds really challenging."
              },
              feedback: {
                'k2': "Perfect! Looking at them and saying nice things shows you care!",
                '3-5': "Excellent! Your body language and words both show you're interested!",
                '6-8': "Great! You're using both verbal and non-verbal signals of engagement.",
                '9-12': "Outstanding! You're demonstrating full active listening - body language plus verbal validation."
              },
              proTip: {
                'k2': "Pro Tip: Look at someone's face when they talk! Nod your head to show you're listening!",
                '3-5': "Pro Tip: Use your face, body, AND words! Nod, make eye contact, and say things like 'wow!' or 'cool!'",
                '6-8': "Pro Tip: Active listening requires three things: eye contact, receptive body language, and verbal acknowledgment.",
                '9-12': "Pro Tip: Full engagement requires: eye contact, open posture, forward lean, and verbal markers ('I see,' 'that makes sense')."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Look around the room while they talk*",
                '3-5': "*Play with something on the table*",
                '6-8': "*Check phone periodically while they're speaking*",
                '9-12': "*Maintain minimal eye contact, glance at phone*"
              },
              feedback: {
                'k2': "Oops! Look at them when they're talking to you!",
                '3-5': "That's not listening! Put things down and look at them!",
                '6-8': "This signals disinterest. Your body language says 'I don't care.'",
                '9-12': "Your divided attention is obvious and dismissive. This damages trust."
              },
              proTip: {
                'k2': "Pro Tip: When someone talks to you, stop what you're doing and look at them!",
                '3-5': "Pro Tip: Put down toys, tablets, or anything you're holding. Face them with your body!",
                '6-8': "Pro Tip: Phone checking is the #1 way to kill a conversation. Put it away completely.",
                '9-12': "Pro Tip: Partial attention is read as disrespect. Either fully engage or politely postpone the conversation."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "Uh huh. *keeps doing other things*",
                '3-5': "Yeah... *clearly not paying attention*",
                '6-8': "Mm-hmm. *eyes glazed over*",
                '9-12': "Right, right. *obviously thinking about something else*"
              },
              feedback: {
                'k2': "Just saying words isn't enough! Show you're really listening!",
                '3-5': "They can tell you're not really listening! Pay attention!",
                '6-8': "Verbal acknowledgment without engagement feels patronizing.",
                '9-12': "Empty affirmations without presence are worse than saying nothing."
              },
              proTip: {
                'k2': "Pro Tip: Don't just say 'uh huh' - really listen and then say something about their story!",
                '3-5': "Pro Tip: Don't use robot words like 'uh huh, uh huh.' Actually think about what they're saying!",
                '6-8': "Pro Tip: Automatic verbal fillers ('mm-hmm,' 'yeah') without cognitive engagement are transparent.",
                '9-12': "Pro Tip: People can sense when you're on autopilot. If you can't engage, say so: 'Can we talk in 5 minutes?'"
              },
              isGood: false,
              points: 2
            },
            {
              text: {
                'k2': "OH! That reminds me of MY puppy!",
                '3-5': "Wait, that's like what happened to ME last week!",
                '6-8': "Oh that's nothing, listen to what happened to ME...",
                '9-12': "I totally get it. Actually, here's my similar story... [talks for 5 minutes]"
              },
              feedback: {
                'k2': "Hold on! Let them finish their story first!",
                '3-5': "You're interrupting! Listen to their whole story before sharing yours!",
                '6-8': "You've hijacked their story. This isn't listening, it's waiting to talk.",
                '9-12': "Conversational narcissism - redirecting every topic back to yourself kills connection."
              },
              proTip: {
                'k2': "Pro Tip: Let them finish talking! Then you can share your story!",
                '3-5': "Pro Tip: Don't interrupt with your own stories! Listen first, then share if it fits!",
                '6-8': "Pro Tip: The 'one-up' or 'me too' interruption makes conversations feel like competitions.",
                '9-12': "Pro Tip: Reciprocal sharing is good, but timing matters. Let them fully express before relating your experience."
              },
              isGood: false,
              points: 3
            }
          ]
        },
        // SCENARIO 2: Asking Follow-Up Questions
        {
          id: 2,
          icon: Focus,
          context: {
            'k2': "Your friend says 'I went to the park yesterday!'",
            '3-5': "Someone mentions 'I started learning guitar.'",
            '6-8': "A classmate says 'I had the worst day yesterday.'",
            '9-12': "Someone mentions 'I'm thinking about quitting the team.'"
          },
          prompt: {
            'k2': "What do you say?",
            '3-5': "How do you respond?",
            '6-8': "What's your follow-up?",
            '9-12': "What question do you ask?"
          },
          options: [
            {
              text: {
                'k2': "What did you do at the park?",
                '3-5': "That's cool! How's it going so far?",
                '6-8': "Oh no! What happened?",
                '9-12': "Really? What's making you think about that?"
              },
              feedback: {
                'k2': "Great question! You want to hear more about their story!",
                '3-5': "Perfect! You showed interest and asked them to share more!",
                '6-8': "Excellent! You expressed empathy and invited elaboration.",
                '9-12': "Ideal! You're probing deeper with genuine curiosity."
              },
              proTip: {
                'k2': "Pro Tip: When someone tells you something, ask 'what' or 'how' to learn more!",
                '3-5': "Pro Tip: Good follow-ups: 'How did that go?' 'What was that like?' 'Tell me more!'",
                '6-8': "Pro Tip: Follow-up questions signal you're engaged. Try: 'Then what?' 'How did you feel?' 'What did you do?'",
                '9-12': "Pro Tip: The best follow-ups invite deeper sharing: 'What's the full story?' 'How are you feeling about it?'"
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "Okay.",
                '3-5': "Cool.",
                '6-8': "That's nice.",
                '9-12': "Interesting."
              },
              feedback: {
                'k2': "That's not much! Ask them more about it!",
                '3-5': "That ends the conversation! Show more interest!",
                '6-8': "One-word responses kill dialogue. Ask a question!",
                '9-12': "This is conversational termination. Follow up or acknowledge you can't talk right now."
              },
              proTip: {
                'k2': "Pro Tip: 'Okay' stops the conversation! Instead say: 'What happened?' or 'Tell me more!'",
                '3-5': "Pro Tip: Never just say 'cool' - add a question! 'Cool! How did you like it?'",
                '6-8': "Pro Tip: Minimal responses signal disinterest. Every statement deserves a question or substantive comment.",
                '9-12': "Pro Tip: If you can't engage, be honest: 'I want to hear about this but I'm swamped - can we talk later?'"
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "I went to the park last week too!",
                '3-5': "I've been playing piano for two years!",
                '6-8': "I had a terrible day last month!",
                '9-12': "I quit the debate team last year."
              },
              feedback: {
                'k2': "Wait! They were telling you about THEIR park trip! Ask about theirs first!",
                '3-5': "You made it about you! Ask about their guitar journey first!",
                '6-8': "You redirected to your experience. This isn't listening!",
                '9-12': "Immediate redirection to your story dismisses theirs."
              },
              proTip: {
                'k2': "Pro Tip: When someone tells you something, ask about it! You can share your story after!",
                '3-5': "Pro Tip: Let them talk about their thing first! Then you can share yours!",
                '6-8': "Pro Tip: Rule of thumb: 2 follow-up questions about their topic before sharing your related experience.",
                '9-12': "Pro Tip: Immediate parallel experiences feel competitive. Explore theirs first, then relate: 'I actually went through something similar...'"
              },
              isGood: false,
              points: 3
            },
            {
              text: {
                'k2': "Parks are boring. I like pools better.",
                '3-5': "Guitar is hard. You should try drums instead.",
                '6-8': "Well, tomorrow will be better.",
                '9-12': "You should definitely quit. That team is a waste of time."
              },
              feedback: {
                'k2': "That's not nice! They liked the park! Don't say mean things!",
                '3-5': "Don't dismiss what they're excited about! Support them!",
                '6-8': "You're minimizing their feelings. They need to be heard, not fixed.",
                '9-12': "Jumping to advice/judgment without understanding is presumptuous."
              },
              proTip: {
                'k2': "Pro Tip: Don't say you don't like what they like! Just ask questions about it!",
                '3-5': "Pro Tip: Never tell someone their interest is bad! Ask questions and be supportive!",
                '6-8': "Pro Tip: Don't immediately problem-solve or dismiss. First: listen and understand. Then: ask if they want advice.",
                '9-12': "Pro Tip: Resist the urge to immediately advise or judge. Understand first: 'Tell me more about what's going on.'"
              },
              isGood: false,
              points: 0
            }
          ]
        },
        // SCENARIO 3: Paraphrasing to Show Understanding
        {
          id: 3,
          context: {
            'k2': "Your friend says: 'I'm sad because I lost my favorite toy.'",
            '3-5': "Someone says: 'I'm nervous about the test tomorrow because I don't understand fractions.'",
            '6-8': "A friend says: 'I'm frustrated because my group members aren't doing their part of the project.'",
            '9-12': "Someone says: 'I feel overwhelmed - I have three essays, two tests, and a game all this week.'"
          },
          prompt: {
            'k2': "What do you say back?",
            '3-5': "How do you respond?",
            '6-8': "What's your response?",
            '9-12': "How do you acknowledge them?"
          },
          options: [
            {
              text: {
                'k2': "You're sad because you can't find your toy. That's hard!",
                '3-5': "So you're worried about the test because fractions are confusing for you?",
                '6-8': "It sounds like you're frustrated because you're doing all the work alone.",
                '9-12': "So you're feeling buried under everything that's due this week."
              },
              feedback: {
                'k2': "Perfect! You said back what they said to show you understand!",
                '3-5': "Excellent! You repeated what they said in your own words!",
                '6-8': "Great! Paraphrasing shows you truly heard them.",
                '9-12': "Ideal! You've reflected their feelings and situation accurately."
              },
              proTip: {
                'k2': "Pro Tip: Repeat what they said in a nice way! It shows you listened!",
                '3-5': "Pro Tip: Say back what you heard: 'So you're [feeling] because [reason]?'",
                '6-8': "Pro Tip: The formula: 'It sounds like you're [emotion] because [situation].' This validates their experience.",
                '9-12': "Pro Tip: Reflective listening builds trust: mirror their emotion and situation without adding interpretation."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "Just get a new toy!",
                '3-5': "Just study more!",
                '6-8': "Just tell the teacher!",
                '9-12': "Just manage your time better!"
              },
              feedback: {
                'k2': "That's not helpful! They're sad and need you to understand!",
                '3-5': "You jumped to solutions! They need to be heard first!",
                '6-8': "'Just' makes problems sound easy. They need empathy, not dismissal.",
                '9-12': "Solutions without understanding feel dismissive and preachy."
              },
              proTip: {
                'k2': "Pro Tip: Don't tell them what to do right away! Say 'That's sad!' first!",
                '3-5': "Pro Tip: Don't give advice immediately! First say 'That sounds hard' to show you understand!",
                '6-8': "Pro Tip: The word 'just' minimizes their struggle. Validate first: 'That must be really frustrating.'",
                '9-12': "Pro Tip: Resist immediate problem-solving. People usually want to be heard, not fixed. Ask: 'Do you want advice or just to vent?'"
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "I lost a toy once too!",
                '3-5': "I'm bad at fractions too!",
                '6-8': "I hate group projects too!",
                '9-12': "I'm so busy this week too!"
              },
              feedback: {
                'k2': "Hold on! This is about their toy! Talk about their feelings first!",
                '3-5': "You made it about you again! Focus on helping them first!",
                '6-8': "You've redirected to your experience. Acknowledge theirs first.",
                '9-12': "Relating is good but timing is wrong. Validate their experience before sharing yours."
              },
              proTip: {
                'k2': "Pro Tip: Help them feel better first! You can share your story after!",
                '3-5': "Pro Tip: Say something about THEIR problem first, then you can mention yours!",
                '6-8': "Pro Tip: Sequence matters. First: 'That sounds really frustrating.' Then: 'I've been there too - last semester...'",
                '9-12': "Pro Tip: Lead with validation, follow with relation: 'That's a lot on your plate. I remember when I...' positions support before sharing."
              },
              isGood: false,
              points: 4
            },
            {
              text: {
                'k2': "Why did you lose it? You should be more careful!",
                '3-5': "Why didn't you study earlier? You had time!",
                '6-8': "Why didn't you assign tasks better from the start?",
                '9-12': "Why did you commit to so much? You should have seen this coming."
              },
              feedback: {
                'k2': "That's mean! They're already sad! Don't make them feel worse!",
                '3-5': "Don't blame them! They need support, not criticism!",
                '6-8': "This is judgment, not listening. They need empathy, not interrogation.",
                '9-12': "Blame masquerading as questions is toxic. This destroys trust."
              },
              proTip: {
                'k2': "Pro Tip: NEVER ask 'why' when someone is sad! Just say 'I'm sorry that happened!'",
                '3-5': "Pro Tip: Don't blame people when they're struggling! Say 'That's tough!' not 'Why didn't you...'",
                '6-8': "Pro Tip: 'Why' questions often sound accusatory when someone's vulnerable. Save analysis for later.",
                '9-12': "Pro Tip: Hindsight criticism ('you should have') is cruel when someone's struggling. Support first, reflect later (if asked)."
              },
              isGood: false,
              points: 0
            }
          ]
        },
        // SCENARIO 4: Not Interrupting
        {
          id: 4,
          context: {
            'k2': "Your friend is telling you a long story about their birthday party.",
            '3-5': "Someone is explaining something important that happened to them.",
            '6-8': "A classmate is sharing a detailed story about their family vacation.",
            '9-12': "Someone is explaining a complex situation they're dealing with."
          },
          prompt: {
            'k2': "What do you do?",
            '3-5': "How do you listen?",
            '6-8': "What's your approach?",
            '9-12': "How do you handle this?"
          },
          options: [
            {
              text: {
                'k2': "*Wait patiently and listen to the whole story*",
                '3-5': "*Listen quietly and wait for them to finish*",
                '6-8': "*Give them space to tell the complete story*",
                '9-12': "*Allow them to fully express their thoughts*"
              },
              feedback: {
                'k2': "Perfect! You let them tell their whole story!",
                '3-5': "Great! You gave them time to share everything!",
                '6-8': "Excellent! You respected their need to tell the complete story.",
                '9-12': "Outstanding! You created a safe space for them to fully express themselves."
              },
              proTip: {
                'k2': "Pro Tip: Let people finish their stories! Don't rush them!",
                '3-5': "Pro Tip: Good listeners wait for the whole story before asking questions!",
                '6-8': "Pro Tip: Interrupting cuts off their flow. Let them finish, then ask follow-up questions.",
                '9-12': "Pro Tip: Full expression requires patience. Save your questions and insights for after they've finished."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Jump in with questions every few seconds*",
                '3-5': "*Interrupt to ask questions while they're talking*",
                '6-8': "*Cut them off to share your own similar experience*",
                '9-12': "*Jump in with advice before they finish explaining*"
              },
              feedback: {
                'k2': "Oops! You're interrupting! Let them finish first!",
                '3-5': "You're cutting them off! Wait until they're done!",
                '6-8': "This disrupts their flow. Let them complete their thought.",
                '9-12': "Premature interruption shows impatience and disrespect for their process."
              },
              proTip: {
                'k2': "Pro Tip: Wait until they stop talking before asking questions!",
                '3-5': "Pro Tip: Save your questions for the end! Let them tell their story first!",
                '6-8': "Pro Tip: Interrupting breaks their rhythm. Take notes mentally, then ask questions afterward.",
                '9-12': "Pro Tip: Let them fully express before offering insights. Premature advice often misses the point."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "*Look bored and sigh loudly*",
                '3-5': "*Show impatience with body language*",
                '6-8': "*Display obvious signs of wanting to leave*",
                '9-12': "*Show disinterest through posture and expression*"
              },
              feedback: {
                'k2': "That's not nice! Show them you care about their story!",
                '3-5': "They can see you're bored! Try to look interested!",
                '6-8': "Your body language is communicating disinterest. This hurts their feelings.",
                '9-12': "Non-verbal impatience is just as damaging as verbal interruption."
              },
              proTip: {
                'k2': "Pro Tip: Look interested even if the story is long! Nod and smile!",
                '3-5': "Pro Tip: Show interest with your face and body! Lean in and nod!",
                '6-8': "Pro Tip: Even if you're impatient, maintain engaged body language. It shows respect.",
                '9-12': "Pro Tip: If you can't engage fully, politely say: 'I want to hear this properly - can we talk when I have more time?'"
              },
              isGood: false,
              points: 2
            },
            {
              text: {
                'k2': "I know what you mean! Let me tell you about MY birthday!",
                '3-5': "That's like what happened to me! Let me tell you...",
                '6-8': "I had something similar happen! Here's my story...",
                '9-12': "I totally relate! Actually, let me tell you about when I... [takes over conversation]"
              },
              feedback: {
                'k2': "Wait! They were still telling THEIR story! Let them finish!",
                '3-5': "You took over their story! Let them finish first!",
                '6-8': "You've hijacked their moment. This isn't listening, it's waiting to talk.",
                '9-12': "Conversation hijacking destroys trust. You've made it about you instead of them."
              },
              proTip: {
                'k2': "Pro Tip: Let them finish their story! You can tell yours after!",
                '3-5': "Pro Tip: Don't take over! Listen to their whole story, then share yours!",
                '6-8': "Pro Tip: 'Me too' can wait. First, fully acknowledge their experience: 'That sounds amazing/terrible/fun!'",
                '9-12': "Pro Tip: Relate, don't redirect. 'I can imagine how that felt' before 'I had something similar...'"
              },
              isGood: false,
              points: 3
            }
          ]
        },
        // SCENARIO 5: Managing Distractions
        {
          id: 5,
          context: {
            'k2': "Your friend is talking, but there's a fun game happening nearby.",
            '3-5': "Someone is sharing something important, but your phone keeps buzzing.",
            '6-8': "A classmate is telling you about a problem, but other people are talking loudly nearby.",
            '9-12': "Someone is discussing a sensitive topic, but you have multiple notifications and distractions."
          },
          prompt: {
            'k2': "What do you do?",
            '3-5': "How do you handle this?",
            '6-8': "What's your response?",
            '9-12': "How do you manage this?"
          },
          options: [
            {
              text: {
                'k2': "*Ignore the game and focus on your friend*",
                '3-5': "*Put phone away and give them full attention*",
                '6-8': "*Move to a quieter spot or ask them to continue*",
                '9-12': "*Silence all notifications and create a focused environment*"
              },
              feedback: {
                'k2': "Perfect! You chose to listen to your friend instead of playing!",
                '3-5': "Great! You put away distractions and focused on them!",
                '6-8': "Excellent! You actively created better conditions for listening.",
                '9-12': "Outstanding! You prioritized their needs over your distractions."
              },
              proTip: {
                'k2': "Pro Tip: Friends are more important than games! Always choose listening!",
                '3-5': "Pro Tip: Put phones and toys away when someone is talking to you!",
                '6-8': "Pro Tip: If distractions are interfering, suggest moving somewhere quieter to continue the conversation.",
                '9-12': "Pro Tip: Create listening conditions: silence notifications, minimize interruptions, and focus completely."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Look at the game while pretending to listen*",
                '3-5': "*Keep checking phone while they talk*",
                '6-8': "*Get distracted by the noise and lose focus*",
                '9-12': "*Try to multitask and respond to notifications*"
              },
              feedback: {
                'k2': "They can tell you're not really listening! Focus on them!",
                '3-5': "That's not fair to them! Put the phone away!",
                '6-8': "You're not giving them your full attention. They deserve better.",
                '9-12': "Multitasking during important conversations is disrespectful and ineffective."
              },
              proTip: {
                'k2': "Pro Tip: Don't look at other things when someone is talking! Look at them!",
                '3-5': "Pro Tip: Phones can wait! Put it away when someone needs to talk!",
                '6-8': "Pro Tip: If you can't focus due to distractions, be honest: 'I'm having trouble concentrating - can we talk somewhere quieter?'",
                '9-12': "Pro Tip: True listening requires full presence. Either commit fully or suggest a better time."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "I want to play that game! Can we talk later?",
                '3-5': "I need to check my phone! Can we finish this later?",
                '6-8': "It's too noisy here! Let's talk about this later.",
                '9-12': "I'm getting too many notifications! Can we reschedule this conversation?"
              },
              feedback: {
                'k2': "That's okay if you're honest! Just make sure to talk to them later!",
                '3-5': "Good! You're being honest about needing to do other things!",
                '6-8': "Respectful! You acknowledged the distraction and suggested a better time.",
                '9-12': "Appropriate! You're managing your capacity and suggesting better conditions."
              },
              proTip: {
                'k2': "Pro Tip: It's okay to say you can't talk right now! Just make sure to talk to them soon!",
                '3-5': "Pro Tip: Being honest is better than pretending to listen! Just follow through later!",
                '6-8': "Pro Tip: 'I want to give this my full attention - can we talk in 10 minutes?' shows respect.",
                '9-12': "Pro Tip: 'I want to be fully present for this - can we talk when I can focus better?' demonstrates care."
              },
              isGood: true,
              points: 8
            },
            {
              text: {
                'k2': "*Keep looking at the game and saying 'uh huh'*",
                '3-5': "*Keep checking phone and giving half-responses*",
                '6-8': "*Nod along while clearly distracted by noise*",
                '9-12': "*Give minimal responses while handling notifications*"
              },
              feedback: {
                'k2': "They can tell you're not really listening! Be honest or focus!",
                '3-5': "This is worse than saying you can't talk! Be honest!",
                '6-8': "Half-listening is insulting. Either commit or be upfront about your limitations.",
                '9-12': "Partial attention is more damaging than honest communication about your capacity."
              },
              proTip: {
                'k2': "Pro Tip: Don't pretend to listen! Either really listen or say you can't right now!",
                '3-5': "Pro Tip: Fake listening hurts feelings! Be honest about what you can do!",
                '6-8': "Pro Tip: 'I'm having trouble focusing right now' is better than fake attention.",
                '9-12': "Pro Tip: 'I want to give this proper attention but I'm distracted' shows more respect than fake listening."
              },
              isGood: false,
              points: 1
            }
          ]
        },
        // SCENARIO 6: Empathetic Responses
        {
          id: 6,
          context: {
            'k2': "Your friend is crying because they're moving away.",
            '3-5': "Someone is upset because they didn't make the team they tried out for.",
            '6-8': "A classmate is frustrated because their parents are getting divorced.",
            '9-12': "Someone is struggling because they're dealing with anxiety about college applications."
          },
          prompt: {
            'k2': "What do you say?",
            '3-5': "How do you respond?",
            '6-8': "What's your reaction?",
            '9-12': "How do you handle this?"
          },
          options: [
            {
              text: {
                'k2': "I'm sorry you're sad. That must be really hard.",
                '3-5': "That's really disappointing. I can see why you're upset.",
                '6-8': "That sounds really difficult. I'm sorry you're going through this.",
                '9-12': "That sounds incredibly stressful. I can imagine how overwhelming this must feel."
              },
              feedback: {
                'k2': "Perfect! You showed you care about their feelings!",
                '3-5': "Great! You acknowledged their feelings and showed you understand!",
                '6-8': "Excellent! You expressed empathy and validated their experience.",
                '9-12': "Outstanding! You demonstrated deep empathy and emotional intelligence."
              },
              proTip: {
                'k2': "Pro Tip: When someone is sad, say 'I'm sorry' and show you care about their feelings!",
                '3-5': "Pro Tip: Acknowledge their feelings first: 'That sounds hard' or 'I can see why you're upset.'",
                '6-8': "Pro Tip: Empathy formula: 'That sounds [emotion]' + 'I'm sorry you're going through this.'",
                '9-12': "Pro Tip: Empathetic responses validate feelings first: 'That sounds [difficult/stressful/overwhelming]' before offering support."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "Don't cry! You'll make new friends!",
                '3-5': "Don't worry! You can try out again next year!",
                '6-8': "Don't be sad! It's not that bad!",
                '9-12': "Don't stress! Everything will work out fine!"
              },
              feedback: {
                'k2': "Don't tell them not to cry! Let them feel sad!",
                '3-5': "Don't dismiss their feelings! They need to be sad right now!",
                '6-8': "'Don't feel that way' invalidates their emotions. Let them process.",
                '9-12': "Minimizing their feelings with 'don't worry' dismisses their legitimate concerns."
              },
              proTip: {
                'k2': "Pro Tip: Never tell someone not to cry! Let them feel their feelings!",
                '3-5': "Pro Tip: Don't say 'don't worry' when someone is upset! Acknowledge their feelings first!",
                '6-8': "Pro Tip: 'Don't be sad' makes people feel worse. Instead: 'It's okay to feel sad about this.'",
                '9-12': "Pro Tip: 'Don't worry' minimizes legitimate concerns. Instead: 'That's a lot to handle - how are you feeling?'"
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "I know exactly how you feel! I moved once too!",
                '3-5': "I didn't make the team either! I know how it feels!",
                '6-8': "My parents got divorced too! I totally understand!",
                '9-12': "I was anxious about college too! I know exactly what you're going through!"
              },
              feedback: {
                'k2': "Hold on! Let them talk about THEIR feelings first!",
                '3-5': "Don't make it about you! Focus on helping them first!",
                '6-8': "You've redirected to your experience. Acknowledge theirs first.",
                '9-12': "Immediate 'I understand' can feel dismissive. Validate their unique experience first."
              },
              proTip: {
                'k2': "Pro Tip: Help them with THEIR feelings first! You can share your story after!",
                '3-5': "Pro Tip: Focus on their feelings first! Then you can relate your experience!",
                '6-8': "Pro Tip: First validate: 'That must be really hard.' Then relate: 'I went through something similar...'",
                '9-12': "Pro Tip: Lead with validation: 'That sounds incredibly difficult.' Then offer relation: 'I had some similar challenges...'"
              },
              isGood: false,
              points: 4
            },
            {
              text: {
                'k2': "It'll be okay! Everything happens for a reason!",
                '3-5': "Maybe it's for the best! You'll find something better!",
                '6-8': "This will make you stronger! You'll learn from this!",
                '9-12': "This is just a phase! You'll get through this!"
              },
              feedback: {
                'k2': "That's not helpful right now! They need you to understand their sadness!",
                '3-5': "Don't try to make them feel better yet! Let them be upset first!",
                '6-8': "Premature optimism dismisses their current pain. Validate first, encourage later.",
                '9-12': "Forced positivity when someone's struggling can feel invalidating and dismissive."
              },
              proTip: {
                'k2': "Pro Tip: Don't try to fix their feelings! Just say 'I'm sorry you're sad!'",
                '3-5': "Pro Tip: Don't jump to 'it'll be okay'! First say 'That must be really hard!'",
                '6-8': "Pro Tip: Save 'it'll get better' for later. First: 'This sounds really difficult right now.'",
                '9-12': "Pro Tip: Premature reassurance can feel dismissive. First acknowledge: 'This sounds overwhelming.' Then offer hope if appropriate."
              },
              isGood: false,
              points: 2
            }
          ]
        }
      ]
    },
    // CATEGORY 3: BODY LANGUAGE
    3: {
      id: 3,
      icon: Eye,
      title: {
        'k2': 'Body Language',
        '3-5': 'Reading Bodies',
        '6-8': 'Body Language',
        '9-12': 'Nonverbal Communication'
      },
      color: '#8B5CF6',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      situations: [
        // SCENARIO 1: Eye Contact Basics
        {
          id: 1,
          context: {
            'k2': "You're talking to your teacher.",
            '3-5': "You're having a conversation with a friend.",
            '6-8': "You're meeting someone new at school.",
            '9-12': "You're in a conversation with a peer or adult."
          },
          prompt: {
            'k2': "Where should you look?",
            '3-5': "What should you do with your eyes?",
            '6-8': "How much eye contact is appropriate?",
            '9-12': "What's the right balance of eye contact?"
          },
          options: [
            {
              text: {
                'k2': "*Look at their face while they talk*",
                '3-5': "*Look at their eyes most of the time, look away sometimes*",
                '6-8': "*Maintain eye contact 60-70% of the time, natural breaks*",
                '9-12': "*Hold eye contact while they speak, brief glances away periodically*"
              },
              feedback: {
                'k2': "Perfect! Looking at their face shows you're paying attention!",
                '3-5': "Great! That's the right balance - mostly looking, sometimes away!",
                '6-8': "Excellent! That's natural, comfortable eye contact.",
                '9-12': "Ideal! This demonstrates engagement without intensity."
              },
              proTip: {
                'k2': "Pro Tip: Look at people's faces when they talk to you! It shows you're listening!",
                '3-5': "Pro Tip: Look at their eyes most of the time, but it's okay to look away sometimes!",
                '6-8': "Pro Tip: The 60/40 rule: maintain eye contact 60% of the time, look away 40% to keep it comfortable.",
                '9-12': "Pro Tip: Natural eye contact rhythm: hold while listening, can look away briefly while processing or thinking."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Stare at them without blinking*",
                '3-5': "*Look directly at them the whole time without looking away*",
                '6-8': "*Maintain intense, unbroken eye contact*",
                '9-12': "*Lock eyes without breaking contact at all*"
              },
              feedback: {
                'k2': "That might feel scary to them! Blink and look away sometimes!",
                '3-5': "That's too much! Looking away sometimes is normal and okay!",
                '6-8': "Unbroken eye contact feels aggressive or uncomfortable. Add natural breaks.",
                '9-12': "Intense, unbroken eye contact reads as confrontational or awkward."
              },
              proTip: {
                'k2': "Pro Tip: Remember to blink! And it's okay to look away for a second!",
                '3-5': "Pro Tip: Too much staring makes people uncomfortable! Look away naturally every few seconds!",
                '6-8': "Pro Tip: Constant eye contact without breaks feels intense. Look away briefly when natural.",
                '9-12': "Pro Tip: Unbroken eye contact signals aggression or social awkwardness. Natural rhythm includes glancing away."
              },
              isGood: false,
              points: 2
            },
            {
              text: {
                'k2': "*Look at the floor the whole time*",
                '3-5': "*Look around the room, not at them*",
                '6-8': "*Avoid eye contact, look at your phone or elsewhere*",
                '9-12': "*Maintain minimal eye contact, focused on objects or devices*"
              },
              feedback: {
                'k2': "They might think you're not listening! Look up at them!",
                '3-5': "You seem distracted or uninterested! Look at them!",
                '6-8': "Avoiding eye contact signals disinterest or discomfort.",
                '9-12': "Eye contact avoidance communicates anxiety, disinterest, or dishonesty."
              },
              proTip: {
                'k2': "Pro Tip: Look at people when they talk! If you're shy, look at their nose or forehead!",
                '3-5': "Pro Tip: If eye contact is hard, look at the space between their eyes or their nose!",
                '6-8': "Pro Tip: If direct eye contact is uncomfortable, look at the bridge of their nose - they won't notice the difference.",
                '9-12': "Pro Tip: Comfort hack: focus on one eye at a time, or the area between eyebrows. Appears as full eye contact."
              },
              isGood: false,
              points: 0
            }
          ]
        },
        // SCENARIO 2: Reading Facial Expressions
        {
          id: 2,
          context: {
            'k2': "Someone's face looks like this: 😠 with crossed arms.",
            '3-5': "You see a classmate with a frown and slumped shoulders.",
            '6-8': "Someone you're talking to has their arms crossed and is frowning slightly.",
            '9-12': "A person's jaw is tight, arms are crossed, and they're giving short answers."
          },
          prompt: {
            'k2': "How do they feel?",
            '3-5': "What might they be feeling?",
            '6-8': "What are these signals telling you?",
            '9-12': "What's the appropriate interpretation?"
          },
          options: [
            {
              text: {
                'k2': "They look mad or upset!",
                '3-5': "They seem upset or frustrated about something.",
                '6-8': "They appear frustrated or uncomfortable with the situation.",
                '9-12': "They're displaying signs of frustration, anger, or defensiveness."
              },
              feedback: {
                'k2': "Right! Their face and body show they're not happy!",
                '3-5': "Good reading! Those are signs of negative emotions!",
                '6-8': "Correct! You've identified defensive/negative body language.",
                '9-12': "Accurate! These are clear indicators of negative emotional state."
              },
              proTip: {
                'k2': "Pro Tip: When someone frowns or crosses their arms, they might be mad or sad!",
                '3-5': "Pro Tip: Crossed arms + frown = upset! Give them space or ask if they're okay!",
                '6-8': "Pro Tip: Cluster reading: one signal might be random, but multiple signals confirm the emotion.",
                '9-12': "Pro Tip: Defensive posture (crossed arms, tight jaw, closed body) signals discomfort. Adjust approach accordingly."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "They're really happy!",
                '3-5': "They seem excited and happy!",
                '6-8': "They're having a great time!",
                '9-12': "They seem engaged and positive!"
              },
              feedback: {
                'k2': "Not quite! Frowns and crossed arms usually mean they're upset!",
                '3-5': "That's not matching their body language! Look again!",
                '6-8': "You've misread the signals. These are negative indicators.",
                '9-12': "This is a significant misread of clear negative signals."
              },
              proTip: {
                'k2': "Pro Tip: Happy faces smile! 😊 Unhappy faces frown! ☹️",
                '3-5': "Pro Tip: Smiles = happy! Frowns = unhappy! Watch faces to understand feelings!",
                '6-8': "Pro Tip: Basic emotion reading: smile + open posture = positive, frown + closed posture = negative.",
                '9-12': "Pro Tip: Misreading negative signals as positive can escalate conflicts. When in doubt, check verbally."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "I don't know, I'm not looking at them.",
                '3-5': "I wasn't really paying attention.",
                '6-8': "I don't really notice body language.",
                '9-12': "I don't read into those things."
              },
              feedback: {
                'k2': "You need to look at people to understand how they feel!",
                '3-5': "Body language tells you a lot! Start noticing these signs!",
                '6-8': "Ignoring body language means missing important social information.",
                '9-12': "Body language literacy is essential for social competence. Start observing."
              },
              proTip: {
                'k2': "Pro Tip: Look at people's faces and bodies! They tell you how someone feels!",
                '3-5': "Pro Tip: Start noticing: Are they smiling? Frowning? Arms open or closed? This helps you understand people!",
                '6-8': "Pro Tip: 55% of communication is body language. Start practicing observation in low-stakes situations.",
                '9-12': "Pro Tip: Body language awareness is a learnable skill. Practice: observe people in public and guess their emotions."
              },
              isGood: false,
              points: 0
            }
          ]
        },
        // SCENARIO 3: Personal Space Boundaries
        {
          id: 3,
          context: {
            'k2': "You're excited to talk to a new friend!",
            '3-5': "You want to show someone something on your tablet.",
            '6-8': "You're having a conversation with someone you just met.",
            '9-12': "You're talking to an acquaintance in a social setting."
          },
          prompt: {
            'k2': "How close should you stand?",
            '3-5': "What's a good distance?",
            '6-8': "What's appropriate personal space?",
            '9-12': "What distance is socially appropriate?"
          },
          options: [
            {
              text: {
                'k2': "*About an arm's length away*",
                '3-5': "*About 2-3 feet away, arm's length*",
                '6-8': "*About 2-4 feet, conversational distance*",
                '9-12': "*Approximately 2-4 feet for acquaintances, 1.5-2 for friends*"
              },
              feedback: {
                'k2': "Perfect! That's a good friendly distance!",
                '3-5': "Great! That's comfortable for both of you!",
                '6-8': "Excellent! That's the standard social distance.",
                '9-12': "Ideal! This respects personal space while maintaining connection."
              },
              proTip: {
                'k2': "Pro Tip: If you can touch them without moving, you're too close! One big step back!",
                '3-5': "Pro Tip: The arm's length rule: stretch out your arm - that's about right!",
                '6-8': "Pro Tip: Personal space varies by relationship: acquaintances 3-4ft, friends 2-3ft, close friends 1.5-2ft.",
                '9-12': "Pro Tip: Cultural context matters, but general US rule: social distance = 2-4ft. Adjust based on their signals."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Right next to them, really close*",
                '3-5': "*Very close, almost touching*",
                '6-8': "*Within 1 foot, intimate distance*",
                '9-12': "*Close enough to feel their breath, < 1.5 feet*"
              },
              feedback: {
                'k2': "Too close! Take a step back!",
                '3-5': "That's uncomfortably close for most people! Give them space!",
                '6-8': "You've invaded their personal space. This distance is for intimate relationships only.",
                '9-12': "Intimate distance (<1.5ft) with non-intimates creates significant discomfort."
              },
              proTip: {
                'k2': "Pro Tip: If you're close enough to hug, you're too close for talking! Step back!",
                '3-5': "Pro Tip: Watch their reaction! If they lean back, you're too close!",
                '6-8': "Pro Tip: If someone steps back when you approach, you've crossed their boundary. Maintain the new distance.",
                '9-12': "Pro Tip: Space invasions create anxiety. Watch for retreat signals: leaning back, stepping away, crossed arms."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "*Across the room, far away*",
                '3-5': "*Several feet away, shouting distance*",
                '6-8': "*6+ feet away, public space distance*",
                '9-12': "*Beyond 7 feet, public distance*"
              },
              feedback: {
                'k2': "That's too far! Come a bit closer so you don't have to yell!",
                '3-5': "That's pretty far! You'll have to talk really loud!",
                '6-8': "That's too distant for conversation. Come closer.",
                '9-12': "Public distance (7+ ft) is appropriate for presentations, not conversations."
              },
              proTip: {
                'k2': "Pro Tip: You should be close enough to talk in a normal voice!",
                '3-5': "Pro Tip: Good talking distance = you can hear each other without shouting!",
                '6-8': "Pro Tip: If you have to raise your voice significantly, you're too far. 2-4 feet is the sweet spot.",
                '9-12': "Pro Tip: Distance zones: intimate (<1.5ft), personal (1.5-4ft), social (4-12ft), public (12+ft). Conversation = personal zone."
              },
              isGood: false,
              points: 3
            }
          ]
        },
        // SCENARIO 4: Confident Posture
        {
          id: 4,
          context: {
            'k2': "You're meeting your new teacher for the first time.",
            '3-5': "You're introducing yourself to a new student.",
            '6-8': "You're giving a presentation to your class.",
            '9-12': "You're at a job interview or meeting new people at an event."
          },
          prompt: {
            'k2': "How should you stand?",
            '3-5': "What's good posture?",
            '6-8': "How do you present confidence through posture?",
            '9-12': "What body language projects confidence?"
          },
          options: [
            {
              text: {
                'k2': "*Stand up tall with shoulders back*",
                '3-5': "*Stand straight, head up, shoulders back*",
                '6-8': "*Upright posture, shoulders back, weight balanced*",
                '9-12': "*Erect spine, shoulders back and down, chin parallel to ground, open stance*"
              },
              feedback: {
                'k2': "Perfect! Standing tall makes you look confident!",
                '3-5': "Excellent! That's confident, friendly posture!",
                '6-8': "Great! This projects confidence and readiness.",
                '9-12': "Ideal! This is textbook confident body language."
              },
              proTip: {
                'k2': "Pro Tip: Pretend there's a string pulling you up from the top of your head!",
                '3-5': "Pro Tip: Think 'superhero pose'! Stand tall and proud!",
                '6-8': "Pro Tip: Quick confidence check: shoulders back, chest open, head level. This instantly improves presence.",
                '9-12': "Pro Tip: Power posing (expansive posture) for 2 minutes before stressful situations actually increases confidence hormones."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Hunch over and look at the ground*",
                '3-5': "*Slouch with rounded shoulders, look down*",
                '6-8': "*Hunched posture, eyes down, closed body language*",
                '9-12': "*Rounded shoulders, downward gaze, collapsed chest*"
              },
              feedback: {
                'k2': "That looks sad or scared! Stand up straight instead!",
                '3-5': "That looks uncertain and uncomfortable! Stand up tall!",
                '6-8': "This projects insecurity and discomfort. Open up your posture.",
                '9-12': "Closed, collapsed posture signals low confidence and invites dismissal."
              },
              proTip: {
                'k2': "Pro Tip: Looking at the ground makes you seem sad! Look up and smile!",
                '3-5': "Pro Tip: Slouching makes you look tired or sad! Standing tall makes you look happy and ready!",
                '6-8': "Pro Tip: Posture affects emotion! Deliberately adjusting to open posture actually makes you feel more confident.",
                '9-12': "Pro Tip: Body-mind connection: changing posture changes emotion. Stand confidently even when you don't feel it - feeling follows form."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "*Cross arms and look away*",
                '3-5': "*Cross arms tightly, shift weight nervously*",
                '6-8': "*Crossed arms, one hip out, defensive stance*",
                '9-12': "*Arms crossed, weight shifted, barrier body language*"
              },
              feedback: {
                'k2': "Crossing your arms can look unfriendly! Keep your arms at your sides!",
                '3-5': "That looks closed off! Keep your arms relaxed at your sides!",
                '6-8': "Crossed arms signal defensiveness or discomfort. Open your posture.",
                '9-12': "Barrier gestures (crossed arms, shifted weight) communicate unavailability and discomfort."
              },
              proTip: {
                'k2': "Pro Tip: Keep your arms by your sides or in front of you, not crossed!",
                '3-5': "Pro Tip: Crossed arms = 'stay away!' Open arms = 'I'm friendly!'",
                '6-8': "Pro Tip: If you feel awkward with your arms, clasp hands in front (not crossed), or keep one arm relaxed at side.",
                '9-12': "Pro Tip: Self-hugging gestures (crossed arms, holding elbows) create physical barriers. Practice open, expansive poses."
              },
              isGood: false,
              points: 2
            }
          ]
        },
        // SCENARIO 5: Handshakes and Greetings
        {
          id: 5,
          context: {
            'k2': "An adult says hello and puts out their hand.",
            '3-5': "Someone's parent reaches out to shake your hand.",
            '6-8': "You're meeting your friend's parents for the first time.",
            '9-12': "You're at a professional or formal introduction."
          },
          prompt: {
            'k2': "What do you do?",
            '3-5': "How do you respond?",
            '6-8': "What's the appropriate greeting?",
            '9-12': "How do you execute a proper handshake?"
          },
          options: [
            {
              text: {
                'k2': "*Shake their hand and smile*",
                '3-5': "*Shake their hand firmly and say 'Nice to meet you!'*",
                '6-8': "*Firm handshake, eye contact, 'Nice to meet you, Mr./Mrs. ___'*",
                '9-12': "*Firm handshake, direct eye contact, confident greeting with name*"
              },
              feedback: {
                'k2': "Perfect! Shaking hands is polite and friendly!",
                '3-5': "Excellent! That's a great, confident greeting!",
                '6-8': "Great! Professional and respectful introduction.",
                '9-12': "Ideal! This demonstrates confidence and social competence."
              },
              proTip: {
                'k2': "Pro Tip: When shaking hands, hold firm but don't squeeze too hard!",
                '3-5': "Pro Tip: Good handshake: web-to-web contact, 2-3 shakes, smile, eye contact!",
                '6-8': "Pro Tip: Handshake formula: firm grip (not crushing), 2-3 pumps, eye contact, smile, verbal greeting.",
                '9-12': "Pro Tip: Perfect handshake: web-to-web contact, firm pressure (match theirs), 2-3 seconds, release. Make eye contact throughout."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Don't shake, just wave from far away*",
                '3-5': "*Ignore the hand and just say hi*",
                '6-8': "*Leave them hanging, just nod*",
                '9-12': "*Don't take their hand, just verbal greeting*"
              },
              feedback: {
                'k2': "They're trying to shake your hand! It's polite to shake back!",
                '3-5': "That's awkward! When someone offers their hand, shake it!",
                '6-8': "Leaving someone's hand hanging is rude. Always reciprocate.",
                '9-12': "Refusing a handshake without reason (pandemic, cultural, etc.) is a significant social error."
              },
              proTip: {
                'k2': "Pro Tip: When someone puts out their hand, hold it and shake it gently!",
                '3-5': "Pro Tip: Always shake hands when offered! It shows respect and confidence!",
                '6-8': "Pro Tip: Handshake rejection signals disrespect or social awkwardness. Even if uncomfortable, reciprocate.",
                '9-12': "Pro Tip: Handshake refusal is a major social violation in Western culture. If you have valid reasons (germophobic, pandemic), verbally acknowledge."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "*Shake with just your fingers, really loose*",
                '3-5': "*Give a really weak, limp handshake*",
                '6-8': "*Dead fish handshake - limp and passive*",
                '9-12': "*Limp, fingerless handshake without grip*"
              },
              feedback: {
                'k2': "That's too loose! Hold their hand a little tighter!",
                '3-5': "Too weak! A limp handshake seems unconfident!",
                '6-8': "Weak handshakes project low confidence and disinterest.",
                '9-12': "The 'dead fish' handshake is infamous for projecting weakness and disengagement."
              },
              proTip: {
                'k2': "Pro Tip: Use your whole hand, not just fingers! Hold firm but gentle!",
                '3-5': "Pro Tip: A good handshake is firm but not too tight! Practice makes perfect!",
                '6-8': "Pro Tip: Aim for medium-firm pressure - firm enough to show confidence, gentle enough to be comfortable.",
                '9-12': "Pro Tip: Match pressure to theirs. Generally aim for firm but not aggressive. Web-to-web contact is essential."
              },
              isGood: false,
              points: 3
            },
            {
              text: {
                'k2': "*Squeeze their hand really, really tight*",
                '3-5': "*Crush their hand with a super strong grip*",
                '6-8': "*Overly aggressive, dominant handshake*",
                '9-12': "*Bone-crushing grip, aggressive power play*"
              },
              feedback: {
                'k2': "Too tight! That might hurt them! Be more gentle!",
                '3-5': "Ouch! That's too strong! Firm but not crushing!",
                '6-8': "Overly aggressive handshakes project insecurity masked as dominance.",
                '9-12': "Power-play handshakes are transparent attempts at dominance and signal insecurity."
              },
              proTip: {
                'k2': "Pro Tip: Don't squeeze too hard! Pretend you're holding a small bird - firm but gentle!",
                '3-5': "Pro Tip: Firm doesn't mean crushing! Just solid and confident!",
                '6-8': "Pro Tip: Aggressive handshakes backfire - they signal trying too hard, not confidence.",
                '9-12': "Pro Tip: Bone-crushing grips are universally disliked and seen as overcompensation. Firm and respectful wins."
              },
              isGood: false,
              points: 1
            }
          ]
        },
        // SCENARIO 6: Nervous Habits to Avoid
        {
          id: 6,
          context: {
            'k2': "You're waiting for your turn to show-and-tell and feeling nervous.",
            '3-5': "You're about to give a presentation and you feel anxious.",
            '6-8': "You're in a social situation and feeling uncomfortable.",
            '9-12': "You're in an interview or important conversation and feeling stressed."
          },
          prompt: {
            'k2': "What should you NOT do?",
            '3-5': "What nervous habits should you avoid?",
            '6-8': "What behaviors should you be aware of?",
            '9-12': "What anxiety tells do you need to manage?"
          },
          options: [
            {
              text: {
                'k2': "*Take a deep breath and keep hands still*",
                '3-5': "*Take slow breaths and rest hands calmly*",
                '6-8': "*Breathe deliberately, maintain still, open posture*",
                '9-12': "*Practice box breathing, maintain composed posture, hands visible but still*"
              },
              feedback: {
                'k2': "Great! Staying calm helps you feel better!",
                '3-5': "Perfect! Controlling your breath helps control your nerves!",
                '6-8': "Excellent! Managing physical symptoms reduces visible anxiety.",
                '9-12': "Ideal! Physiological regulation reduces both anxiety and its visible signs."
              },
              proTip: {
                'k2': "Pro Tip: When nervous, take big slow breaths! It helps you calm down!",
                '3-5': "Pro Tip: Deep breathing trick: breathe in for 4, hold for 4, out for 4. Do it 3 times!",
                '6-8': "Pro Tip: Box breathing (4-4-4-4) activates parasympathetic nervous system and reduces anxiety fast.",
                '9-12': "Pro Tip: Physiological sigh (double inhale, long exhale) most rapidly reduces stress. Practice before high-pressure situations."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Bite nails or pick at fingers*",
                '3-5': "*Fidget constantly, tap feet, bite nails*",
                '6-8': "*Constant fidgeting, nail biting, hair twirling*",
                '9-12': "*Visible nervous tics: nail biting, leg bouncing, finger drumming*"
              },
              feedback: {
                'k2': "Try not to do that! It shows you're nervous!",
                '3-5': "Those habits show everyone you're anxious! Try to stay still!",
                '6-8': "Nervous habits broadcast anxiety and distract others from your message.",
                '9-12': "Visible anxiety tells undermine your message and project lack of confidence."
              },
              proTip: {
                'k2': "Pro Tip: If you want to move your hands, hold them together or hold something!",
                '3-5': "Pro Tip: If you need to do something with your hands, clasp them or hold a pen!",
                '6-8': "Pro Tip: Redirect nervous energy: squeeze hands together, press feet into floor, or hold something discreet.",
                '9-12': "Pro Tip: Channel nervous energy productively: deliberate hand gestures, subtle muscle tension/release, or grounding techniques."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "*Hide face behind hands*",
                '3-5': "*Cover face, avoid all eye contact*",
                '6-8': "*Hide behind hair, complete avoidance posture*",
                '9-12': "*Physical withdrawal, barrier postures, face covering*"
              },
              feedback: {
                'k2': "That makes it hard to see you! Try to keep your face visible!",
                '3-5': "Hiding makes you seem more nervous! Stand tall instead!",
                '6-8': "Avoidance behaviors amplify perception of anxiety. Open posture is better.",
                '9-12': "Retreat behaviors signal extreme discomfort and invite others' anxiety."
              },
              proTip: {
                'k2': "Pro Tip: Even if you're nervous, let people see your face! You can do it!",
                '3-5': "Pro Tip: Hiding makes nerves worse! Face your fear - it gets easier every time!",
                '6-8': "Pro Tip: Exposure reduces anxiety over time. Each time you maintain open posture despite nerves, it gets easier.",
                '9-12': "Pro Tip: Avoidance maintains anxiety. Approach with discomfort (open posture despite fear) is the only path to confidence."
              },
              isGood: false,
              points: 0
            }
          ]
        }
      ]
    },
    // CATEGORY 4: CONFIDENCE BUILDING
    4: {
      id: 4,
      icon: Star,
      title: {
        'k2': 'Confidence Building',
        '3-5': 'Building Confidence',
        '6-8': 'Confidence Building',
        '9-12': 'Self-Confidence'
      },
      color: '#14B8A6',
      background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
      situations: [
        // SCENARIO 1: Speaking Up in Groups
        {
          id: 1,
          context: {
            'k2': "Your class is talking about favorite animals and you have an idea!",
            '3-5': "Your group is discussing what game to play and you have a suggestion.",
            '6-8': "Your class is debating a topic and you have a perspective to share.",
            '9-12': "You're in a group discussion and have relevant insight but feel hesitant."
          },
          prompt: {
            'k2': "What do you do?",
            '3-5': "Should you speak up?",
            '6-8': "How do you contribute?",
            '9-12': "What's your approach?"
          },
          options: [
            {
              text: {
                'k2': "*Raise hand and share your idea*",
                '3-5': "*Wait for a pause, then clearly state your suggestion*",
                '6-8': "*'I have a thought on this' - then share your perspective*",
                '9-12': "*'Building on that point...' or 'Different perspective...' - then contribute*"
              },
              feedback: {
                'k2': "Great job! Sharing your ideas is important!",
                '3-5': "Perfect! You waited for the right moment and spoke clearly!",
                '6-8': "Excellent! You signaled your contribution and delivered confidently.",
                '9-12': "Ideal! You've framed your contribution and asserted your perspective."
              },
              proTip: {
                'k2': "Pro Tip: Your ideas are good! Always try to share them!",
                '3-5': "Pro Tip: Wait for a quiet moment, take a breath, then speak clearly!",
                '6-8': "Pro Tip: Entry phrases help: 'I think...', 'What if...', 'Has anyone considered...' signal you're adding value.",
                '9-12': "Pro Tip: Frame contributions: 'counterpoint,' 'building on that,' 'different angle.' This positions your value-add."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Stay quiet even though you have an idea*",
                '3-5': "*Keep your suggestion to yourself*",
                '6-8': "*Remain silent despite having relevant input*",
                '9-12': "*Self-censor and don't contribute*"
              },
              feedback: {
                'k2': "Your idea is good! Don't be afraid to share it!",
                '3-5': "You had something to offer! Speak up next time!",
                '6-8': "By not contributing, you're denying the group your perspective.",
                '9-12': "Self-silencing means missing opportunities and reinforcing insecurity."
              },
              proTip: {
                'k2': "Pro Tip: Even if you're shy, your ideas matter! Try sharing just one thing!",
                '3-5': "Pro Tip: Start small! Share one idea per day, even if it feels scary!",
                '6-8': "Pro Tip: Nobody knows your insight is valuable until you share it. The only guaranteed failure is silence.",
                '9-12': "Pro Tip: Confidence builds through action, not thought. Each time you speak up despite fear, it gets easier."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "*Whisper your idea to the person next to you*",
                '3-5': "*Tell your friend your idea quietly instead of the group*",
                '6-8': "*Share your thought with one person instead of the whole group*",
                '9-12': "*Side conversation instead of group contribution*"
              },
              feedback: {
                'k2': "That's okay, but the whole class would like to hear your idea!",
                '3-5': "Your friend likes your idea - the whole group might too! Share with everyone!",
                '6-8': "You had the courage to share, but limited your impact. Speak to the group.",
                '9-12': "Private sharing is a halfway measure. Full participation requires public contribution."
              },
              proTip: {
                'k2': "Pro Tip: It's okay to be nervous! Next time, try telling the whole class!",
                '3-5': "Pro Tip: Practice! First share with one person, then a small group, then everyone!",
                '6-8': "Pro Tip: Build gradually: share with friend → small group → full class. Each level builds confidence.",
                '9-12': "Pro Tip: Proximate sharing is progress but not the goal. Use it as a stepping stone to full group contribution."
              },
              isGood: false,
              points: 5
            },
            {
              text: {
                'k2': "*Shout out your idea really loud*",
                '3-5': "*Interrupt everyone to share your idea immediately*",
                '6-8': "*Talk over others without waiting for an opening*",
                '9-12': "*Assert your perspective without regard for conversational flow*"
              },
              feedback: {
                'k2': "Good energy, but wait your turn! Raise your hand!",
                '3-5': "Great confidence, but don't interrupt! Wait for a pause!",
                '6-8': "Confidence is good, but respect conversational flow. Wait for an opening.",
                '9-12': "Assertiveness without social calibration comes across as domineering."
              },
              proTip: {
                'k2': "Pro Tip: It's great to be excited! But wait for your turn to talk!",
                '3-5': "Pro Tip: Confidence + patience = perfect! Wait for a quiet moment, then speak up!",
                '6-8': "Pro Tip: True confidence respects others' space. Find natural pauses or explicitly request floor time.",
                '9-12': "Pro Tip: Balance assertion with calibration. 'Can I jump in?' or waiting for natural breaks maintains respect."
              },
              isGood: false,
              points: 4
            }
          ]
        },
        // SCENARIO 2: Handling Embarrassment
        {
          id: 2,
          context: {
            'k2': "You tripped and fell in front of other kids.",
            '3-5': "You gave a wrong answer in class and some kids laughed.",
            '6-8': "You made a mistake during a presentation.",
            '9-12': "You experienced a social mishap in front of peers."
          },
          prompt: {
            'k2': "What should you do?",
            '3-5': "How do you handle it?",
            '6-8': "What's your response?",
            '9-12': "How do you recover?"
          },
          options: [
            {
              text: {
                'k2': "*Get up, laugh a little, and keep going*",
                '3-5': "*Smile and say 'Oops!' and move on*",
                '6-8': "*Acknowledge briefly with humor, then continue*",
                '9-12': "*'Well, that was awkward!' - self-deprecating humor, move forward*"
              },
              feedback: {
                'k2': "Perfect! Everyone makes mistakes! You handled it great!",
                '3-5': "Excellent! You didn't let it ruin your day!",
                '6-8': "Great recovery! Quick acknowledgment and forward momentum.",
                '9-12': "Ideal! Self-deprecating humor + swift recovery demonstrates confidence."
              },
              proTip: {
                'k2': "Pro Tip: Everyone falls sometimes! Just get up and smile!",
                '3-5': "Pro Tip: Quick laugh + move on = everyone forgets fast!",
                '6-8': "Pro Tip: Brief acknowledgment + humor + move forward = classic confident recovery pattern.",
                '9-12': "Pro Tip: Confident people acknowledge mistakes without dwelling. Quick humor diffuses tension and models resilience."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Cry and run away*",
                '3-5': "*Get really upset and hide*",
                '6-8': "*Flee the situation in distress*",
                '9-12': "*Catastrophize and exit abruptly*"
              },
              feedback: {
                'k2': "It's okay to feel bad, but running away makes it seem bigger!",
                '3-5': "It's normal to feel embarrassed, but don't let it control you!",
                '6-8': "Fleeing amplifies the incident and reinforces shame.",
                '9-12': "Catastrophic response to minor incidents reinforces anxiety and damages confidence."
              },
              proTip: {
                'k2': "Pro Tip: Take a deep breath! Everyone makes mistakes and it's okay!",
                '3-5': "Pro Tip: Feel the embarrassment, but don't run! Stay, breathe, and let it pass!",
                '6-8': "Pro Tip: Embarrassment feels huge in the moment but fades fast. Staying present teaches your brain it's survivable.",
                '9-12': "Pro Tip: Avoidance maintains shame. Tolerating discomfort in-situ builds resilience. Each time you stay, confidence grows."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "*Pretend it didn't happen and act weird*",
                '3-5': "*Ignore it completely and act like nothing happened*",
                '6-8': "*Deny or minimize without acknowledgment*",
                '9-12': "*Complete avoidance, pretend it didn't occur*"
              },
              feedback: {
                'k2': "Everyone saw it! A little laugh or 'I'm okay!' is better!",
                '3-5': "Pretending makes it awkward! Just say 'oops!' and move on!",
                '6-8': "Everyone saw it. Non-acknowledgment creates awkwardness.",
                '9-12': "Denial when something is obvious creates disconnect and amplifies awkwardness."
              },
              proTip: {
                'k2': "Pro Tip: It's okay to say 'I'm okay!' so people know you're fine!",
                '3-5': "Pro Tip: Quick acknowledgment ('My bad!') works better than pretending!",
                '6-8': "Pro Tip: Brief acknowledgment releases social tension. Denial maintains it.",
                '9-12': "Pro Tip: Acknowledge obvious mishaps briefly, then redirect. Denial damages credibility and prolongs discomfort."
              },
              isGood: false,
              points: 3
            },
            {
              text: {
                'k2': "*Blame someone else or something else*",
                '3-5': "*Get angry and blame the teacher or classmates*",
                '6-8': "*Externalize blame to protect ego*",
                '9-12': "*Defensive blame-shifting to avoid responsibility*"
              },
              feedback: {
                'k2': "That's not fair! It's okay to make mistakes - don't blame others!",
                '3-5': "Blaming others makes it worse! Own your mistakes!",
                '6-8': "Blame-shifting is transparent and damages credibility more than the original mistake.",
                '9-12': "Defensive externalization signals fragile ego and lack of accountability."
              },
              proTip: {
                'k2': "Pro Tip: Everyone makes mistakes! It's better to say 'Oops, my bad!' than to blame someone!",
                '3-5': "Pro Tip: Taking responsibility = strong! Blaming others = weak! Own it and move on!",
                '6-8': "Pro Tip: 'I messed up' followed by correction is infinitely stronger than blame-shifting.",
                '9-12': "Pro Tip: Accountability signals confidence. Blame signals insecurity. Own mistakes swiftly and move forward."
              },
              isGood: false,
              points: 0
            }
          ]
        },
        // SCENARIO 3: Accepting Compliments
        {
          id: 3,
          context: {
            'k2': "Someone says 'I like your drawing! It's really good!'",
            '3-5': "A classmate says 'You're really good at soccer!'",
            '6-8': "Someone compliments your presentation: 'That was really well done.'",
            '9-12': "Someone says 'You're really talented at this. That was impressive.'"
          },
          prompt: {
            'k2': "What do you say?",
            '3-5': "How do you respond?",
            '6-8': "What's your reply?",
            '9-12': "How do you accept the compliment?"
          },
          options: [
            {
              text: {
                'k2': "Thank you! I worked hard on it!",
                '3-5': "Thanks! I've been practicing a lot!",
                '6-8': "Thank you! I really appreciate that.",
                '9-12': "Thank you, that means a lot. I put a lot of effort into it."
              },
              feedback: {
                'k2': "Perfect! You said thank you and were proud of your work!",
                '3-5': "Excellent! You accepted the compliment graciously!",
                '6-8': "Great! You acknowledged both the compliment and your effort.",
                '9-12': "Ideal! You accepted graciously and validated your own effort."
              },
              proTip: {
                'k2': "Pro Tip: When someone says something nice, say 'thank you!' and smile!",
                '3-5': "Pro Tip: It's okay to be proud! Say 'thanks' and maybe mention how hard you worked!",
                '6-8': "Pro Tip: The formula: 'Thank you' + brief acknowledgment of effort or context. This validates both of you.",
                '9-12': "Pro Tip: Gracious acceptance = 'Thank you' + validation of your effort. Avoid deflection or over-humility."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "No it's not! It's bad!",
                '3-5': "It's not that good. Anyone could do it.",
                '6-8': "It wasn't that great, honestly.",
                '9-12': "I really didn't do that well. There were so many mistakes."
              },
              feedback: {
                'k2': "Don't say that! Your drawing IS good! Accept the nice words!",
                '3-5': "You're being too hard on yourself! Accept the compliment!",
                '6-8': "Deflecting compliments suggests low self-worth and dismisses the giver.",
                '9-12': "Rejecting compliments signals insecurity and invalidates the complimenter's judgment."
              },
              proTip: {
                'k2': "Pro Tip: When someone says something nice, believe them! Say 'thank you!'",
                '3-5': "Pro Tip: Don't argue with compliments! Just say 'thanks' even if you feel shy!",
                '6-8': "Pro Tip: Compliment deflection makes both parties uncomfortable. Simple 'thank you' is sufficient.",
                '9-12': "Pro Tip: Rejecting compliments implies the giver has poor judgment. Honor their perspective with gracious acceptance."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "Yeah, I know I'm good!",
                '3-5': "Yeah, I'm the best at this!",
                '6-8': "I know, I'm pretty talented.",
                '9-12': "Obviously. I'm naturally gifted at this."
              },
              feedback: {
                'k2': "It's good to be proud, but that sounds a little too big!",
                '3-5': "Being confident is good, but that sounds a bit too boastful!",
                '6-8': "Confidence crossed into arrogance. This alienates others.",
                '9-12': "Arrogant acceptance damages relationships and signals insecurity."
              },
              proTip: {
                'k2': "Pro Tip: Say 'thank you' instead of 'I know!' Be proud but not too much!",
                '3-5': "Pro Tip: Confidence is great! But stay humble: 'Thanks! I worked really hard!'",
                '6-8': "Pro Tip: Balance confidence with humility: 'Thank you, I'm proud of the effort I put in.'",
                '9-12': "Pro Tip: The line between confidence and arrogance: acknowledge effort/growth, not inherent superiority."
              },
              isGood: false,
              points: 3
            },
            {
              text: {
                'k2': "*Say nothing and look away*",
                '3-5': "*Shrug and change the subject*",
                '6-8': "*Awkward silence, then topic change*",
                '9-12': "*Uncomfortable deflection without acknowledgment*"
              },
              feedback: {
                'k2': "They're trying to be nice! Say 'thank you!'",
                '3-5': "Don't ignore compliments! At least say thanks!",
                '6-8': "Ignoring compliments creates social awkwardness.",
                '9-12': "Non-acknowledgment of compliments is socially uncomfortable for both parties."
              },
              proTip: {
                'k2': "Pro Tip: Always say something when people are nice! 'Thank you!' is perfect!",
                '3-5': "Pro Tip: Even if you feel shy, at least say 'thanks!' It's polite!",
                '6-8': "Pro Tip: Compliment acknowledgment is a basic social contract. At minimum: 'Thank you.'",
                '9-12': "Pro Tip: Silence in response to compliments creates discomfort. Always acknowledge, even if briefly."
              },
              isGood: false,
              points: 2
            }
          ]
        },
        // SCENARIO 4: Standing Up for Yourself
        {
          id: 4,
          context: {
            'k2': "Someone cuts in line in front of you.",
            '3-5': "A classmate takes your pencil without asking.",
            '6-8': "Someone takes credit for your idea in a group project.",
            '9-12': "Someone publicly dismisses your contribution in a meeting."
          },
          prompt: {
            'k2': "What do you do?",
            '3-5': "How do you handle this?",
            '6-8': "What's your response?",
            '9-12': "How do you address this?"
          },
          options: [
            {
              text: {
                'k2': "Excuse me, I was here first.",
                '3-5': "Hey, that's my pencil. Please give it back.",
                '6-8': "Actually, that was my idea. I'd like credit for it.",
                '9-12': "I appreciate your input, but I'd like to clarify my position on this."
              },
              feedback: {
                'k2': "Great! You spoke up for yourself politely!",
                '3-5': "Perfect! You were firm but polite!",
                '6-8': "Excellent! You asserted yourself clearly and directly.",
                '9-12': "Ideal! You stood your ground professionally and respectfully."
              },
              proTip: {
                'k2': "Pro Tip: It's okay to tell people when something isn't fair! Use a calm voice!",
                '3-5': "Pro Tip: You can be firm AND polite! Say what you need clearly but nicely!",
                '6-8': "Pro Tip: Assertive formula: State the issue + your need/boundary. No aggression required.",
                '9-12': "Pro Tip: Professional assertion: Acknowledge → Clarify → Stand firm. Maintain composure throughout."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Say nothing and let them cut*",
                '3-5': "*Let them keep it and say nothing*",
                '6-8': "*Stay silent and let them take credit*",
                '9-12': "*Accept the dismissal without response*"
              },
              feedback: {
                'k2': "That's not fair to you! It's okay to speak up!",
                '3-5': "You deserve to have your things! Speak up next time!",
                '6-8': "Silence reinforces the pattern and builds resentment.",
                '9-12': "Non-assertion invites continued disrespect and damages self-respect."
              },
              proTip: {
                'k2': "Pro Tip: You can use your words! It's okay to say 'That's not fair!'",
                '3-5': "Pro Tip: Speaking up for yourself is important! Practice saying 'Please don't do that.'",
                '6-8': "Pro Tip: Each time you don't assert yourself, the pattern strengthens. Start with small assertions.",
                '9-12': "Pro Tip: Self-advocacy is a skill that requires practice. Start in low-stakes situations, build to high-stakes."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "HEY! You CAN'T do that! You're mean!",
                '3-5': "Give it back NOW or I'll tell on you!",
                '6-8': "That's MY idea! You're a thief!",
                '9-12': "Are you seriously trying to steal my work? That's unacceptable!"
              },
              feedback: {
                'k2': "Too loud and angry! Use a calm voice when you speak up!",
                '3-5': "That's too aggressive! You can be firm without being mean!",
                '6-8': "Aggressive assertion damages relationships and undermines your point.",
                '9-12': "Hostile confrontation escalates conflict and damages professional reputation."
              },
              proTip: {
                'k2': "Pro Tip: Use your normal voice, not your yelling voice! 'Please don't cut' works better!",
                '3-5': "Pro Tip: Firm voice, calm words! 'That's mine, please give it back' is strong without being mean!",
                '6-8': "Pro Tip: The difference between assertive and aggressive: tone, volume, and personal attacks. Keep it factual.",
                '9-12': "Pro Tip: Assertive = clear boundary statement. Aggressive = attacks, accusations, hostility. The former works, the latter backfires."
              },
              isGood: false,
              points: 2
            },
            {
              text: {
                'k2': "*Cry or get very upset*",
                '3-5': "*Get really emotional and storm off*",
                '6-8': "*Become visibly distressed and exit*",
                '9-12': "*React with visible anger or tears*"
              },
              feedback: {
                'k2': "It's okay to feel upset! But use your words first before getting too sad!",
                '3-5': "Feelings are valid! But try words first: 'That's not okay.'",
                '6-8': "Emotional reactivity undermines your message and position.",
                '9-12': "Visible emotional dysregulation damages professional credibility."
              },
              proTip: {
                'k2': "Pro Tip: Take a breath! Then use words: 'I don't like that. Please stop.'",
                '3-5': "Pro Tip: If you feel like crying, that's okay! Take 3 deep breaths, then say what you need!",
                '6-8': "Pro Tip: Feel the emotion, pause, then respond from a regulated place. Feeling → Breath → Response.",
                '9-12': "Pro Tip: Emotional regulation before response: Notice emotion → Physiological intervention (breath) → Considered response."
              },
              isGood: false,
              points: 3
            }
          ]
        },
        // SCENARIO 5: Trying New Things Socially
        {
          id: 5,
          context: {
            'k2': "You're invited to play a new game you've never played before.",
            '3-5': "Someone invites you to join their club or activity.",
            '6-8': "You're invited to a social event where you won't know many people.",
            '9-12': "You have an opportunity to join a new group or try a new activity."
          },
          prompt: {
            'k2': "What do you do?",
            '3-5': "How do you respond?",
            '6-8': "What's your decision?",
            '9-12': "How do you handle this opportunity?"
          },
          options: [
            {
              text: {
                'k2': "Okay! Can you show me how to play?",
                '3-5': "Sure! That sounds fun! What do I need to know?",
                '6-8': "I'd like to try! Can you fill me in on what to expect?",
                '9-12': "I'm interested! Can you tell me more about it first?"
              },
              feedback: {
                'k2': "Great! Trying new things helps you make friends!",
                '3-5': "Perfect! You said yes AND asked good questions!",
                '6-8': "Excellent! You're open to new experiences while gathering information.",
                '9-12': "Ideal! You've expressed interest while managing risk through inquiry."
              },
              proTip: {
                'k2': "Pro Tip: New things can be scary, but they're also fun! Just ask someone to help you!",
                '3-5': "Pro Tip: Say yes to new things! You might discover something you love!",
                '6-8': "Pro Tip: Growth happens outside comfort zones. Say yes more than you say no.",
                '9-12': "Pro Tip: Calculated risk-taking builds confidence. Gather info, then commit. Each 'yes' expands your comfort zone."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "No, I don't want to.",
                '3-5': "No thanks, I don't do new things.",
                '6-8': "I'm not really into trying new stuff.",
                '9-12': "That's not really my thing. I'll pass."
              },
              feedback: {
                'k2': "That's okay sometimes, but you might miss out on something fun!",
                '3-5': "It's okay to say no, but try not to always say no to new things!",
                '6-8': "Habitual refusal limits growth and opportunity.",
                '9-12': "Consistent risk avoidance maintains anxiety and restricts life experience."
              },
              proTip: {
                'k2': "Pro Tip: It's okay to feel nervous about new things! But try saying yes sometimes - it might be fun!",
                '3-5': "Pro Tip: Challenge yourself! Try to say 'yes' to at least one new thing each week!",
                '6-8': "Pro Tip: If you find yourself defaulting to 'no,' ask: 'What's the worst that could happen?' Often it's manageable.",
                '9-12': "Pro Tip: Anxiety says 'don't do it.' Growth says 'do it scared.' Track which advice serves you better long-term."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "I don't know how! I'll look silly!",
                '3-5': "What if I'm bad at it? Everyone will laugh!",
                '6-8': "I'll probably embarrass myself. I shouldn't go.",
                '9-12': "I don't know anyone there and I'll look awkward. Better not."
              },
              feedback: {
                'k2': "Everyone is learning! Nobody will laugh at you for trying!",
                '3-5': "Everyone starts as a beginner! People respect those who try!",
                '6-8': "Catastrophizing prevents growth. Most fears don't materialize.",
                '9-12': "Anticipatory anxiety is usually worse than actual experience. Test your predictions."
              },
              proTip: {
                'k2': "Pro Tip: It's okay to not know how! Everyone learns! Just ask for help!",
                '3-5': "Pro Tip: Being bad at something at first is how you get good at it! Everyone starts somewhere!",
                '6-8': "Pro Tip: Embarrassment predictions rarely come true. And when they do, recovery is faster than you think.",
                '9-12': "Pro Tip: Cognitive distortion check: 'What evidence supports this fear?' Often there's none. Try it anyway."
              },
              isGood: false,
              points: 2
            },
            {
              text: {
                'k2': "YES! *immediately runs over without asking questions*",
                '3-5': "SURE! *jumps in without any information*",
                '6-8': "Absolutely! *commits immediately without details*",
                '9-12': "I'm in! *full commitment without inquiry*"
              },
              feedback: {
                'k2': "Great energy! But it's okay to ask questions first!",
                '3-5': "Enthusiasm is great! But ask a few questions so you know what to expect!",
                '6-8': "Eagerness is positive, but informed decisions are better than impulsive ones.",
                '9-12': "Blind enthusiasm can lead to poor decisions. Balance openness with prudent inquiry."
              },
              proTip: {
                'k2': "Pro Tip: It's good to be excited! But first ask: 'What do we do?' so you know what's happening!",
                '3-5': "Pro Tip: Say yes to new things, but ask a question or two first! 'How does it work?' or 'What should I bring?'",
                '6-8': "Pro Tip: Openness + prudence = wise decisions. Express interest, gather info, then commit.",
                '9-12': "Pro Tip: Balance spontaneity with due diligence. Quick 'yes' to experiences, but ask clarifying questions first."
              },
              isGood: true,
              points: 8
            }
          ]
        },
        // SCENARIO 6: Recovery from Social Mistakes
        {
          id: 6,
          context: {
            'k2': "You accidentally said something that hurt a friend's feelings.",
            '3-5': "You forgot someone's name right after they told you.",
            '6-8': "You made an insensitive comment without thinking.",
            '9-12': "You said something awkward or inappropriate in a group."
          },
          prompt: {
            'k2': "What should you do?",
            '3-5': "How do you fix this?",
            '6-8': "What's your response?",
            '9-12': "How do you recover?"
          },
          options: [
            {
              text: {
                'k2': "I'm sorry! I didn't mean to hurt your feelings.",
                '3-5': "I'm sorry, can you remind me of your name?",
                '6-8': "I apologize - that was insensitive. I should have thought before speaking.",
                '9-12': "That came out wrong. I apologize - let me rephrase that more thoughtfully."
              },
              feedback: {
                'k2': "Perfect! You said sorry and were honest!",
                '3-5': "Excellent! Quick apology and asking for help!",
                '6-8': "Great! You acknowledged the mistake and took responsibility.",
                '9-12': "Ideal! Swift acknowledgment, genuine apology, and correction."
              },
              proTip: {
                'k2': "Pro Tip: When you hurt someone, say 'I'm sorry' right away!",
                '3-5': "Pro Tip: Everyone makes mistakes! Say sorry quickly, then fix it!",
                '6-8': "Pro Tip: The formula: Acknowledge + Apologize + Correct. Do it swiftly and sincerely.",
                '9-12': "Pro Tip: Rapid recovery: immediate acknowledgment → genuine apology → behavioral correction. Speed matters."
              },
              isGood: true,
              points: 10
            },
            {
              text: {
                'k2': "*Pretend it didn't happen*",
                '3-5': "*Act like nothing happened*",
                '6-8': "*Continue without acknowledgment*",
                '9-12': "*Ignore the misstep and proceed*"
              },
              feedback: {
                'k2': "They're still hurt! You need to say sorry!",
                '3-5': "Ignoring mistakes doesn't make them go away! Apologize!",
                '6-8': "Non-acknowledgment amplifies the offense and damages trust.",
                '9-12': "Avoidance signals either obliviousness or lack of care. Both damage relationships."
              },
              proTip: {
                'k2': "Pro Tip: Always say sorry when you hurt someone! It helps them feel better!",
                '3-5': "Pro Tip: Pretending doesn't work! Quick apology fixes things much better!",
                '6-8': "Pro Tip: Mistakes acknowledged are mistakes minimized. Mistakes ignored are mistakes amplified.",
                '9-12': "Pro Tip: The longer you wait to acknowledge, the bigger it becomes. Immediate acknowledgment limits damage."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "You're too sensitive! I was just kidding!",
                '3-5': "It's not that big of a deal! You're overreacting!",
                '6-8': "I was just joking! Don't be so sensitive!",
                '9-12': "People are too easily offended these days. That's on you."
              },
              feedback: {
                'k2': "That makes it worse! Just say sorry!",
                '3-5': "Blaming them makes it worse! Take responsibility!",
                '6-8': "Defensive blame-shifting compounds the original offense.",
                '9-12': "Invalidating their reaction destroys trust and prevents resolution."
              },
              proTip: {
                'k2': "Pro Tip: NEVER say 'you're too sensitive!' Just say 'I'm sorry I hurt you!'",
                '3-5': "Pro Tip: Don't blame them for being hurt! Say 'I'm sorry' and mean it!",
                '6-8': "Pro Tip: 'I didn't mean to hurt you' ≠ 'You shouldn't be hurt.' Intention doesn't negate impact.",
                '9-12': "Pro Tip: Impact > Intent. Your intentions don't invalidate their experience. Apologize for impact, regardless of intent."
              },
              isGood: false,
              points: 0
            },
            {
              text: {
                'k2': "I'm so sorry! I'm the worst! I always mess up!",
                '3-5': "I'm so stupid! I can't believe I did that! I'm terrible!",
                '6-8': "I'm such an idiot. I always say the wrong thing. I'm hopeless.",
                '9-12': "I'm the worst person. I can't do anything right. I should just stop talking."
              },
              feedback: {
                'k2': "You're not the worst! Just say 'I'm sorry' - that's enough!",
                '3-5': "Don't be so hard on yourself! Simple 'I'm sorry' is better!",
                '6-8': "Over-apologizing makes the other person manage YOUR feelings. Keep it simple.",
                '9-12': "Excessive self-flagellation burdens others with consoling you. Brief, genuine apology is sufficient."
              },
              proTip: {
                'k2': "Pro Tip: You don't need to feel really bad! Just say 'sorry' and be more careful next time!",
                '3-5': "Pro Tip: Simple apology is best! 'I'm sorry, I'll try not to do that again.' That's it!",
                '6-8': "Pro Tip: Over-apologizing shifts focus to your distress, requiring them to comfort you. Keep it simple and sincere.",
                '9-12': "Pro Tip: Proportional response: minor mistake = brief apology. Don't create emotional labor for the other person."
              },
              isGood: false,
              points: 4
            }
          ]
        }
      ]
    }
  };
  
  // Error handling for scenario loading
export const loadScenario = (scenarioId) => {
  try {
    const scenario = scenarios[scenarioId];
    if (!scenario) {
      console.error(`Scenario ${scenarioId} not found`);
      return null;
    }
    
    // Validate scenario structure
    if (!scenario.id || !scenario.title || !scenario.situations) {
      console.error(`Invalid scenario structure for ID ${scenarioId}`);
      return null;
    }
    
    return scenario;
  } catch (error) {
    console.error('Failed to load scenario:', error);
    return null;
  }
};

export const getAllScenarios = () => {
  try {
    return Object.values(scenarios).filter(scenario => 
      scenario && scenario.id && scenario.title && scenario.situations
    );
  } catch (error) {
    console.error('Failed to load scenarios:', error);
    return [];
  }
};

export const getScenarioCount = () => {
  try {
    return Object.keys(scenarios).length;
  } catch (error) {
    console.error('Failed to count scenarios:', error);
    return 0;
  }
};

export default scenarios;