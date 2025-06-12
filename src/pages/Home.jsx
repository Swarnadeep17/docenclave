'use client'
import { useState, useEffect } from 'react'
import { trackVisitor, getMonthlyStats, getRecentEvents } from '@/utils/analytics'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'
import { useTypewriter } from 'react-simple-typewriter'

const toolsData = {
  PDF: {
    color: 'from-[#0ff] to-[#00f]',
    subtools: [
      { name: 'Merge', path: '/tools/pdf/merge', status: 'Available' },
      { name: 'Split', path: '/tools/pdf/split', status: 'Available' },
      { name: 'Compress', status: 'Coming Soon' },
      { name: 'Protect', status: 'Coming Soon' }
    ]
  },
  Images: {
    color: 'from-[#f0f] to-[#a0f]',
    subtools: [
      { name: 'Resize', status: 'Coming Soon' },
      { name: 'Convert', status: 'Coming Soon' }
    ]
  },
  Documents: {
    color: 'from-[#ff0] to-[#fa0]',
    subtools: [
      { name: 'OCR', status: 'Coming Soon' },
      { name: 'Summarize', status: 'Coming Soon' }
    ]
  }
}

export default function Home() {
  const [expandedTool, setExpandedTool] = useState(null)
  const [stats, setStats] = useState({ secured: 0, uploadsAvoided: 0, timeSaved: 0 })
  const [ticker, setTicker] = useState([])
  const [currentTicker, setCurrentTicker] = useState(0)

  useEffect(() => {
    trackVisitor()
    getMonthlyStats().then(data => {
      setStats({
        secured: data.tools_used || 0,
        uploadsAvoided: data.uploads_avoided || 0,
        timeSaved: data.time_saved || 0
      })
    })

    getRecentEvents().then(setTicker)
  }, [])

  useEffect(() => {
    if (ticker.length > 0) {
      const interval = setInterval(() => {
        setCurrentTicker(i => (i + 1) % ticker.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [ticker])

  const handleInit = async (main) => await loadFull(main)

  const [text] = useTypewriter({
    words: ['Secure', 'Private', 'Fast', 'No Cloud Footprint'],
    loop: true,
    delaySpeed: 2500
  })

  return (
    <div className="bg-dark-primary text-white min-h-screen">
      {/* HERO + PARTICLES */}
      <div className="relative h-[500px] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <Particles
          id="tsparticles"
          init={handleInit}
          options={{
            fullScreen: false,
            background: { color: '#111' },
            particles: {
              number: { value: 60 },
              size: { value: 2 },
              color: { value: '#0ff' },
              links: { enable: true, color: '#0ff' },
              move: { enable: true, speed: 0.5 }
            }
          }}
          className="absolute inset-0 z-0"
        />

        <h1 className="z-10 text-5xl sm:text-6xl font-bold mb-4">DocEnclave</h1>
        <p className="z-10 text-lg text-dark-text-muted mb-6">Where files stay <span className="text-[#0ff]">{text}</span>.</p>

        {ticker.length > 0 && (
          <div className="z-10 bg-dark-secondary px-4 py-2 rounded-xl shadow-md text-sm tracking-wide animate-fade-in">
            {ticker[currentTicker]}
          </div>
        )}
      </div>

      {/* STATS */}
      <div className="max-w-4xl mx-auto px-4 mt-10 text-center grid sm:grid-cols-3 gap-4">
        <div className="bg-dark-secondary rounded-xl p-4 shadow">
          <div className="text-2xl font-semibold text-[#0f0]">{stats.secured}</div>
          <p className="text-sm text-dark-text-muted mt-1">Files Secured This Month</p>
        </div>
        <div className="bg-dark-secondary rounded-xl p-4 shadow">
          <div className="text-2xl font-semibold text-[#ff0]">{stats.uploadsAvoided}</div>
          <p className="text-sm text-dark-text-muted mt-1">Uploads Avoided</p>
        </div>
        <div className="bg-dark-secondary rounded-xl p-4 shadow">
          <div className="text-2xl font-semibold text-[#f0f]">{stats.timeSaved} mins</div>
          <p className="text-sm text-dark-text-muted mt-1">Processing Time Saved</p>
        </div>
      </div>

      {/* TOOLS */}
      <div className="max-w-6xl mx-auto px-4 pb-24 mt-16">
        <h2 className="text-3xl font-semibold mb-10 text-center">Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {Object.entries(toolsData).map(([key, value]) => (
            <div key={key}>
              <button
                onClick={() => setExpandedTool(expandedTool === key ? null : key)}
                className={`w-full group bg-gradient-to-r ${value.color} p-[2px] rounded-2xl transition-all hover:scale-105`}
              >
                <div className="flex items-center justify-center p-6 bg-dark-secondary rounded-2xl">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M4 12h16M4 8h16M4 4h16" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
              {expandedTool === key && (
                <div className="mt-4 space-y-3">
                  {value.subtools.map((tool, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-4 py-2 rounded-lg bg-dark-tertiary border border-dark-border ${
                        tool.status === 'Available' ? 'hover:bg-dark-secondary transition cursor-pointer' : 'opacity-60 cursor-not-allowed'
                      }`}
                      onClick={() => tool.status === 'Available' && window.location.assign(tool.path)}
                    >
                      <span>{tool.name}</span>
                      <span className={`text-sm ${tool.status === 'Available' ? 'text-[#0f0]' : 'text-[#999]'}`}>{tool.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* COMPARISON */}
      <div className="bg-dark-secondary py-20 px-6 text-center">
        <h3 className="text-2xl sm:text-3xl font-semibold mb-10">How DocEnclave Compares</h3>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6 text-left">
          {[
            ['No Login Needed', 'Start instantly. No email required.'],
            ['Client-Side Only', 'No file ever leaves your device.'],
            ['Real-Time Stats', 'Track live tool usage, not you.'],
            ['Futuristic UI', 'Modern tools with neon aesthetics.'],
            ['Mobile-Ready', 'Built for all screen sizes.'],
            ['Secure by Design', 'Zero trust cloudless processing.'],
            ['No Tracking', 'We collect no personal info.'],
            ['Open Source', 'Code transparency you can audit.'],
            ['Fast Load Times', 'Lightweight & optimized codebase.'],
            ['Coming Soon Tools', 'Stay tuned for regular upgrades.']
          ].map(([title, desc], idx) => (
            <div key={idx} className="bg-dark-tertiary p-6 rounded-xl border border-dark-border">
              <p className="font-semibold mb-1">{title}</p>
              <p className="text-sm text-dark-text-muted">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}