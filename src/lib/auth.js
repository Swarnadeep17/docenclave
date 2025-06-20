import { auth, db } from './firebase.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    signInWithPopup,
    GoogleAuthProvider,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "firebase/auth";
import { ref, set, get, update, serverTimestamp } from "firebase/database";

const googleProvider = new GoogleAuthProvider();

let currentUser = null;
let loading = true;
const listeners = new Set();

const fetchRoleAndDetails = async (firebaseUser) => {
    if (!firebaseUser) return null;
    const userRef = ref(db, `users/${firebaseUser.uid}`);
    const snapshot = await get(userRef);
    const dbUser = snapshot.val() || {};
    
    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        phoneNumber: firebaseUser.phoneNumber,
        role: dbUser.role || 'free',
        promoCodeRedeemed: dbUser.promoCodeRedeemed || null,
    };
};

onAuthStateChanged(auth, async (firebaseUser) => {
    loading = true;
    currentUser = await fetchRoleAndDetails(firebaseUser);
    loading = false;
    listeners.forEach(listener => listener(currentUser));
});

export const authManager = {
    getCurrentUser: () => currentUser,
    isLoading: () => loading,

    subscribe: (callback) => {
        listeners.add(callback);
        callback(currentUser); // Immediately notify
        return () => listeners.delete(callback);
    },

    loginWithEmail: (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    },

    signupWithEmail: async (email, password, promoCode) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        let newRole = 'free';
        let promoCodeRedeemed = null;

        if (promoCode) {
            const codeRef = ref(db, `promoCodes/${promoCode}`);
            const codeSnap = await get(codeRef);

            if (codeSnap.exists()) {
                const codeData = codeSnap.val();
                if (!codeData.redeemed && (!codeData.expiresAt || Date.now() < codeData.expiresAt)) {
                    newRole = codeData.targetRole || 'free';
                    promoCodeRedeemed = promoCode;
                    await update(codeRef, {
                        redeemed: true,
                        redeemedBy: cred.user.uid,
                        redeemedAt: serverTimestamp(),
                    });
                } else {
                    throw new Error("Promo code is invalid or has already been used.");
                }
            } else {
                throw new Error("Promo code not found.");
            }
        }
        await set(ref(db, `users/${cred.user.uid}`), {
            email,
            role: newRole,
            promoCodeRedeemed,
        });
        return cred;
    },

    loginWithGoogle: async () => {
        const result = await signInWithPopup(auth, googleProvider);
        const userRef = ref(db, `users/${result.user.uid}`);
        const snap = await get(userRef);
        if (!snap.exists()) {
            await set(userRef, {
                email: result.user.email,
                role: 'free',
            });
        }
        return result;
    },
    
    startPhoneLogin: (phone, containerId) => {
        // Ensure recaptcha is only initialized once
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
        }
        return signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
    },

    logout: () => {
        if(window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
        }
        return signOut(auth);
    },
};