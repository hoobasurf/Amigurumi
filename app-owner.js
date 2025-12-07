import { db, storage } from "./firebase.js";
import { collection, addDoc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const saveBtn = document.getElementById("save");
const photosInput = document.getElementById("photo");
const nameInput = document.getElementById("name");
const publicSelect = document.getElementById("public");
const status = document.getElementById("status");
const projectsContainer = document.getElementById("projects-container");

async function displayExistingProjects() {
  projectsContainer.innerHTML = "";
  const snapshot = await getDocs(collection(db, "creations"));
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.mainImage) return;
    const img = document.createElement("img");
    img.src = data.mainImage;
    img.title = data.name;
    img.style.width = "80px";
    img.style.height = "80px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "6px";
    projectsContainer.appendChild(img);
  });
}

displayExistingProjects();

saveBtn.onclick = async () => {
  const name = nameInput.value.trim();
  const files = Array.from(photosInput.files);
  const isPublic = publicSelect.value === "true";

  if (!name || !files.length) {
    status.textContent = "⚠️ Remplis le nom et choisis au moins une image.";
    return;
  }

  status.textContent = "📤 Upload des images…";
  const uploadedUrls = [];

  for (const file of files) {
    try {
      const imageRef = ref(storage, `images/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(imageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      uploadedUrls.push(url);
      console.log("Uploaded:", url);
    } catch (err) {
      console.error("Erreur upload:", err);
      status.textContent = "❌ Erreur lors de l'upload.";
      return;
    }
  }

  status.textContent = "📝 Enregistrement dans la base…";

  try {
    await addDoc(collection(db, "creations"), {
      name,
      imageUrls: uploadedUrls,
      mainImage: uploadedUrls[0],
      public: isPublic,
      likes: 0,
      createdAt: serverTimestamp()
    });
    status.textContent = "🎉 Création ajoutée avec succès !";
    nameInput.value = "";
    photosInput.value = "";
    displayExistingProjects();
  } catch (err) {
    console.error("Erreur Firestore:", err);
    status.textContent = "❌ Erreur lors de l'enregistrement.";
  }
};
