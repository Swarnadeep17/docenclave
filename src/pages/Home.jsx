import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PrivacyCounter from '../components/home/PrivacyCounter.jsx'
import { trackVisitor, hasTrackedThisSession, markVisitorTracked } from '../utils/analytics.js'

const ToolCategory = ({ title, icon, description, tools, isExpanded, onToggle }) => {
  return (
    <div className="bg-dark-secondary rounded-xl border border-dark-border overflow-hidden transition-all duration-300">
      <div 
        onClick={onToggle}
        className="p-8 cursor-pointer hover:bg-dark-tertiary transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl mb-4">{icon}</div>
            <h4 className="text-xl font-semibold text-dark-text-primary mb-3">{title}</h4>
            <p className="text-dark-text-secondary mb-4">{description}</p>
          </div>
          <div className={`text-2xl text-dark-text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            ⌄
          </div>
        </div>
      </div>
      
      {/* Expanded Tools Section */}
      <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-dark-border bg-dark-primary p-6">
          <h5 className="text-lg font-semibold text-dark-text-primary mb-4">Available Tools:</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool, index) => (
              <div key={index} className="flex items-center justify-between">
                {tool.available ? (
                  <Link 
                    to={tool.path}
                    className="flex-1 bg-dark-secondary p-4 rounded-lg hover:bg-dark-tertiary transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h6 className="text-dark-text-primary font-medium group-hover:text-white transition-colors">
                          {tool.name}
                        </h6>
                        <p className="text-dark-text-muted text-sm">{tool.description}</p>
                      </div>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded ml-4">
                        Available
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="flex-1 bg-dark-secondary p-4 rounded-lg opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <h6 className="text-dark-text-primary font-medium">{tool.name}</h6>
                        <p className="text-dark-text-muted text-sm">{tool.description}</p>
                      </div>
                      <span className="text-xs bg-dark-tertiary text-dark-text-secondary px-2 py-1 rounded ml-4">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const Home = () => {
  const [expandedCategory, setExpandedCategory] = useState(null)

  useEffect(() => {
    if (!hasTrackedThisSession()) {
      trackVisitor()
      markVisitorTracked()
    }
  }, [])

  const handleCategoryToggle = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  const toolCategories = [
    {
      id: 'pdf',
      title: 'PDF Tools',
      icon: '📄',
      description: 'Process and manipulate PDF files with professional-grade tools',
      tools: [
        {
          name: 'PDF Merge',
          description: 'Combine multiple PDFs into one',
          path: '/tools/pdf/merge',
          available: true
        },
        {
          name: 'PDF Split',
          description: 'Extract pages or split into multiple files',
          path: '/tools/pdf/split',
          available: true  // ← Changed from false to true
        },
        {
          name: 'PDF Compress',
          description: 'Reduce file size while maintaining quality',
          path: '/tools/pdf/compress',
          available: false
        },
        {
          name: 'PDF to Image',
          description: 'Convert PDF pages to image formats',
          path: '/tools/pdf/to-image',
          available: false
        }
      ]
    },
    {
      id: 'image',
      title: 'Image Tools',
      icon: '🖼️',
      description: 'Resize, compress, and convert images while maintaining quality',
      tools: [
        {
          name: 'Image Resize',
          description: 'Change image dimensions',
          path: '/tools/image/resize',
          available: false
        },
        {
          name: 'Image Compress',
          description: 'Reduce file size',
          path: '/tools/image/compress',
          available: false
        },
        {
          name: 'Format Convert',
          description: 'Convert between image formats',
          path: '/tools/image/convert',
          available: false
        },
        {
          name: 'Image to PDF',
          description: 'Convert images to PDF',
          path: '/tools/image/to-pdf',
          available: false
        }
      ]
    },
    {
      id: 'document',
      title: 'Document Tools',
      icon: '📝',
      description: 'Advanced document processing and conversion tools',
      tools: [
        {
          name: 'Word to PDF',
          description: 'Convert DOC/DOCX to PDF',
          path: '/tools/document/word-to-pdf',
          available: false
        },
        {
          name: 'Excel to PDF',
          description: 'Convert spreadsheets to PDF',
          path: '/tools/document/excel-to-pdf',
          available: false
        },
        {
          name: 'PowerPoint to PDF',
          description: 'Convert presentations to PDF',
          path: '/tools/document/ppt-to-pdf',
          available: false
        },
        {
          name: 'Text to PDF',
          description: 'Create PDF from plain text',
          path: '/tools/document/text-to-pdf',
          available: false
        }
      ]
    }
  ]

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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button 
              onClick={() => handleCategoryToggle('pdf')}
              className="bg-dark-text-primary text-dark-primary px-8 py-4 rounded-lg font-semibold hover:bg-dark-text-secondary transition-colors"
            >
              Start Processing
            </button>
            <button 
              onClick={() => setExpandedCategory(expandedCategory ? null : 'pdf')}
              className="border border-dark-border text-dark-text-primary px-8 py-4 rounded-lg font-semibold hover:bg-dark-tertiary transition-colors"
            >
              View Tools
            </button>
          </div>
        </div>
      </section>

      <PrivacyCounter />

      {/* Tools Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-dark-text-primary mb-4">
            Choose Your File Type
          </h3>
          <p className="text-dark-text-secondary max-w-2xl mx-auto">
            Click on any file type below to see available processing tools
          </p>
        </div>
        
        <div className="space-y-6 max-w-4xl mx-auto">
          {toolCategories.map((category) => (
            <ToolCategory
              key={category.id}
              title={category.title}
              icon={category.icon}
              description={category.description}
              tools={category.tools}
              isExpanded={expandedCategory === category.id}
              onToggle={() => handleCategoryToggle(category.id)}
            />
          ))}
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
    </>
  )
}

export default Home