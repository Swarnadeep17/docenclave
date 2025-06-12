// src/utils/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, increment, getDoc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

// It's crucial this file is NOT public. Use environment variables.
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- AUTHENTICATION FUNCTIONS ---

// Sign up a new user
export const signup = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  // Create a corresponding user document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    isAdmin: false, // Default to not an admin
    plan: 'FREE',
    createdAt: new Date(),
  });
  return user;
};

// Login a user
export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Logout the current user
export const logout = () => {
  return signOut(auth);
};

// Get the current user's auth state
export const onAuthStateChangeHelper = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get a user's profile from Firestore
export const getUserProfile = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? userDoc.data() : null;
};


// --- ANALYTICS FUNCTIONS ---

// ... (All your existing analytics functions: trackVisitor, trackDownload, etc.) ...
// New function to get all historical data
export const getHistoricalStats = async () => {
  try {
    const q = query(collection(db, "analytics"), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    const stats = [];
    querySnapshot.forEach((doc) => {
      stats.push({ id: doc.id, ...doc.data() });
    });
    return stats;
  } catch (error) {
    console.error("Error fetching historical stats:", error);
    return [];
  }
}