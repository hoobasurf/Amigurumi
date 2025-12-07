// Import Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

// Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Storage (pour les photos)
import { getStorage } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// --- CONFIGURATION FIREBASE (la tienne) ---
const firebaseConfig = {
  apiKey: "AIzaSyDbkbhXdZO20XdQpg3GhShFnqBVSpTdJKQ",
  authDomain: "amigurumi-2e7df.firebaseapp.com",
  projectId: "amigurumi-2e7df",
  storageBucket: "amigurumi-2e7df.firebasestorage.app",
  messagingSenderId: "92443765428",
  appId: "1:92443765428:web:23e5aab383547b6f8885e1"
};

// --- INITIALISATION ---
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
