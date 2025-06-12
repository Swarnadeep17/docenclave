import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js'; // Import the useAuth hook
import { logout } from '../../utils/firebase.js';

const Layout = ({ children }) => {
  // Use our auth hook to get the current user and loading state
  const { currentUser, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Navigate to home after logout
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // If not on the homepage, navigate there first then scroll
      navigate('/');
      setTimeout(() => {
        document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };


  return (
    <div className="min-h-screen bg-dark-primary text-dark-text-primary">
      {/* Header */}
      <header className="bg-dark-secondary/70 border-b border-dark-border sticky top-0 z-40 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-dark-text-primary">
                  DocEnclave
                </h1>
                <p className="hidden sm:block text-dark-text-muted text-xs md:text-sm">
                  Secure Document Processing
                </p>
              </div>
            </Link>
            
            {/* THIS IS THE CRITICAL FIX: Don't render the dynamic part of the header until auth is loaded */}
            {!loading && (
              <div className="flex items-center space-x-4 md:space-x-6">
                <button onClick={() => scrollToElement('tools-hub')} className="text-dark-text-secondary hover:text-dark-text-primary transition-colors text-sm font-medium">
                  Tools
                </button>
                <button onClick={() => scrollToElement('features-comparison')} className="hidden md:inline text-dark-text-secondary hover:text-dark-text-primary transition-colors text-sm font-medium">
                  Features
                </button>

                {currentUser ? (
                  // If user is logged in
                  <>
                    <Link to="/account" className="flex items-center space-x-2 text-dark-text-secondary hover:text-dark-text-primary">
                       <span className="text-xl">👤</span> 
                       <span className="hidden md:inline text-sm font-medium">Account</span>
                    </Link>
                    <button onClick={handleLogout} className="hidden sm:inline text-dark-text-secondary hover:text-red-400 transition-colors text-sm font-medium">Logout</button>
                  </>
                ) : (
                  // If user is logged out
                  <div className="flex items-center space-x-3">
                     <Link to="/login" className="text-dark-text-secondary hover:text-dark-text-primary transition-colors text-sm font-medium">
                        Log In
                    </Link>
                    <Link to="/signup" className="bg-dark-tertiary hover:bg-gray-700 text-dark-text-primary px-4 py-2 rounded-lg transition-colors border border-dark-border text-sm font-medium">
                        Sign Up
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main>{children}</main>
      
      {/* Footer */}
      <footer className="bg-dark-primary border-t border-dark-border py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h4 className="text-lg font-bold text-dark-text-primary mb-1">DocEnclave</h4>
            <p className="text-dark-text-muted mb-6 text-sm">Privacy-first document processing</p>
            <div className="flex justify-center space-x-6 mb-6">
              <button onClick={() => scrollToElement('tools-hub')} className="text-dark-text-secondary hover:text-dark-text-primary cursor-pointer transition-colors text-sm">Tools</button>
              <button onClick={() => scrollToElement('features-comparison')} className="text-dark-text-secondary hover:text-dark-text-primary cursor-pointer transition-colors text-sm">Features</button>
              <span className="text-dark-text-secondary hover:text-dark-text-primary cursor-pointer transition-colors text-sm">Support</span>
            </div>
            <p className="text-dark-text-muted text-xs">© 2024 DocEnclave. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;