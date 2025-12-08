import { db, storage } from "./firebase.js";
import { addDoc, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// Vérification Firebase
console.log("Firebase chargé ?", db ? "OUI" : "NON");

// --- AJOUTER UNE CRÉATION ---
const btn = document.getElementById("add");
const nameInput = document.getElementById("name");
const photoInput = document.getElementById("photo");
const ownerList = document.getElementById("owner-list");

btn.onclick = async () => {
    const name = nameInput.value.trim();
    const file = photoInput.files[0];

    if (!name || !file) {
        alert("Merci de remplir le nom et choisir une image !");
        return;
    }

    // Upload dans Firebase Storage
    const storageRef = ref(storage, "photos/" + Date.now() + "-" + file.name);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // Ajout dans Firestore
    await addDoc(collection(db, "creations"), {
        name,
        imageUrl: url,
        createdAt: Date.now()
    });

    // Reset inputs
    nameInput.value = "";
    photoInput.value = "";

    loadCreations();
};

// --- CHARGER LA LISTE ---
async function loadCreations() {
    const snap = await getDocs(collection(db, "creations"));
    ownerList.innerHTML = "";

    snap.docs.forEach(docu => {
        const div = document.createElement("div");
        div.className = "owner-item";

        div.innerHTML = `
            <img src="${docu.data().imageUrl}" class="owner-thumb">
            <span>${docu.data().name}</span>
            <button class="delete-btn">🗑</button>
        `;

        // Suppression
        div.querySelector(".delete-btn").onclick = async () => {
            await deleteDoc(doc(db, "creations", docu.id));
            loadCreations();
        };

        ownerList.appendChild(div);
    });
}

// Charge la liste au démarrage
loadCreations();
