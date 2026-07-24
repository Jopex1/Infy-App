import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, RecaptchaVerifier, signInWithPhoneNumber, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBwyUZM2nLM5M3Tmw4YC8DwtvBziiWzLXA",
  authDomain: "infy-app-8119a.firebaseapp.com",
  projectId: "infy-app-8119a",
  storageBucket: "infy-app-8119a.firebasestorage.app",
  messagingSenderId: "440440351373",
  appId: "1:440440351373:web:c9628c4360dbf001aa90c4",
  measurementId: "G-3FR0SNB3DE"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider, signInWithPopup, signOut, RecaptchaVerifier, signInWithPhoneNumber, createUserWithEmailAndPassword, signInWithEmailAndPassword };
