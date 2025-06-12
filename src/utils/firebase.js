import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, increment, getDoc, setDoc, collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

// IMPORTANT: Replace these with your actual Firebase config details from the Firebase console
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// --- THE DEFINITIVE FIX: SINGLETON PATTERN ---
// Check if a Firebase app has already been initialized.
// If not, initialize it. If it has, use the existing app.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

// --- AUTHENTICATION FUNCTIONS ---
export const signup = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  // Create a corresponding user document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    isAdmin: false, // Default to not an admin
    plan: 'FREE',
    createdAt: Timestamp.now(),
  });
  return user;
};

export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};

export const onAuthStateChangeHelper = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const getUserProfile = async (uid) => {
  if (!uid) return null;
  const userDocRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists() ? userDoc.data() : null;
};


// --- ANALYTICS FUNCTIONS ---
const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const trackVisitor = async () => {
    try {
        const monthKey = getCurrentMonthKey();
        const docRef = doc(db, 'analytics', monthKey);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            await setDoc(docRef, { visitors: 1, downloads: 0, tools_used: {}, created_at: Timestamp.now() });
        } else {
            await updateDoc(docRef, { visitors: increment(1) });
        }
    } catch (error) { console.error('Analytics tracking failed:', error); }
};

export const trackToolUsage = async (toolName) => {
    try {
        const monthKey = getCurrentMonthKey();
        const docRef = doc(db, 'analytics', monthKey);
        const docSnap = await getDoc(docRef);
        const updateData = { [`tools_used.${toolName}`]: increment(1) };
        if (!docSnap.exists()) {
            await setDoc(docRef, { visitors: 0, downloads: 0, tools_used: { [toolName]: 1 }, created_at: Timestamp.now() });
        } else {
            await updateDoc(docRef, updateData);
        }
    } catch (error) { console.error('Tool usage tracking failed:', error); }
};

export const trackDownload = async (toolName = 'unknown') => {
    try {
        const monthKey = getCurrentMonthKey();
        const docRef = doc(db, 'analytics', monthKey);
        const docSnap = await getDoc(docRef);
        const updateData = { downloads: increment(1), [`tools_used.${toolName}`]: increment(1) };
        if (!docSnap.exists()) {
            await setDoc(docRef, { visitors: 0, downloads: 1, tools_used: { [toolName]: 1 }, created_at: Timestamp.now() });
        } else {
            await updateDoc(docRef, updateData);
        }
    } catch (error) { console.error('Download tracking failed:', error); }
};

export const hasTrackedThisSession = () => sessionStorage.getItem('visitor_tracked') === 'true';
export const markVisitorTracked = () => sessionStorage.setItem('visitor_tracked', 'true');

export const getMonthlyStats = async () => {
    try {
        const monthKey = getCurrentMonthKey();
        const docRef = doc(db, 'analytics', monthKey);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return docSnap.data();
        return { visitors: 0, downloads: 0, tools_used: {} };
    } catch (error) {
        console.error('Failed to get stats:', error);
        return { visitors: 0, downloads: 0, tools_used: {} };
    }
};

export const getHistoricalStats = async () => {
  try {
    const q = query(collection(db, "analytics"), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    const stats = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Defensive check to ensure created_at exists and is a valid Timestamp
      if (data.created_at && typeof data.created_at.toDate === 'function') {
          stats.push({ id: doc.id, ...data });
      } else {
          // Provide a safe default for any malformed documents
          stats.push({ 
              id: doc.id, 
              ...data,
              created_at: Timestamp.now()
          });
      }
    });
    return stats;
  } catch (error) {
    console.error("Error fetching historical stats:", error);
    return [];
  }
};