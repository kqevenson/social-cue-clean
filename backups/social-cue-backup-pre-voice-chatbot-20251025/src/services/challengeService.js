// Real World Challenge Service
// Handles API calls for generating and managing real-world challenges

const API_BASE_URL = 'http://localhost:3001/api';

export const challengeService = {
  // Generate a new real-world challenge
  async generateChallenge(userId, topicId, topicName, learnerProfile) {
    try {
      console.log('🎯 Generating real-world challenge:', {
        userId,
        topicId,
        topicName,
        learnerProfile
      });

      // Check network connectivity
      if (!navigator.onLine) {
        throw new Error('No internet connection available');
      }

      // Set timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${API_BASE_URL}/adaptive/generate-challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          learnerId: userId,
          topicName: topicName,
          gradeLevel: learnerProfile.grade || 'K-2',
          currentLevel: learnerProfile.currentLevel || 1,
          strengths: learnerProfile.strengths || [],
          needsWork: learnerProfile.needsWork || [],
          recentPerformance: learnerProfile.recentPerformance || 'No recent data'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else if (response.status === 401) {
          throw new Error('Authentication error. Please refresh the page.');
        } else {
          throw new Error(`Request failed with status ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate challenge');
      }

      console.log('✅ Real-world challenge generated successfully:', data.challenge.title);
      return data.challenge;
    } catch (error) {
      console.error('❌ Error generating challenge:', error);
      
      // Classify error for better handling
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your connection.');
      } else if (error.message.includes('No internet')) {
        throw new Error('No internet connection available.');
      }
      
      throw error;
    }
  },

  // Create a fallback challenge when API is unavailable
  createFallbackChallenge(topicName, gradeLevel) {
    console.log('🔄 Creating fallback challenge for:', topicName);
    
    const fallbackChallenges = {
      'Making Friends': {
        title: 'Start a conversation with someone new',
        description: 'Practice your conversation skills by introducing yourself to someone you haven\'t talked to before.',
        specificGoal: 'Have a 2-3 minute conversation with someone new',
        whereToTry: [
          'At lunch or break time',
          'During group activities',
          'At after-school clubs',
          'In the hallway between classes'
        ],
        successIndicators: [
          'You introduced yourself',
          'You asked them a question',
          'You listened to their answer',
          'The conversation lasted at least 2 minutes'
        ],
        tips: [
          'Start with a simple greeting like "Hi, I\'m [your name]"',
          'Ask about their interests or what they like to do',
          'Listen carefully to their responses',
          'Share something about yourself too'
        ],
        timeframe: 'This week',
        estimatedDifficulty: 'Easy'
      },
      'Active Listening': {
        title: 'Practice active listening with a friend',
        description: 'Show someone you care by really listening to what they have to say.',
        specificGoal: 'Have a conversation where you focus entirely on listening',
        whereToTry: [
          'During lunch',
          'On the playground',
          'At home with family',
          'During study groups'
        ],
        successIndicators: [
          'You made eye contact while they talked',
          'You asked follow-up questions',
          'You didn\'t interrupt them',
          'You remembered details they shared'
        ],
        tips: [
          'Put away distractions like phones or games',
          'Look at the person while they talk',
          'Nod and show you\'re listening',
          'Ask questions about what they said'
        ],
        timeframe: 'Today',
        estimatedDifficulty: 'Easy'
      },
      'Body Language': {
        title: 'Practice positive body language',
        description: 'Use your body to show confidence and friendliness.',
        specificGoal: 'Use positive body language in 3 different conversations',
        whereToTry: [
          'When meeting new people',
          'During class presentations',
          'At lunch with friends',
          'When asking for help'
        ],
        successIndicators: [
          'You stood or sat up straight',
          'You made appropriate eye contact',
          'You smiled when appropriate',
          'You used open gestures'
        ],
        tips: [
          'Stand up straight with shoulders back',
          'Make eye contact but don\'t stare',
          'Smile when greeting people',
          'Keep your arms uncrossed'
        ],
        timeframe: 'This week',
        estimatedDifficulty: 'Moderate'
      }
    };

    const challenge = fallbackChallenges[topicName] || fallbackChallenges['Making Friends'];
    
    return {
      ...challenge,
      isFallback: true,
      topicName: topicName,
      gradeLevel: gradeLevel
    };
  },

  // Save challenge to localStorage (temporary storage)
  saveActiveChallenge(challenge, userId) {
    try {
      const activeChallenges = this.getActiveChallenges(userId);
      const newChallenge = {
        ...challenge,
        id: Date.now() + Math.random(),
        userId: userId,
        acceptedAt: new Date().toISOString(),
        status: 'active',
        daysRemaining: this.calculateDaysRemaining(challenge.timeframe)
      };
      
      activeChallenges.push(newChallenge);
      localStorage.setItem(`active_challenges_${userId}`, JSON.stringify(activeChallenges));
      
      console.log('✅ Challenge saved as active:', newChallenge.title);
      return newChallenge;
    } catch (error) {
      console.error('❌ Error saving challenge:', error);
      throw error;
    }
  },

  // Get active challenges from localStorage
  getActiveChallenges(userId) {
    try {
      const challenges = localStorage.getItem(`active_challenges_${userId}`);
      return challenges ? JSON.parse(challenges) : [];
    } catch (error) {
      console.error('❌ Error getting active challenges:', error);
      return [];
    }
  },

  // Mark challenge as complete
  completeChallenge(challengeId, userId) {
    try {
      const activeChallenges = this.getActiveChallenges(userId);
      const updatedChallenges = activeChallenges.filter(c => c.id !== challengeId);
      
      localStorage.setItem(`active_challenges_${userId}`, JSON.stringify(updatedChallenges));
      
      console.log('✅ Challenge marked as complete:', challengeId);
      return true;
    } catch (error) {
      console.error('❌ Error completing challenge:', error);
      throw error;
    }
  },

  // Calculate days remaining based on timeframe
  calculateDaysRemaining(timeframe) {
    switch (timeframe?.toLowerCase()) {
      case 'today':
        return 1;
      case 'this week':
        return 7;
      case 'this month':
        return 30;
      default:
        return 7; // Default to 1 week
    }
  },

  // Update days remaining for all active challenges
  updateDaysRemaining(userId) {
    try {
      const activeChallenges = this.getActiveChallenges(userId);
      const updatedChallenges = activeChallenges.map(challenge => {
        const acceptedDate = new Date(challenge.acceptedAt);
        const daysSinceAccepted = Math.floor((Date.now() - acceptedDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, challenge.daysRemaining - daysSinceAccepted);
        
        return {
          ...challenge,
          daysRemaining: daysRemaining,
          acceptedAt: challenge.acceptedAt // Keep original date
        };
      }).filter(challenge => challenge.daysRemaining > 0); // Remove expired challenges
      
      localStorage.setItem(`active_challenges_${userId}`, JSON.stringify(updatedChallenges));
      return updatedChallenges;
    } catch (error) {
      console.error('❌ Error updating days remaining:', error);
      return [];
    }
  },

  // Fetch active challenges from backend API
  async fetchActiveChallenges(userId) {
    try {
      console.log('🎯 Fetching active challenges for user:', userId);

      const response = await fetch(`${API_BASE_URL}/adaptive/active-challenges/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📭 No active challenges found');
          return [];
        }
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch active challenges');
      }

      console.log('✅ Active challenges fetched successfully:', data.challenges.length);
      return data.challenges || [];
    } catch (error) {
      console.error('❌ Error fetching active challenges:', error);
      
      // Fallback to localStorage if API fails
      console.log('🔄 Falling back to localStorage challenges');
      return this.getActiveChallenges(userId);
    }
  },

  // Complete challenge via backend API
  async completeChallengeAPI(challengeId, userId, notes = '') {
    try {
      console.log('🎉 Completing challenge via API:', challengeId);

      const response = await fetch(`${API_BASE_URL}/adaptive/complete-challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: challengeId,
          learnerId: userId,
          notes: notes,
          pointsAwarded: 50
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to complete challenge');
      }

      console.log('✅ Challenge completed successfully via API');
      return data;
    } catch (error) {
      console.error('❌ Error completing challenge via API:', error);
      
      // Fallback to localStorage completion
      console.log('🔄 Falling back to localStorage completion');
      return this.completeChallenge(challengeId, userId);
    }
  }
};

export default challengeService;
