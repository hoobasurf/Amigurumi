import { getStorage } from "firebase-admin/storage";
import { initializeApp, cert } from "firebase-admin/app";
import multiparty from "multiparty";

// Initialisation Firebase Admin
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "amigurumi-2e7df.appspot.com"
});

const bucket = getStorage().bucket();

export async function handler(event, context) {
  return new Promise((resolve) => {
    const form = new multiparty.Form();
    form.parse(event, async (err, fields, files) => {
      if (err) {
        resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
        return;
      }

      const file = files.file[0];
      const blob = bucket.file(`images/${Date.now()}_${file.originalFilename}`);
      await blob.save(file.buffer, { resumable: false });
      const url = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      resolve({
        statusCode: 200,
        body: JSON.stringify({ url })
      });
    });
  });
}
