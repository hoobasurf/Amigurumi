// Imports Firebase
import { db, storage } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

console.log("app-owner.js chargé !");
console.log("db:", db, "storage:", storage);

// Récupération éléments DOM
const saveCreationBtn = document.getElementById("saveCreationBtn");
const saveBtn = document.getElementById("saveBtn");
const nameInput = document.getElementById("name");
const photosInput = document.getElementById("photo");
const publicSelect = document.getElementById("public");
const status = document.getElementById("status");
const projectsContainer = document.getElementById("projects-container");

// Listener pour bouton création
saveCreationBtn.onclick = saveCreation;

// Listener bouton simple (action personnalisable)
saveBtn.onclick = () => {
  alert("Bouton Enregistrer cliqué ! Tu peux mettre une autre action ici.");
};

// Fonction pour afficher les miniatures côté owner
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

// Fonction principale pour enregistrer une création
async function saveCreation() {
  const name = nameInput.value.trim();
  const files = Array.from(photosInput.files);
  const isPublic = publicSelect.value === "true";

  if (!name || files.length === 0) {
    status.innerHTML = "⚠️ Remplis le nom et choisis au moins une image.";
    return;
  }

  status.innerHTML = "📤 Début de l'upload…";
  const uploadedUrls = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    status.innerHTML += `<br>⏳ Upload de l'image ${i + 1}/${files.length} : ${file.name}…`;
    console.log(`Upload fichier: ${file.name}, taille: ${file.size} octets`);

    try {
      const imageRef = ref(storage, "images/" + Date.now() + "_" + file.name);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      uploadedUrls.push(url);
      status.innerHTML += `<br>✅ Upload réussi : ${file.name}`;
    } catch (err) {
      status.innerHTML += `<br>❌ Erreur upload ${file.name} : ${err.message}`;
      console.error("Upload error:", err);
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
      mainImage: uploadedUrls[0], // première image = principale
      public: isPublic,
      createdAt: serverTimestamp()
    });
    status.innerHTML += "<br>🎉 Création ajoutée avec succès !";

    // Reset champs
    nameInput.value = "";
    photosInput.value = "";
    displayMiniatures(uploadedUrls);

  } catch (err) {
    status.innerHTML += `<br>❌ Erreur Firestore : ${err.message}`;
    console.error("Firestore error:", err);
  }
}
