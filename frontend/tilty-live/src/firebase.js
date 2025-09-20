// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDokp-NEs3IzLSdCV7h1Z3t7ZGoJokGSGw",
  authDomain: "tilty-mctiltface.firebaseapp.com",
  projectId: "tilty-mctiltface",
  storageBucket: "tilty-mctiltface.firebasestorage.app",
  messagingSenderId: "624107351308",
  appId: "1:624107351308:web:a49085445550193567ad29",
};

// --- Init singletons ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Resolve once when we know the initial user (or lack thereof)
const authReady = new Promise((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();
    resolve(user ?? null);
  });
});

// Subscribe to user changes
const onUser = (callback) => onAuthStateChanged(auth, callback);

// Simple helpers
const signUp = async (email, password) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
};

const signIn = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

const signOut = async () => {
  await fbSignOut(auth);
};

export { app, db, auth, authReady, onUser, signUp, signIn, signOut };
