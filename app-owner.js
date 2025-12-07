// app-owner.js
import { db, storage } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, getDownloadURL, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const saveBtn = document.getElementById("save");
const nameInput = document.getElementById("name");
const photosInput = document.getElementById("photo");
const publicSelect = document.getElementById("public");
const status = document.getElementById("status");
const projectsContainer = document.getElementById("projects-container");

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

// Fonction pour convertir image iOS en JPEG (si nécessaire)
function convertToJPEG(file) {
  return new Promise((resolve) => {
    if (file.type === "image/jpeg") {
      resolve(file);
      return;
    }
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpeg"), { type: "image/jpeg" });
        resolve(newFile);
      }, "image/jpeg", 0.9);
    };
  });
}

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
    let file = files[i];
    status.innerHTML += `⏳ Préparation de l'image ${i + 1} / ${files.length} : ${file.name}<br>`;
    file = await convertToJPEG(file);

    const imageRef = ref(storage, "images/" + Date.now() + "_" + file.name);
    const uploadTask = uploadBytesResumable(imageRef, file);

    await new Promise((resolve, reject) => {
      uploadTask.on("state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          status.innerHTML = `⏳ Upload ${file.name} : ${progress.toFixed(0)}%<br>`;
        },
        (error) => {
          status.innerHTML += `❌ Erreur upload ${file.name} : ${error.message}<br>`;
          console.error(error);
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          uploadedUrls.push(url);
          status.innerHTML += `✅ ${file.name} uploadé<br>`;
          resolve();
        }
      );
    });
  }

  if (uploadedUrls.length > 0) {
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
      console.error(err);
    }
  }
}
