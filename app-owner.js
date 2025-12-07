import { db, storage } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

document.getElementById("save").onclick = saveCreation;

async function saveCreation() {
  const name = document.getElementById("name").value.trim();
  const files = document.getElementById("photo").files;
  const isPublic = document.getElementById("public").value === "true";
  const status = document.getElementById("status");

  if (!name || !files.length) {
    status.textContent = "⚠️ Remplis le nom et choisis au moins une image.";
    return;
  }

  status.textContent = "📤 Upload des images…";

  const uploadedUrls = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imageRef = ref(storage, "images/" + Date.now() + "_" + file.name);
    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);
    uploadedUrls.push(url);
  }

  status.textContent = "📝 Enregistrement du projet…";

  try {
    await addDoc(collection(db, "creations"), {
      name,
      mainImage: uploadedUrls[0],
      images: uploadedUrls,
      public: isPublic,
      likes: 0,
      createdAt: serverTimestamp()
    });

    status.textContent = "🎉 Projet ajouté avec succès !";
    document.getElementById("name").value = "";
    document.getElementById("photo").value = "";
  } catch (err) {
    console.error(err);
    status.textContent = "❌ Erreur lors de l'enregistrement.";
  }
}
