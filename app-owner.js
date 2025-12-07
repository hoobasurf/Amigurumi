// app-owner.js
import { db, storage } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

console.log("app-owner.js chargé !");
console.log("db:", db, "storage:", storage);

const saveBtn = document.getElementById("save");
const nameInput = document.getElementById("name");
const photosInput = document.getElementById("photo");
const publicSelect = document.getElementById("public");
const status = document.getElementById("status");
const projectsContainer = document.getElementById("projects-container");

saveBtn.onclick = saveCreation;

// Affichage miniatures
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

// Upload d’un fichier avec suivi progress
function uploadFile(file) {
  return new Promise((resolve, reject) => {
    const imageRef = ref(storage, "images/" + Date.now() + "_" + file.name);
    const uploadTask = uploadBytesResumable(imageRef, file);

    uploadTask.on('state_changed',
      snapshot => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        status.innerHTML = `⏳ Upload ${file.name} : ${progress}%`;
      },
      error => {
        console.error("Upload error:", error);
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

// Fonction principale
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
    try {
      const url = await uploadFile(file);
      uploadedUrls.push(url);
      status.innerHTML += `✅ Upload réussi : ${file.name}<br>`;
    } catch (err) {
      status.innerHTML += `❌ Erreur upload ${file.name} : ${err.message}<br>`;
      console.error(err);
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
