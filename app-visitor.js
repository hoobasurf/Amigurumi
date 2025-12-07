import { db } from "./firebase.js";
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const albumContainer = document.getElementById("album-container");

const modal = document.getElementById("modal");
const modalOverlay = document.getElementById("modal-overlay");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalClose = document.getElementById("modal-close");
const miniThumbs = document.getElementById("mini-thumbs");
const likeBtn = document.getElementById("modal-like-btn");
const likeCountSpan = document.getElementById("like-count");

/* --- COMMENT PANEL --- */
const commentBtn = document.getElementById("modal-comment-btn");
const commentPanel = document.getElementById("comment-panel");
const commentClose = document.getElementById("comment-close");
const commentsList = document.getElementById("comments-list");
const commentForm = document.getElementById("comment-form");
const nameInput = document.getElementById("comment-name");
const textInput = document.getElementById("comment-text");
const emojiRow = document.getElementById("emoji-row");
const cancelBtn = document.getElementById("comment-cancel");

let activeProjectId = null;
let projectsData = {};

// --- LOCALSTORAGE COMMENTAIRES ---
const LS_KEY = "comments_amigurumi_album";
function getAllComments() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
}
function saveAllComments(obj) { localStorage.setItem(LS_KEY, JSON.stringify(obj)); }
function getCommentsFor(key) { const all = getAllComments(); return all[key] || []; }
function addCommentFor(key, comment) { const all = getAllComments(); if(!all[key]) all[key]=[]; all[key].push(comment); saveAllComments(all); }
function renderComments() {
  commentsList.innerHTML = "";
  const arr = getCommentsFor(activeProjectId);
  if(!arr.length){ commentsList.innerHTML=`<div class="small-muted">Aucun commentaire</div>`; return; }
  arr.slice().reverse().forEach(c=>{
    const div=document.createElement("div");
    div.className="comment";
    div.innerHTML=`<div class="who">${c.name}<span class="small-muted"> • ${new Date(c.date).toLocaleString()}</span></div><div class="txt">${c.text}</div>`;
    commentsList.appendChild(div);
  });
}

// --- AFFICHAGE DES PROJETS ---
async function loadProjects() {
  const snapshot = await getDocs(collection(db, "creations"));
  snapshot.forEach(docSnap=>{
    const data = docSnap.data();
    projectsData[docSnap.id] = data;

    const page = document.createElement("div");
    page.className = "album-page";
    page.dataset.id = docSnap.id;

    const h2 = document.createElement("h2");
    h2.textContent = data.name;
    const img = document.createElement("img");
    img.src = data.mainImage;
    img.className = "album-img";
    img.style.cursor = "zoom-in";

    page.appendChild(h2);
    page.appendChild(img);
    albumContainer.appendChild(page);

    img.addEventListener("click", ()=>openProjectModal(docSnap.id));
  });
}

loadProjects();

// --- MODAL ---
function openProjectModal(id){
  const data = projectsData[id];
  activeProjectId = id;

  modalTitle.textContent = data.name;
  modalImg.src = data.mainImage;
  likeCountSpan.textContent = data.likes || 0;

  miniThumbs.innerHTML="";
  data.imageUrls.forEach(url=>{
    const thumb=document.createElement("img");
    thumb.src=url;
    thumb.style.width="60px";
    thumb.style.height="60px";
    thumb.style.objectFit="cover";
    thumb.style.cursor="pointer";
    thumb.style.borderRadius="6px";
    thumb.addEventListener("click", ()=>{ modalImg.src=url; });
    miniThumbs.appendChild(thumb);
  });

  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
}

// --- FERMETURE ---
function closeAll(){
  modal.setAttribute("aria-hidden","true");
  commentPanel.classList.remove("show");
  document.body.style.overflow="";
}
modalOverlay.addEventListener("click", closeAll);
modalClose.addEventListener("click", closeAll);

// --- COMMENTAIRES ---
commentBtn.addEventListener("click",()=>{
  renderComments();
  commentPanel.classList.add("show");
});
commentClose.addEventListener("click",()=>commentPanel.classList.remove("show"));
cancelBtn.addEventListener("click",()=>commentPanel.classList.remove("show"));
commentForm.addEventListener("submit", e=>{
  e.preventDefault();
  if(!activeProjectId) return;
  const name=nameInput.value.trim()||"Anonyme";
  const text=textInput.value.trim();
  if(!text) return;
  addCommentFor(activeProjectId,{name,text,date:new Date().toISOString()});
  commentPanel.classList.remove("show");
  closeAll();
});

// --- EMOJIS ---
emojiRow.addEventListener("click", e=>{
  const btn=e.target.closest("button,span");
  if(!btn) return;
  textInput.value+=" "+btn.textContent;
  textInput.focus();
});

// --- LIKE ---
likeBtn.addEventListener("click", async ()=>{
  if(!activeProjectId) return;
  const currentLikes = projectsData[activeProjectId].likes || 0;
  projectsData[activeProjectId].likes = currentLikes+1;
  likeCountSpan.textContent = projectsData[activeProjectId].likes;
  try {
    const docRef = doc(db,"creations",activeProjectId);
    await updateDoc(docRef,{likes:projectsData[activeProjectId].likes});
  } catch(err){ console.error(err);}
});
