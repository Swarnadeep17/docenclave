import { useState, useEffect } from 'react'
import { trackVisitor, getMonthlyStats } from '@/utils/analytics'

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
  const [stats, setStats] = useState({ visitors: 0, downloads: 0 })

  useEffect(() => {
    trackVisitor()
    getMonthlyStats().then(data =>
      setStats({
        visitors: data.visitors || 0,
        downloads: data.downloads || 0
      })
    )
  }, [])

  return (
    <div className="bg-dark-primary min-h-screen text-white">
      <div className="relative overflow-hidden py-20 px-6 text-center">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-[#111] to-[#222] opacity-40 blur-2xl"></div>
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold z-10 relative mb-4">DocEnclave</h1>
        <p className="text-dark-text-muted text-lg z-10 relative">Secure. Fast. Futuristic file tools.</p>
        <div className="flex justify-center space-x-6 mt-6 z-10 relative">
          <div className="bg-dark-secondary px-4 py-2 rounded-xl shadow-md text-sm tracking-wide">
            Visitors this month: <span className="text-[#0ff] font-semibold">{stats.visitors}</span>
          </div>
          <div className="bg-dark-secondary px-4 py-2 rounded-xl shadow-md text-sm tracking-wide">
            Downloads: <span className="text-[#f0f] font-semibold">{stats.downloads}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-24">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-10 text-center">Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {Object.entries(toolsData).map(([key, value]) => (
            <div key={key} className="relative">
              <button
                onClick={() => setExpandedTool(expandedTool === key ? null : key)}
                className={`w-full group bg-gradient-to-r ${value.color} p-[2px] rounded-2xl transition-all hover:scale-105`}
              >
                <div className="flex items-center justify-center p-6 bg-dark-secondary rounded-2xl">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M4 12h16M4 8h16M4 4h16" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
              {expandedTool === key && (
                <div className="mt-4 space-y-3">
                  {value.subtools.map((tool, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-4 py-2 rounded-lg bg-dark-tertiary border border-dark-border ${tool.status === 'Available' ? 'hover:bg-dark-secondary transition' : 'opacity-60 cursor-not-allowed'}`}
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

        <div className="mt-20 text-center">
          <h3 className="text-xl sm:text-2xl font-semibold mb-6">How DocEnclave Compares</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-[#0ff] to-[#00f] p-[2px] rounded-xl">
              <div className="bg-dark-secondary p-6 rounded-xl h-full">
                <p className="font-semibold">No Account Needed</p>
                <p className="text-sm text-dark-text-muted mt-2">Start using tools instantly. No signup friction.</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#f0f] to-[#a0f] p-[2px] rounded-xl">
              <div className="bg-dark-secondary p-6 rounded-xl h-full">
                <p className="font-semibold">Secure & Private</p>
                <p className="text-sm text-dark-text-muted mt-2">We track nothing personal. Your files are safe.</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#ff0] to-[#fa0] p-[2px] rounded-xl">
              <div className="bg-dark-secondary p-6 rounded-xl h-full">
                <p className="font-semibold">Built for Speed</p>
                <p className="text-sm text-dark-text-muted mt-2">Lightning fast file handling with modern tech.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}