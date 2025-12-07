import { db } from "./firebase.js";
import { collection, getDocs, doc, updateDoc, arrayUnion, increment } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* --- ELEMENTS --- */
const projectsContainer = document.getElementById("projects-container");
const modal = document.getElementById("modal");
const modalOverlay = document.getElementById("modal-overlay");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalClose = document.getElementById("modal-close");
const thumbnails = document.getElementById("thumbnails");

const commentBtn = document.getElementById("modal-comment-btn");
const commentPanel = document.getElementById("comment-panel");
const commentClose = document.getElementById("comment-close");
const commentsList = document.getElementById("comments-list");
const commentForm = document.getElementById("comment-form");
const nameInput = document.getElementById("comment-name");
const textInput = document.getElementById("comment-text");
const emojiRow = document.getElementById("emoji-row");
const likeBtn = document.getElementById("like-btn");

let activeProject = null;
let activeImage = null;

/* --- OUVERTURE MODAL PROJET --- */
async function loadProjects() {
  const snapshot = await getDocs(collection(db, "projects"));
  snapshot.forEach(docSnap => {
    const project = { id: docSnap.id, ...docSnap.data() };
    if (!project.public) return;

    const div = document.createElement("div");
    div.className = "album-page";
    div.innerHTML = `
      <h2>${project.name}</h2>
      <img src="${project.images[0]}" class="album-img"/>
    `;
    div.querySelector("img").style.cursor = "pointer";
    div.addEventListener("click", () => openProjectModal(project));
    projectsContainer.appendChild(div);
  });
}

/* --- MODAL PROJET --- */
function openProjectModal(project) {
  activeProject = project;
  activeImage = project.images[0];
  modalImg.src = activeImage;
  modalTitle.textContent = project.name;

  // miniatures
  thumbnails.innerHTML = "";
  project.images.forEach(img => {
    const thumb = document.createElement("img");
    thumb.src = img;
    thumb.style.width = "60px";
    thumb.style.height = "60px";
    thumb.style.objectFit = "cover";
    thumb.style.cursor = "pointer";
    thumb.style.border = "2px solid #f7c6da";
    thumb.style.borderRadius = "6px";
    thumb.addEventListener("click", () => {
      activeImage = img;
      modalImg.src = img;
    });
    thumbnails.appendChild(thumb);
  });

  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  updateLikeButton();
}

/* --- FERMETURE MODAL --- */
function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  commentPanel.setAttribute("aria-hidden", "true");
}

modalOverlay.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);

/* --- MODAL COMMENTAIRE --- */
commentBtn.addEventListener("click", () => {
  renderComments();
  commentPanel.setAttribute("aria-hidden", "false");
});

/* --- COMMENTAIRES --- */
commentClose.addEventListener("click", () => commentPanel.setAttribute("aria-hidden", "true"));

commentForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!activeProject) return;

  const name = nameInput.value.trim() || "Anonyme";
  const text = textInput.value.trim();
  if (!text) return;

  const projectRef = doc(db, "projects", activeProject.id);
  await updateDoc(projectRef, {
    comments: arrayUnion({ name, text, date: new Date().toISOString() })
  });

  textInput.value = "";
  nameInput.value = "";
  renderComments();
});

/* --- RENDU COMMENTAIRES --- */
function renderComments() {
  commentsList.innerHTML = "";
  if (!activeProject.comments || activeProject.comments.length === 0) {
    commentsList.innerHTML = `<div class="small-muted">Aucun commentaire</div>`;
    return;
  }
  activeProject.comments.slice().reverse().forEach(c => {
    const div = document.createElement("div");
    div.className = "comment";
    div.innerHTML = `<div class="who">${c.name} • ${new Date(c.date).toLocaleString()}</div><div class="txt">${c.text}</div>`;
    commentsList.appendChild(div);
  });
}

/* --- LIKES --- */
likeBtn.addEventListener("click", async () => {
  if (!activeProject) return;
  const projectRef = doc(db, "projects", activeProject.id);
  await updateDoc(projectRef, { likes: increment(1) });
  activeProject.likes = (activeProject.likes || 0) + 1;
  updateLikeButton();
});

function updateLikeButton() {
  likeBtn.textContent = `❤️ ${activeProject.likes || 0}`;
}

/* --- EMOJIS --- */
emojiRow.addEventListener("click", e => {
  const btn = e.target.closest("button, span");
  if (!btn) return;
  textInput.value += " " + btn.textContent;
  textInput.focus();
});

/* --- INIT --- */
loadProjects();
