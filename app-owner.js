import { db } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const saveBtn = document.getElementById("save");
const nameInput = document.getElementById("name");
const photosInput = document.getElementById("photo");
const publicSelect = document.getElementById("public");
const status = document.getElementById("status");
const projectsContainer = document.getElementById("projects-container");

saveBtn.onclick = saveCreation;

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
    status.innerHTML += `⏳ Upload de l'image ${i + 1} / ${files.length} : ${file.name}…<br>`;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/.netlify/functions/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur upload");

      uploadedUrls.push(data.url);
      status.innerHTML += `✅ ${file.name} uploadé<br>`;
    } catch (err) {
      status.innerHTML += `❌ ${file.name} : ${err.message}<br>`;
      console.error(err);
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
      mainImage: uploadedUrls[0],
      public: isPublic,
      createdAt: serverTimestamp()
    });
    status.innerHTML += "🎉 Création ajoutée !";
    nameInput.value = "";
    photosInput.value = "";
    displayMiniatures(uploadedUrls);
  } catch (err) {
    status.innerHTML += `❌ Erreur Firestore : ${err.message}`;
    console.error(err);
  }
}

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
