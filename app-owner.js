import { db, storage } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const saveBtn = document.getElementById("save");
const nameInput = document.getElementById("name");
const photosInput = document.getElementById("photo");
const publicSelect = document.getElementById("public");
const status = document.getElementById("status");

saveBtn.onclick = async () => {
  const name = nameInput.value.trim();
  const files = Array.from(photosInput.files);
  const isPublic = publicSelect.value === "true";

  if (!name || files.length === 0) {
    status.innerHTML = "⚠️ Remplis le nom et choisis au moins une image.";
    return;
  }

  status.innerHTML = "📤 Début de l'upload…<br>";

  try {
    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      status.innerHTML += `⏳ Upload de l'image ${i+1} / ${files.length} : ${file.name}…<br>`;
      const imageRef = ref(storage, `images/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      uploadedUrls.push(url);
      status.innerHTML += `✅ URL générée : <a href="${url}" target="_blank">Voir image</a><br>`;
    }

    status.innerHTML += "📝 Enregistrement dans Firestore…<br>";

    const docData = {
      name,
      imageUrls: uploadedUrls,
      mainImage: uploadedUrls[0],
      public: isPublic,
      likes: 0,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "creations"), docData);

    status.innerHTML += `🎉 Création ajoutée avec succès ! Document ID : ${docRef.id}<br>`;
    status.innerHTML += "Vous pouvez maintenant aller sur la page visiteur pour voir le projet.<br>";

    // reset formulaire
    nameInput.value = "";
    photosInput.value = "";

  } catch (err) {
    console.error("Erreur lors de l'upload ou Firestore :", err);
    status.innerHTML += `❌ Erreur : ${err.message}`;
  }
};
