export const ENV = {
  OPENAI_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_KEY: process.env.ANTHROPIC_API_KEY,
  RUNWAY_KEY: process.env.RUNWAY_KEY || process.env.RUNWAY_API_KEY,
  HUME_API_KEY: process.env.HUME_API_KEY,
  HUME_SECRET: process.env.HUME_CLIENT_SECRET,
  PORT: process.env.PORT || 3001,
  FIREBASE: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  }
};

