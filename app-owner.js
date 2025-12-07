import { db, storage } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

alert("✅ app-owner.js chargé !");

const saveBtn = document.getElementById("save");
const nameInput = document.getElementById("name");
const photoInput = document.getElementById("photo");
const status = document.getElementById("status");

saveBtn.onclick = saveCreation;

async function saveCreation() {
    const name = nameInput.value.trim();
    const files = Array.from(photoInput.files);

    if (!name || files.length === 0) {
        status.innerHTML = "⚠️ Remplis le nom et choisis au moins une image.";
        return;
    }

    // On prend seulement le premier fichier pour simplifier le test
    const file = files[0];

    // Renommer le fichier pour éviter caractères spéciaux
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");

    status.innerHTML = `📤 Début de l'upload…<br>⏳ Upload de ${safeName} (${file.size} bytes)…`;
    console.log("Upload démarré pour :", safeName, file.size);

    try {
        const imageRef = ref(storage, `images/${Date.now()}_${safeName}`);
        const uploadResult = await uploadBytes(imageRef, file);
        console.log("Upload terminé :", uploadResult);

        const url = await getDownloadURL(imageRef);
        console.log("URL récupérée :", url);
        status.innerHTML += `<br>✅ Upload réussi !`;

        // Enregistrement Firestore
        await addDoc(collection(db, "creations"), {
            name,
            imageUrls: [url],
            mainImage: url,
            public: true,
            createdAt: serverTimestamp()
        });

        status.innerHTML += "<br>🎉 Création ajoutée avec succès !";

        // Reset champs
        nameInput.value = "";
        photoInput.value = "";

    } catch (err) {
        console.error("Erreur upload :", err);
        status.innerHTML += `<br>❌ Erreur upload : ${err.message}`;
        alert("❌ Erreur upload : " + err.message);
    }
}
