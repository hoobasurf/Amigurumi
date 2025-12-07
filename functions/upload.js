import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

export async function handler(event) {
  try {
    const { name, fileBase64 } = JSON.parse(event.body);

    const buffer = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));
    const storageRef = ref(storage, `images/${Date.now()}_${name}`);

    await uploadBytes(storageRef, buffer);
    const url = await getDownloadURL(storageRef);

    return {
      statusCode: 200,
      body: JSON.stringify({ url })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
