import OpenAI from 'openai';
import standaloneContentService from './contentService.js';
import { getIntroductionSequence } from '../content/training/introduction-scripts.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

console.log('🔑 OpenAI API Key present:', !!import.meta.env.VITE_OPENAI_API_KEY);

/**
 * Generate AI conversation response with ADAPTIVE TEACHING
 */
export async function generateConversationResponse({
  conversationHistory,
  scenario,
  gradeLevel = '6-8',
  currentPhase = 'intro',
  lessonId = null,
  isInCharacterMode = false,
  characterRole = null,
  characterExchangeCount = 0
}) {
  try {
    console.log('🤖 Generating Social Cue response...');
    console.log('📍 Phase:', currentPhase, '| Character mode:', isInCharacterMode);
    console.log('🎓 Grade:', gradeLevel, '| Scenario:', scenario?.title);

    const timing = standaloneContentService.getTimingForGrade(gradeLevel);
    const exchangeCount = Math.floor(conversationHistory.length / 2);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎤 GENERATING AI RESPONSE');
    console.log('Phase:', currentPhase);
    console.log('Turn count:', conversationHistory.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const curriculumScript = deriveCurriculumScript(
      currentPhase,
      conversationHistory,
      gradeLevel,
      scenario
    );

    if (curriculumScript) {
      console.log('✅ CURRICULUM SCRIPT FOUND:');
      console.log(curriculumScript);
      console.log('📝 This will be FORCED into user message');
    } else {
      console.log('ℹ️  No curriculum script for this turn - AI will respond naturally');
    }

    let aiResponse = '';
    let apiSucceeded = false;

    try {
      console.log('🌐 Calling API...');
      const response = await fetch(`${API_BASE_URL}/api/voice/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory,
          scenario,
          gradeLevel,
          phase: currentPhase,
          curriculumScript,
          lessonId,
          isInCharacterMode,
          characterRole,
          characterExchangeCount
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      console.log('🤖 AI RESPONDED:');
      console.log(data.aiResponse);

      if (curriculumScript) {
        const matches = data.aiResponse?.includes(curriculumScript.substring(0, 30));
        console.log(matches ? '✅ AI USED CURRICULUM!' : '❌ AI IGNORED CURRICULUM!');
        if (!matches) {
          console.log('⚠️  EXPECTED:', curriculumScript);
          console.log('⚠️  GOT:', data.aiResponse);
        }
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      aiResponse = data.aiResponse?.trim() || '';
      apiSucceeded = true;
    } catch (apiError) {
      console.error('❌ API call failed, falling back to direct OpenAI call:', apiError);
    }

    if (!apiSucceeded) {
      const fallbackMessages = (conversationHistory || [])
        .map((msg) => {
          const content = String(msg?.content || msg?.text || '').trim();
          if (!content) return null;
          return {
            role: msg?.role === 'user' ? 'user' : 'assistant',
            content
          };
        })
        .filter(Boolean);

      if (curriculumScript) {
        fallbackMessages.push({
          role: 'user',
          content: `RESPOND WITH EXACTLY: "${curriculumScript}"`
        });
        console.log('💪 FORCING curriculum in fallback OpenAI call:', curriculumScript);
      } else {
        console.log('ℹ️  No curriculum script for fallback call');
      }

      const fallbackSystemPrompt = `${standaloneContentService.generateSystemPrompt(
        gradeLevel,
        scenario,
        0,
        isInCharacterMode,
        characterRole,
        characterExchangeCount,
        lessonId,
        currentPhase
      )}

CRITICAL OVERRIDE INSTRUCTION:
When you receive a message that says "RESPOND WITH EXACTLY: [text]", you MUST repeat that exact text word-for-word as your complete response. Do not add anything before or after it. Do not paraphrase. Just say those exact words.`;

      console.log('📤 Sending fallback request to OpenAI with', fallbackMessages.length + 1, 'messages');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'system', content: fallbackSystemPrompt }, ...fallbackMessages],
        temperature: 0.3,
        max_tokens: 200
      });

      aiResponse = completion.choices[0]?.message?.content?.trim() || '';
      console.log('🤖 OpenAI fallback responded:', aiResponse);
      if (curriculumScript) {
        const matches = aiResponse.includes(curriculumScript.substring(0, 30));
        console.log(matches ? '✅ Fallback used curriculum!' : '❌ Fallback ignored curriculum!');
      }
    }

    const validation = standaloneContentService.validateResponse(aiResponse, timing);

    if (!validation.valid) {
      console.warn('⚠️ Response warnings:', validation.warnings);
    }

    const nextPhase = standaloneContentService.determineNextPhase(currentPhase, exchangeCount);
    
    if (nextPhase !== currentPhase) {
      console.log(`🔄 Phase transition: ${currentPhase} → ${nextPhase}`);
    }

    return {
      response: aiResponse,
      aiResponse: aiResponse,
      text: aiResponse,
      shouldContinue: nextPhase !== 'complete',
      phase: currentPhase,
      nextPhase: nextPhase,
      exchangeCount: exchangeCount,
      validation: validation,
      hasEvaluation: false,
      feedback: nextPhase === 'complete' ? generateSessionFeedback(conversationHistory) : null
    };

  } catch (error) {
    console.error('❌ OpenAI API error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error?.status,
      type: error?.type
    });

    return {
      response: "I'm having a little trouble right now. Can you try saying that again?",
      aiResponse: "I'm having a little trouble right now. Can you try saying that again?",
      text: "I'm having a little trouble right now. Can you try saying that again?",
      shouldContinue: true,
      phase: currentPhase,
      nextPhase: currentPhase,
      hasEvaluation: false,
      error: error.message
    };
  }
}

/**
 * Generate session feedback
 */
function generateSessionFeedback(conversationHistory) {
  const totalExchanges = Math.floor(conversationHistory.length / 2);
  const studentMessages = conversationHistory.filter(m => m.role === 'user');
  
  const avgWordCount = studentMessages.reduce((sum, m) => {
    const words = (m.content || m.text || '').split(/\s+/).length;
    return sum + words;
  }, 0) / studentMessages.length;
  
  const askedQuestions = studentMessages.filter(m => 
    (m.content || m.text || '').includes('?')
  ).length;
  
  const achievements = [];
  
  if (totalExchanges >= 5) achievements.push('Completed full practice');
  if (avgWordCount >= 10) achievements.push('Gave detailed responses');
  if (askedQuestions > 0) achievements.push('Asked questions');
  
  return {
    totalExchanges,
    completed: true,
    achievements,
    message: achievements.length > 0 
      ? `Great work! You ${achievements.join(', ')}.`
      : "Great practice session!"
  };
}

function mapScenarioToKey(scenario) {
  if (!scenario) return 'starting-conversation';
  const title = (scenario.title || scenario.name || '').toLowerCase();

  if (title.includes('start') || title.includes('conversation')) return 'starting-conversation';
  if (title.includes('friend')) return 'making-friends';
  if (title.includes('attention') || title.includes('listen')) return 'paying-attention';
  if (title.includes('help')) return 'asking-help';
  if (title.includes('join') || title.includes('group')) return 'joining-group';

  return 'starting-conversation';
}

function deriveCurriculumScript(currentPhase, conversationHistory, gradeLevel, scenario) {
  try {
    const turnCount = conversationHistory.length;

    if (currentPhase !== 'intro') {
      console.log('ℹ️  No curriculum script for phase:', currentPhase, 'turn:', turnCount);
      return null;
    }

    const introData = getIntroductionSequence(gradeLevel);
    const scenarioKey = mapScenarioToKey(scenario);

    if (!introData.scenarios?.[scenarioKey]) {
      console.log('⚠️  Scenario not found in curriculum:', scenarioKey);
      return null;
    }

    const script = introData.scenarios[scenarioKey];

    if (turnCount === 0) {
      const completeIntro = `${introData.fullIntro || ''} ${script.intro || ''}`.replace(/\s+/g, ' ').trim();
      console.log('✅ Using COMPLETE curriculum intro');
      console.log('Complete intro:', completeIntro);
      return completeIntro;
    }

    if (turnCount === 2) {
      console.log('✅ Using curriculum AFTER-RESPONSE for turn 2');
      return script.afterResponse;
    }

    console.log('ℹ️  No curriculum script for phase:', currentPhase, 'turn:', turnCount);
    return null;
  } catch (error) {
    console.warn('⚠️ Unable to load curriculum script:', error.message);
    return null;
  }
}

export default {
  generateConversationResponse
};