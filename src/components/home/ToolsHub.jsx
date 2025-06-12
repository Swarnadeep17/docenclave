import React, { useState, useEffect } from 'react';
import { getMonthlyStats } from '../../utils/firebase.js';
import { toolCategories } from '../../data/toolData.js';
import ToolCategory from './ToolCategory.jsx';

const ImpactStat = ({ value, label }) => {
    const [displayValue, setDisplayValue] = useState(0);
  
    useEffect(() => {
      if (value === 0) {
        setDisplayValue(0);
        return;
      }
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
      <div className="flex items-baseline gap-2 text-sm">
        <span className="font-mono font-bold text-lg text-dark-text-primary">
          {displayValue.toLocaleString()}
        </span>
        <span className="text-dark-text-secondary">{label}</span>
      </div>
    );
  };

const ToolsHub = () => {
  const [stats, setStats] = useState({ visitors: 0, downloads: 0 });
  const [expandedCategory, setExpandedCategory] = useState('pdf');

  useEffect(() => {
    const loadStats = async () => {
      const monthlyStats = await getMonthlyStats();
      if (monthlyStats) {
        setStats(monthlyStats);
      }
    };
    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCategoryToggle = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const filesKeptPrivate = Math.floor((stats?.visitors || 0) * 2.5);
  const documentsProcessed = stats?.downloads || 0;

  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-4xl mx-auto rounded-xl p-px bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500">
        <div className="bg-dark-secondary rounded-[11px] p-6">
            <div className="text-center mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-dark-text-primary mb-3">
                    Tools Hub
                </h3>
                <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap text-xs text-dark-text-secondary">
                    <span className="flex items-center text-green-400 font-medium">
                        <span className="relative flex h-2 w-2 mr-1.5"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                        LIVE
                    </span>
                    <span className="text-dark-border">|</span>
                    <ImpactStat value={filesKeptPrivate} label="Files Kept Private" />
                    <span className="text-dark-border">|</span>
                    <ImpactStat value={documentsProcessed} label="Secure Operations" />
                </div>
            </div>
            <div className="space-y-3">
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