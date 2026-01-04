import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Ganti dengan konfigurasi Firebase kamu sendiri
// Ambil dari Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyBKct0HrDPG_D_KKxecHyG1uaBjbEh1sbA",
  authDomain: "content-flow-c2977.firebaseapp.com",
  projectId: "content-flow-c2977",
  storageBucket: "content-flow-c2977.firebasestorage.app",
  messagingSenderId: "350187640426",
  appId: "1:350187640426:web:26ecce3b241913b8789c13"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);