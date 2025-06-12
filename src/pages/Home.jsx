import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { loadSlim } from '@tsparticles/slim'
import Particles from '@tsparticles/react'
import { trackVisitor, hasTrackedThisSession, markVisitorTracked, getMonthlyStats } from '../utils/analytics'
import '../styles/home.css'

const scrollToTools = () => {
  const toolsSection = document.getElementById('tools-section')
  if (toolsSection) {
    toolsSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const HeroParticles = () => (
  <Particles
    id="tsparticles"
    init={loadSlim}
    options={{
      fullScreen: { enable: false },
      background: { color: { value: '#0e0e0e' } },
      fpsLimit: 60,
      interactivity: {
        events: { onHover: { enable: true, mode: 'repulse' }, resize: true },
        modes: { repulse: { distance: 100, duration: 0.4 } },
      },
      particles: {
        color: { value: '#00ffff' },
        links: { color: '#00ffff', distance: 150, enable: true, opacity: 0.4, width: 1 },
        collisions: { enable: true },
        move: { direction: 'none', enable: true, outModes: 'bounce', speed: 2 },
        number: { value: 50, density: { enable: true, area: 800 } },
        opacity: { value: 0.5 },
        shape: { type: 'circle' },
        size: { value: { min: 1, max: 5 } },
      },
      detectRetina: true,
    }}
  />
)

const AnimatedStatTicker = ({ visitors, downloads, month }) => (
  <motion.div
    className="flex items-center gap-2 neon-text text-sm sm:text-base mt-4 animate-pulse"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
  >
    <ShieldCheck className="w-5 h-5 text-cyan-400 animate-bounce-slow" />
    <span>{month}: {visitors} visitors / {downloads} downloads</span>
  </motion.div>
)

const Home = () => {
  const [stats, setStats] = useState({ visitors: 0, downloads: 0, month_name: '' })

  useEffect(() => {
    if (!hasTrackedThisSession()) {
      trackVisitor().then(() => markVisitorTracked())
    }
    getMonthlyStats().then(setStats)
  }, [])

  const tools = [
    { type: 'PDF', tools: ['Merge', 'Split', 'Compress'] },
    { type: 'Image', tools: ['Convert', 'Resize'] },
    { type: 'Document', tools: ['Compare', 'Summarize'] }
  ]

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2 }
    })
  }

  return (
    <div className="relative overflow-hidden min-h-screen bg-black text-white">
      <div className="absolute inset-0 z-0">
        <HeroParticles />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center h-[90vh] px-4">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold neon-text"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Welcome to DocEnclave
        </motion.h1>
        <motion.p
          className="mt-4 text-lg sm:text-xl max-w-xl text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          Securely manipulate your PDFs, images, and documents. No data is stored. Always private.
        </motion.p>

        <motion.button
          onClick={scrollToTools}
          className="mt-8 px-6 py-3 rounded-2xl border border-cyan-400 text-cyan-300 hover:bg-cyan-900 transition-all duration-300 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          Explore Tools
        </motion.button>

        <AnimatedStatTicker
          visitors={stats.visitors}
          downloads={stats.downloads}
          month={stats.month_name}
        />
      </div>

      <section id="tools-section" className="relative z-10 py-16 px-4 max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold neon-text mb-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Tools by File Type
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {tools.map((group, index) => (
            <motion.div
              key={group.type}
              custom={index}
              initial="hidden"
              whileInView="visible"
              variants={cardVariants}
              viewport={{ once: true }}
              className="p-6 bg-gray-900 border border-cyan-700 rounded-2xl shadow-xl hover:shadow-cyan-500/50 transition-all"
            >
              <h3 className="text-xl font-semibold neon-text mb-4">{group.type} Tools</h3>
              <ul className="space-y-2">
                {group.tools.map((tool) => (
                  <li key={tool}>
                    <Link
                      to={`/tools/${group.type.toLowerCase()}/${tool.toLowerCase()}`}
                      className="text-cyan-300 hover:underline"
                    >
                      {tool}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home