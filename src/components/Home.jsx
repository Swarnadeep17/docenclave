
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toolCategories, getAllTools } from '../config/tools'
import ToolCard from './ToolCard'

const Home = () => {
  const [stats, setStats] = useState({
    filesProcessed: 0,
    toolsAvailable: 0,
    happyUsers: 0,
    dataProcessed: 0
  })

  const [animatedStats, setAnimatedStats] = useState({
    filesProcessed: 0,
    toolsAvailable: 0,
    happyUsers: 0,
    dataProcessed: 0
  })

  // Simulate real stats (in production, this would come from Firebase/analytics)
  useEffect(() => {
    const allTools = getAllTools()
    const availableTools = Object.values(allTools).filter(tool => tool.status !== 'soon').length
    const totalTools = Object.keys(allTools).length
    
    setStats({
      filesProcessed: 12847,
      toolsAvailable: totalTools,
      happyUsers: 3421,
      dataProcessed: 2.4 // GB
    })
  }, [])

  // Animate counters
  useEffect(() => {
    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    const animateCounter = (key, targetValue) => {
      let currentValue = 0
      const increment = targetValue / steps

      const timer = setInterval(() => {
        currentValue += increment
        if (currentValue >= targetValue) {
          currentValue = targetValue
          clearInterval(timer)
        }
        setAnimatedStats(prev => ({
          ...prev,
          [key]: Math.floor(currentValue)
        }))
      }, stepDuration)
    }

    Object.entries(stats).forEach(([key, value]) => {
      animateCounter(key, value)
    })
  }, [stats])

  const popularTools = Object.entries(getAllTools())
    .filter(([_, tool]) => tool.status !== 'soon')
    .slice(0, 6)

  const features = [
    {
      icon: 'fa-shield-alt',
      title: 'Secure & Private',
      description: 'All processing happens in your browser. Your files never leave your device.'
    },
    {
      icon: 'fa-bolt',
      title: 'Lightning Fast',
      description: 'Client-side processing means instant results without waiting for uploads.'
    },
    {
      icon: 'fa-mobile-alt',
      title: 'Works Everywhere',
      description: 'Use on any device - desktop, tablet, or mobile. No installation required.'
    },
    {
      icon: 'fa-heart',
      title: 'Always Free',
      description: 'Core features are completely free. Premium features for power users.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="container px-4 py-20 mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl lg:text-7xl">
              Transform Your
              <span className="text-transparent bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text">
                {" "}Documents
              </span>
              <br />with Ease
            </h1>
            <p className="mb-8 text-xl text-gray-600 md:text-2xl">
              Free, secure, and lightning-fast document processing tools.
              <br />
              <span className="text-primary-600 font-semibold">No uploads. No waiting. No limits.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/tools" className="btn-primary text-lg px-8 py-4">
                <i className="fas fa-rocket mr-2"></i>
                Start Processing
              </Link>
              <button className="btn-secondary text-lg px-8 py-4">
                <i className="fas fa-play mr-2"></i>
                Watch Demo
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {animatedStats.filesProcessed.toLocaleString()}+
              </div>
              <div className="text-gray-600">Files Transformed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {animatedStats.toolsAvailable}
              </div>
              <div className="text-gray-600">Powerful Tools</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {animatedStats.happyUsers.toLocaleString()}+
              </div>
              <div className="text-gray-600">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {animatedStats.dataProcessed}GB+
              </div>
              <div className="text-gray-600">Data Processed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose DocEnclave?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with privacy, speed, and simplicity in mind
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`fas ${feature.icon} text-2xl text-primary-600`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Tools
            </h2>
            <p className="text-xl text-gray-600">
              Get started with our most-used document processing tools
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {popularTools.map(([toolId, tool]) => (
              <ToolCard key={toolId} tool={{ ...tool, id: toolId }} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/tools" className="btn-primary text-lg px-8 py-4">
              <i className="fas fa-th-large mr-2"></i>
              View All Tools
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-blue-600">
        <div className="container px-4 mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Documents?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of users who trust DocEnclave for their document processing needs
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/tools" className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                Get Started Free
              </Link>
              <button className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
