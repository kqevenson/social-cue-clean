// Practice Session scenarios
const scenarios = {
    1: {
      id: 1,
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
          image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80',
          imageAlt: 'Students at lunch',
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
          image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80',
          imageAlt: 'Children playing together',
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
          image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80',
          imageAlt: 'Friends saying goodbye',
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
          image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80',
          imageAlt: 'People in conversation',
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
          image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80',
          imageAlt: 'Group conversation',
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
          image: 'https://images.unsplash.com/photo-1517898717222-37dd902c63e1?w=800&q=80',
          imageAlt: 'Person being interrupted',
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
          image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
          imageAlt: 'Person giving compliment',
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
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
          imageAlt: 'Person receiving compliment',
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
          image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&q=80',
          imageAlt: 'People ending conversation',
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
          image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80',
          imageAlt: 'Active listening',
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
          image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80',
          imageAlt: 'Asking questions',
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
          image: 'https://images.unsplash.com/photo-1517898717222-37dd902c63e1?w=800&q=80',
          imageAlt: 'Understanding others',
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
          image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
          imageAlt: 'Not interrupting',
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
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
          imageAlt: 'Managing distractions',
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
          image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&q=80',
          imageAlt: 'Empathetic listening',
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
    }
  };
  
  export default scenarios;