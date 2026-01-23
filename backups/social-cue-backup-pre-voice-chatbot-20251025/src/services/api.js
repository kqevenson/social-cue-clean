const API_BASE_URL = 'http://localhost:3001/api';

export const apiService = {
  // Test server connection
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return null;
    }
  },

  // Generate AI-powered scenarios (returns array of 5 scenarios)
  async generateScenarios(category, gradeLevel, topic) {
    try {
      console.log(`🚀 API: Generating scenarios for ${category}, Grade: ${gradeLevel}`);
      
      const response = await fetch(`${API_BASE_URL}/generate-scenario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          gradeLevel,
          topic
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate scenarios');
      }
      
      console.log(`✅ API: Received ${data.scenarios?.length || 0} scenarios`);
      if (data.scenarios?.length > 0) {
        console.log(`📋 API: First scenario context: "${data.scenarios[0].context?.substring(0, 50)}..."`);
      }
      
      return data.scenarios;
    } catch (error) {
      console.error('❌ API: Error generating scenarios:', error);
      throw error;
    }
  },

  // Generate personalized feedback for student responses
  async generatePersonalizedFeedback({
    scenarioContext,
    question,
    studentChoice,
    correctAnswer,
    choiceQuality,
    gradeLevel,
    studentStrengths,
    studentWeaknesses,
    previousPerformance
  }) {
    try {
      console.log(`🎯 API: Generating personalized feedback for grade ${gradeLevel}`);
      
      const response = await fetch(`${API_BASE_URL}/generate-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioContext,
          question,
          studentChoice,
          correctAnswer,
          choiceQuality,
          gradeLevel,
          studentStrengths,
          studentWeaknesses,
          previousPerformance
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate personalized feedback');
      }
      
      console.log(`✅ API: Personalized feedback generated successfully`);
      return data.feedback;
    } catch (error) {
      console.error('❌ API: Error generating personalized feedback:', error);
      throw error;
    }
  }
};
