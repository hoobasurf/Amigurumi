import { db, storage } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// Elements
const saveBtn = document.getElementById("save");
const nameInput = document.getElementById("name");
const photoInput = document.getElementById("photo");
const publicSelect = document.getElementById("public");
const status = document.getElementById("status");
const previewContainer = document.getElementById("preview-container");
const existingProjectsDiv = document.getElementById("existing-projects");

// Prévisualisation des images sélectionnées
photoInput.addEventListener("change", () => {
  previewContainer.innerHTML = "";
  const files = Array.from(photoInput.files);
  files.forEach(file => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.width = "60px";
    img.style.height = "60px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "6px";
    previewContainer.appendChild(img);
  });
});

// Fonction pour afficher tous les projets existants
async function loadExistingProjects() {
  existingProjectsDiv.innerHTML = "";
  const q = query(collection(db, "creations"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const data = doc.data();
    const projectDiv = document.createElement("div");
    projectDiv.style.display = "flex";
    projectDiv.style.flexDirection = "column";
    projectDiv.style.alignItems = "center";
    projectDiv.style.gap = "4px";

    // miniature principale = première image
    const img = document.createElement("img");
    img.src = Array.isArray(data.imageUrl) ? data.imageUrl[0] : data.imageUrl;
    img.style.width = "80px";
    img.style.height = "80px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "6px";

    const title = document.createElement("div");
    title.textContent = data.name;
    title.style.fontSize = "0.85rem";
    title.style.textAlign = "center";

    projectDiv.appendChild(img);
    projectDiv.appendChild(title);

    existingProjectsDiv.appendChild(projectDiv);
  });
}

// Initial load
loadExistingProjects();

// Enregistrer un nouveau projet
saveBtn.onclick = async () => {
  const name = nameInput.value.trim();
  const files = Array.from(photoInput.files);
  const isPublic = publicSelect.value === "true";

  if (!name || files.length === 0) {
    status.textContent = "⚠️ Remplis le nom et choisis au moins une image.";
    return;
  }

  status.textContent = "📤 Upload des images…";

  // Upload multiple images
  const uploadedUrls = [];
  for (const file of files) {
    const imageRef = ref(storage, `images/${Date.now()}_${file.name}`);
    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);
    uploadedUrls.push(url);
  }

  status.textContent = "📝 Enregistrement du projet…";

  await addDoc(collection(db, "creations"), {
    name,
    imageUrl: uploadedUrls, // tableau d'urls
    public: isPublic,
    createdAt: serverTimestamp()
  });

  status.textContent = "🎉 Projet ajouté !";

  // Reset
  nameInput.value = "";
  photoInput.value = "";
  previewContainer.innerHTML = "";

  // Rafraîchir la liste des projets existants
  loadExistingProjects();
};
