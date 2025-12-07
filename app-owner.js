alert("app-owner.js exécuté !");
console.log("db:", db, "storage:", storage);

import { db, storage } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

console.log("app-owner.js chargé !");

// Elements du DOM
const saveBtn = document.getElementById("save");
const nameInput = document.getElementById("name");
const photosInput = document.getElementById("photo");
const publicSelect = document.getElementById("public");
const status = document.getElementById("status");
const projectsContainer = document.getElementById("projects-container");

// Click bouton enregistrer
saveBtn.onclick = saveCreation;

// Nettoie le nom des fichiers pour Firebase Storage
function sanitizeFileName(name) {
  return name
    .trim()
    .replace(/\s+/g, "_")       // espaces → _
    .replace(/[^\w\-.]/g, "");  // enlève caractères spéciaux sauf _ - .
}

// Affiche les miniatures côté propriétaire
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

// Fonction principale d’upload + Firestore
async function saveCreation() {
  const name = nameInput.value.trim();
  const files = Array.from(photosInput.files);
  const isPublic = publicSelect.value === "true";

  if (!name || files.length === 0) {
    status.innerHTML = "⚠️ Remplis le nom et choisis au moins une image.";
    return;
  }

  status.innerHTML = "📤 Début de l'upload…<br>";
  const uploadedUrls = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const cleanName = sanitizeFileName(file.name);
    const imageRef = ref(storage, "images/" + Date.now() + "_" + cleanName);

    status.innerHTML += `⏳ Upload de l'image ${i + 1} / ${files.length} : ${file.name}…<br>`;
    console.log(`Upload fichier: ${file.name} → ${cleanName}, taille: ${file.size} octets`);

    try {
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      uploadedUrls.push(url);
      status.innerHTML += `✅ Upload réussi : ${file.name}<br>`;
    } catch (err) {
      status.innerHTML += `❌ Erreur upload ${file.name} : ${err.message}<br>`;
      console.error("Upload error:", err);
    }
  }

  if (uploadedUrls.length === 0) {
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

    // Reset form
    nameInput.value = "";
    photosInput.value = "";

    // Affiche miniatures
    displayMiniatures(uploadedUrls);

  } catch (err) {
    status.innerHTML += `❌ Erreur Firestore : ${err.message}`;
    console.error("Firestore error:", err);
  }
}
