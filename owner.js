import { db, storage } from "./firebase.js";
import {
  addDoc, collection, getDocs, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

document.getElementById("add").onclick = async () => {
  const name = document.getElementById("name").value;
  const file = document.getElementById("photo").files[0];

  if (!name || !file) return;

  const storageRef = ref(storage, "photos/" + file.name);
  await uploadBytes(storageRef, file);

  const url = await getDownloadURL(storageRef);

  await addDoc(collection(db, "creations"), {
    name,
    imageUrl: url,
    createdAt: Date.now()
  });

  loadCreations();
};

async function loadCreations() {
  const snap = await getDocs(collection(db, "creations"));
  const list = document.getElementById("owner-list");
  list.innerHTML = "";

  snap.docs.forEach(docu => {
    const div = document.createElement("div");
    div.className = "owner-item";

    div.innerHTML = `
      <img src="${docu.data().imageUrl}" class="owner-thumb">
      <span>${docu.data().name}</span>
      <button class="delete-btn">🗑</button>
    `;

    div.querySelector(".delete-btn").onclick = () => {
      deleteDoc(doc(db, "creations", docu.id));
      loadCreations();
    };

    list.appendChild(div);
  });
}

loadCreations();
