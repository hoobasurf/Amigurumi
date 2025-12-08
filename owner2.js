// ⚡ On suppose que firebase.js est déjà chargé dans owner.html
// et fournit db et storage

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
            // Upload dans Firebase Storage
            const storageRef = storage.ref("photos/" + Date.now() + "-" + file.name);
            await storageRef.put(file);
            const url = await storageRef.getDownloadURL();

            // Ajout dans Firestore
            await db.collection("creations").add({
                name,
                imageUrl: url,
                createdAt: Date.now()
            });

            // Reset inputs
            nameInput.value = "";
            photoInput.value = "";

            // Rafraîchir la liste
            loadCreations();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'ajout de la création !");
        }
    };

    // --- CHARGER LA LISTE ---
    async function loadCreations() {
        try {
            const snap = await db.collection("creations").get();
            ownerList.innerHTML = "";

            snap.forEach(docu => {
                const data = docu.data();
                const div = document.createElement("div");
                div.className = "owner-item";

                div.innerHTML = `
                    <img src="${data.imageUrl}" class="owner-thumb">
                    <span>${data.name}</span>
                    <button class="delete-btn">🗑</button>
                `;

                // Suppression
                div.querySelector(".delete-btn").onclick = async () => {
                    await db.collection("creations").doc(docu.id).delete();
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
