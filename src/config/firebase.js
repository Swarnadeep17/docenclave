import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

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
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
