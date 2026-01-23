// Firebase Configuration for Social Cue App
// This file initializes Firebase and exports the database and auth services

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration object
// TODO: Replace with your actual Firebase config from Firebase Console
// Go to https://console.firebase.google.com
// 1. Create a new project called "Social Cue App"
// 2. Add a web app to your project
// 3. Copy the config object and paste it below
const firebaseConfig = {
    apiKey: "AIzaSyBo836PZY5YBmv6e0xjrsPH0wg-5c7yCXQ",
    authDomain: "social-cue-2025.firebaseapp.com",
    projectId: "social-cue-2025",
    storageBucket: "social-cue-2025.firebasestorage.app",
    messagingSenderId: "828360561679",
    appId: "1:828360561679:web:68b42b0b9e806d17d03f7a",
    measurementId: "G-2GCFVB5LJL"
  };

// Initialize Firebase app
// This creates the main Firebase app instance
const app = initializeApp(firebaseConfig);

// Initialize Firestore database
// This is our main database for storing learner progress, sessions, etc.
export const db = getFirestore(app);

// Initialize Firebase Authentication
// This handles user login, registration, and authentication
export const auth = getAuth(app);

// Export the app instance in case you need it elsewhere
export default app;

// Usage examples:
// import { db, auth } from './firebaseConfig';
// 
// To use Firestore:
// import { collection, addDoc, getDocs } from 'firebase/firestore';
// const usersRef = collection(db, 'users');
//
// To use Authentication:
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
// await signInWithEmailAndPassword(auth, email, password);
