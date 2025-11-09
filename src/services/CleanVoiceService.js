import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

class CleanVoiceService {
  async generateResponse({ conversationHistory = [], scenario = {}, gradeLevel = '6-8', persona = '' }) {
    const turnCount = conversationHistory.filter(m => m.role === 'user').length;

    const messages = conversationHistory
      .filter(msg => (msg?.text || msg?.content || '').trim())
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: (msg?.text || msg?.content || '').trim()
      }));

    let systemPrompt = '';

    if (turnCount === 0) {
      systemPrompt = `You're Cue, a warm social coach. Greet a grade ${gradeLevel} student. Keep it under 15 words.`;
    } else if (turnCount === 1) {
      systemPrompt = `You're Cue helping with ${scenario?.title || 'a conversation skill'}.

The student responded. Now:
- Acknowledge them warmly
- Share 2-3 practical tips
- Give 1 example of what to say
- Offer a practice scenario
- Ask what they’d say

Speak like a real coach. Use age-appropriate language for grade ${gradeLevel}. ${
        persona ? `Keep in mind the student is acting ${persona}.` : ''
      }

No symbols or formatting. Max 50 words.`;
    } else if (turnCount <= 5) {
      systemPrompt = `You're a friendly peer practicing with a grade ${gradeLevel} student.

They just said something—respond naturally and supportively in under 30 words. ${
        persona ? `You are a ${persona} student.` : ''
      }`;
    } else {
      systemPrompt = `You're Cue wrapping up. Give warm, specific feedback to a grade ${gradeLevel} student. Max 30 words.`;
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.8,
        max_tokens: 120
      });

      const aiResponse = response.choices[0]?.message?.content?.trim() || '';

      return {
        aiResponse,
        shouldContinue: turnCount < 7,
        phase: turnCount < 2 ? 'coach' : turnCount < 6 ? 'peer' : 'feedback'
      };
    } catch (error) {
      console.error('❌ Error:', error);
      throw error;
    }
  }

  async generateVoicePrompt({ transcript, phase = 'coach', gradeLevel = '6-8', persona = '' }) {
    const prompt = `Rewrite the following message for voice. Keep it friendly, concise, and natural for a grade ${gradeLevel} student. ${
      persona ? `Match a ${persona} tone.` : ''
    } Speak like a real person, not a script. Max 30 words.

Message: """${transcript}"""`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'system', content: prompt }],
        temperature: 0.7,
        max_tokens: 60
      });

      return response.choices[0]?.message?.content?.trim();
    } catch (error) {
      console.error('❌ Error generating voice prompt:', error);
      return transcript?.slice(0, 200); // fallback
    }
  }
}

export default new CleanVoiceService();
