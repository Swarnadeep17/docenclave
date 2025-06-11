import React from 'react'
import { Link } from 'react-router-dom'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Header */}
      <header className="bg-dark-secondary border-b border-dark-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-dark-text-primary">
                DocEnclave
              </h1>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/tools" className="text-dark-text-secondary hover:text-dark-text-primary transition-colors">
                Tools
              </Link>
              <span className="text-dark-text-secondary text-sm">About</span>
              <button className="bg-dark-tertiary hover:bg-gray-700 text-dark-text-primary px-4 py-2 rounded-lg transition-colors border border-dark-border">
                Premium
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main>{children}</main>
      
      {/* Footer */}
      <footer className="bg-dark-primary border-t border-dark-border py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h4 className="text-xl font-bold text-dark-text-primary mb-2">DocEnclave</h4>
            <p className="text-dark-text-muted mb-6">Privacy-first document processing</p>
            <p className="text-dark-text-muted text-sm">
              &copy; 2024 DocEnclave. Privacy-first document processing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout