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
  const file = document.getElementById("photo").files[0];
  const isPublic = document.getElementById("public").value === "true";
  const status = document.getElementById("status");

  if (!name || !file) {
    status.textContent = "⚠️ Remplis le nom et choisis une image.";
    return;
  }

  status.textContent = "📤 Upload de l’image…";

  // 1) Upload image dans Storage
  const imageRef = ref(storage, "images/" + Date.now() + "_" + file.name);
  await uploadBytes(imageRef, file);

  const imageUrl = await getDownloadURL(imageRef);

  status.textContent = "📝 Enregistrement dans la base…";

  // 2) Enregistrer dans Firestore
  await addDoc(collection(db, "creations"), {
    name,
    imageUrl,
    public: isPublic,
    createdAt: serverTimestamp()
  });

  status.textContent = "🎉 Création ajoutée avec succès !";
  document.getElementById("name").value = "";
  document.getElementById("photo").value = "";
}
