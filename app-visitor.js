// app-visitor.js (module)
import { db } from "./firebase.js";
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const gallery = document.getElementById("gallery");
const emptyMsg = document.getElementById("empty-msg");

const modal = document.getElementById("modal");
const modalOverlay = document.getElementById("modal-overlay");
const modalClose = document.getElementById("modal-close");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");

const commentsList = document.getElementById("comments-list");
const commentForm = document.getElementById("comment-form");
const nameInput = document.getElementById("comment-name");
const textInput = document.getElementById("comment-text");
const emojiRow = document.getElementById("emoji-row");
const commentCancel = document.getElementById("comment-cancel");

let creations = [];
let activeImageKey = null; // clé pour commentaires (par ex imageUrl)

// Charger créations
async function loadCreations() {
  try {
    const q = query(collection(db, "creations"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    creations = snap.docs.map(doc => {
      const d = doc.data();
      // si pas d'imageUrl, fallback
      return {
        name: d.name || "Sans nom",
        imageUrl: d.imageUrl || "assets/empty.png",
        id: d.id || d.imageUrl || Math.random().toString(36).slice(2,9)
      };
    });

    renderGallery();
  } catch (err) {
    console.error("Erreur chargement créations", err);
    emptyMsg.textContent = "Impossible de charger les créations.";
  }
}

function renderGallery(){
  gallery.innerHTML = "";
  if (!creations.length) {
    emptyMsg.textContent = "Aucune création publique pour le moment.";
    gallery.appendChild(emptyMsg);
    return;
  }
  creations.forEach(item => {
    const card = document.createElement("article");
    card.className = "gallery-card";
    card.tabIndex = 0;

    const img = document.createElement("img");
    img.className = "gallery-img";
    img.src = item.imageUrl || "assets/empty.png";
    img.alt = item.name || "Création";

    const caption = document.createElement("div");
    caption.className = "gallery-caption";
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = item.name || "";
    const info = document.createElement("div");
    info.className = "small-muted";
    info.textContent = "Voir";

    caption.appendChild(name);
    caption.appendChild(info);

    card.appendChild(img);
    card.appendChild(caption);

    // Ouvrir modal au clic
    card.addEventListener("click", () => openModal(item));
    card.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") openModal(item);
    });

    gallery.appendChild(card);
  });
}

// Modal functions
function openModal(item) {
  activeImageKey = item.id || item.imageUrl;
  modalImg.src = item.imageUrl || "assets/empty.png";
  modalImg.alt = item.name || "Image";
  modalTitle.textContent = item.name || "";
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden"; // empêcher scroll page
  renderComments();
}

function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  // clear form
  commentForm.reset();
  activeImageKey = null;
}

// Comments storage (localStorage)
// Structure: localStorage.comments_amigurumi = JSON.stringify({ [key]: [ {name, text, date} ] })
const LS_KEY = "comments_amigurumi";

function getAllComments() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e) {
    console.error("parse localStorage", e);
    return {};
  }
}

function saveAllComments(obj) {
  localStorage.setItem(LS_KEY, JSON.stringify(obj));
}

function getCommentsFor(key){
  const all = getAllComments();
  return all[key] || [];
}

function addCommentFor(key, comment) {
  const all = getAllComments();
  if (!all[key]) all[key] = [];
  all[key].push(comment);
  saveAllComments(all);
}

// Render comments in modal
function renderComments(){
  commentsList.innerHTML = "";
  if (!activeImageKey) return;
  const arr = getCommentsFor(activeImageKey);
  if (!arr.length) {
    commentsList.innerHTML = '<div class="small-muted">Aucun commentaire — sois le premier !</div>';
    return;
  }
  arr.slice().reverse().forEach(c => {
    const el = document.createElement("div");
    el.className = "comment";
    el.innerHTML = `<div class="who">${escapeHtml(c.name)} <span class="small-muted" style="font-weight:400;font-size:0.85rem">• ${new Date(c.date).toLocaleString()}</span></div>
                    <div class="txt">${escapeHtml(c.text)}</div>`;
    commentsList.appendChild(el);
  });
}

// Simple escape to avoid injection in local pages
function escapeHtml(s){
  if(!s) return "";
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'", "&#039;");
}

// Form submit
commentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!activeImageKey) return;
  const name = nameInput.value.trim() || "Anonyme";
  const text = textInput.value.trim();
  if (!text) return;
  const comment = { name, text, date: new Date().toISOString() };
  addCommentFor(activeImageKey, comment);
  renderComments();
  // reset text only (garder prénom)
  textInput.value = "";
  // focus back to gallery by leaving modal open (user wanted it)
});

// Cancel in form: close modal
commentCancel.addEventListener("click", () => {
  closeModal();
});

// close modal on overlay or close btn
modalOverlay.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);

// ESC to close
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") closeModal();
});

// emoji buttons
emojiRow.addEventListener("click", (ev) => {
  const btn = ev.target.closest(".emoji-btn");
  if (!btn) return;
  textInput.value = (textInput.value || "") + " " + btn.textContent;
  textInput.focus();
});

// helper: if no creations yet, hide empty message when filled
function maybeHideEmpty() {
  if (creations.length) {
    if (emptyMsg && emptyMsg.parentNode) emptyMsg.parentNode.removeChild(emptyMsg);
  }
}

// Initial load
loadCreations().then(maybeHideEmpty);
