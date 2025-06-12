import React, { useState, useEffect } from 'react';
import { getMonthlyStats } from '../../utils/analytics.js';
import { toolCategories } from '../../data/toolData.js';
import ToolCategory from './ToolCategory.jsx'; // We will modify this file next

// A smaller, more elegant component for individual stats
const ImpactStat = ({ icon, value, label }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const end = parseInt(value, 10);
    const duration = 2000;
    const increment = Math.max(1, end / (duration / 16));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xl text-blue-400">{icon}</span>
      <span className="text-2xl font-mono font-bold text-dark-text-primary">
        {displayValue.toLocaleString()}
      </span>
      <span className="text-sm text-dark-text-secondary mt-1">{label}</span>
    </div>
  );
};

const ToolsHub = () => {
  const [stats, setStats] = useState({ visitors: 0, downloads: 0 });
  const [expandedCategory, setExpandedCategory] = useState('pdf'); // Default to open

  useEffect(() => {
    const loadStats = async () => {
      const monthlyStats = await getMonthlyStats();
      setStats(monthlyStats);
    };
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCategoryToggle = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const filesKeptPrivate = Math.floor(stats.visitors * 2.5);
  const documentsProcessed = stats.downloads;

  return (
    <section className="container mx-auto px-4 py-24">
      {/* The main container with futuristic styling */}
      <div className="relative max-w-4xl mx-auto bg-dark-secondary/40 border border-dark-border rounded-2xl p-8 backdrop-blur-sm">
        {/* Animated Gradient Border */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-blue-500/80 via-purple-500/80 to-blue-500/80 opacity-40 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" style={{ animationDuration: '5s' }}></div>
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
           <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>

        <div className="relative">
            {/* Header with Integrated Stats */}
            <div className="mb-10">
                <h3 className="text-3xl md:text-4xl font-bold text-dark-text-primary text-center mb-4">
                    Privacy-First Tools Hub
                </h3>
                <div className="flex items-center justify-center gap-8 flex-wrap border-y border-dark-border py-4">
                    <div className="flex items-center text-green-400 text-sm font-medium tracking-wider">
                        <span className="relative flex h-3 w-3 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        LIVE IMPACT
                    </div>
                    <ImpactStat icon="🔒" value={filesKeptPrivate} label="Files Kept Private" />
                    <ImpactStat icon="✨" value={documentsProcessed} label="Secure Operations" />
                </div>
            </div>

            {/* Tools Accordion */}
            <div className="space-y-4">
            {toolCategories.map((category) => (
                <ToolCategory
                key={category.id}
                {...category}
                isExpanded={expandedCategory === category.id}
                onToggle={() => handleCategoryToggle(category.id)}
                />
            ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsHub;