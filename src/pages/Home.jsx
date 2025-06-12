import { useState, useEffect } from 'react' import { trackVisitor, getMonthlyStats } from '@/utils/analytics'

const toolsData = { PDF: { color: 'from-[#0ff] to-[#00f]', subtools: [ { name: 'Merge', path: '/tools/pdf/merge', status: 'Available' }, { name: 'Split', path: '/tools/pdf/split', status: 'Available' }, { name: 'Compress', status: 'Coming Soon' }, { name: 'Protect', status: 'Coming Soon' } ] }, Images: { color: 'from-[#f0f] to-[#a0f]', subtools: [ { name: 'Resize', status: 'Coming Soon' }, { name: 'Convert', status: 'Coming Soon' } ] }, Documents: { color: 'from-[#ff0] to-[#fa0]', subtools: [ { name: 'OCR', status: 'Coming Soon' }, { name: 'Summarize', status: 'Coming Soon' } ] } }

export default function Home() { const [expanded, setExpanded] = useState(null) const [stats, setStats] = useState({ visitors: 0, downloads: 0 })

useEffect(() => { if (!sessionStorage.getItem('visitor_tracked')) { trackVisitor() sessionStorage.setItem('visitor_tracked', 'true') } getMonthlyStats().then(setStats) }, [])

return ( <main className="bg-dark-primary text-dark-text-primary min-h-screen px-4 sm:px-10 py-12"> {/* Hero */} <section className="text-center max-w-2xl mx-auto mb-16"> <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#0ff] to-[#0f0] bg-clip-text text-transparent"> Secure PDF Tools. Private. Instant. Free. </h1> <p className="text-dark-text-muted text-lg">No uploads. Everything processed right in your browser.</p> <button onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })} className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0ff] to-[#0f0] text-black font-semibold shadow-lg"> Try Now </button> </section>

{/* Stats Ticker */}
  <div className="flex justify-center gap-8 mb-12 text-sm sm:text-base">
    <div className="bg-dark-secondary px-4 py-2 rounded-full text-neon-cyan shadow-[0_0_8px_#0ff]">
      🚀 Visitors this month: <strong>{stats.visitors}</strong>
    </div>
    <div className="bg-dark-secondary px-4 py-2 rounded-full text-neon-green shadow-[0_0_8px_#0f0]">
      📥 Downloads this month: <strong>{stats.downloads}</strong>
    </div>
  </div>

  {/* Tools Section */}
  <section id="tools" className="max-w-5xl mx-auto space-y-6">
    {Object.entries(toolsData).map(([tool, { color, subtools }]) => (
      <div key={tool}>
        <div
          onClick={() => setExpanded(expanded === tool ? null : tool)}
          className={`cursor-pointer p-6 rounded-2xl bg-gradient-to-r ${color} text-black font-semibold text-xl flex items-center justify-between shadow-[0_0_16px_rgba(255,255,255,0.1)]`}
        >
          <div className="flex items-center gap-3">
            <span className="inline-block w-6 h-6">📄</span>
            {tool}
          </div>
          <span>{expanded === tool ? '−' : '+'}</span>
        </div>
        {expanded === tool && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 ml-6">
            {subtools.map(({ name, status, path }) => (
              <div
                key={name}
                className={`p-4 rounded-xl bg-dark-secondary text-dark-text-secondary border border-dark-border ${status === 'Available' ? 'hover:scale-105 transition-transform shadow-[0_0_12px_#0f0]' : 'opacity-50'} flex flex-col items-start justify-between`}
              >
                <div className="flex items-center gap-2 text-lg">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16v16H4z" />
                  </svg>
                  {name}
                </div>
                <div className={`mt-2 text-sm ${status === 'Available' ? 'text-green-400' : 'text-dark-text-muted'}`}>
                  {status}
                </div>
                {status === 'Available' && (
                  <a href={path} className="mt-2 text-xs text-neon-green underline">Go</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    ))}
  </section>

  {/* Comparison Section */}
  <section className="mt-20 max-w-4xl mx-auto text-dark-text-secondary">
    <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">Why Choose DocEnclave for PDF Tools?</h2>
    <div className="grid sm:grid-cols-2 gap-6">
      <article className="bg-dark-secondary p-4 rounded-xl border border-dark-border shadow-sm">
        <h3 className="text-lg font-bold mb-2 text-neon-green">🔒 Privacy-First</h3>
        <p>No server uploads. All processing happens securely in your browser.</p>
      </article>
      <article className="bg-dark-secondary p-4 rounded-xl border border-dark-border shadow-sm">
        <h3 className="text-lg font-bold mb-2 text-neon-cyan">⚡ Instant Tools</h3>
        <p>Merge or split files instantly with zero waiting time or network delay.</p>
      </article>
      <article className="bg-dark-secondary p-4 rounded-xl border border-dark-border shadow-sm">
        <h3 className="text-lg font-bold mb-2 text-yellow-400">📊 Transparent Stats</h3>
        <p>Real-time usage stats to show you exactly how we’re performing.</p>
      </article>
      <article className="bg-dark-secondary p-4 rounded-xl border border-dark-border shadow-sm">
        <h3 className="text-lg font-bold mb-2 text-pink-400">🧠 Smart UX</h3>
        <p>Designed with user-first principles for an intuitive experience.</p>
      </article>
    </div>
  </section>
</main>

) }

