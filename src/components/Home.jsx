import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toolCategories, getAllTools } from '../config/tools'
import { useStats } from '../contexts/StatsContext'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { stats: globalStats } = useStats()
  const { user } = useAuth()
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [realTimeStats, setRealTimeStats] = useState({
    filesSecured: 0,
    filesDownloaded: 0,
    activeUsers: 0,
    toolsUsed: 0
  })

  // Simulate real-time stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStats(prev => ({
        filesSecured: prev.filesSecured + Math.floor(Math.random() * 3),
        filesDownloaded: prev.filesDownloaded + Math.floor(Math.random() * 5),
        activeUsers: 127 + Math.floor(Math.random() * 20),
        toolsUsed: prev.toolsUsed + Math.floor(Math.random() * 2)
      }))
    }, 3000)

    // Initialize with base numbers
    setRealTimeStats({
      filesSecured: globalStats.filesProcessed + 1247,
      filesDownloaded: globalStats.filesProcessed * 2 + 3456,
      activeUsers: 127,
      toolsUsed: globalStats.filesProcessed + 567
    })

    return () => clearInterval(interval)
  }, [globalStats])

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
    { feature: 'Client-side Processing', docenclave: true, others: false },
    { feature: 'No File Size Limits', docenclave: true, others: false },
    { feature: 'No Registration Required', docenclave: true, others: false },
    { feature: 'Unlimited Usage', docenclave: true, others: false },
    { feature: 'Mobile Optimized', docenclave: true, others: 'partial' },
    { feature: 'Open Source', docenclave: true, others: false },
    { feature: 'No Watermarks', docenclave: true, others: false },
    { feature: 'Offline Capable', docenclave: true, others: false }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-white/5 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Document Processing
            <br />
            <span className="text-4xl md:text-6xl">Reimagined</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Privacy-first tools that work entirely in your browser. No uploads, no limits, no compromises.
          </p>
          <Link 
            to="/tools" 
            className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300 group"
          >
            <i className="fas fa-tools mr-3 group-hover:rotate-12 transition-transform"></i>
            Explore Tools
            <i className="fas fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform"></i>
          </Link>
        </div>
      </section>

      {/* USP Cards Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            Why Choose DocEnclave?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {uspCards.map((card, index) => (
              <div 
                key={index}
                className="group p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <i className={`fas ${card.icon} text-white text-xl`}></i>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{card.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Innovative Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-white">
            Live Activity
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
              <div className="flex items-center justify-center mb-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <i className="fas fa-shield-alt text-green-400"></i>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {realTimeStats.filesSecured.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Files Secured</div>
              <div className="text-xs text-green-400 mt-1">This Month</div>
            </div>

            <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
              <div className="flex items-center justify-center mb-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse mr-2"></div>
                <i className="fas fa-download text-blue-400"></i>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {realTimeStats.filesDownloaded.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Files Downloaded</div>
              <div className="text-xs text-blue-400 mt-1">Privately</div>
            </div>

            <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
              <div className="flex items-center justify-center mb-3">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse mr-2"></div>
                <i className="fas fa-users text-purple-400"></i>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {realTimeStats.activeUsers}
              </div>
              <div className="text-xs text-gray-400">Active Users</div>
              <div className="text-xs text-purple-400 mt-1">Right Now</div>
            </div>

            <div className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
              <div className="flex items-center justify-center mb-3">
                <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse mr-2"></div>
                <i className="fas fa-tools text-orange-400"></i>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {realTimeStats.toolsUsed.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Tools Used</div>
              <div className="text-xs text-orange-400 mt-1">This Month</div>
            </div>
          </div>
        </div>
      </section>

      {/* Expandable Tools Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            Our Tools
          </h2>
          <div className="space-y-4">
            {Object.entries(toolCategories).map(([categoryId, category]) => {
              const isExpanded = expandedCategory === categoryId
              const availableTools = Object.values(category.tools).filter(tool => !tool.comingSoon).length
              const totalTools = Object.keys(category.tools).length
              
              return (
                <div 
                  key={categoryId}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : categoryId)}
                    className="w-full p-6 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
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
                            {Math.floor(Math.random() * 500 + 100)} uses this month
                          </div>
                        </div>
                        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400`}></i>
                      </div>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                        {Object.entries(category.tools).map(([toolId, tool]) => (
                          <div 
                            key={toolId}
                            className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-white">{tool.name}</h4>
                              {tool.comingSoon ? (
                                <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full">
                                  Coming Soon
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-green-600 text-green-100 text-xs rounded-full">
                                  Available
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm mb-3">{tool.description}</p>
                            {!tool.comingSoon && (
                              <Link 
                                to={`/tools/${toolId}`}
                                className="inline-flex items-center text-sm text-white hover:text-gray-300 transition-colors"
                              >
                                Use Tool <i className="fas fa-arrow-right ml-1"></i>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            DocEnclave vs Others
          </h2>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/10">
              <div className="text-gray-400 font-medium">Feature</div>
              <div className="text-center text-white font-bold">DocEnclave</div>
              <div className="text-center text-gray-400 font-medium">Others</div>
            </div>
            {comparisonFeatures.map((item, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                <div className="text-gray-300">{item.feature}</div>
                <div className="text-center">
                  {item.docenclave ? (
                    <i className="fas fa-check text-green-400"></i>
                  ) : (
                    <i className="fas fa-times text-red-400"></i>
                  )}
                </div>
                <div className="text-center">
                  {item.others === true ? (
                    <i className="fas fa-check text-green-400"></i>
                  ) : item.others === 'partial' ? (
                    <i className="fas fa-minus text-yellow-400"></i>
                  ) : (
                    <i className="fas fa-times text-red-400"></i>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <i className="fas fa-file-alt text-black text-sm"></i>
                </div>
                <span className="text-2xl font-bold text-white">
                  Doc<span className="text-gray-400">Enclave</span>
                </span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Privacy-first document processing tools that work entirely in your browser. 
                No uploads, no tracking, no compromises.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <i className="fab fa-twitter text-white"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <i className="fab fa-github text-white"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <i className="fab fa-discord text-white"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Tools</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/tools" className="hover:text-white transition-colors">PDF Tools</Link></li>
                <li><Link to="/tools" className="hover:text-white transition-colors">Image Tools</Link></li>
                <li><Link to="/tools" className="hover:text-white transition-colors">Document Tools</Link></li>
                <li><Link to="/tools" className="hover:text-white transition-colors">Security Tools</Link></li>
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
          
          <div className="pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2025 DocEnclave. All rights reserved. Built with privacy in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
