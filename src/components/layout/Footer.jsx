// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900/50 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center bg-cyan-500 rounded-lg">
                <span className="text-lg">📄</span>
              </div>
              <span className="text-xl font-bold">
                Doc<span className="text-cyan-400">Enclave</span>
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Advanced document processing tools that work entirely in your browser.
            </p>
            <div className="flex space-x-4">
              {['twitter', 'github', 'linkedin', 'facebook'].map((platform) => (
                <a 
                  key={platform} 
                  href="#" 
                  className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg hover:bg-cyan-500/20 transition-colors"
                >
                  <span className="sr-only">{platform}</span>
                  <span className="text-xl">{platform === 'twitter' ? '🐦' : platform === 'github' ? '🐙' : platform === 'linkedin' ? '👔' : '👍'}</span>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Tools</h3>
            <ul className="space-y-2">
              {['PDF Tools', 'Image Tools', 'Document Tools', 'All Tools'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {['About Us', 'Pricing', 'Blog', 'Careers'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Security', 'Cookie Policy'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-500">
          <p>&copy; {year} DocEnclave. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;