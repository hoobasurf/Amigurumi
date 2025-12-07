import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import multiparty from "multiparty";
import fs from "fs";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "amigurumi-2e7df.appspot.com"
});

export async function handler(event) {
  return new Promise((resolve) => {
    const form = new multiparty.Form();
    form.parse(event, async (err, fields, files) => {
      if (err) return resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });

      const file = files.file[0];
      const bucket = getStorage().bucket();
      const destination = `images/${Date.now()}_${file.originalFilename}`;

      try {
        await bucket.upload(file.path, { destination });
        const url = `https://storage.googleapis.com/${bucket.name}/${destination}`;
        resolve({ statusCode: 200, body: JSON.stringify({ url }) });
      } catch (err) {
        resolve({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
      }
    });
  });
}
