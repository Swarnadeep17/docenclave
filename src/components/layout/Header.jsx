import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Tools', href: '/tools' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/95 backdrop-blur-md border-b border-gray-800' 
          : 'bg-transparent'
      }`}
    >
      <div className="container-padding mx-auto">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <span className="material-icons text-black text-lg md:text-xl">description</span>
            </div>
            <span className="font-bold text-xl md:text-2xl tracking-tight">
              Doc<span className="text-gray-400">Enclave</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative px-3 py-2 text-sm font-medium transition-colors duration-300 hover:text-white ${
                  location.pathname === item.href 
                    ? 'text-white' 
                    : 'text-gray-400'
                }`}
              >
                {item.name}
                {location.pathname === item.href && (
                  <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-white rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/auth" 
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-300"
            >
              Sign In
            </Link>
            <Link 
              to="/auth?mode=signup" 
              className="btn-primary text-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-900 transition-colors duration-300"
            aria-label="Toggle menu"
          >
            <span className="material-icons text-white">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800 animate-slide-down">
            <div className="py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors duration-300 ${
                    location.pathname === item.href
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-gray-800 pt-4 mt-4">
                <Link 
                  to="/auth" 
                  className="block px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg font-medium transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link 
                  to="/auth?mode=signup" 
                  className="block mx-4 mt-2 px-4 py-3 bg-white text-black text-center rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
