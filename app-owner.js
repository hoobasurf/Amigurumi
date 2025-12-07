window.saveCreation = async function() {
  const name = document.getElementById("name").value.trim();
  const files = Array.from(document.getElementById("photo").files);
  const status = document.getElementById("status");

  if (!name || files.length === 0) {
    status.innerHTML = "⚠️ Remplis le nom et choisis au moins une image.";
    return;
  }

  status.innerHTML = "📤 Début upload…";

  const uploadedUrls = [];
  for (let file of files) {
    try {
      const imageRef = ref(storage, "images/" + Date.now() + "_" + file.name);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      uploadedUrls.push(url);
      status.innerHTML += `<br>✅ ${file.name} uploadé`;
    } catch (err) {
      status.innerHTML += `<br>❌ ${file.name} : ${err.message}`;
      console.error(err);
    }
  }

  if (uploadedUrls.length > 0) {
    status.innerHTML += "<br>📝 Enregistrement dans Firestore…";
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
