// src/components/layout/Layout.jsx
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import Logo from '../shared/Logo';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const scrollToTools = (e) => {
    e.preventDefault();
    const toolsSection = document.getElementById('tools');
    if (toolsSection) {
      window.scrollTo({
        top: toolsSection.offsetTop - 80,
        behavior: 'smooth'
      });
    } else if (location.pathname !== '/') {
      // Navigate to homepage then scroll to tools
      window.location.href = '/#tools';
    } else {
      // If on homepage but tools section doesn't exist, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="fixed w-full z-50 bg-gradient-to-b from-black/70 to-transparent backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <Logo className="h-8 w-auto" />
              <span className="ml-2 text-xl font-semi bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
                DocEnclave
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/tools"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                Tools
              </Link>
              <Link
                to="/features"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                Features
              </Link>
              <Link
                to="/enterprise"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                Enterprise
              </Link>
              <Link
                to="/pricing"
                className="text-gray-400 hover:text-cyan-400 transition-colors"
              >
                Pricing
              </Link>
            </nav>
            
            {/* Account Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg font-medium bg-gray-800 hover:bg-gray-700 transition-colors text-gray-200"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all duration-300"
              >
                Get Started
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-400 hover:text-white focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-b border-gray-800">
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <Link
                to="/tools"
                className="text-gray-400 hover:text-cyan-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tools
              </Link>
              <Link
                to="/features"
                className="text-gray-400 hover:text-cyan-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/enterprise"
                className="text-gray-400 hover:text-cyan-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Enterprise
              </Link>
              <Link
                to="/pricing"
                className="text-gray-400 hover:text-cyan-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              
              <div className="pt-2 border-t border-gray-800 flex flex-col space-y-4">
                <Link
                  to="/login"
                  className="text-white text-center py-2 rounded-lg bg-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-white text-center py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-grow pt-16">{children}</main>

      {/* Footer */}
      <footer className="pt-16 pb-8 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center">
                <Logo className="h-8 w-auto" />
                <span className="ml-2 text-xl font-semi bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
                  DocEnclave
                </span>
              </div>
              <p className="mt-4 text-gray-500 text-sm max-w-xs">
                Privacy-first document processing tools that keep your sensitive content protected.
              </p>
            </div>
            
            <div>
              <h4 className="text-gray-300 text-lg font-semibold mb-4">Products</h4>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/tools/pdf-anonymizer" 
                    className="text-gray-500 hover:text-cyan-400 transition-colors text-sm"
                  >
                    PDF Anonymizer
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/tools/secure-redaction" 
                    className="text-gray-500 hover:text-cyan-400 transition-colors text-sm"
                  >
                    Secure Redaction
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/tools/metadata-scrubber" 
                    className="text-gray-500 hover:text-cyan-400 transition-colors text-sm"
                  >
                    Metadata Scrubber
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-gray-300 text-lg font-semib极 mb-4">Resources</h4>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/privacy-guide" 
                    className="text-gray-500 hover:text-cyan-400 transition-colors text-sm"
                  >
                    Privacy Guide
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/developers" 
                    className="text-gray-500 hover:text-cyan-400 transition-colors text-sm"
                  >
                    Developer API
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/docs" 
                    className="text-gray-500 hover:text-cyan-400 transition-colors text-sm"
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-gray-300 text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/about" 
                    className="text-gray-500 hover:text-cyan-400 transition-colors text-sm"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/security" 
                    className="text-gray-500 hover:text-cyan-400 transition-colors text-sm"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <a 
                    onClick={scrollToTools}
                    className="text-gray-500 hover:text-cyan-400 transition-colors text-sm cursor-pointer"
                  >
                    Tools
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-900 mt-12 pt-8 text-center text-sm text-gray-600">
            <div>© {new Date().getFullYear()} DocEnclave. All rights reserved.</div>
            <div className="mt-2">
              <Link to="/privacy" className="hover:text-cyan-400 transition-colors mx-2">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-cyan-400 transition-colors mx-2">Terms of Service</Link>
              <Link to="/cookies" className="hover:text-cyan-400 transition-colors mx-2">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
