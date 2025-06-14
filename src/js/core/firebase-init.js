// Initialize Firebase
firebase.initializeApp(window.firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// Global Firebase references
window.auth = auth;
window.db = db;
window.analytics = analytics;

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User signed in:', user.uid);
        window.currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            plan: 'free' // Will be fetched from Firestore
        };
        
        // Fetch user plan from Firestore
        db.collection('users').doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    window.currentUser.plan = doc.data().plan || 'free';
                    window.currentUser.role = doc.data().role || 'user';
                }
                updateUIForUser();
            });
    } else {
        console.log('User signed out');
        window.currentUser = null;
        updateUIForAnonymous();
    }
});

function updateUIForUser() {
    const authBtn = document.getElementById('auth-btn');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    
    if (authBtn && userMenu && userName) {
        authBtn.style.display = 'none';
        userMenu.style.display = 'flex';
        userName.textContent = window.currentUser.displayName || window.currentUser.email;
    }
}

function updateUIForAnonymous() {
    const authBtn = document.getElementById('auth-btn');
    const userMenu = document.getElementById('user-menu');
    
    if (authBtn && userMenu) {
        authBtn.style.display = 'block';
        userMenu.style.display = 'none';
    }
}

console.log('Firebase initialized successfully');