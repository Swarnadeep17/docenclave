
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './auth/AuthModal'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { user, userTier, logout } = useAuth()

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-file-alt text-white text-sm"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Doc<span className="text-primary-600">Enclave</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/tools" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors flex items-center"
            >
              <i className="fas fa-tools mr-2"></i>
              Tools
            </Link>
            <Link 
              to="/pricing" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
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
                    <span className="text-gray-700 font-medium text-sm">
                      {user.displayName || 'Anonymous User'}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {userTier} Plan
                    </span>
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700 p-2"
                  title="Sign Out"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn-primary"
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
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-gray-700`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/tools" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="fas fa-tools mr-2"></i>
                Tools
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-4 border-t border-gray-200">
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
                        <span className="text-gray-700 font-medium text-sm">
                          {user.displayName || 'Anonymous User'}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {userTier} Plan
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={logout}
                      className="text-gray-500 hover:text-gray-700 p-2"
                    >
                      <i className="fas fa-sign-out-alt"></i>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <button 
                      onClick={() => setIsAuthModalOpen(true)}
                      className="text-left text-gray-700 hover:text-primary-600 font-medium transition-colors"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => setIsAuthModalOpen(true)}
                      className="btn-primary text-left"
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
