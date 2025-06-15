
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          background: 'black', 
          color: 'white', 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1>Something went wrong</h1>
          <p>The application encountered an error. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Initialize Firebase with error handling
let firebaseInitialized = false
try {
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
  firebaseInitialized = true
  console.log('Firebase initialized successfully')
} catch (error) {
  console.warn('Firebase initialization failed:', error)
  console.log('App will continue without Firebase features')
}

// Render the app with error boundary
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
