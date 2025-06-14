import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously 
} from 'firebase/auth'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userTier, setUserTier] = useState('anonymous') // anonymous, free, premium, admin

  const auth = getAuth()
  const googleProvider = new GoogleAuthProvider()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        // Determine user tier based on user data
        if (user.isAnonymous) {
          setUserTier('anonymous')
        } else if (user.email === 'admin@docenclave.com') {
          setUserTier('admin')
        } else {
          // Check if user has premium subscription (would come from Firestore in production)
          setUserTier('free')
        }
      } else {
        setUser(null)
        setUserTier('anonymous')
      }
      setLoading(false)
    })

    return unsubscribe
  }, [auth])

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signInAsAnonymous = async () => {
    try {
      const result = await signInAnonymously(auth)
      return result.user
    } catch (error) {
      console.error('Error signing in anonymously:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const getUserLimits = () => {
    const limits = {
      anonymous: {
        maxFiles: 1,
        maxFileSize: 10, // MB
        toolsAccess: ['pdf-merge']
      },
      free: {
        maxFiles: 3,
        maxFileSize: 20, // MB
        toolsAccess: ['pdf-merge', 'pdf-split', 'image-compress']
      },
      premium: {
        maxFiles: 10,
        maxFileSize: 100, // MB
        toolsAccess: 'all'
      },
      admin: {
        maxFiles: 'unlimited',
        maxFileSize: 'unlimited',
        toolsAccess: 'all'
      }
    }
    return limits[userTier] || limits.anonymous
  }

  const value = {
    user,
    userTier,
    loading,
    signInWithGoogle,
    signInAsAnonymous,
    logout,
    getUserLimits
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
