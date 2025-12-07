import { db, storage } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

console.log("app-owner.js chargé !");
console.log("db:", db);
console.log("storage:", storage);

// Récupération des éléments
const saveBtn = document.getElementById("saveCreationBtn");
const nameInput = document.getElementById("name");
const photosInput = document.getElementById("photo");
const publicSelect = document.getElementById("public");
const status = document.getElementById("status");
const projectsContainer = document.getElementById("projects-container");

// Fonction affichage miniatures
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

// Fonction principale saveCreation
window.saveCreation = async function () {
  const name = nameInput.value.trim();
  const files = Array.from(photosInput.files);
  const isPublic = publicSelect.value === "true";

  if (!name || files.length === 0) {
    status.innerHTML = "⚠️ Remplis le nom et choisis au moins une image.";
    return;
  }

  status.innerHTML = "📤 Début upload…<br>";
  console.log("Début upload fichiers :", files);

  const uploadedUrls = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    status.innerHTML += `⏳ Upload image ${i + 1} / ${files.length} : ${file.name}…<br>`;
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
    const docRef = await addDoc(collection(db, "creations"), {
      name,
      imageUrls: uploadedUrls,
      mainImage: uploadedUrls[0], // première image = principale
      public: isPublic,
      createdAt: serverTimestamp()
    });
    status.innerHTML += "🎉 Création ajoutée avec succès !";
    console.log("Document Firestore ajouté:", docRef.id);

    // Reset form
    nameInput.value = "";
    photosInput.value = "";
    displayMiniatures(uploadedUrls);
  } catch (err) {
    status.innerHTML += `❌ Erreur Firestore : ${err.message}`;
    console.error("Firestore error:", err);
  }
};

// Associer le bouton
saveBtn.onclick = window.saveCreation;
