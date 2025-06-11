import React, { useState, useEffect } from 'react'
import { getMonthlyStats } from '../../utils/analytics.js'

const PrivacyMetric = ({ value, label, icon, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!isVisible) return

    let start = 0
    const end = parseInt(value) || 0
    const duration = 2500
    const increment = end / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value, isVisible])

  return (
    <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex items-center justify-center mb-2">
        <span className="text-2xl mr-2">{icon}</span>
        <span className="text-3xl md:text-5xl font-bold text-black font-mono">
          {displayValue.toLocaleString()}
        </span>
      </div>
      <div className="text-gray-600 text-sm md:text-base font-medium">
        {label}
      </div>
    </div>
  )
}

const LiveIndicator = () => (
  <div className="flex items-center justify-center mb-6">
    <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
      <span className="text-xs text-gray-600 font-medium">LIVE PRIVACY STATS</span>
    </div>
  </div>
)

const PrivacyCounter = () => {
  const [stats, setStats] = useState({ visitors: 0, downloads: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      const monthlyStats = await getMonthlyStats()
      setStats(monthlyStats)
      setLoading(false)
    }
    
    loadStats()
    
    // Refresh every 10 seconds for real-time feel
    const interval = setInterval(loadStats, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    )
  }

  // Calculate privacy impact metrics
  const documentsProcessed = stats.downloads
  const filesProtected = stats.visitors * 2.3 // Avg 2.3 files per visitor session
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white py-12 border-t border-b border-gray-100">
      <div className="container mx-auto px-4">
        <LiveIndicator />
        
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl md:text-2xl font-semibold text-center text-gray-800 mb-8">
            Your Privacy is Our Priority
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            <PrivacyMetric 
              value={Math.floor(filesProtected)}
              label="Files Kept Off Cloud Servers"
              icon="🔒"
              delay={300}
            />
            <PrivacyMetric 
              value={documentsProcessed}
              label="Documents Processed Privately"
              icon="📄"
              delay={600}
            />
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              Every file you process with DocEnclave stays on your device. 
              No uploads, no cloud storage, no privacy concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyCounter