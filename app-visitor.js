import { db } from "./firebase.js";
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* --- MODE ALBUM VISITEUR --- */
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
if (prevBtn) prevBtn.style.display = "none";
if (nextBtn) nextBtn.style.display = "none";

/* --- ELEMENTS MODAL --- */
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

/* --- LOCALSTORAGE COMMENTAIRES --- */
const LS_KEY = "comments_amigurumi_album";
let activeProjectId = null;

function getAllComments() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } 
  catch { return {}; }
}

function saveAllComments(obj) { localStorage.setItem(LS_KEY, JSON.stringify(obj)); }
function getCommentsFor(key) { const all = getAllComments(); return all[key] || []; }
function addCommentFor(key, comment) { const all = getAllComments(); if (!all[key]) all[key]=[]; all[key].push(comment); saveAllComments(all); }

function renderComments() {
  commentsList.innerHTML = "";
  const arr = getCommentsFor(activeProjectId);
  if (!arr.length) { commentsList.innerHTML = `<div class="small-muted">Aucun commentaire</div>`; return; }
  arr.slice().reverse().forEach(c=>{
    const div=document.createElement("div");
    div.className="comment";
    div.innerHTML = `<div class="who">${c.name}<span class="small-muted"> • ${new Date(c.date).toLocaleString()}</span></div><div class="txt">${c.text}</div>`;
    commentsList.appendChild(div);
  });
}

/* --- FERMETURE MODAL --- */
function closeAll() {
  modal.setAttribute("aria-hidden","true");
  commentPanel.classList.remove("show");
  document.body.style.overflow="";
}

modalOverlay.addEventListener("click", closeAll);
modalClose.addEventListener("click", closeAll);
commentClose.addEventListener("click",()=>commentPanel.classList.remove("show"));
cancelBtn.addEventListener("click",()=>commentPanel.classList.remove("show"));
commentBtn.addEventListener("click",()=>{
  renderComments();
  commentPanel.classList.add("show");
});
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
emojiRow.addEventListener("click", e=>{
  const btn=e.target.closest("button,span");
  if(!btn) return;
  textInput.value+=" "+btn.textContent;
  textInput.focus();
});

/* --- RECUPERATION DES PROJETS FIRESTORE --- */
async function loadProjects() {
  const container = document.querySelector(".album-container");
  container.innerHTML=""; // vider container avant ajout

  const q = query(collection(db,"creations"), where("public","==",true), orderBy("createdAt","desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc=>{
    const data = doc.data();
    const projectDiv = document.createElement("div");
    projectDiv.className="album-page";
    projectDiv.dataset.id = doc.id;

    // Titre
    const h2 = document.createElement("h2");
    h2.textContent = data.name;
    projectDiv.appendChild(h2);

    // Image principale
    const img = document.createElement("img");
    img.src = data.mainImage;
    img.className="album-img";
    projectDiv.appendChild(img);

    // Clic pour ouvrir modal
    img.style.cursor="zoom-in";
    img.addEventListener("click",()=>{
      activeProjectId = doc.id;
      modalImg.src = data.mainImage;
      modalTitle.textContent = data.name;

      // miniatures
      const miniContainer = document.createElement("div");
      miniContainer.style.display="flex";
      miniContainer.style.gap="6px";
      miniContainer.style.marginTop="6px";
      data.images.forEach(url=>{
        const mini = document.createElement("img");
        mini.src = url;
        mini.style.width="50px";
        mini.style.height="50px";
        mini.style.objectFit="cover";
        mini.style.border="2px solid #f7c6da";
        mini.style.borderRadius="6px";
        mini.style.cursor="pointer";
        mini.addEventListener("click",()=>{ modalImg.src = url; });
        miniContainer.appendChild(mini);
      });

      // bouton like
      const likeBtn = document.createElement("button");
      likeBtn.textContent = "♡ " + data.likes;
      likeBtn.style.marginTop="8px";
      likeBtn.style.padding="6px 12px";
      likeBtn.style.borderRadius="8px";
      likeBtn.style.border="none";
      likeBtn.style.background="#ffffffcc";
      likeBtn.style.cursor="pointer";
      likeBtn.addEventListener("click",async()=>{
        data.likes++;
        likeBtn.textContent = "❤️ " + data.likes;
        // mettre à jour Firestore
        await db.collection("creations").doc(doc.id).update({likes: data.likes}).catch(()=>{}); 
      });

      // Supprimer miniContainer et like si déjà ajouté
      const oldMini = modalBox.querySelector(".mini-container");
      if(oldMini) oldMini.remove();
      const oldLike = modalBox.querySelector(".like-btn");
      if(oldLike) oldLike.remove();

      miniContainer.className="mini-container";
      likeBtn.className="like-btn";

      modalBox.appendChild(miniContainer);
      modalBox.appendChild(likeBtn);

      modal.setAttribute("aria-hidden","false");
      document.body.style.overflow="hidden";
    });

    container.appendChild(projectDiv);
  });
}

loadProjects();
