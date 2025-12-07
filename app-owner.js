alert("Test A : début du fichier");

import { db, storage } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

alert("Test B : après imports");

console.log("app-owner.js chargé !");
console.log("db:", db);
console.log("storage:", storage);

alert("Test C : avant saveBtn");

alert("saveBtn = " + saveBtn);
alert("photosInput = " + photosInput);
alert("status = " + status);
alert("projectsContainer = " + projectsContainer);

const saveBtn = document.getElementById("save");
const nameInput = document.getElementById("name");
const photosInput = document.getElementById("photo");
const publicSelect = document.getElementById("public");
const status = document.getElementById("status");
const projectsContainer = document.getElementById("projects-container");

saveBtn.onclick = saveCreation;

// Fonction pour créer miniatures côté propriétaire
function displayMiniatures(urls) {
  projectsContainer.innerHTML = "";
  urls.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    img.style.width = "80px";
    img.style.height = "80px";
    img.style.objectFit = "cover";
    img.style.border = "2px solid #f7c6da";
    img.style.borderRadius = "8px";
    img.style.margin = "3px";
    projectsContainer.appendChild(img);
  });
}

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
    console.log(`Upload fichier: ${file.name}, taille: ${file.size} octets`);

    try {
      const imageRef = ref(storage, "images/" + Date.now() + "_" + file.name);
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
  try {
    await addDoc(collection(db, "creations"), {
      name,
      imageUrls: uploadedUrls,
      mainImage: uploadedUrls[0], // première image = principale
      public: isPublic,
      createdAt: serverTimestamp()
    });
    status.innerHTML += "🎉 Création ajoutée avec succès !";
    nameInput.value = "";
    photosInput.value = "";
    displayMiniatures(uploadedUrls);
  } catch (err) {
    status.innerHTML += `❌ Erreur Firestore : ${err.message}`;
    console.error("Firestore error:", err);
  }
}
window.testUpload = async function () {
  const file = photosInput.files[0];
  if (!file) {
    alert("Choisis une image");
    return;
  }

  console.log("Test upload fichier:", file);

  try {
    const imageRef = ref(storage, "debug/" + Date.now() + "_" + file.name);
    await uploadBytes(imageRef, file);
    alert("UPLOAD OK !");
  } catch (err) {
    alert("ERREUR: " + err.message);
    console.error(err);
  }
};

alert("Test Z : fin du fichier chargée");
