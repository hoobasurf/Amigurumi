import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

async function loadCreations() {
  const snapshot = await getDocs(collection(db, "creations"));
  snapshot.forEach(doc => {
    console.log("Doc Firestore:", doc.id, doc.data());
  });
}

loadCreations();

import { db } from "./firebase.js";
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const projectsContainer = document.getElementById("projects-container");

// Fonction pour créer un élément projet
function createProjectCard(project) {
  const card = document.createElement("div");
  card.className = "project-card";
  card.style.display = "inline-block";
  card.style.margin = "5px";
  card.style.cursor = "pointer";
  
  const img = document.createElement("img");
  img.src = project.mainImage;
  img.style.width = "200px";
  img.style.height = "200px";
  img.style.objectFit = "cover";
  img.style.borderRadius = "10px";
  img.style.border = "2px solid #f7c6da";
  card.appendChild(img);

  // Click pour ouvrir modal
  card.onclick = () => openProjectModal(project);

  return card;
}

// Fonction modal
function openProjectModal(project) {
  // Création fond transparent flou
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = 0;
  modal.style.left = 0;
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(255,255,255,0.8)";
  modal.style.backdropFilter = "blur(5px)";
  modal.style.display = "flex";
  modal.style.flexDirection = "column";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = 9999;
  modal.onclick = (e) => { if(e.target===modal) modal.remove(); }

  // Image principale
  const mainImg = document.createElement("img");
  mainImg.src = project.mainImage;
  mainImg.style.maxWidth = "80%";
  mainImg.style.maxHeight = "50%";
  mainImg.style.marginBottom = "10px";
  modal.appendChild(mainImg);

  // Miniatures
  if (project.imageUrls.length > 1) {
    const miniContainer = document.createElement("div");
    miniContainer.style.display = "flex";
    miniContainer.style.gap = "5px";
    project.imageUrls.forEach(url => {
      const mini = document.createElement("img");
      mini.src = url;
      mini.style.width = "60px";
      mini.style.height = "60px";
      mini.style.objectFit = "cover";
      mini.style.borderRadius = "5px";
      miniContainer.appendChild(mini);
    });
    modal.appendChild(miniContainer);
  }

  // Bouton commentaire + like
  const commentBtn = document.createElement("button");
  commentBtn.innerText = "💬 Commenter / ❤️";
  commentBtn.style.marginTop = "10px";
  commentBtn.style.padding = "5px 10px";
  commentBtn.style.borderRadius = "5px";
  commentBtn.style.border = "1px solid #f7c6da";
  commentBtn.style.background = "#fff0f5";
  commentBtn.onclick = (e) => {
    e.stopPropagation();
    alert("Commentaire / Like fonction à implémenter !");
  };
  modal.appendChild(commentBtn);

  document.body.appendChild(modal);
}

// Récupérer toutes les créations publiques
async function loadProjects() {
  const q = query(collection(db, "creations"), where("public", "==", true), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  projectsContainer.innerHTML = "";
  snapshot.forEach(doc => {
    const project = doc.data();
    const card = createProjectCard(project);
    projectsContainer.appendChild(card);
  });
}

// Initialisation
loadProjects();
