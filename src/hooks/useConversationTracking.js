import { useState, useCallback } from 'react';
import contentService from '../services/contentService';

export const useConversationTracking = (gradeLevel, scenario) => {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentPhase, setCurrentPhase] = useState('demonstrate');
  const [turnCount, setTurnCount] = useState(0);
  const [studentSuccessRate, setStudentSuccessRate] = useState(0);

  /**
   * Update conversation phase based on progress
   */
  const updatePhase = useCallback(
    (turns, successRate) => {
      const newPhase =
        contentService.leadershipMethod?.getCurrentPhase?.(turns, successRate) ??
        currentPhase;

      if (newPhase !== currentPhase) {
        console.log(`Phase transition: ${currentPhase} → ${newPhase}`);
        setCurrentPhase(newPhase);
      }
    },
    [currentPhase]
  );

  /**
   * Add message to conversation history
   */
  const addMessage = useCallback(
    (role, text, needsHelp = false) => {
      const message = {
        id: Date.now(),
        role,
        text,
        timestamp: new Date(),
        needsHelp,
        phase: currentPhase
      };

      setConversationHistory((prev) => [...prev, message]);

      const nextTurnCount = role === 'user' ? turnCount + 1 : turnCount;
      if (role === 'user') {
        setTurnCount(nextTurnCount);
      }

      const updatedHistory =
        role === 'user'
          ? [...conversationHistory, message]
          : [...conversationHistory, message];

      if (typeof contentService.calculateSuccessRate === 'function') {
        const newSuccessRate = contentService.calculateSuccessRate(updatedHistory);
        setStudentSuccessRate(newSuccessRate);
        updatePhase(nextTurnCount, newSuccessRate);
      } else {
        updatePhase(nextTurnCount, studentSuccessRate);
      }

      return message;
    },
    [
      conversationHistory,
      currentPhase,
      studentSuccessRate,
      turnCount,
      updatePhase
    ]
  );

  /**
   * Get current phase instructions
   */
  const getPhaseInstructions = useCallback(() => {
    if (typeof contentService.getPhaseInstructions === 'function') {
      return contentService.getPhaseInstructions(turnCount, studentSuccessRate);
    }
    return null;
  }, [studentSuccessRate, turnCount]);

  /**
   * Check if conversation should continue
   */
  const shouldContinue = useCallback(() => {
    return currentPhase !== 'masteryCheck' && turnCount < 12;
  }, [currentPhase, turnCount]);

  /**
   * Reset conversation
   */
  const reset = useCallback(() => {
    setConversationHistory([]);
    setCurrentPhase('demonstrate');
    setTurnCount(0);
    setStudentSuccessRate(0);
  }, []);

  return {
    conversationHistory,
    currentPhase,
    turnCount,
    studentSuccessRate,
    addMessage,
    getPhaseInstructions,
    shouldContinue,
    reset
  };
};

export default useConversationTracking;

