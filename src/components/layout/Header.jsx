import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-900/80 backdrop-blur-md border-b border-white/10' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 flex items-center justify-center bg-cyan-500 rounded-lg">
              <span className="text-xl">📄</span>
            </div>
            <span className="text-xl font-bold">
              Doc<span className="text-cyan-400">Enclave</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`relative transition-colors duration-300 ${
                  location.pathname === item.path 
                    ? 'text-cyan-400' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.name}
                {location.pathname === item.path && (
                  <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-cyan-400 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/login" 
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all"
            >
              Get Started
            </Link>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="text-2xl">{isMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 animate-slide-down">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-white/10 text-cyan-400'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 mt-2 border-t border-white/10">
                <Link 
                  to="/login" 
                  className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="block mx-4 mt-3 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-center rounded-lg font-semibold"
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