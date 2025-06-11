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
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">DocEnclave</h1>
          <p className="text-gray-300">Secure Document Processing</p>
        </div>
      </header>
      
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-black mb-6">
              Process Documents
              <span className="block text-gray-600">Securely</span>
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
              All processing happens in your browser. Your files never leave your device.
            </p>
          </div>
        </section>

        {/* Privacy Counter - Hero Integration */}
        <PrivacyCounter />

        {/* Tools Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-black mb-2">PDF Tools</h3>
              <p className="text-gray-600">Merge, split, compress PDF files</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-black mb-2">Image Tools</h3>
              <p className="text-gray-600">Resize, compress, convert images</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-black mb-2">Coming Soon</h3>
              <p className="text-gray-600">More tools in development</p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-black text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 DocEnclave. Privacy-first document processing.</p>
        </div>
      </footer>
    </div>
  )
}

export default App