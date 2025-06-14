// Firebase Configuration
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
    },
    supportedFileTypes: {
        pdf: ['.pdf'],
        image: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
        document: ['.doc', '.docx', '.txt', '.rtf']
    }
};

// Export configurations
window.firebaseConfig = firebaseConfig;
window.appConfig = appConfig;