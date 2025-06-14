// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAwgqYEEUWu0aGminZCl11c_yKYfUu-9MU",
    authDomain: "docenclave-d5a43.firebaseapp.com",
    projectId: "docenclave-d5a43",
    storageBucket: "docenclave-d5a43.appspot.com",
    messagingSenderId: "13497976521",
    appId: "1:13497976521:web:YOUR_APP_ID", // You'll get this when you add web app
    measurementId: "G-YOUR_MEASUREMENT_ID" // You'll get this when you enable Analytics
};

// App Configuration
const appConfig = {
    name: 'DocEnclave',
    version: '1.0.0',
    maxFileSize: {
        free: 20 * 1024 * 1024, // 20MB in bytes
        premium: 100 * 1024 * 1024 // 100MB in bytes
    },
    pricing: {
        premium: {
            monthly: 9.99,
            currency: 'USD' // Will be dynamic based on user location
        }
    },
    features: {
        free: ['Basic tools', '20MB file limit', 'Standard processing'],
        premium: ['All tools', '100MB file limit', 'Priority processing', 'Advanced features']
    }
};

// Export configurations
window.firebaseConfig = firebaseConfig;
window.appConfig = appConfig;