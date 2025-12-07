import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// --- Elements DOM ---
const albumContainer = document.getElementById("album-container");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
prevBtn.style.display = "none";
nextBtn.style.display = "none";

// --- Modal ---
const modal = document.getElementById("modal");
const modalOverlay = document.getElementById("modal-overlay");
const modalBox = document.getElementById("modal-box");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalClose = document.getElementById("modal-close");
const miniImagesDiv = document.getElementById("mini-images");

// --- Commentaires ---
const commentBtn = document.getElementById("modal-comment-btn");
const commentPanel = document.getElementById("comment-panel");
const commentClose = document.getElementById("comment-close");
const commentsList = document.getElementById("comments-list");
const commentForm = document.getElementById("comment-form");
const nameInput = document.getElementById("comment-name");
const textInput = document.getElementById("comment-text");
const emojiRow = document.getElementById("emoji-row");
const cancelBtn = document.getElementById("comment-cancel");

// --- Likes ---
const likeBtn = document.getElementById("modal-like-btn");
const likeCountSpan = document.getElementById("like-count");

// --- LocalStorage clé ---
const LS_COMMENTS_KEY = "comments_amigurumi_album";
const LS_LIKES_KEY = "likes_amigurumi_album";

let activeProjectId = null;
let activeProjectData = null;

// --- Fonctions LocalStorage ---
function getAllComments() {
  try { return JSON.parse(localStorage.getItem(LS_COMMENTS_KEY)) || {}; }
  catch { return {}; }
}

function saveAllComments(obj) {
  localStorage.setItem(LS_COMMENTS_KEY, JSON.stringify(obj));
}

function getCommentsFor(key) {
  return getAllComments()[key] || [];
}

function addCommentFor(key, comment) {
  const all = getAllComments();
  if (!all[key]) all[key] = [];
  all[key].push(comment);
  saveAllComments(all);
}

function getLikesFor(key) {
  const all = JSON.parse(localStorage.getItem(LS_LIKES_KEY)) || {};
  return all[key] || 0;
}

function toggleLike(key) {
  const all = JSON.parse(localStorage.getItem(LS_LIKES_KEY)) || {};
  all[key] = all[key] ? 0 : 1; // toggle
  localStorage.setItem(LS_LIKES_KEY, JSON.stringify(all));
  return all[key];
}

// --- Rendu commentaires ---
function renderComments() {
  commentsList.innerHTML = "";
  const arr = getCommentsFor(activeProjectId);
  if (!arr.length) { commentsList.innerHTML = `<div class="small-muted">Aucun commentaire</div>`; return; }
  arr.slice().reverse().forEach(c => {
    const div = document.createElement("div");
    div.className = "comment";
    div.innerHTML = `<div class="who">${c.name} <span class="small-muted">• ${new Date(c.date).toLocaleString()}</span></div><div class="txt">${c.text}</div>`;
    commentsList.appendChild(div);
  });
}

// --- Ouvrir modal ---
function openModal(projectId, projectData) {
  activeProjectId = projectId;
  activeProjectData = projectData;
  modalTitle.textContent = projectData.name;
  modalImg.src = Array.isArray(projectData.imageUrl) ? projectData.imageUrl[0] : projectData.imageUrl;
  miniImagesDiv.innerHTML = "";

  // Miniatures
  if (Array.isArray(projectData.imageUrl)) {
    projectData.imageUrl.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      img.style.width = "50px";
      img.style.height = "50px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "4px";
      img.style.cursor = "pointer";
      img.addEventListener("click", () => { modalImg.src = url; });
      miniImagesDiv.appendChild(img);
    });
  }

  // Likes
  likeCountSpan.textContent = getLikesFor(projectId);
  likeBtn.textContent = getLikesFor(projectId) ? "❤️ " + getLikesFor(projectId) : "♡ 0";

  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

// --- Fermer modal ---
function closeAll() {
  modal.setAttribute("aria-hidden", "true");
  commentPanel.classList.remove("show");
  document.body.style.overflow = "";
}

modalOverlay.addEventListener("click", closeAll);
modalClose.addEventListener("click", closeAll);

// --- Commentaires ---
commentBtn.addEventListener("click", () => {
  renderComments();
  commentPanel.classList.add("show");
});
commentClose.addEventListener("click", () => commentPanel.classList.remove("show"));
cancelBtn.addEventListener("click", () => commentPanel.classList.remove("show"));
commentForm.addEventListener("submit", e => {
  e.preventDefault();
  if (!activeProjectId) return;
  const name = nameInput.value.trim() || "Anonyme";
  const text = textInput.value.trim();
  if (!text) return;
  addCommentFor(activeProjectId, { name, text, date: new Date().toISOString() });
  commentPanel.classList.remove("show");
  closeAll();
});

// --- Emoji click ---
emojiRow.addEventListener("click", e => {
  const btn = e.target.closest("button, span");
  if (!btn) return;
  textInput.value += " " + btn.textContent;
  textInput.focus();
});

// --- Like button ---
likeBtn.addEventListener("click", () => {
  if (!activeProjectId) return;
  const liked = toggleLike(activeProjectId);
  likeBtn.textContent = liked ? "❤️ " + 1 : "♡ 0";
  likeCountSpan.textContent = liked ? 1 : 0;
});

// --- Charger tous les projets ---
async function loadProjects() {
  albumContainer.innerHTML = "";
  const q = query(collection(db, "creations"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.public) return; // afficher seulement public
    const div = document.createElement("div");
    div.className = "album-page";
    div.style.cursor = "pointer";

    const title = document.createElement("h2");
    title.textContent = data.name;
    title.id = `title-${doc.id}`;

    const img = document.createElement("img");
    img.src = Array.isArray(data.imageUrl) ? data.imageUrl[0] : data.imageUrl;
    img.className = "album-img";

    div.appendChild(title);
    div.appendChild(img);

    div.addEventListener("click", () => openModal(doc.id, data));

    albumContainer.appendChild(div);
  });
}

// --- Initial ---
loadProjects();
