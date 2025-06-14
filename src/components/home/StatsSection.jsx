// src/components/home/StatsSection.jsx
import React, { useState, useEffect } from 'react';

const StatsSection = () => {
  const [counts, setCounts] = useState({
    processed: 0,
    users: 0,
    tools: 0,
    uptime: 0
  });

  useEffect(() => {
    // Simulate counting up animation
    const interval = setInterval(() => {
      setCounts(prev => ({
        processed: Math.min(prev.processed + 127, 125000),
        users: Math.min(prev.users + 9, 8500),
        tools: Math.min(prev.tools + 1, 12),
        uptime: Math.min(prev.uptime + 0.1, 99.9)
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 backdrop-blur-2xl rounded-3xl border border-cyan-500/20 p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Trusted by Thousands
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard 
              value={counts.processed.toLocaleString()} 
              label="Files Processed" 
              icon="📄"
            />
            <StatCard 
              value={counts.users.toLocaleString()} 
              label="Active Users" 
              icon="👥"
            />
            <StatCard 
              value={counts.tools} 
              label="Available Tools" 
              icon="🛠️"
            />
            <StatCard 
              value={`${counts.uptime.toFixed(1)}%`} 
              label="Uptime" 
              icon="⏱️"
            />
          </div>
          
          {/* Animated file processing visualization */}
          <div className="mt-16">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
                <span className="text-sm">Real-time file processing</span>
              </div>
            </div>
            
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{ 
                  width: `${Math.min(counts.processed / 1250, 100)}%`,
                  animation: 'pulse 2s infinite'
                }}
              ></div>
            </div>
            
            <div className="grid grid-cols-5 gap-4 mt-8">
              {['PDF', 'JPG', 'PNG', 'DOC', 'XLS'].map((type, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg mb-2">
                    <span className="text-lg">{i === 0 ? '📄' : i === 1 ? '🖼️' : i === 2 ? '🖼️' : i === 3 ? '📝' : '📊'}</span>
                  </div>
                  <span className="text-sm text-gray-400">{type}</span>
                  <span className="text-xs text-cyan-400">{Math.floor(Math.random() * 45 + 15)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ value, label, icon }) => (
  <div className="bg-black/30 backdrop-blur-lg rounded-xl p-6 text-center border border-white/5">
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
      {value}
    </div>
    <div className="text-gray-400">{label}</div>
  </div>
);

export default StatsSection;