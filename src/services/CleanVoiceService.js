import OpenAI from 'openai';
import { getIntroductionSequence } from '../content/training/introduction-scripts.js';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

class CleanVoiceService {
  async generateResponse({ conversationHistory = [], scenario = {}, gradeLevel = '6', phase = 'intro' }) {
    const studentMessages = conversationHistory.filter((msg) => msg.role === 'user');
    const turnCount = studentMessages.length;

    console.log('🎯 Turn count:', turnCount, '(student messages:', studentMessages.length, ')');

    const curriculum = this.getCurriculumForTurn(turnCount, gradeLevel, scenario);

    const messages = this.buildMessages(conversationHistory, curriculum);

    const systemPrompt = this.buildTeachingPrompt({
      gradeLevel,
      scenario,
      phase,
      turnCount,
      lastStudentMessage: studentMessages[studentMessages.length - 1]?.text || '',
      curriculum
    });

    console.log('📝 System prompt length:', systemPrompt.length);

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.4,
        max_tokens: 200
      });

      const aiResponse = response.choices[0]?.message?.content?.trim() || '';
      console.log('🤖 AI teaching response:', aiResponse);

      return {
        aiResponse,
        shouldContinue: turnCount < 5,
        phase: turnCount < 4 ? 'practice' : 'feedback'
      };
    } catch (error) {
      console.error('❌ CleanVoiceService error:', error);
      throw error;
    }
  }

  getCurriculumForTurn(turnCount, gradeLevel, scenario) {
    const introData = getIntroductionSequence(gradeLevel);
    const scenarioKey = this.getScenarioKey(scenario);
    const script = introData.scenarios?.[scenarioKey];

    if (!script) return null;

    if (turnCount === 0) {
      const shortIntro = `${introData.greeting || ''} ${script.intro || ''}`.replace(/\s+/g, ' ').trim();
      const wordCount = shortIntro.split(' ').length;
      console.log('✅ Turn 0: Using SHORT intro');
      console.log('📏 Intro length:', wordCount, 'words');
      return { type: 'intro', text: shortIntro };
    }

    if (turnCount === 1) {
      console.log('✅ Turn 1: Using afterResponse as teaching guide');
      return { type: 'afterResponse', text: script.afterResponse }; // base coaching line
    }

    console.log('ℹ️ Turn', turnCount, ': natural coaching');
    return null;
  }

  buildMessages(conversationHistory, curriculum) {
    const messages = (conversationHistory || [])
      .filter((msg) => typeof msg?.text === 'string' && msg.text.trim() !== '')
      .map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text.trim()
      }));

    console.log('📝 Built', messages.length, 'valid messages from', conversationHistory.length, 'total');

    if (curriculum?.type === 'intro') {
      messages.push({
        role: 'user',
        content: `RESPOND WITH EXACTLY: "${curriculum.text}"`
      });
      console.log('💪 Forcing intro curriculum');
    }

    return messages;
  }

  buildTeachingPrompt({ gradeLevel, scenario, turnCount, lastStudentMessage, curriculum }) {
    const grade = parseInt(gradeLevel, 10) || 6;
    const wordLimit = this.getWordLimit(grade);
    const studentSaid = (lastStudentMessage && lastStudentMessage.trim()) || '[no response]';

    if (turnCount === 0) {
      return 'You are Cue. When you see "RESPOND WITH EXACTLY:", say those exact words and nothing else.';
    }

    const ageGuidance = this.getAgeAppropriateCoaching(grade);
    const baseResponse = curriculum?.type === 'afterResponse' ? curriculum.text : '';

    return `You are Cue, a warm and insightful social skills coach for grade ${gradeLevel} students.

SCENARIO: ${scenario?.title || 'Starting a conversation'}
STUDENT JUST SAID: "${studentSaid}"
TURN: ${turnCount}

YOUR JOB:
${turnCount === 1 && baseResponse ? `1. Start with something NATURAL based on: "${baseResponse}"
` : ''}${turnCount === 1 && baseResponse ? '2. Then coach them:' : '1. Coach them:'}
   - Was their tone friendly, awkward, or rude?
   - Did they make a good conversation starter?
   - What SPECIFIC words worked well?
   - What could be better?

Give feedback like a real coach:
   - Point to exact words they used ("When you said ...")
   - Explain WHY it works or not
   - Model a better version if needed
   - Encourage their effort

${ageGuidance}

EXAMPLES:
If student says: "Hi, mind if I sit here?"
You say: "That's a solid opener! You asked permission with 'mind if I sit?' which is polite and friendly. Nice job! How would you keep it going after they say yes?"

If student says: "Why are you alone?"
You say: "Let's rethink that. 'Why are you alone?' might feel uncomfortable. Try 'Hey, mind if I join you?'—it's friendlier and doesn't put them on the spot. Want to try it?"

Keep response under ${wordLimit} words. Sound natural, supportive, and encouraging.`;
  }

  getAgeAppropriateCoaching(grade) {
    if (grade <= 2) return '- Use simple words\n- Be very encouraging\n- Keep it playful';
    if (grade <= 5) return '- Use clear language\n- Friendly tone\n- Specific praise';
    if (grade <= 8) return '- Conversational tone\n- Acknowledge complexity\n- Be supportive';
    return '- Mature dialogue\n- Nuanced feedback\n- Respect their perspective';
  }

  getWordLimit(grade) {
    if (grade <= 2) return 40;
    if (grade <= 5) return 50;
    if (grade <= 8) return 60;
    return 70;
  }

  getScenarioKey(scenario) {
    if (!scenario) return 'starting-conversation';
    const title = (scenario.title || '').toLowerCase();

    if (title.includes('start') || title.includes('conversation')) return 'starting-conversation';
    if (title.includes('friend')) return 'making-friends';
    if (title.includes('attention') || title.includes('listen')) return 'paying-attention';
    if (title.includes('help')) return 'asking-help';
    if (title.includes('join') || title.includes('group')) return 'joining-group';

    return 'starting-conversation';
  }
}

export default new CleanVoiceService();
