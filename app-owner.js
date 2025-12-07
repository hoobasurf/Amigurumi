import { db, storage } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const photoInput = document.getElementById("photo");
const previewContainer = document.getElementById("preview-container");

photoInput.addEventListener("change", () => {
  previewContainer.innerHTML = "";
  const files = photoInput.files;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = (e) => {
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
  }
});

document.getElementById("save").onclick = async () => {
  const name = document.getElementById("name").value.trim();
  const files = photoInput.files;
  const isPublic = document.getElementById("public").value === "true";
  const status = document.getElementById("status");

  if (!name || !files.length) {
    status.textContent = "⚠️ Remplis le nom et choisis au moins une image.";
    return;
  }

  status.textContent = "📤 Upload des images…";

  const uploadedUrls = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imageRef = ref(storage, "images/" + Date.now() + "_" + file.name);
    await uploadBytes(imageRef, file);
    uploadedUrls.push(await getDownloadURL(imageRef));
  }

  status.textContent = "📝 Enregistrement du projet…";

  try {
    await addDoc(collection(db, "creations"), {
      name,
      mainImage: uploadedUrls[0],
      images: uploadedUrls,
      public: isPublic,
      likes: 0,
      createdAt: serverTimestamp()
    });

    status.textContent = "🎉 Projet ajouté avec succès !";
    document.getElementById("name").value = "";
    photoInput.value = "";
    previewContainer.innerHTML = "";
  } catch (err) {
    console.error(err);
    status.textContent = "❌ Erreur lors de l'enregistrement.";
  }
};
