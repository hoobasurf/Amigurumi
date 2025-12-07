// app-visitor.js
import { db } from "./firebase.js";
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const projectsContainer = document.getElementById("projects-container");
const status = document.getElementById("status");

// Fonction pour afficher les créations
function displayCreations(creations) {
  projectsContainer.innerHTML = "";
  creations.forEach(doc => {
    const data = doc.data();
    
    // Création d'une carte projet
    const div = document.createElement("div");
    div.style.border = "2px solid #f7c6da";
    div.style.borderRadius = "8px";
    div.style.padding = "5px";
    div.style.margin = "5px";
    div.style.width = "120px";
    div.style.textAlign = "center";
    
    // Image principale
    const img = document.createElement("img");
    img.src = data.mainImage || data.imageUrls[0];
    img.style.width = "100px";
    img.style.height = "100px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "5px";
    div.appendChild(img);
    
    // Nom projet
    const name = document.createElement("p");
    name.textContent = data.name;
    name.style.fontSize = "14px";
    name.style.margin = "5px 0 0 0";
    div.appendChild(name);
    
    projectsContainer.appendChild(div);
  });
}

// Charger toutes les créations publiques
async function loadCreations() {
  status.innerHTML = "⏳ Chargement des créations publiques…";
  try {
    const q = query(
      collection(db, "creations"),
      where("public", "==", true),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      status.innerHTML = "Aucune création publique pour le moment.";
      return;
    }
    const creations = snapshot.docs;
    displayCreations(creations);
    status.innerHTML = "✅ Créations chargées !";
  } catch (err) {
    status.innerHTML = `❌ Erreur chargement : ${err.message}`;
    console.error("Firestore error:", err);
  }
}

// Exécuter au chargement
document.addEventListener("DOMContentLoaded", loadCreations);
