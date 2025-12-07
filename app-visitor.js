import { db } from "./firebase.js";
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* --- ELEMENTS --- */
const albumContainer = document.getElementById("album-container");
const modal = document.getElementById("modal");
const modalOverlay = document.getElementById("modal-overlay");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalClose = document.getElementById("modal-close");
const modalThumbnails = document.getElementById("modal-thumbnails");

const commentBtn = document.getElementById("modal-comment-btn");
const commentPanel = document.getElementById("comment-panel");
const commentClose = document.getElementById("comment-close");
const commentsList = document.getElementById("comments-list");
const commentForm = document.getElementById("comment-form");
const nameInput = document.getElementById("comment-name");
const textInput = document.getElementById("comment-text");

const likeBtn = document.getElementById("modal-like-btn");
const likeCount = document.getElementById("like-count");

let projects = [];
let activeProject = null;
const LS_KEY = "comments_amigurumi_album";

/* --- LOCALSTORAGE COMMENTS --- */
function getAllComments() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } 
  catch { return {}; }
}
function saveAllComments(obj) { localStorage.setItem(LS_KEY, JSON.stringify(obj)); }
function getCommentsFor(key) { const all = getAllComments(); return all[key] || []; }
function addCommentFor(key, comment) { const all = getAllComments(); if(!all[key]) all[key]=[]; all[key].push(comment); saveAllComments(all); }

/* --- RENDER COMMENTS --- */
function renderComments() {
  commentsList.innerHTML = "";
  const arr = getCommentsFor(activeProject.id);
  if (!arr.length) commentsList.innerHTML = "<div class='small-muted'>Aucun commentaire</div>";
  else arr.slice().reverse().forEach(c => {
    const div = document.createElement("div");
    div.innerHTML = `<div class="who">${c.name} • ${new Date(c.date).toLocaleString()}</div>
                     <div class="txt">${c.text}</div>`;
    commentsList.appendChild(div);
  });
}

/* --- LOAD PROJECTS --- */
async function loadProjects() {
  albumContainer.innerHTML = "";
  const snapshot = await getDocs(collection(db,"creations"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if(!data.public) return;
    const div = document.createElement("div");
    div.className = "album-page";
    div.style.cursor = "pointer";
    div.dataset.id = docSnap.id;

    const h2 = document.createElement("h2");
    h2.textContent = data.name;

    const img = document.createElement("img");
    img.src = data.mainImage;
    img.className = "album-img";

    div.appendChild(h2);
    div.appendChild(img);
    albumContainer.appendChild(div);

    div.addEventListener("click",()=>openModal(docSnap.id));
  });
}
loadProjects();

/* --- OPEN MODAL --- */
async function openModal(id){
  const docSnap = projects.find(p=>p.id===id) || (await getDocs(collection(db,"creations"))).docs.map(d=>({id:d.id,...d.data()})).find(d=>d.id===id);
  activeProject = docSnap;
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
  modalTitle.textContent = activeProject.name;
  modalImg.src = activeProject.mainImage;

  // Thumbnails
  modalThumbnails.innerHTML = "";
  activeProject.images.forEach(url=>{
    const thumb = document.createElement("img");
    thumb.src = url;
    thumb.style.width="50px";
    thumb.style.height="50px";
    thumb.style.objectFit="cover";
    thumb.style.border="2px solid #f7c6da";
    thumb.style.borderRadius="6px";
    thumb.style.cursor="pointer";
    thumb.addEventListener("click",()=>{ modalImg.src=url; });
    modalThumbnails.appendChild(thumb);
  });

  likeCount.textContent = activeProject.likes || 0;
}

/* --- CLOSE MODAL --- */
function closeModal(){
  modal.setAttribute("aria-hidden","true");
  commentPanel.classList.remove("show");
  document.body.style.overflow = "";
}
modalOverlay.addEventListener("click",closeModal);
modalClose.addEventListener("click",closeModal);

/* --- COMMENTS --- */
commentBtn.addEventListener("click",()=>{ renderComments(); commentPanel.classList.add("show"); });
commentClose.addEventListener("click",()=>{ commentPanel.classList.remove("show"); });
commentForm.addEventListener("submit",e=>{
  e.preventDefault();
  if(!activeProject) return;
  const name = nameInput.value.trim() || "Anonyme";
  const text = textInput.value.trim();
  if(!text) return;
  addCommentFor(activeProject.id,{name,text,date:new Date().toISOString()});
  commentPanel.classList.remove("show");
});

/* --- LIKE BUTTON --- */
likeBtn.addEventListener("click", async ()=>{
  if(!activeProject) return;
  const docRef = doc(db,"creations",activeProject.id);
  activeProject.likes = (activeProject.likes||0)+1;
  await updateDoc(docRef,{likes:activeProject.likes});
  likeCount.textContent = activeProject.likes;
});
