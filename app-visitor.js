import { db } from "./firebase.js";
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* --- MODE ALBUM VISITEUR --- */
const albumContainer = document.querySelector(".album-container");
const modal = document.getElementById("modal");
const modalOverlay = document.getElementById("modal-overlay");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalClose = document.getElementById("modal-close");
const commentBtn = document.getElementById("modal-comment-btn");
const commentPanel = document.getElementById("comment-panel");
const commentClose = document.getElementById("comment-close");
const commentsList = document.getElementById("comments-list");
const commentForm = document.getElementById("comment-form");
const nameInput = document.getElementById("comment-name");
const textInput = document.getElementById("comment-text");
const emojiRow = document.getElementById("emoji-row");
const cancelBtn = document.getElementById("comment-cancel");

let activeProject = null;

/* --- LOCALSTORAGE COMMENTAIRES --- */
const LS_KEY = "comments_amigurumi_album";

function getAllComments() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } 
  catch { return {}; }
}

function saveAllComments(obj) {
  localStorage.setItem(LS_KEY, JSON.stringify(obj));
}

function getCommentsFor(key) {
  const all = getAllComments();
  return all[key] || [];
}

function addCommentFor(key, comment) {
  const all = getAllComments();
  if (!all[key]) all[key] = [];
  all[key].push(comment);
  saveAllComments(all);
}

/* --- AFFICHAGE DES PROJETS --- */
async function loadProjects() {
  albumContainer.innerHTML = "";
  const snapshot = await getDocs(collection(db, "creations"));

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (!data.public) return;

    const page = document.createElement("div");
    page.className = "album-page";

    const title = document.createElement("h2");
    title.textContent = data.name;
    page.appendChild(title);

    const img = document.createElement("img");
    img.className = "album-img";
    img.src = data.mainImage;
    page.appendChild(img);

    // like count
    const likeDiv = document.createElement("div");
    likeDiv.style.fontSize = "0.9rem";
    likeDiv.style.marginTop = "6px";
    likeDiv.textContent = `❤️ ${data.likes || 0}`;
    page.appendChild(likeDiv);

    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => openProjectModal(data, docSnap.id));

    albumContainer.appendChild(page);
  });
}

/* --- MODAL PROJECT --- */
function openProjectModal(projectData, projectId) {
  activeProject = { ...projectData, id: projectId };

  modalImg.src = projectData.mainImage;
  modalTitle.textContent = projectData.name;

  // miniatures si plusieurs images
  const thumbContainer = document.createElement("div");
  thumbContainer.style.display = "flex";
  thumbContainer.style.gap = "8px";
  thumbContainer.style.marginTop = "10px";

  projectData.images.forEach(url => {
    const thumb = document.createElement("img");
    thumb.src = url;
    thumb.style.width = "50px";
    thumb.style.height = "50px";
    thumb.style.objectFit = "cover";
    thumb.style.borderRadius = "6px";
    thumb.style.cursor = "pointer";
    thumb.addEventListener("click", () => { modalImg.src = url; });
    thumbContainer.appendChild(thumb);
  });

  // ajoute container miniatures si pas déjà présent
  const oldThumbs = modal.querySelector("#thumb-container");
  if (oldThumbs) oldThumbs.remove();
  thumbContainer.id = "thumb-container";
  modal.querySelector("#modal-box").appendChild(thumbContainer);

  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

/* --- FERMETURE --- */
function closeAll() {
  modal.setAttribute("aria-hidden", "true");
  commentPanel.classList.remove("show");
  document.body.style.overflow = "";
}

modalOverlay.addEventListener("click", closeAll);
modalClose.addEventListener("click", closeAll);

/* --- COMMENTAIRES --- */
commentBtn.addEventListener("click", () => {
  if (!activeProject) return;
  renderComments();
  commentPanel.classList.add("show");
});

commentClose.addEventListener("click", () => commentPanel.classList.remove("show"));
cancelBtn.addEventListener("click", () => commentPanel.classList.remove("show"));

commentForm.addEventListener("submit", e => {
  e.preventDefault();
  if (!activeProject) return;

  const name = nameInput.value.trim() || "Anonyme";
  const text = textInput.value.trim();
  if (!text) return;

  addCommentFor(activeProject.id, {
    name,
    text,
    date: new Date().toISOString()
  });

  commentPanel.classList.remove("show");
  closeAll();
});

/* --- RENDU COMMENTAIRES --- */
function renderComments() {
  commentsList.innerHTML = "";
  const arr = getCommentsFor(activeProject.id);
  if (!arr.length) {
    commentsList.innerHTML = `<div class="small-muted">Aucun commentaire</div>`;
    return;
  }
  arr.slice().reverse().forEach(c => {
    const div = document.createElement("div");
    div.className = "comment";
    div.innerHTML = `
      <div class="who">${c.name}
        <span class="small-muted"> • ${new Date(c.date).toLocaleString()}</span>
      </div>
      <div class="txt">${c.text}</div>
    `;
    commentsList.appendChild(div);
  });
}

/* --- EMOJIS --- */
emojiRow.addEventListener("click", e => {
  const btn = e.target.closest("button, span");
  if (!btn) return;
  textInput.value += " " + btn.textContent;
  textInput.focus();
});

/* --- LOAD --- */
loadProjects();
