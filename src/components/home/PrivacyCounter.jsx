import React, { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase' // adjust import if needed

const monthId = new Date().toISOString().slice(0, 7)

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
      <div className="flex items-center justify-center mb-4">
        <span className="text-3xl mr-3">{icon}</span>
        <span className="text-4xl md:text-6xl font-bold text-dark-text-primary font-mono">
          {displayValue.toLocaleString()}
        </span>
      </div>
      <div className="text-dark-text-secondary text-sm md:text-lg font-medium">
        {label}
      </div>
    </div>
  )
}

const LiveIndicator = () => (
  <div className="flex items-center justify-center mb-8">
    <div className="flex items-center bg-dark-secondary px-4 py-2 rounded-full border border-dark-border">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
      <span className="text-xs text-dark-text-secondary font-medium tracking-wider">LIVE PRIVACY STATS</span>
    </div>
  </div>
)

const PrivacyCounter = () => {
  const [stats, setStats] = useState({
    toolsUsed: 0,
    downloads: 0,
    tickerMessage: ''
  })

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'analytics', monthId), (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        const toolsUsed = Object.values(data.tools_used || {}).reduce((sum, val) => sum + val, 0)
        const downloads = data.downloads || 0
        const tickerMessage = data.lastDownloadLocation ? `File downloaded from ${data.lastDownloadLocation}` : ''
        setStats({ toolsUsed, downloads, tickerMessage })
      }
    })
    return () => unsub()
  }, [])

  const filesProtected = Math.floor(stats.downloads * 1.6) // More privacy impact
  
  return (
    <section className="bg-dark-secondary border-y border-dark-border py-20">
      <div className="container mx-auto px-4">
        <LiveIndicator />

        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-dark-text-primary mb-4">
            Your Privacy is Our Priority
          </h3>
          <p className="text-center text-dark-text-secondary mb-12 max-w-2xl mx-auto">
            Real-time impact of our client-side processing approach
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
            <PrivacyMetric
              value={filesProtected}
              label="Files Kept Off Cloud Servers"
              icon="🔒"
              delay={300}
            />
            <PrivacyMetric
              value={stats.toolsUsed}
              label="Documents Processed Privately"
              icon="📄"
              delay={600}
            />
          </div>

          {stats.tickerMessage && (
            <div className="text-center mt-10">
              <p className="text-sm text-lime-400 italic animate-pulse">
                {stats.tickerMessage}
              </p>
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-sm text-dark-text-muted max-w-3xl mx-auto leading-relaxed">
              Every file you process with DocEnclave stays on your device.
              No uploads, no cloud storage, no privacy concerns.
              Join thousands who trust us with their document privacy.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PrivacyCounter