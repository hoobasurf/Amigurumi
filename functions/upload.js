// functions/upload.js
const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes } = require("firebase/storage");
const multiparty = require("multiparty");
const fs = require("fs");

// ⚠️ Mets ici ta config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDbkbhXdZO20XdQpg3GhShFnqBVSpTdJKQ",
  authDomain: "amigurumi-2e7df.firebaseapp.com",
  projectId: "amigurumi-2e7df",
  storageBucket: "amigurumi-2e7df.appspot.com",
  messagingSenderId: "92443765428",
  appId: "1:92443765428:web:23e5aab383547b6f8885e1"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

exports.handler = async function(event, context) {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();

    form.parse(event, async (err, fields, files) => {
      if (err) {
        console.error(err);
        return resolve({
          statusCode: 500,
          body: JSON.stringify({ error: "Erreur parsing form data" })
        });
      }

      try {
        const file = files.file[0]; // "file" = clé FormData
        const fileData = fs.readFileSync(file.path);
        const fileName = `${Date.now()}_${file.originalFilename}`;
        const storageRef = ref(storage, `images/${fileName}`);

        await uploadBytes(storageRef, fileData);

        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/images%2F${encodeURIComponent(fileName)}?alt=media`;

        resolve({
          statusCode: 200,
          body: JSON.stringify({ url: publicUrl })
        });
      } catch (uploadErr) {
        console.error(uploadErr);
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: "Erreur upload Firebase" })
        });
      }
    });
  });
};
