<!-- À mettre dans owner.html avant owner2.js -->
<script src="https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js"></script>
<script>
  // Configuration Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyDbkbhXdZO20XdQpg3GhShFnqBVSpTdJKQ",
    authDomain: "amigurumi-2e7df.firebaseapp.com",
    projectId: "amigurumi-2e7df",
    storageBucket: "amigurumi-2e7df.appspot.com",
    messagingSenderId: "92443765428",
    appId: "1:92443765428:web:23e5aab383547b6f8885e1"
  };

  // Initialisation Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const storage = firebase.storage();
</script>
