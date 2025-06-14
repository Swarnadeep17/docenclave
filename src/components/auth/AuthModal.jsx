import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const AuthModal = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signInAsAnonymous } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      onClose()
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnonymousSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      await signInAsAnonymous()
      onClose()
    } catch (error) {
      setError('Failed to continue anonymously. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 backdrop-blur-md border border-white/20 rounded-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Get Started</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-gray-300">
              Choose how you'd like to use DocEnclave
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="w-5 h-5 mr-3"
            />
            <span className="font-medium text-white">
              Continue with Google
            </span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">or</span>
            </div>
          </div>

          {/* Anonymous Sign In */}
          <button
            onClick={handleAnonymousSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <i className="fas fa-user-secret mr-3 text-gray-300"></i>
            <span className="font-medium text-white">
              Continue Anonymously
            </span>
          </button>

          {/* Feature Comparison */}
          <div className="mt-6 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg">
            <h3 className="font-semibold text-white mb-3">Account Benefits</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <i className="fas fa-check text-green-400 mr-2"></i>
                <span className="text-gray-300">Save your processed files</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check text-green-400 mr-2"></i>
                <span className="text-gray-300">Higher file size limits</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check text-green-400 mr-2"></i>
                <span className="text-gray-300">Access to more tools</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-check text-green-400 mr-2"></i>
                <span className="text-gray-300">Priority support</span>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400 mt-4">
            By continuing, you agree to our{' '}
            <a href="#" className="text-white hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-white hover:underline">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
