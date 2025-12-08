// --- IMPORTS ---
import { db, storage } from "./firebase.js";
import { addDoc, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// --- ATTENDRE QUE LE BOUTON EXISTE ---
function waitForButton(callback) {
    const btn = document.getElementById("add");
    if(btn){
        callback(btn);
    } else {
        setTimeout(() => waitForButton(callback), 50);
    }
}

waitForButton((btn) => {
    const nameInput = document.getElementById("name");
    const photoInput = document.getElementById("photo");
    const ownerList = document.getElementById("owner-list");

    console.log("Bouton trouvé ! Firebase chargé ?", db ? "OUI" : "NON");

    btn.onclick = async () => {
        const name = nameInput.value.trim();
        const file = photoInput.files[0];

        if (!name || !file) {
            alert("Merci de remplir le nom et choisir une image !");
            return;
        }

        try {
            const storageRef = ref(storage, "photos/" + Date.now() + "-" + file.name);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            await addDoc(collection(db, "creations"), {
                name,
                imageUrl: url,
                createdAt: Date.now()
            });

            nameInput.value = "";
            photoInput.value = "";

            loadCreations();

        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'ajout de la création !");
        }
    };

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

    // Charge la liste dès le départ
    loadCreations();
});
