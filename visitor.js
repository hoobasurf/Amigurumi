import { db } from "./firebase.js";
import {
  collection, getDocs, addDoc, doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

let creations = [];
let activeImage = null;

// Charger les peluches
async function loadCreations() {
  const snap = await getDocs(collection(db, "creations"));
  creations = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  displayGallery();
}

function displayGallery() {
  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  creations.forEach(c => {
    const img = document.createElement("img");
    img.src = c.imageUrl || "assets/empty.png";
    img.className = "gallery-img";
    img.onclick = () => openImage(c);
    gallery.appendChild(img);
  });
}

// Ouvrir zoom
function openImage(crea) {
  activeImage = crea;

  document.getElementById("modal-img").src = crea.imageUrl;
  document.getElementById("modal").classList.remove("hidden");
}

document.getElementById("close-modal").onclick = () =>
  document.getElementById("modal").classList.add("hidden");

// Ouvrir commentaires
document.getElementById("comment-btn").onclick = () => {
  document.getElementById("comment-modal").classList.remove("hidden");
};

// Fermer commentaire
document.getElementById("close-comment").onclick = () =>
  document.getElementById("comment-modal").classList.add("hidden");

// Envoyer commentaire
document.getElementById("send-comment").onclick = async () => {
  const prenom = document.getElementById("prenom").value.trim();
  const commentaire = document.getElementById("commentaire").value.trim();

  if (!prenom || !commentaire) return;

  await addDoc(
    collection(db, "creations", activeImage.id, "comments"),
    { prenom, commentaire, date: Date.now() }
  );

  document.getElementById("comment-modal").classList.add("hidden");
};

loadCreations();
