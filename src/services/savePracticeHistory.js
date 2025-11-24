import { db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Save practice session history to Firestore
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID (typically sessionCompletedAt timestamp)
 * @param {Object} historyObj - Session data object
 * @returns {Promise<boolean>} - Success status
 */
export async function savePracticeHistory(userId, sessionId, historyObj) {
  try {
    const ref = doc(db, `users/${userId}/practiceHistory`, sessionId);

    await setDoc(ref, {
      ...historyObj,
      sessionId,
      userId,
      savedAt: serverTimestamp(),
    }, { merge: true });

    console.log('✅ Practice history saved to Firestore:', sessionId);
    return true;
  } catch (error) {
    console.error('❌ Error saving practice history:', error);
    throw error;
  }
}


