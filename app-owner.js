import { db, storage } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// --- Elements DOM ---
const saveBtn = document.getElementById("save");
const nameInput = document.getElementById("name");
const photoInput = document.getElementById("photo");
const publicSelect = document.getElementById("public");
const statusText = document.getElementById("status");
const previewDiv = document.getElementById("preview-images");
const projectsContainer = document.getElementById("projects-container");

let selectedFiles = [];

// --- Prévisualisation images ---
photoInput.addEventListener("change", () => {
  previewDiv.innerHTML = "";
  selectedFiles = Array.from(photoInput.files);

  selectedFiles.forEach(file => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.width = "60px";
    img.style.height = "60px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "6px";
    previewDiv.appendChild(img);
  });
});

// --- Fonction save ---
saveBtn.addEventListener("click", async () => {
  const name = nameInput.value.trim();
  const isPublic = publicSelect.value === "true";

  if (!name || selectedFiles.length === 0) {
    statusText.textContent = "⚠️ Remplis le nom et choisis au moins une image.";
    return;
  }

  statusText.textContent = "📤 Upload des images…";
  
  const urls = [];

  for (const file of selectedFiles) {
    const fileRef = ref(storage, `images/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    urls.push(url);
  }

  // Enregistrer le projet dans Firestore
  await addDoc(collection(db, "creations"), {
    name,
    imageUrl: urls,
    public: isPublic,
    createdAt: serverTimestamp()
  });

  statusText.textContent = "🎉 Création ajoutée avec succès !";

  // Reset formulaire
  nameInput.value = "";
  photoInput.value = "";
  previewDiv.innerHTML = "";
  selectedFiles = [];

  // Recharger projets existants
  loadExistingProjects();
});

// --- Charger projets existants ---
async function loadExistingProjects() {
  projectsContainer.innerHTML = "";
  const q = query(collection(db, "creations"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.style.width = "60px";
    div.style.height = "60px";
    div.style.overflow = "hidden";
    div.style.borderRadius = "6px";
    div.style.cursor = "pointer";
    div.style.border = "2px solid #f7c6da";

    const img = document.createElement("img");
    img.src = Array.isArray(data.imageUrl) ? data.imageUrl[0] : data.imageUrl;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";

    div.appendChild(img);
    projectsContainer.appendChild(div);
  });
}

// --- Initial load ---
loadExistingProjects();
