// Custom React Hook for User Authentication
// This hook manages user authentication state and provides auth functions

import { useState, useEffect, useContext, createContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { createUser, getUser, updateUser } from '../firebaseHelpers';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user ? 'User logged in' : 'User logged out');
      
      if (user) {
        try {
          // Get user data from Firestore
          const userData = await getUser(user.uid);
          if (userData) {
            setCurrentUser({
              userId: user.uid,
              email: user.email,
              ...userData
            });
            console.log('✅ User data loaded:', userData);
          } else {
            // User exists in Firebase Auth but not in Firestore
            console.log('⚠️ User not found in Firestore, creating profile...');
            setCurrentUser({
              userId: user.uid,
              email: user.email,
              name: user.displayName || 'User',
              role: 'learner',
              gradeLevel: '6-8'
            });
          }
        } catch (error) {
          console.error('❌ Error loading user data:', error);
          setError('Failed to load user data');
        }
      } else {
        setCurrentUser(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up function
  const signUp = async (email, password, name, gradeLevel, role = 'learner') => {
    try {
      console.log('📝 Creating new user account...');
      setError(null);
      
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Firebase Auth user created:', user.uid);
      
      // Create user profile in Firestore
      const userData = {
        name,
        email,
        role,
        gradeLevel,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      
      await createUser(userData);
      console.log('✅ User profile created in Firestore');
      
      return { success: true, userId: user.uid };
      
    } catch (error) {
      console.error('❌ Sign up error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      console.log('🔑 Signing in user...');
      setError(null);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ User signed in:', userCredential.user.uid);
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Sign in error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Sign out function
  const signOutUser = async () => {
    try {
      console.log('🚪 Signing out user...');
      setError(null);
      
      await signOut(auth);
      console.log('✅ User signed out');
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Sign out error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Continue as guest function
  const continueAsGuest = (name, gradeLevel) => {
    try {
      console.log('👤 Creating guest user...');
      setError(null);
      
      // Generate a temporary guest ID
      const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      
      // Store guest data in localStorage
      const guestData = {
        userId: guestId,
        name,
        gradeLevel,
        role: 'learner',
        isGuest: true,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      
      localStorage.setItem('socialCueGuestData', JSON.stringify(guestData));
      
      setCurrentUser(guestData);
      console.log('✅ Guest user created:', guestId);
      
      return { success: true, userId: guestId };
      
    } catch (error) {
      console.error('❌ Guest creation error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      
      console.log('📝 Updating user profile...');
      
      if (currentUser.isGuest) {
        // Update guest data in localStorage
        const updatedGuestData = { ...currentUser, ...updates };
        localStorage.setItem('socialCueGuestData', JSON.stringify(updatedGuestData));
        setCurrentUser(updatedGuestData);
      } else {
        // Update user data in Firestore
        await updateUser(currentUser.userId, updates);
        setCurrentUser(prev => ({ ...prev, ...updates }));
      }
      
      console.log('✅ User profile updated');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Profile update error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    currentUser,
    isLoading,
    error,
    signUp,
    signIn,
    signOut: signOutUser,
    continueAsGuest,
    updateUserProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Hook for checking if user is authenticated
export const useAuthState = () => {
  const { currentUser, isLoading } = useAuth();
  
  return {
    isAuthenticated: !!currentUser,
    isGuest: currentUser?.isGuest || false,
    isLoading
  };
};

// Hook for getting current user ID (useful for saving session data)
export const useCurrentUserId = () => {
  const { currentUser } = useAuth();
  
  return currentUser?.userId || null;
};

// Usage examples:
/*
// In your main App component:
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <YourAppContent />
    </AuthProvider>
  );
}

// In any component:
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { 
    currentUser,      // { userId, name, email, role, gradeLevel }
    isLoading,        // boolean
    error,            // error message if any
    signUp,           // function
    signIn,           // function
    signOut,          // function
    continueAsGuest,  // function
    updateUserProfile, // function
    clearError        // function
  } = useAuth();

  // Use the auth functions and state
}
*/

