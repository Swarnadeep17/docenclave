import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark-primary text-dark-text-primary">
      {/* Header - Made more compact with reduced padding (py-4) */}
      <header className="bg-dark-secondary border-b border-dark-border sticky top-0 z-40 backdrop-blur-sm bg-opacity-70">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16"> {/* Use fixed height for consistency */}
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
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-dark-text-secondary hover:text-dark-text-primary transition-colors text-sm font-medium">
                Home
              </Link>
              <a href="#features-comparison" className="hidden md:inline text-dark-text-secondary hover:text-dark-text-primary transition-colors text-sm font-medium">
                Features
              </a>
              <button className="hidden sm:inline bg-dark-tertiary hover:bg-gray-700 text-dark-text-primary px-4 py-2 rounded-lg transition-colors border border-dark-border text-sm font-medium">
                Premium
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main>{children}</main>
      
      {/* Footer - Made more compact with reduced padding (py-8) */}
      <footer className="bg-dark-primary border-t border-dark-border py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h4 className="text-lg font-bold text-dark-text-primary mb-1">DocEnclave</h4>
            <p className="text-dark-text-muted mb-6 text-sm">Privacy-first document processing</p>
            
            <div className="flex justify-center space-x-6 mb-6">
              <a href="#tools-hub" className="text-dark-text-secondary hover:text-dark-text-primary cursor-pointer transition-colors text-sm">
                Tools
              </a>
              <a href="#features-comparison" className="text-dark-text-secondary hover:text-dark-text-primary cursor-pointer transition-colors text-sm">
                Features
              </a>
              <span className="text-dark-text-secondary hover:text-dark-text-primary cursor-pointer transition-colors text-sm">Support</span>
            </div>
            
            <p className="text-dark-text-muted text-xs">
              © 2024 DocEnclave. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;