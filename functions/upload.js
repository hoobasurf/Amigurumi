import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDbkbhXdZO20XdQpg3GhShFnqBVSpTdJKQ",
  authDomain: "amigurumi-2e7df.firebaseapp.com",
  projectId: "amigurumi-2e7df",
  storageBucket: "amigurumi-2e7df.appspot.com",
  messagingSenderId: "92443765428",
  appId: "1:92443765428:web:23e5aab383547b6f8885e1"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export async function handler(event, context) {
  try {
    const body = event.body;
    const fileData = Buffer.from(event.body, "base64"); // si base64
    // ici adapter pour multipart (Netlify auto gère FormData)
    
    // ⚠️ À compléter selon la librairie Netlify pour parser multipart/form-data
    // Puis uploadBytes(ref(storage, `images/${filename}`), fileBuffer)

    return {
      statusCode: 200,
      body: JSON.stringify({ url: "https://..." })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
