import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { ENV } from "./env.js";

let db = null;

export function configureFirebase() {
  const app = initializeApp(ENV.FIREBASE);
  db = getFirestore(app);
}

export function getDB() {
  return db;
}



