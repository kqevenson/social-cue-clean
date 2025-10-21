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
    }
  };
  
  export default scenarios;