// Import des modules Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDbkbhXdZO20XdQpg3GhShFnqBVSpTdJKQ",
  authDomain: "amigurumi-2e7df.firebaseapp.com",
  projectId: "amigurumi-2e7df",
  storageBucket: "amigurumi-2e7df.appspot.com",   // ✔️ CORRIGÉ
  messagingSenderId: "92443765428",
  appId: "1:92443765428:web:23e5aab383547b6f8885e1"
};

// Initialisation Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
