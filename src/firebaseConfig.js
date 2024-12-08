// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmvrwjmz9NAneJptmfbbb7YsgvmOct-Sc",
  authDomain: "pioforum-4edf7.firebaseapp.com",
  projectId: "pioforum-4edf7",
  storageBucket: "pioforum-4edf7.firebasestorage.app",
  messagingSenderId: "976689658498",
  appId: "1:976689658498:web:31069d5863cf4ee0c2129b",
  measurementId: "G-MJ0XZKNXL8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
