import { db, storage } from "./firebase.js";
import { collection, addDoc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const saveBtn = document.getElementById("save");
const nameInput = document.getElementById("name");
const photosInput = document.getElementById("photos");
const publicSelect = document.getElementById("public");
const status = document.getElementById("status");
const existingProjects = document.getElementById("existing-projects");

async function loadProjects() {
  existingProjects.innerHTML = "";
  const snapshot = await getDocs(collection(db, "creations"));
  snapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";

    const mainImg = document.createElement("img");
    mainImg.src = data.mainImage;
    mainImg.style.width = "60px";
    mainImg.style.height = "60px";
    mainImg.style.objectFit = "cover";
    mainImg.style.border = "2px solid #f7c6da";
    mainImg.style.borderRadius = "6px";

    const title = document.createElement("span");
    title.textContent = data.name;
    title.style.fontSize = "0.8rem";

    div.appendChild(mainImg);
    div.appendChild(title);
    existingProjects.appendChild(div);
  });
}

loadProjects();

saveBtn.onclick = async () => {
  const name = nameInput.value.trim();
  const files = Array.from(photosInput.files);
  const isPublic = publicSelect.value === "true";

  if (!name || files.length === 0) {
    status.textContent = "⚠️ Remplis le nom et choisis au moins une image.";
    return;
  }

  status.textContent = "📤 Upload des images…";

  try {
    const urls = [];
    for (const file of files) {
      const imageRef = ref(storage, "images/" + Date.now() + "_" + file.name);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      urls.push(url);
    }

    const projectData = {
      name,
      mainImage: urls[0],
      images: urls,
      public: isPublic,
      likes: 0,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "creations"), projectData);

    status.textContent = "🎉 Création ajoutée avec succès !";
    nameInput.value = "";
    photosInput.value = "";
    loadProjects();
  } catch (err) {
    console.error(err);
    status.textContent = "❌ Erreur lors de l'upload";
  }
};
