import React, { useEffect } from 'react'
import PrivacyCounter from './components/home/PrivacyCounter.jsx'
import { trackVisitor, hasTrackedThisSession, markVisitorTracked } from './utils/analytics.js'

function App() {
  useEffect(() => {
    // Track visitor on page load (only once per session)
    if (!hasTrackedThisSession()) {
      trackVisitor()
      markVisitorTracked()
    }
  }, [])

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Header */}
      <header className="bg-dark-secondary border-b border-dark-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-dark-text-primary">
                DocEnclave
              </h1>
              <p className="text-dark-text-muted text-sm md:text-base">
                Secure Document Processing
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <span className="text-dark-text-secondary text-sm">Tools</span>
              <span className="text-dark-text-secondary text-sm">About</span>
              <button className="bg-dark-tertiary hover:bg-gray-700 text-dark-text-primary px-4 py-2 rounded-lg transition-colors border border-dark-border">
                Premium
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main>
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
              <button className="bg-dark-text-primary text-dark-primary px-8 py-4 rounded-lg font-semibold hover:bg-dark-text-secondary transition-colors">
                Start Processing
              </button>
              <button className="border border-dark-border text-dark-text-primary px-8 py-4 rounded-lg font-semibold hover:bg-dark-tertiary transition-colors">
                View Tools
              </button>
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
            <div className="bg-dark-secondary p-8 rounded-xl border border-dark-border hover:bg-dark-tertiary transition-all duration-300 group">
              <div className="text-4xl mb-4">📄</div>
              <h4 className="text-xl font-semibold text-dark-text-primary mb-3">PDF Tools</h4>
              <p className="text-dark-text-secondary mb-4">
                Merge, split, compress, and convert PDF files with enterprise-grade quality
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-dark-tertiary text-dark-text-secondary px-2 py-1 rounded">Merge</span>
                <span className="text-xs bg-dark-tertiary text-dark-text-secondary px-2 py-1 rounded">Split</span>
                <span className="text-xs bg-dark-tertiary text-dark-text-secondary px-2 py-1 rounded">Compress</span>
              </div>
            </div>
            
            <div className="bg-dark-secondary p-8 rounded-xl border border-dark-border hover:bg-dark-tertiary transition-all duration-300 group">
              <div className="text-4xl mb-4">🖼️</div>
              <h4 className="text-xl font-semibold text-dark-text-primary mb-3">Image Tools</h4>
              <p className="text-dark-text-secondary mb-4">
                Resize, compress, and convert images while maintaining optimal quality
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-dark-tertiary text-dark-text-secondary px-2 py-1 rounded">Resize</span>
                <span className="text-xs bg-dark-tertiary text-dark-text-secondary px-2 py-1 rounded">Compress</span>
                <span className="text-xs bg-dark-tertiary text-dark-text-secondary px-2 py-1 rounded">Convert</span>
              </div>
            </div>
            
            <div className="bg-dark-secondary p-8 rounded-xl border border-dark-border hover:bg-dark-tertiary transition-all duration-300 group relative overflow-hidden">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="text-xl font-semibold text-dark-text-primary mb-3">Coming Soon</h4>
              <p className="text-dark-text-secondary mb-4">
                Advanced document tools and batch processing capabilities
              </p>
              <div className="absolute top-4 right-4">
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Soon</span>
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
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-dark-primary border-t border-dark-border py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h4 className="text-xl font-bold text-dark-text-primary mb-2">DocEnclave</h4>
            <p className="text-dark-text-muted mb-6">Privacy-first document processing</p>
            
            <div className="flex justify-center space-x-8 mb-8">
              <span className="text-dark-text-secondary hover:text-dark-text-primary cursor-pointer transition-colors">Tools</span>
              <span className="text-dark-text-secondary hover:text-dark-text-primary cursor-pointer transition-colors">Privacy</span>
              <span className="text-dark-text-secondary hover:text-dark-text-primary cursor-pointer transition-colors">Support</span>
            </div>
            
            <p className="text-dark-text-muted text-sm">
              &copy; 2024 DocEnclave. Privacy-first document processing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App