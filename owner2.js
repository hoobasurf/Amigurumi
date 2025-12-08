// --- IMPORTS ---
import { db, storage } from "./firebase.js";
import { addDoc, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("add");
    const nameInput = document.getElementById("name");
    const photoInput = document.getElementById("photo");
    const ownerList = document.getElementById("owner-list");

    if (!btn) {
        alert("Bouton NON trouvé !");
        return;
    }

    console.log("Bouton trouvé ! Firebase chargé ?", db ? "OUI" : "NON");

    // --- AJOUTER UNE CRÉATION ---
    btn.onclick = async () => {
        const name = nameInput.value.trim();
        const file = photoInput.files[0];

        if (!name || !file) {
            alert("Merci de remplir le nom et choisir une image !");
            return;
        }

        try {
            // Upload image dans Firebase Storage
            const storageRef = ref(storage, "photos/" + Date.now() + "-" + file.name);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            // Ajouter dans Firestore
            await addDoc(collection(db, "creations"), {
                name,
                imageUrl: url,
                createdAt: Date.now()
            });

            // Reset inputs
            nameInput.value = "";
            photoInput.value = "";

            loadCreations();

        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'ajout de la création !");
        }
    };

    // --- CHARGER LA LISTE ---
    async function loadCreations() {
        try {
            const snap = await getDocs(collection(db, "creations"));
            ownerList.innerHTML = "";

            snap.docs.forEach(docu => {
                const data = docu.data();
                const div = document.createElement("div");
                div.className = "owner-item";

                div.innerHTML = `
                    <img src="${data.imageUrl}" class="owner-thumb">
                    <span>${data.name}</span>
                    <button class="delete-btn">🗑</button>
                `;

                div.querySelector(".delete-btn").onclick = async () => {
                    await deleteDoc(doc(db, "creations", docu.id));
                    loadCreations();
                };

                ownerList.appendChild(div);
            });
        } catch (err) {
            console.error(err);
            alert("Erreur lors du chargement des créations !");
        }
    }

    // Charge la liste au démarrage
    loadCreations();

});
