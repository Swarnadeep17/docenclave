import { useState, useEffect } from 'react'
import { trackVisitor, getMonthlyStats } from '@/utils/analytics'

const toolsData = {
  PDF: {
    color: 'from-[#0ff] to-[#00f]',
    subtools: [
      { name: 'Merge', path: '/tools/pdf/merge', status: 'Available' },
      { name: 'Split', path: '/tools/pdf/split', status: 'Available' },
      { name: 'Compress', status: 'Coming Soon' },
      { name: 'Protect', status: 'Coming Soon' },
    ],
  },
  Images: {
    color: 'from-[#f0f] to-[#a0f]',
    subtools: [
      { name: 'Resize', status: 'Coming Soon' },
      { name: 'Convert', status: 'Coming Soon' },
    ],
  },
  Documents: {
    color: 'from-[#ff0] to-[#fa0]',
    subtools: [
      { name: 'OCR', status: 'Coming Soon' },
      { name: 'Summarize', status: 'Coming Soon' },
    ],
  },
}

export default function Home() {
  const [stats, setStats] = useState({ visitors: 0, downloads: 0 })
  const [openTool, setOpenTool] = useState(null)

  useEffect(() => {
    if (!sessionStorage.getItem('visitor_tracked')) {
      trackVisitor()
      sessionStorage.setItem('visitor_tracked', 'true')
    }

    const fetchStats = async () => {
      const data = await getMonthlyStats()
      setStats({ visitors: data.visitors, downloads: data.downloads })
    }

    fetchStats()
  }, [])

  return (
    <div className="bg-dark-primary min-h-screen text-white p-4">
      <section className="text-center py-10">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          DocEnclave
        </h1>
        <p className="text-dark-text-muted mb-6">
          Secure & Private File Tools. No uploads. No tracking.
        </p>
        <div className="text-sm flex justify-center gap-4 text-dark-text-muted">
          <span>Visitors: {stats.visitors}</span>
          <span>Downloads: {stats.downloads}</span>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {Object.entries(toolsData).map(([tool, data]) => (
          <div
            key={tool}
            className={`bg-gradient-to-br ${data.color} rounded-2xl p-4 shadow-lg cursor-pointer`}
            onClick={() => setOpenTool(openTool === tool ? null : tool)}
          >
            <div className="flex items-center justify-between">
              <svg className="w-6 h-6 text-white opacity-80" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xl font-semibold">{tool}</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${openTool === tool ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {openTool === tool && (
              <div className="mt-4 space-y-2">
                {data.subtools.map((sub, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-dark-secondary rounded-lg px-3 py-2 text-sm hover:bg-dark-tertiary transition-colors"
                  >
                    <span>{sub.name}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        sub.status === 'Available'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="mt-12 px-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Why Choose DocEnclave?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: '100% Local Processing',
              desc: 'Your files never leave your device. No uploads, no surveillance.',
            },
            {
              title: 'Lightning Fast',
              desc: 'Tools open instantly with zero server delays. No loading screens.',
            },
            {
              title: 'Private & Secure',
              desc: 'We collect no personal data. Your documents are your business.',
            },
          ].map((card, i) => (
            <div key={i} className="bg-dark-secondary p-4 rounded-xl shadow-inner border border-dark-border">
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-dark-text-muted">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}