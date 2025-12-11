/**
 * Generate Emotion-Aware MCQs for Social Cue Lessons
 *
 * Inputs:
 *  - practiceScenarios: lesson.practiceScenarios from Claude
 *  - videoEmotionData: Hume frame-by-frame emotion analysis
 *  - gradeLevel: K–12
 *  - topicId: curriculum key (e.g., "start-a-conversation")
 *
 * Output:
 *  - A modified, personalized list of practice MCQs
 */

export function generateEmotionAwareMCQs({
  practiceScenarios,
  videoEmotionData,
  gradeLevel,
  topicId
}) {

  // ---------------------------
  // 1. Analyze dominant emotion
  // ---------------------------

  let dominantEmotion = "neutral";
  let dominantIntensity = 0;

  if (videoEmotionData?.results?.length > 0) {
    const all = videoEmotionData.results.flatMap((frame) => frame.emotions || []);

    if (all.length > 0) {
      const sorted = all.sort((a, b) => b.score - a.score);
      dominantEmotion = sorted[0].name;
      dominantIntensity = sorted[0].score;
    }
  }

  // Emotional category (for difficulty scaling)
  const isOverwhelmed =
    ["fear", "sadness", "anxiety", "confusion"].includes(
      dominantEmotion.toLowerCase()
    ) && dominantIntensity > 0.35;

  const isEngaged =
    ["joy", "enthusiasm", "interest"].includes(
      dominantEmotion.toLowerCase()
    ) && dominantIntensity > 0.35;



  // ---------------------------
  // 2. Grade difficulty mapping
  // ---------------------------

  const gradeNum = gradeLevel === "K" ? 0 : parseInt(gradeLevel);
  let difficulty = "medium";

  if (gradeNum <= 2) difficulty = "easy";
  else if (gradeNum >= 9) difficulty = "advanced";

  // Overwhelm reduces difficulty
  if (isOverwhelmed) difficulty = "easier";

  // Engagement increases difficulty
  if (isEngaged) difficulty = "harder";



  // ---------------------------
  // 3. Personalize feedback rules
  // ---------------------------

  function softenFeedback(text) {
    return (
      "You're doing great — let's think about this together. " +
      text.replace(/wrong|incorrect|bad/gi, "could be improved")
    );
  }

  function strengthenFeedback(text) {
    return (
      "Nice work — let's go deeper: " +
      text.replace(/good/gi, "solid").replace(/great/gi, "excellent")
    );
  }



  // ---------------------------
  // 4. Adjust MCQs
  // ---------------------------

  const updated = practiceScenarios.map((q) => {
    const newQ = { ...q };

    // If the learner seems overwhelmed, simplify the question
    if (difficulty === "easier") {
      newQ.question = `Let's take it slow. ${q.question}`;
      newQ.options = q.options.map((opt) => ({
        ...opt,
        feedback: softenFeedback(opt.feedback),
      }));
    }

    // If the learner is engaged, deepen the reasoning
    if (difficulty === "harder") {
      newQ.question = `${q.question} Think carefully about the best choice.`;
      newQ.options = q.options.map((opt) => ({
        ...opt,
        feedback: strengthenFeedback(opt.feedback),
      }));
    }

    // Grade-based vocabulary simplification
    if (gradeNum <= 2) {
      newQ.question = newQ.question
        .replace(/conversation/gi, "talk")
        .replace(/appropriate/gi, "okay")
        .replace(/emotion/gi, "feeling");
    }

    return newQ;
  });



  // ---------------------------
  // 5. Return enhanced MCQs
  // ---------------------------

  return {
    dominantEmotion,
    dominantIntensity,
    difficultyApplied: difficulty,
    updatedScenarios: updated,
  };
}



