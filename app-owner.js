import { db } from "./firebase.js";

window.saveCreation = async function() {
  const name = document.getElementById("name").value.trim();
  const files = Array.from(document.getElementById("photo").files);
  const status = document.getElementById("status");

  if (!name || files.length === 0) {
    status.innerHTML = "⚠️ Remplis le nom et choisis au moins une image.";
    return;
  }

  status.innerHTML = "📤 Début upload via Netlify Function…";
  const uploadedUrls = [];

  for (let file of files) {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    await new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64Data = reader.result.split(",")[1]; // enlève data:image/...
          const res = await fetch("/.netlify/functions/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: file.name, fileBase64: base64Data })
          });
          const data = await res.json();
          if (data.url) {
            uploadedUrls.push(data.url);
            status.innerHTML += `<br>✅ ${file.name} uploadé`;
          } else {
            status.innerHTML += `<br>❌ ${file.name} : Erreur function`;
          }
          resolve();
        } catch (err) {
          status.innerHTML += `<br>❌ ${file.name} : ${err.message}`;
          reject(err);
        }
      };
      reader.onerror = err => reject(err);
    });
  }

  if (uploadedUrls.length > 0) {
    status.innerHTML += "<br>📝 Enregistrement dans Firestore…";
    const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js");

    await addDoc(collection(db, "creations"), {
      name,
      imageUrls: uploadedUrls,
      mainImage: uploadedUrls[0],
      public: true,
      createdAt: serverTimestamp()
    });

    status.innerHTML += "<br>🎉 Création ajoutée !";
  }
};
