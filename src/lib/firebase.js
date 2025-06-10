// src/lib/firebase.js
import { initializeApp } from "firebase/app";

// PASTE YOUR CLEANED firebaseConfig OBJECT HERE
const firebaseConfig = {
  apiKey: "AIzaSyAwgqYEEUWu0aGminZCl11c_yKYfUu-9MU",
  authDomain: "docenclave-d5a43.firebaseapp.com",
  projectId: "docenclave-d5a43",
  storageBucket: "docenclave-d5a43.firebasestorage.app",
  messagingSenderId: "13497976521",
  appId: "1:13497976521:web:fd2f8c357e3bdebfaf6f18",
  measurementId: "G-YMT8E4PJN0"
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);