
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './auth/AuthModal'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { user, userTier, logout } = useAuth()

  return (
    <nav className="bg-black/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <i className="fas fa-file-alt text-black text-sm"></i>
            </div>
            <span className="text-2xl font-bold text-white">
              Doc<span className="text-gray-400">Enclave</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/tools" 
              className="text-gray-300 hover:text-white font-medium transition-colors flex items-center"
            >
              <i className="fas fa-tools mr-2"></i>
              Tools
            </Link>
            <Link 
              to="/pricing" 
              className="text-gray-300 hover:text-white font-medium transition-colors"
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              className="text-gray-300 hover:text-white font-medium transition-colors"
            >
              About
            </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <i className="fas fa-user text-primary-600 text-sm"></i>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-medium text-sm">
                      {user.displayName || 'Anonymous User'}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">
                      {userTier} Plan
                    </span>
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="text-gray-400 hover:text-white p-2"
                  title="Sign Out"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-gray-300 hover:text-white font-medium transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white font-medium hover:bg-white/20 transition-all"
                >
                  <i className="fas fa-user-plus mr-2"></i>
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-white`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/tools" 
                className="text-gray-300 hover:text-white font-medium transition-colors flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-tools mr-2"></i>
                Tools
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-300 hover:text-white font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className="text-gray-300 hover:text-white font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-4 border-t border-white/10">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <i className="fas fa-user text-primary-600 text-sm"></i>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">
                          {user.displayName || 'Anonymous User'}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">
                          {userTier} Plan
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={logout}
                      className="text-gray-400 hover:text-white p-2"
                    >
                      <i className="fas fa-sign-out-alt"></i>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <button 
                      onClick={() => setIsAuthModalOpen(true)}
                      className="text-left text-gray-300 hover:text-white font-medium transition-colors"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white font-medium hover:bg-white/20 transition-all text-left"
                    >
                      <i className="fas fa-user-plus mr-2"></i>
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </nav>
  )
}

export default Navbar
