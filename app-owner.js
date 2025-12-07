import { db, storage } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// Test d'exécution
alert("app-owner.js chargé !");
console.log("db:", db, "storage:", storage);

const saveBtn = document.getElementById("save");
const photosInput = document.getElementById("photo");
const status = document.getElementById("status");

saveBtn.onclick = async function () {
  const file = photosInput.files[0];
  if (!file) {
    alert("Choisis une image !");
    return;
  }

  status.textContent = "📤 Upload en cours…";

  try {
    // Upload sur Firebase Storage
    const imageRef = ref(storage, "test/" + Date.now() + "_" + file.name);
    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);
    console.log("URL récupérée :", url);
    status.textContent = "✅ Upload réussi ! URL : " + url;

    // Enregistrement dans Firestore
    await addDoc(collection(db, "creations"), {
      name: file.name,
      imageUrl: url,
      createdAt: serverTimestamp()
    });
    console.log("Document Firestore ajouté");
  } catch (err) {
    status.textContent = "❌ Erreur : " + err.message;
    console.error(err);
  }
};
