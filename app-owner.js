import { db, storage } from "./firebase.js";
import { collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const photoInput = document.getElementById("photo");
const previewContainer = document.getElementById("preview-container");
const status = document.getElementById("status");
const nameInput = document.getElementById("name");

let selectedFiles = [];

photoInput.addEventListener("change", () => {
  previewContainer.innerHTML = "";
  selectedFiles = Array.from(photoInput.files);

  selectedFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.width = "60px";
      img.style.height = "60px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "8px";
      img.style.border = "2px solid #f7c6da";
      previewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

document.getElementById("save").onclick = async () => {
  const name = nameInput.value.trim();
  const isPublic = document.getElementById("public").value === "true";

  if (!name || selectedFiles.length === 0) {
    status.textContent = "⚠️ Remplis le nom et choisis au moins une image.";
    return;
  }

  status.textContent = "📤 Upload des images…";

  try {
    const uploadedUrls = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const imageRef = ref(storage, "images/" + Date.now() + "_" + file.name);
      await uploadBytes(imageRef, file);
      uploadedUrls.push(await getDownloadURL(imageRef));
    }

    // Enregistrer le projet dans Firestore
    await addDoc(collection(db, "creations"), {
      name,
      mainImage: uploadedUrls[0],
      images: uploadedUrls,
      public: isPublic,
      likes: 0,
      createdAt: serverTimestamp()
    });

    status.textContent = "🎉 Projet ajouté avec succès !";
    nameInput.value = "";
    photoInput.value = "";
    previewContainer.innerHTML = "";
    selectedFiles = [];

    // Affiche les projets existants en bas
    await displayExistingProjects();
  } catch (err) {
    console.error(err);
    status.textContent = "❌ Erreur lors de l'enregistrement.";
  }
};

// Afficher projets déjà créés pour le propriétaire
async function displayExistingProjects() {
  let existingContainer = document.getElementById("existing-projects");
  if (!existingContainer) {
    existingContainer = document.createElement("div");
    existingContainer.id = "existing-projects";
    existingContainer.style.marginTop = "20px";
    document.body.appendChild(existingContainer);
  }

  existingContainer.innerHTML = "<h3>Mes projets existants :</h3>";

  const snapshot = await getDocs(collection(db, "creations"));
  snapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.gap = "10px";
    div.style.marginBottom = "10px";

    const img = document.createElement("img");
    img.src = data.mainImage;
    img.style.width = "50px";
    img.style.height = "50px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "6px";
    div.appendChild(img);

    const span = document.createElement("span");
    span.textContent = data.name;
    div.appendChild(span);

    existingContainer.appendChild(div);
  });
}

// Afficher les projets existants au chargement
displayExistingProjects();
