import { db, storage } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const saveBtn = document.getElementById("save");
const nameInput = document.getElementById("name");
const photosInput = document.getElementById("photo");
const publicSelect = document.getElementById("public");
const status = document.getElementById("status");

saveBtn.onclick = saveCreation;

async function saveCreation() {
  const name = nameInput.value.trim();
  const files = Array.from(photosInput.files);
  const isPublic = publicSelect.value === "true";

  if (!name || !files.length) {
    status.innerHTML = "⚠️ Remplis le nom et choisis au moins une image.";
    return;
  }

  status.innerHTML = "📤 Début de l'upload…<br>";

  const uploadedUrls = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    status.innerHTML += `⏳ Upload de l'image ${i + 1} / ${files.length} : ${file.name}…<br>`;
    console.log(`Début upload fichier: ${file.name}, taille: ${file.size} octets`);

    try {
      const imageRef = ref(storage, "images/" + Date.now() + "_" + file.name);
      console.log("Référence storage:", imageRef);

      const uploadResult = await uploadBytes(imageRef, file);
      console.log("Upload terminé:", uploadResult);

      const url = await getDownloadURL(imageRef);
      console.log("URL récupérée:", url);

      uploadedUrls.push(url);
      status.innerHTML += `✅ Upload réussi : ${file.name}<br>`;
    } catch (err) {
      status.innerHTML += `❌ Erreur upload ${file.name} : ${err.message}<br>`;
      console.error("Upload error:", err);
    }
  }

  if (!uploadedUrls.length) {
    status.innerHTML += "❌ Aucun fichier n'a pu être uploadé.";
    return;
  }

  status.innerHTML += "📝 Enregistrement dans Firestore…<br>";
  console.log("Données à enregistrer:", { name, imageUrls: uploadedUrls, public: isPublic });

  try {
    const docRef = await addDoc(collection(db, "creations"), {
      name,
      imageUrls: uploadedUrls,
      public: isPublic,
      createdAt: serverTimestamp()
    });
    console.log("Document Firestore ajouté:", docRef.id);

    status.innerHTML += "🎉 Création ajoutée avec succès !";
    nameInput.value = "";
    photosInput.value = "";
  } catch (err) {
    status.innerHTML += `❌ Erreur Firestore : ${err.message}`;
    console.error("Firestore error:", err);
  }
}
