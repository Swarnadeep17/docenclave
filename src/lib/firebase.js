import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// NOTE: This configuration is publicly visible and intended for client-side use.
// Security is enforced by Firebase Security Rules in `database.rules.json`.
const firebaseConfig = {
  apiKey: "AIzaSyAwgqYEEUWu0aGminZCl11c_yKYfUu-9MU",
  authDomain: "docenclave-d5a43.firebaseapp.com",
  databaseURL: "https://docenclave-d5a43-default-rtdb.firebaseio.com",
  projectId: "docenclave-d5a43",
  storageBucket: "docenclave-d5a43.firebasestorage.app",
  messagingSenderId: "13497976521",
  appId: "1:13497976521:web:fd2f8c357e3bdebfaf6f18",
  measurementId: "G-YMT8E4PJN0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };