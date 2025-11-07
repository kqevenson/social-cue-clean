import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for development
});

// Debug: Check if API key is present
console.log('🔑 OpenAI API Key present:', !!import.meta.env.VITE_OPENAI_API_KEY);
if (import.meta.env.VITE_OPENAI_API_KEY) {
  console.log('🔑 OpenAI Key starts with:', import.meta.env.VITE_OPENAI_API_KEY.substring(0, 15));
}

/**
 * Generate AI conversation response
 */
export const generateConversationResponse = async ({
  conversationHistory,
  scenario,
  gradeLevel,
  currentPhase
}) => {
  try {
    console.log('🤖 Generating conversation response...');
    console.log('📊 Conversation history length:', conversationHistory.length);
    console.log('📍 Current phase:', currentPhase);
    console.log('🎓 Grade level:', gradeLevel);

    const systemPrompt = buildSystemPrompt(scenario, gradeLevel, currentPhase);
    
    // Format messages for OpenAI - CRITICAL: Handle both 'content' and 'text' field names
    const formattedMessages = conversationHistory
      .filter(msg => {
        // Filter out messages with no content
        const hasContent = !!(msg.content || msg.text);
        if (!hasContent) {
          console.warn('⚠️ Filtered out message with no content:', msg);
        }
        return hasContent;
      })
      .map(msg => ({
        role: msg.role === 'ai' || msg.role === 'assistant' ? 'assistant' : 'user',
        content: String(msg.content || msg.text || '').trim() // Ensure string and handle both fields
      }));

    console.log('📤 Sending to OpenAI:', formattedMessages.length, 'messages');
    
    // Debug: Log the actual messages being sent
    formattedMessages.forEach((msg, i) => {
      console.log(`  Message ${i + 1} [${msg.role}]:`, msg.content.substring(0, 50) + '...');
    });

    const messages = [
      { role: 'system', content: systemPrompt },
      ...formattedMessages
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      max_tokens: 150,
      temperature: 0.7,
      top_p: 0.9
    });

    const aiResponse = completion.choices[0].message.content;
    console.log('✅ OpenAI response received:', aiResponse.substring(0, 100) + '...');

    return {
      aiResponse: aiResponse,
      shouldContinue: currentPhase !== 'complete',
      phase: determineNextPhase(currentPhase, conversationHistory.length),
      feedback: currentPhase === 'feedback' ? generateFeedback(conversationHistory) : null
    };
    
  } catch (error) {
    console.error('❌ OpenAI API error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      type: error.type
    });
    throw error;
  }
};

/**
 * Build system prompt based on phase and grade level
 */
function buildSystemPrompt(scenario, gradeLevel, phase) {
  const gradeDescriptions = {
    'k-2': 'kindergarten to 2nd grade (ages 5-7)',
    '3-5': '3rd to 5th grade (ages 8-10)',
    '6-8': '6th to 8th grade (ages 11-13)',
    '9-12': '9th to 12th grade (ages 14-18)'
  };

  const basePrompt = `You are a supportive social skills coach helping a student practice: "${scenario.title}".

Student grade level: ${gradeDescriptions[gradeLevel] || gradeDescriptions['6-8']}
Current phase: ${phase}

Scenario description: ${scenario.description || scenario.title}

Guidelines:
- Speak naturally as if having a real conversation, not writing
- Use age-appropriate language for ${gradeDescriptions[gradeLevel] || gradeDescriptions['6-8']}
- Keep responses concise (2-3 sentences maximum)
- Be warm, encouraging, and supportive
- Ask open-ended questions to practice conversation skills
- Never use markdown, asterisks, or formatting in your responses`;

  const phaseInstructions = {
    intro: `
INTRO PHASE:
- Welcome the student warmly
- Briefly explain what you'll practice together
- Set up the scenario and your role
- Ask if they're ready to begin
Example: "Hi! Today we're going to practice ${scenario.title}. I'll help guide you through it. Ready to give it a try?"`,
    
    practice: `
PRACTICE PHASE:
- Stay in character for the scenario
- Respond naturally to what the student says
- Gently guide if they seem stuck
- Provide subtle corrections inline
- Progress the conversation naturally
- After 4-5 exchanges, transition to feedback
Example responses:
- "That's a good start! Tell me more about that."
- "Nice! I like how you said that. What happened next?"`,
    
    feedback: `
FEEDBACK PHASE:
- Highlight 2-3 specific things they did well
- Offer 1 constructive suggestion for improvement
- Explain WHY certain approaches work better
- Be specific with examples from their responses
- Keep it positive and encouraging
- End with encouragement to practice in real life
Example: "You did great! I really liked how you started the conversation. One thing that could make it even better is asking a follow-up question. Want to try this scenario again?"`,
    
    complete: `
COMPLETE PHASE:
- Celebrate their effort and progress
- Summarize one key learning
- Encourage them to practice in real situations
- End on an uplifting note
Example: "Awesome job practicing ${scenario.title}! Remember to smile and make eye contact. You're ready to try this for real!"`
  };

  return basePrompt + '\n\n' + (phaseInstructions[phase] || phaseInstructions['intro']);
}

/**
 * Determine next conversation phase
 */
function determineNextPhase(currentPhase, messageCount) {
  if (currentPhase === 'intro' && messageCount >= 2) return 'practice';
  if (currentPhase === 'practice' && messageCount >= 8) return 'feedback';
  if (currentPhase === 'feedback' && messageCount >= 10) return 'complete';
  return currentPhase;
}

/**
 * Generate feedback based on conversation
 */
function generateFeedback(conversationHistory) {
  return "Great job engaging in this conversation!";
}

export default {
  generateConversationResponse
};