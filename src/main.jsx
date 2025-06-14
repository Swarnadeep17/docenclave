
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyAwgqYEEUWu0aGminZCl11c_yKYfUu-9MU",
  authDomain: "docenclave-d5a43.firebaseapp.com",
  databaseURL: "https://docenclave-d5a43-default-rtdb.firebaseio.com",
  projectId: "docenclave-d5a43",
  storageBucket: "docenclave-d5a43.firebasestorage.app",
  messagingSenderId: "13497976521",
  appId: "1:13497976521:web:fd2f8c357e3bdebfaf6f18",
  measurementId: "G-YMT8E4PJN0"
}

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
