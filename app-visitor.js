/* --- MODE ALBUM VISITEUR (version finale) --- */

// cacher boutons prev/next
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

let activeImageKey = null;

/* --- LOCALSTORAGE COMMENTAIRES --- */
const LS_KEY = "comments_amigurumi_album";

function getAllComments() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch {
    return {};
  }
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

/* --- RENDU COMMENTAIRES --- */
function renderComments() {
  commentsList.innerHTML = "";
  const arr = getCommentsFor(activeImageKey);

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

/* --- OUVERTURE ZOOM IMAGE --- */
const albumImgs = document.querySelectorAll(".album-img");

albumImgs.forEach(img => {
  img.style.cursor = "zoom-in";

  img.addEventListener("click", () => {
    const src = img.src;
    const title =
      img.closest(".album-page")?.querySelector("h2")?.textContent || "Création";

    activeImageKey = src;
    modalImg.src = src;
    modalTitle.textContent = title;

    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });
});

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
  renderComments();
  commentPanel.classList.add("show");
});

commentClose.addEventListener("click", () => {
  commentPanel.classList.remove("show");
});

cancelBtn.addEventListener("click", () => {
  commentPanel.classList.remove("show");
});

/* --- VALIDATION COMMENTAIRE --- */
commentForm.addEventListener("submit", e => {
  e.preventDefault();
  if (!activeImageKey) return;

  const name = nameInput.value.trim() || "Anonyme";
  const text = textInput.value.trim();
  if (!text) return;

  addCommentFor(activeImageKey, {
    name,
    text,
    date: new Date().toISOString()
  });

  commentPanel.classList.remove("show");
  closeAll();
});

/* --- EMOJIS --- */
emojiRow.addEventListener("click", e => {
  const btn = e.target.closest("button, span");
  if (!btn) return;
  textInput.value += " " + btn.textContent;
  textInput.focus();
});
