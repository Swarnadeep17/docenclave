import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import PrivacyCounter from '../components/home/PrivacyCounter.jsx'
import { trackVisitor, hasTrackedThisSession, markVisitorTracked } from '../utils/analytics.js'

const Home = () => {
  useEffect(() => {
    // Track visitor on page load (only once per session)
    if (!hasTrackedThisSession()) {
      trackVisitor()
      markVisitorTracked()
    }
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold text-dark-text-primary mb-6 leading-tight">
            Process Documents
            <span className="block text-dark-text-muted">Securely</span>
          </h2>
          <p className="text-dark-text-secondary mb-12 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            All processing happens in your browser. Your files never leave your device. 
            No uploads, no tracking, no compromises.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/tools/pdf/merge" className="bg-dark-text-primary text-dark-primary px-8 py-4 rounded-lg font-semibold hover:bg-dark-text-secondary transition-colors">
              Start Processing
            </Link>
            <Link to="/tools/pdf/merge" className="border border-dark-border text-dark-text-primary px-8 py-4 rounded-lg font-semibold hover:bg-dark-tertiary transition-colors">
              View Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy Counter */}
      <PrivacyCounter />

      {/* Tools Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-dark-text-primary mb-4">
            Available Tools
          </h3>
          <p className="text-dark-text-secondary max-w-2xl mx-auto">
            Professional-grade document processing tools that work entirely in your browser
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link to="/tools/pdf/merge" className="bg-dark-secondary p-8 rounded-xl border border-dark-border hover:bg-dark-tertiary transition-all duration-300 group">
            <div className="text-4xl mb-4">📄</div>
            <h4 className="text-xl font-semibold text-dark-text-primary mb-3">PDF Merge</h4>
            <p className="text-dark-text-secondary mb-4">
              Combine multiple PDF files into a single document with full control over order
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Available</span>
            </div>
          </Link>
          
          <div className="bg-dark-secondary p-8 rounded-xl border border-dark-border opacity-60">
            <div className="text-4xl mb-4">✂️</div>
            <h4 className="text-xl font-semibold text-dark-text-primary mb-3">PDF Split</h4>
            <p className="text-dark-text-secondary mb-4">
              Extract specific pages or split PDF into multiple files
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-dark-tertiary text-dark-text-secondary px-2 py-1 rounded">Coming Soon</span>
            </div>
          </div>
          
          <div className="bg-dark-secondary p-8 rounded-xl border border-dark-border opacity-60">
            <div className="text-4xl mb-4">🗜️</div>
            <h4 className="text-xl font-semibold text-dark-text-primary mb-3">PDF Compress</h4>
            <p className="text-dark-text-secondary mb-4">
              Reduce PDF file size while maintaining quality
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs bg-dark-tertiary text-dark-text-secondary px-2 py-1 rounded">Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-dark-secondary py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-dark-text-primary mb-4">
              Why Choose DocEnclave
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-5xl mb-6">🔒</div>
              <h4 className="text-xl font-semibold text-dark-text-primary mb-3">100% Private</h4>
              <p className="text-dark-text-secondary">
                Files never leave your device. Complete client-side processing ensures maximum privacy.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-6">⚡</div>
              <h4 className="text-xl font-semibold text-dark-text-primary mb-3">Lightning Fast</h4>
              <p className="text-dark-text-secondary">
                No upload delays. Process documents instantly without waiting for server responses.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-6">🌐</div>
              <h4 className="text-xl font-semibold text-dark-text-primary mb-3">Works Offline</h4>
              <p className="text-dark-text-secondary">
                Once loaded, tools work without internet. Perfect for sensitive environments.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Home