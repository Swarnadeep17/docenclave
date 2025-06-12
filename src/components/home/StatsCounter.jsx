import React, { useState, useEffect } from 'react'
import { getMonthlyStats } from '../../utils/analytics.js'

const AnimatedCounter = ({ value, label }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = parseInt(value) || 0
    const duration = 2000
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
  }, [value])

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-black">
        {displayValue.toLocaleString()}
      </div>
      <div className="text-gray-600 text-sm md:text-base">{label}</div>
    </div>
  )
}

const StatsCounter = () => {
  const [stats, setStats] = useState({ visitors: 0, downloads: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      const monthlyStats = await getMonthlyStats()
      setStats(monthlyStats)
      setLoading(false)
    }
    
    loadStats()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">Loading stats...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h3 className="text-2xl font-bold text-center text-black mb-8">
          This Month's Activity
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <AnimatedCounter 
            value={stats.visitors} 
            label="Visitors" 
          />
          <AnimatedCounter 
            value={stats.downloads} 
            label="Downloads" 
          />
          <AnimatedCounter 
            value={stats.visitors > 0 ? Math.round((stats.downloads / stats.visitors) * 100) : 0} 
            label="Conversion %" 
          />
          <AnimatedCounter 
            value={Object.keys(stats.tools_used || {}).length} 
            label="Tools Used" 
          />
        </div>
      </div>
    </div>
  )
}

export default StatsCounter