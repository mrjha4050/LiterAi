import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyA1fRqGksJrZNQs4SFl_6Re76D1X_phd3o",
    authDomain: "literai-faf05.firebaseapp.com",
    projectId: "literai-faf05",
    storageBucket: "literai-faf05.firebasestorage.app",
    messagingSenderId: "1049972555912",
    appId: "1:1049972555912:web:8a625ad34d4ce3e29f5f3d",
    measurementId: "G-0EC1KE6SXC"
  };
  
 
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  
  setPersistence(auth, browserLocalPersistence)
    .then(() => console.log('Firebase persistence set to LOCAL'))
    .catch((error) => console.error('Error setting persistence:', error));
  
  export { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged };