import { db, storage } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// Sélection des éléments
const saveBtn = document.getElementById("save");
const nameInput = document.getElementById("name");
const photosInput = document.getElementById("photo");
const publicSelect = document.getElementById("public");
const status = document.getElementById("status");
const projectsContainer = document.getElementById("projects-container");

// Événement bouton
saveBtn.onclick = saveCreation;

// Fonction pour afficher les miniatures
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

// Fonction principale d’upload
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

  for (let file of files) {
    // Nettoyage du nom de fichier pour éviter les erreurs de pattern
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const imageRef = ref(storage, `images/${Date.now()}_${safeName}`);

    try {
      const uploadResult = await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      uploadedUrls.push(url);
      status.innerHTML += `✅ ${file.name} uploadé<br>`;
      console.log("Upload OK:", file.name, url);
    } catch (err) {
      status.innerHTML += `❌ ${file.name} : ${err.message}<br>`;
      console.error("Upload error:", err);
    }
  }

  if (uploadedUrls.length === 0) {
    status.innerHTML += "❌ Aucun fichier n'a pu être uploadé.";
    return;
  }

  // Enregistrement Firestore
  status.innerHTML += "📝 Enregistrement dans Firestore…<br>";
  try {
    await addDoc(collection(db, "creations"), {
      name,
      imageUrls: uploadedUrls,
      mainImage: uploadedUrls[0],
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
