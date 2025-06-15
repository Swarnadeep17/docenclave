import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toolCategories, getAllTools } from '../config/tools.js'
import { getToolsFromManifest } from '../config/dynamicTools'
import { useStats } from '../contexts/StatsContext'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { stats: globalStats, activeUsers, isConnected, incrementFilesProcessed, incrementToolsUsed } = useStats()
  const { user } = useAuth()
  const [expandedCategory, setExpandedCategory] = useState(null)

  // Use real-time stats from Firebase
  const realTimeStats = {
    filesSecured: globalStats.visits,
    filesDownloaded: globalStats.filesDownloaded,
    activeUsers: activeUsers,
    toolsUsed: globalStats.toolsUsed,
  }

  const uspCards = [
    {
      icon: 'fa-shield-alt',
      title: 'Privacy First',
      description: 'All processing happens locally in your browser. Zero data collection.'
    },
    {
      icon: 'fa-bolt',
      title: 'Lightning Fast',
      description: 'No uploads, no waiting. Instant processing with cutting-edge technology.'
    },
    {
      icon: 'fa-infinity',
      title: 'Unlimited Usage',
      description: 'Process as many files as you need. No artificial limits or subscriptions.'
    },
    {
      icon: 'fa-mobile-alt',
      title: 'Works Everywhere',
      description: 'Desktop, tablet, mobile. Same powerful tools, anywhere you need them.'
    }
  ]

  const comparisonFeatures = [
    { 
      feature: 'Complete Privacy Protection', 
      description: 'Your documents never leave your device - true client-side processing',
      docenclave: true, 
      others: false 
    },
    { 
      feature: 'Unlimited File Processing', 
      description: 'No artificial restrictions on file sizes or quantity',
      docenclave: true, 
      others: false 
    },
    { 
      feature: 'Zero Registration Hassle', 
      description: 'Start using tools immediately without creating accounts',
      docenclave: true, 
      others: false 
    },
    { 
      feature: 'Completely Free Forever', 
      description: 'Core features remain free with no hidden subscription traps',
      docenclave: true, 
      others: false 
    },
    { 
      feature: 'Mobile-First Design', 
      description: 'Optimized experience across all devices and screen sizes',
      docenclave: true, 
      others: 'partial' 
    },
    { 
      feature: 'Open Source Transparency', 
      description: 'Community-driven development with full code transparency',
      docenclave: true, 
      others: false 
    },
    { 
      feature: 'Professional Results', 
      description: 'Clean outputs without watermarks or branding',
      docenclave: true, 
      others: false 
    },
    { 
      feature: 'Works Offline', 
      description: 'Process documents even without internet connection',
      docenclave: true, 
      others: false 
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 md:py-16">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-white/5 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-7xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Document Processing
            <br />
            <span className="text-3xl md:text-6xl">Reimagined</span>
          </h1>
          
          {/* Live Activity Stats in Hero */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10 max-w-4xl mx-auto">
            <div className="p-4 md:p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-2 h-2 rounded-full animate-pulse mr-2 ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <i className="fas fa-shield-alt text-green-400 text-sm"></i>
              </div>
              <div className="text-lg md:text-2xl font-bold text-white mb-1">
                {realTimeStats.filesSecured.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Files Secured</div>
              <div className="text-xs text-green-400 mt-1">
                {isConnected ? 'Live Data' : 'Cached Data'}
              </div>
            </div>

            <div className="p-4 md:p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-2 h-2 rounded-full animate-pulse mr-2 ${isConnected ? 'bg-blue-400' : 'bg-yellow-400'}`}></div>
                <i className="fas fa-download text-blue-400 text-sm"></i>
              </div>
              <div className="text-lg md:text-2xl font-bold text-white mb-1">
                {realTimeStats.filesDownloaded.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Files Downloaded</div>
              <div className="text-xs text-blue-400 mt-1">Privately</div>
            </div>

            <div className="p-4 md:p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-2 h-2 rounded-full animate-pulse mr-2 ${isConnected ? 'bg-purple-400' : 'bg-yellow-400'}`}></div>
                <i className="fas fa-users text-purple-400 text-sm"></i>
              </div>
              <div className="text-lg md:text-2xl font-bold text-white mb-1">
                {realTimeStats.activeUsers}
              </div>
              <div className="text-xs text-gray-400">Active Users</div>
              <div className="text-xs text-purple-400 mt-1">Right Now</div>
            </div>

            <div className="p-4 md:p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-2 h-2 rounded-full animate-pulse mr-2 ${isConnected ? 'bg-orange-400' : 'bg-yellow-400'}`}></div>
                <i className="fas fa-tools text-orange-400 text-sm"></i>
              </div>
              <div className="text-lg md:text-2xl font-bold text-white mb-1">
                {realTimeStats.toolsUsed.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Tools Used</div>
              <div className="text-xs text-orange-400 mt-1">
                {isConnected ? 'Live Data' : 'Cached Data'}
              </div>
            </div>
          </div>
          
          <a 
            href="#tools" 
            className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold text-base md:text-lg hover:bg-white/20 transition-all duration-300 group"
          >
            <i className="fas fa-tools mr-3 group-hover:rotate-12 transition-transform"></i>
            Explore Tools
            <i className="fas fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform"></i>
          </a>
        </div>
      </section>

      {/* USP Cards Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-white">
            Why Choose DocEnclave?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {uspCards.map((card, index) => (
              <div 
                key={index}
                className="group p-4 md:p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                  <i className={`fas ${card.icon} text-white text-lg md:text-xl`}></i>
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-2 text-white">{card.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expandable Tools Section */}
      <section id="tools" className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12 text-white">
            Powerful Tools at Your Fingertips
          </h2>
          
          <div className="space-y-4">
            {Object.entries(toolCategories).map(([categoryId, category]) => {
              const isExpanded = expandedCategory === categoryId
              const totalTools = Object.keys(category.tools).length
              // Dynamic tool availability check - only pdf-merge is actually available
              const availableTools = Object.entries(category.tools).filter(([toolId, tool]) => {
                return toolId === 'pdf-merge' && categoryId === 'pdf'
              }).length
              
              return (
                <div key={categoryId} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : categoryId)}
                    className="w-full p-6 hover:bg-white/5 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <i className={`fas ${category.icon} text-white text-xl`}></i>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                          <p className="text-gray-400 text-sm">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-white font-medium">
                            {availableTools}/{totalTools} Available
                          </div>
                          <div className="text-xs text-gray-400">
                            {Object.values(globalStats.toolUsage || {}).reduce((sum, count) => sum + count, 0)} total uses
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isExpanded 
                      ? 'max-h-[2000px] opacity-100' 
                      : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                        {Object.entries(category.tools).map(([toolId, tool], index) => {
                          // Dynamic availability check
                          const isAvailable = toolId === 'pdf-merge' && categoryId === 'pdf'
                          
                          return (
                            <div 
                              key={toolId}
                              className={`p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 ${
                                !isAvailable ? 'opacity-60' : ''
                              }`}
                              style={{
                                animationDelay: `${index * 100}ms`,
                                animation: isExpanded ? 'slideInUp 0.6s ease-out forwards' : 'none'
                              }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                    <i className={`fas ${tool.icon} text-white text-sm`}></i>
                                  </div>
                                  <h4 className="font-medium text-white">{tool.name}</h4>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full transition-all ${
                                  isAvailable 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {isAvailable ? 'Available' : 'Coming Soon'}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm mb-3">{tool.description}</p>
                              {isAvailable && (
                                <button 
                                  onClick={() => window.location.href = `/tools/${toolId}`}//eslint-disable-line
                                  className="inline-flex items-center text-sm text-white hover:text-gray-300 transition-colors group"
                                >
                                  Use Tool <i className="fas fa-arrow-right ml-1 group-hover:translate-x-1 transition-transform"></i>
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 text-white">
              Why DocEnclave Leads the Document Processing Revolution
            </h2>
            <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              While other platforms compromise your privacy and limit your productivity, DocEnclave delivers 
              unmatched security, unlimited processing power, and professional results—all completely free.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-6 border-b border-white/10">
              <div className="text-gray-400 font-medium text-lg">Capability</div>
              <div className="text-center text-white font-bold text-lg">DocEnclave</div>
              <div className="text-center text-gray-400 font-medium text-lg">Traditional Tools</div>
            </div>
            {comparisonFeatures.map((item, index) => (
              <div key={index} className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-6 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors group">
                <div className="lg:pr-4">
                  <h3 className="text-white font-semibold mb-2 group-hover:text-gray-200 transition-colors">
                    {item.feature}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="text-center flex items-center justify-center">
                  {item.docenclave ? (
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check-circle text-green-400 text-xl"></i>
                      <span className="text-green-400 font-medium">Yes</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-times-circle text-red-400 text-xl"></i>
                      <span className="text-red-400 font-medium">No</span>
                    </div>
                  )}
                </div>
                <div className="text-center flex items-center justify-center">
                  {item.others === true ? (
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-check-circle text-green-400 text-xl"></i>
                      <span className="text-green-400 font-medium">Yes</span>
                    </div>
                  ) : item.others === 'partial' ? (
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-exclamation-circle text-yellow-400 text-xl"></i>
                      <span className="text-yellow-400 font-medium">Limited</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-times-circle text-red-400 text-xl"></i>
                      <span className="text-red-400 font-medium">No</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 md:mt-12">
            <p className="text-gray-300 text-base md:text-lg mb-4 md:mb-6">
              Experience the difference that true privacy and unlimited processing can make for your workflow.
            </p>
            <a 
              href="#tools" 
              className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold text-base md:text-lg hover:from-white/30 hover:to-white/20 transition-all duration-300 group"
            >
              <i className="fas fa-rocket mr-3 group-hover:scale-110 transition-transform"></i>
              Start Processing Documents Now
              <i className="fas fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform"></i>
            </a>
          </div>
        </div>
      </section>

      {/* Tools and Company Links Section */}
      <section className="py-8 md:py-12 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h3 className="font-semibold text-white mb-4">Tools</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/tools/pdf-merge" className="hover:text-white transition-colors">PDF Tools</Link></li>
                <li><Link to="/tools/image-converter" className="hover:text-white transition-colors">Image Tools</Link></li>
                <li><Link to="/tools/text-analyzer" className="hover:text-white transition-colors">Document Tools</Link></li>
                <li><Link to="/tools/password-generator" className="hover:text-white transition-colors">Security Tools</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DocEnclave Description Section */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center">
              <i className="fas fa-file-alt text-black text-lg md:text-xl"></i>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Doc<span className="text-gray-400">Enclave</span>
            </h2>
          </div>
          
          <p className="text-lg text-gray-400 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
            Built by developers who believe your documents should remain yours. DocEnclave processes everything 
            locally on your device, ensuring complete privacy while delivering professional-grade results. 
            Join thousands of users who've made the switch to truly secure document processing.
          </p>
          
          <div className="flex justify-center space-x-4 md:space-x-6">
            <a 
              href="https://twitter.com/docenclave" 
              target="_blank"//eslint-disable-line
              rel="noopener noreferrer"
              className="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
            >
              <i className="fab fa-twitter text-white text-lg md:text-xl group-hover:scale-110 transition-transform"></i>
            </a>
            <a 
              href="https://github.com/docenclave" 
              target="_blank"//eslint-disable-line
              rel="noopener noreferrer"
              className="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
            >
              <i className="fab fa-github text-white text-lg md:text-xl group-hover:scale-110 transition-transform"></i>
            </a>
            <a 
              href="https://discord.gg/docenclave" 
              target="_blank"//eslint-disable-line
              rel="noopener noreferrer"
              className="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
            >
              <i className="fab fa-discord text-white text-lg md:text-xl group-hover:scale-110 transition-transform"></i>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2025 DocEnclave. All rights reserved. Built with privacy in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
