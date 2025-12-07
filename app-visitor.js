import { db } from "./firebase.js";
import { collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const container = document.querySelector(".album-container");
const modal = document.getElementById("modal");
const modalOverlay = document.getElementById("modal-overlay");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalClose = document.getElementById("modal-close");
const thumbnailsDiv = document.getElementById("thumbnails");
const commentBtn = document.getElementById("modal-comment-btn");
const commentPanel = document.getElementById("comment-panel");
const commentClose = document.getElementById("comment-close");
const commentsList = document.getElementById("comments-list");
const commentForm = document.getElementById("comment-form");
const nameInput = document.getElementById("comment-name");
const textInput = document.getElementById("comment-text");
const cancelBtn = document.getElementById("comment-cancel");
const likeBtn = document.getElementById("like-btn");
const likeCount = document.getElementById("like-count");

const LS_KEY_COMMENTS = "amigurumi_comments";
const LS_KEY_LIKES = "amigurumi_likes";

function getComments(key){return JSON.parse(localStorage.getItem(LS_KEY_COMMENTS)||"{}")[key]||[];}
function saveComment(key, comment){
  const all = JSON.parse(localStorage.getItem(LS_KEY_COMMENTS)||"{}");
  if(!all[key]) all[key]=[];
  all[key].push(comment);
  localStorage.setItem(LS_KEY_COMMENTS,JSON.stringify(all));
}
function getLikes(key){return JSON.parse(localStorage.getItem(LS_KEY_LIKES)||"{}")[key]||0;}
function toggleLike(key){
  const all = JSON.parse(localStorage.getItem(LS_KEY_LIKES)||"{}");
  all[key] = all[key]?0:1;
  localStorage.setItem(LS_KEY_LIKES,JSON.stringify(all));
  return all[key];
}

async function loadProjects(){
  container.innerHTML="";
  const q = query(collection(db,"creations"),where("public","==",true),orderBy("createdAt","desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc=>{
    const data=doc.data();
    const div=document.createElement("div");
    div.className="album-page";
    const h2=document.createElement("h2");
    h2.textContent=data.name;
    div.appendChild(h2);
    const img=document.createElement("img");
    img.src=data.mainImage;
    img.className="album-img";
    div.appendChild(img);

    img.addEventListener("click",()=>{
      modalImg.src=data.mainImage;
      modalTitle.textContent=data.name;

      thumbnailsDiv.innerHTML="";
      data.images.forEach(u=>{
        const thumb=document.createElement("img");
        thumb.src=u;
        thumb.style.width="50px";
        thumb.style.height="50px";
        thumb.style.objectFit="cover";
        thumb.style.borderRadius="6px";
        thumb.style.border="2px solid #f7c6da";
        thumb.style.cursor="pointer";
        thumb.addEventListener("click",()=>{modalImg.src=u;});
        thumbnailsDiv.appendChild(thumb);
      });

      likeCount.textContent=data.likes;
      likeBtn.dataset.projectId=doc.id;

      modal.setAttribute("aria-hidden","false");
      document.body.style.overflow="hidden";
    });

    container.appendChild(div);
  });
}

modalClose.addEventListener("click",()=>{modal.setAttribute("aria-hidden","true");document.body.style.overflow="";});
modalOverlay.addEventListener("click",()=>{modal.setAttribute("aria-hidden","true");document.body.style.overflow="";});

// COMMENTAIRES
commentBtn.addEventListener("click",()=>{
  const key = modalTitle.textContent;
  commentsList.innerHTML="";
  const arr = getComments(key);
  if(!arr.length) commentsList.innerHTML="<div class='small-muted'>Aucun commentaire</div>";
  arr.slice().reverse().forEach(c=>{
    const div=document.createElement("div");
    div.innerHTML=`<div class="who">${c.name} • ${new Date(c.date).toLocaleString()}</div><div>${c.text}</div>`;
    commentsList.appendChild(div);
  });
  commentPanel.style.display="flex";
});

commentClose.addEventListener("click",()=>commentPanel.style.display="none");
cancelBtn.addEventListener("click",()=>commentPanel.style.display="none");

commentForm.addEventListener("submit",(e)=>{
  e.preventDefault();
  const key=modalTitle.textContent;
  const name=nameInput.value.trim()||"Anonyme";
  const text=textInput.value.trim();
  if(!text) return;
  saveComment(key,{name,text,date:new Date().toISOString()});
  commentPanel.style.display="none";
  nameInput.value="";
  textInput.value="";
});

// LIKE
likeBtn.addEventListener("click",()=>{
  const key=likeBtn.dataset.projectId;
  const count = getLikes(key)?0:1;
  likeCount.textContent=count;
  toggleLike(key);
});

loadProjects();
