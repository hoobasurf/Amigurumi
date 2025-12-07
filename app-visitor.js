import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const projectsContainer = document.getElementById("projects-container");

async function loadCreations() {
  try {
    const snapshot = await getDocs(collection(db, "creations"));
    projectsContainer.innerHTML = ""; // vide avant affichage

    snapshot.forEach(doc => {
      const data = doc.data();
      console.log("Doc Firestore:", doc.id, data);

      // Bloc principal du projet
      const projectDiv = document.createElement("div");
      projectDiv.className = "project-item";
      projectDiv.style.display = "inline-block";
      projectDiv.style.margin = "10px";
      projectDiv.style.cursor = "pointer";

      // Image principale
      const mainImg = document.createElement("img");
      mainImg.src = data.mainImage || (data.imageUrls ? data.imageUrls[0] : "");
      mainImg.style.width = "200px";
      mainImg.style.height = "200px";
      mainImg.style.objectFit = "cover";
      mainImg.style.borderRadius = "10px";
      projectDiv.appendChild(mainImg);

      // Nom du projet
      const title = document.createElement("p");
      title.textContent = data.name || "Sans nom";
      title.style.textAlign = "center";
      projectDiv.appendChild(title);

      // Miniatures supplémentaires
      if (data.imageUrls && data.imageUrls.length > 1) {
        const miniContainer = document.createElement("div");
        miniContainer.style.display = "flex";
        miniContainer.style.justifyContent = "center";
        miniContainer.style.marginTop = "5px";

        data.imageUrls.forEach((url, index) => {
          if (index === 0) return; // la principale est déjà affichée
          const mini = document.createElement("img");
          mini.src = url;
          mini.style.width = "50px";
          mini.style.height = "50px";
          mini.style.objectFit = "cover";
          mini.style.border = "1px solid #ccc";
          mini.style.borderRadius = "5px";
          mini.style.margin = "2px";
          miniContainer.appendChild(mini);
        });
        projectDiv.appendChild(miniContainer);
      }

      projectsContainer.appendChild(projectDiv);
    });
  } catch (err) {
    console.error("Erreur Firestore:", err);
    projectsContainer.innerHTML = "<p>Erreur chargement projets.</p>";
  }
}

loadCreations();
