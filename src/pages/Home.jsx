// src/pages/Home.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import PDFPageRenderer from '../components/shared/PDFPageRenderer';
import StatsCounter from '../components/home/StatsCounter';

const Home = () => {
  const [documentsSecured, setDocumentsSecured] = useState(58724);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDocumentsSecured(prev => prev + Math.floor(Math.random() * 5));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const particlesInit = useCallback(async engine => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async container => {
    return;
  }, []);

  const countries = ['US', 'DE', 'UK', 'IN', 'CA', 'JP', 'BR', 'FR', 'AU', 'SG'];
  
  const toolCards = [
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#0EA5E9', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path fill="url(#grad1)" d="M9 16H5V8h4l5-4v16l-5-4m2-7l-2.2 1.8L9 11V9z"/>
          <path fill="url(#grad1)" d="M19 13c1.1 0 2.1-.3 3-.8v-7.7c-.9-.5-1.9-.8-3-.8-2.8 0-5 2.2-5 5s2.2 5 5 5z"/>
          <path fill="#0F172A" d="M19,15c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S20.1,15,19,15z"/>
        </svg>
      ),
      title: "Privacy Filter",
      desc: "Auto-analyze and redact sensitive info"
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path fill="url(#grad2)" d="M21 5c-1.11-0.35-2.33-0.5-3.5-0.5c-1.95 0-4.05 0.4-5.5 1.5c-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v15.5C2.45 20.4 4.55 20 6.5 20s4.05 0.4 5.5 1.5c1.45-1.1 3.55-1.5 5.5-1.5c1.17 0 2.39 0.15 3.5 0.5c0.75-0.25 1-1 1-1.5V6C22 6 21.75 5.75 21 5z"/>
          <path fill="#0F172A" d="M17.5,10.5c-0.78,0-1.42-0.64-1.42-1.42s0.64-1.42,1.42-1.42c0.78,0,1.42,0.64,1.42,1.42S18.28,10.5,17.5,10.5z"/>
        </svg>
      ),
      title: "Anonymize PDF",
      desc: "Remove metadata, watermarks, and hidden data"
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path fill="url(#grad3)" d="M14,12L10,8v8L14,12z M12,4c-4.41,0-8,3.59-8,8s3.59,8,8,8s8-3.59,8-8S16.41,4,12,4z M12,18.5c-3.31,0-6-2.69-6-6 s2.69-6,6-6s6,2.69,6,6S15.31,18.5,12,18.5z"/>
        </svg>
      ),
      title: "Secure Preview",
      desc: "View PDFs without uploading to servers"
    }
  ];
return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-tr from-[#0c0e11] via-[#111827] to-[#090e19]">
        <Particles
          id="tsparticles"
          className="absolute inset-0 z-0"
          init={particlesInit}
          loaded={particlesLoaded}
          options={{
            particles: {
              number: { value: 30, density: { enable: true, value_area: 800 } },
              color: { value: "#6366F1" },
              opacity: { value: 0.2, random: true },
              size: { value: 3, random: true },
              line_linked: { enable: false },
              move: { enable: true, speed: 0.5 }
            }
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
                Privacy-Focused Document Tools for Sensitive Content
              </h1>
              <p className="text-gray-300 mt-4 text-lg max-w-xl">
                Military-grade redaction and anonymization where your documents never leave your device
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => document.getElementById('tools').scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-xl"
                >
                  Explore Secure Tools →
                </button>
                <button 
                  className="px-6 py-3 rounded-lg font-medium bg-gray-800 hover:bg-gray-700 transition-all duration-300 border border-gray-700"
                >
                  How It Works
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-gray-700 overflow-hidden">
                <PDFPageRenderer showStandardToolbar={false} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Stats Section */}
      <section className="py-12 bg-gray-900 border-y border-gray-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-900 rounded-xl border border-gray-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/10 to-cyan-900/10 z-0"></div>

            {/* Animated Privacy Shield */}
            <div className="flex flex-col items-center z-10">
              <motion.div
                className="relative"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg className="w-16 h-16 text-green-400" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,1L3,5v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12V5L12,1z"/>
                  <motion.path 
                    fill="currentColor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    d="M10.3,16.4l-2.5-2.5l1.4-1.4l1.1,1.1l4.6-4.6l1.4,1.4L10.3,16.4z"
                  />
                </svg>
                <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 blur-sm animate-pulse"></div>
              </motion.div>
              <p className="mt-2 text-center text-sm text-gray-400">Privacy Shield Active</p>
            </div>

            {/* Neon Progress Bar */}
            <div className="md:col-span-2 z-10">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-cyan-300">Documents Secured</span>
                <span className="text-sm font-bold text-cyan-400">
                  <StatsCounter 
                    value={documentsSecured} 
                    duration={3000} 
                  />
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-green-400 shadow-lg shadow-cyan-400/20"
                  style={{ width: `${Math.min(100, (documentsSecured / 100000) * 100)}%` }}
                ></div>
              </div>
              <div className="mt-1 text-right text-xs text-gray-400">
                Next goal: {Math.min(100000, documentsSecured + 10000).toLocaleString()}
                <span className="text-green-400 ml-2">
                  +{Math.round((documentsSecured / 100000) * 100)}%
                </span>
              </div>
            </div>
{/* Live Activity Ticker */}
            <div className="md:col-span-3 mt-4 z-10">
              <div className="flex overflow-hidden h-8 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center px-4 bg-cyan-900/50">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse mr-2"></div>
                  <span className="text-xs font-mono text-gray-200">LIVE ACTIVITY</span>
                </div>
                <div className="relative flex-1">
                  <div className="absolute inset-0 flex items-center text-xs font-mono text-gray-400 animate-marquee whitespace-nowrap">
                    🔒 User from {countries[Math.floor(Math.random() * countries.length)]} secured a resume • 
                    🔍 User from {countries[Math.floor(Math.random() * countries.length)]} anonymized 18 pages • 
                    ✨ User from {countries[Math.floor(Math.random() * countries.length)]} merged 3 PDFs • 
                    ✨ User from {countries[Math.floor(Math.random() * countries.length)]} split a 200-page document •
                    ✅ User from {countries[Math.floor(Math.random() * countries.length)]} removed metadata from 10 files
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-16 bg-gradient-to-b from-[#111113] to-black">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
              Secure Document Tools
            </h2>
            <p className="text-gray-400 mt-4">
              All privacy features. Zero compromises. Totally free.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md p-1 bg-gray-900 border border-gray-800">
              {['all', 'pdf', 'privacy'].map(tab => (
                <button 
                  key={tab}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab 
                      ? 'bg-cyan-500/10 text-cyan-400' 
                      : 'hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'all' ? 'All Tools' : tab.charAt(0).toUpperCase() + tab.slice(1) + ' Tools'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {toolCards.map((tool, index) => (
              <a 
                key={index}
                href={`/tools/${tool.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-cyan-500 transition-all duration-300 shadow-lg shadow-gray-900/30 hover:shadow-cyan-500/10 overflow-hidden hover:-translate-y-1"
              >
                <div className="mb-4">{tool.icon}</div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">{tool.title}</h3>
                <p className="text-gray-400 mb-4">{tool.desc}</p>
                <div className="text-cyan-400 font-medium text-sm flex items-center gap-2">
                  Use Tool
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;