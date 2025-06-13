import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 py-10 text-gray-400 text-center border-t border-gray-800">
      <div className="container-padding mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <Link to="/" className="flex items-center space-x-2 text-white font-bold text-lg">
            <span className="material-icons">description</span>
            <span>DocEnclave</span>
          </Link>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
        <p className="text-sm">&copy; {year} DocEnclave. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
