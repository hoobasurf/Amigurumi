import { db } from "./firebase.js";
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

let creations = [];
let currentPage = 0;

// Charger les peluches publiques
async function loadCreations() {
  const q = query(collection(db, "creations"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  creations = snap.docs.map(doc => doc.data());

  displayPages();
}

function displayPages() {
  const leftIndex = currentPage * 2;
  const rightIndex = leftIndex + 1;

  document.getElementById("title-left").textContent =
    creations[leftIndex]?.name || "";
  document.getElementById("img-left").src =
    creations[leftIndex]?.imageUrl || "assets/empty.png";

  document.getElementById("title-right").textContent =
    creations[rightIndex]?.name || "";
  document.getElementById("img-right").src =
    creations[rightIndex]?.imageUrl || "assets/empty.png";
}

// Navigation
document.getElementById("prev").onclick = () => {
  if (currentPage > 0) currentPage--;
  displayPages();
};

document.getElementById("next").onclick = () => {
  if ((currentPage + 1) * 2 < creations.length) currentPage++;
  displayPages();
};

// Lancer
loadCreations();
