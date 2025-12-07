import { db } from "./firebase.js";
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const container = document.querySelector(".album-container");

async function loadProjects() {
  container.innerHTML = ""; // vider container

  const q = query(collection(db, "creations"), where("public","==",true), orderBy("createdAt","desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc=>{
    const data = doc.data();
    const div = document.createElement("div");
    div.className="album-page";

    const h2 = document.createElement("h2");
    h2.textContent = data.name;
    div.appendChild(h2);

    const img = document.createElement("img");
    img.src = data.mainImage;
    img.className="album-img";
    div.appendChild(img);

    // clic zoom
    img.addEventListener("click",()=>{
      const modal = document.getElementById("modal");
      const modalImg = document.getElementById("modal-img");
      const modalTitle = document.getElementById("modal-title");

      modalImg.src = data.mainImage;
      modalTitle.textContent = data.name;
      modal.setAttribute("aria-hidden","false");
      document.body.style.overflow="hidden";
    });

    container.appendChild(div);
  });
}

loadProjects();
