import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const saveBtn = document.getElementById("save");
const nameInput = document.getElementById("name");
const photoInput = document.getElementById("photo");
const publicSelect = document.getElementById("public");
const status = document.getElementById("status");
const projectsContainer = document.getElementById("projects-container");

saveBtn.onclick = saveCreation;

// Affichage des miniatures
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
  const files = Array.from(photoInput.files);
  const isPublic = publicSelect.value === "true";

  if (!name || files.length === 0) {
    status.innerHTML = "⚠️ Remplis le nom et choisis au moins une image.";
    return;
  }

  status.innerHTML = "📤 Début upload…";
  const uploadedUrls = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    status.innerHTML += `<br>⏳ Upload de ${file.name}…`;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/.netlify/functions/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erreur inconnue");

      uploadedUrls.push(data.url);
      status.innerHTML += ` ✅ ${file.name} uploadé`;
    } catch (err) {
      status.innerHTML += `<br>❌ ${file.name} : ${err.message}`;
      console.error(err);
    }
  }

  if (uploadedUrls.length === 0) {
    status.innerHTML += "<br>❌ Aucun fichier n'a pu être uploadé.";
    return;
  }

  status.innerHTML += "<br>📝 Enregistrement dans Firestore…";
  try {
    await addDoc(collection(db, "creations"), {
      name,
      imageUrls: uploadedUrls,
      mainImage: uploadedUrls[0],
      public: isPublic,
      createdAt: serverTimestamp()
    });
    status.innerHTML += "<br>🎉 Création ajoutée !";
    displayMiniatures(uploadedUrls);
    nameInput.value = "";
    photoInput.value = "";
  } catch (err) {
    status.innerHTML += `<br>❌ Erreur Firestore : ${err.message}`;
    console.error(err);
  }
}
