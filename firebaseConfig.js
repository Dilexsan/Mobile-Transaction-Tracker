// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA82Qdl3XObcBDsHh7isLXrFhH9kr9daMM",
  authDomain: "transaction-tracker-db13f.firebaseapp.com",
  projectId: "transaction-tracker-db13f",
  storageBucket: "transaction-tracker-db13f.firebasestorage.app",
  messagingSenderId: "1013688746541",
  appId: "1:1013688746541:web:653f9059af45df80092ea4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };