import { db } from '../firebaseConfig';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';

/**
 * Load practice session history from Firestore
 * @param {string} userId - User ID
 * @param {number} maxResults - Maximum number of sessions to return (default: 20)
 * @returns {Promise<Array>} - Array of session objects
 */
export async function loadPracticeHistory(userId, maxResults = 20) {
  try {
    const ref = collection(db, `users/${userId}/practiceHistory`);
    const q = query(
      ref,
      orderBy('sessionCompletedAt', 'desc'),
      limit(maxResults)
    );

    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ Loaded ${sessions.length} practice sessions from Firestore`);
    return sessions;
  } catch (error) {
    console.error('❌ Error loading practice history:', error);
    // If orderBy fails (no index), try without it
    try {
      const ref = collection(db, `users/${userId}/practiceHistory`);
      const snapshot = await getDocs(ref);
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sort in JavaScript
      sessions.sort((a, b) => {
        const dateA = new Date(a.sessionCompletedAt || a.savedAt || 0);
        const dateB = new Date(b.sessionCompletedAt || b.savedAt || 0);
        return dateB - dateA;
      });
      
      return sessions.slice(0, maxResults);
    } catch (fallbackError) {
      console.error('❌ Fallback query also failed:', fallbackError);
      return [];
    }
  }
}




