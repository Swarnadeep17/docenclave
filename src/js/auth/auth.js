class AuthManager {
    constructor() {
        this.currentUser = null;
    }

    async signUp(email, password, displayName) {
        try {
            const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update profile
            await user.updateProfile({
                displayName: displayName
            });

            // Create user document in Firestore
            await window.db.collection('users').doc(user.uid).set({
                email: email,
                displayName: displayName,
                plan: 'free',
                role: 'user',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Track signup
            window.analytics.logEvent('sign_up', {
                method: 'email'
            });

            return user;
        } catch (error) {
            console.error('Sign up error:', error);
            throw new Error(this.getAuthErrorMessage(error.code));
        }
    }

    async signIn(email, password) {
        try {
            const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update last login
            await window.db.collection('users').doc(user.uid).update({
                lastLoginAt: firebase.fire