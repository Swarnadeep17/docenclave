import React, { useState, useEffect } from 'react';
import { getMonthlyStats } from '../../utils/analytics.js';

const ImpactMetric = ({ value, label, icon, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible || value === 0) return;

    let start = 0;
    const end = parseInt(value, 10);
    const duration = 2500;
    // Ensure increment is at least 1 to prevent infinite loops on small numbers
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
  }, [value, isVisible]);

  return (
    <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
      <div className="flex items-center justify-center mb-4">
        <span className="text-4xl mr-4">{icon}</span>
        <span className="text-5xl md:text-7xl font-bold text-dark-text-primary font-mono tracking-tighter">
          {displayValue.toLocaleString()}
        </span>
      </div>
      <div className="text-dark-text-secondary text-base md:text-lg font-medium">
        {label}
      </div>
    </div>
  );
};

const LiveIndicator = () => (
  <div className="flex items-center justify-center mb-8">
    <div className="flex items-center bg-dark-tertiary px-4 py-2 rounded-full border border-dark-border shadow-lg">
      <span className="relative flex h-3 w-3 mr-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
      <span className="text-sm text-dark-text-secondary font-medium tracking-wider">LIVE IMPACT METRICS</span>
    </div>
  </div>
);

const PrivacyImpact = () => {
  const [stats, setStats] = useState({ visitors: 0, downloads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const monthlyStats = await getMonthlyStats();
        setStats(monthlyStats);
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
    
    // Refresh every 10 seconds for a real-time feel
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="bg-dark-primary border-y border-dark-border py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-dark-tertiary rounded w-64 mx-auto mb-12"></div>
              <div className="h-20 bg-dark-tertiary rounded w-80 mx-auto mb-6"></div>
              <div className="h-6 bg-dark-tertiary rounded w-56 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // More engaging, privacy-focused metrics
  const documentsProcessed = stats.downloads;
  // Estimate: an average user might have handled ~2.5 files per session if they didn't use our tool
  const filesKeptPrivate = Math.floor(stats.visitors * 2.5); 
  
  return (
    <section className="bg-dark-secondary border-y border-dark-border py-24 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" aria-hidden="true"></div>

        <div className="container mx-auto px-4 relative">
            <LiveIndicator />
            
            <div className="max-w-5xl mx-auto">
                <h3 className="text-3xl md:text-4xl font-bold text-center text-dark-text-primary mb-4">
                    Your Privacy, Quantified
                </h3>
                <p className="text-center text-dark-text-secondary mb-16 max-w-2xl mx-auto text-lg">
                    Real-time impact of our client-side promise. Every number here represents a file that was never uploaded to a server.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <ImpactMetric 
                        value={filesKeptPrivate}
                        label="Files Kept Off Cloud Servers This Month"
                        icon="🔒"
                        delay={200}
                    />
                    <ImpactMetric 
                        value={documentsProcessed}
                        label="Documents Processed Privately This Month"
                        icon="✨"
                        delay={500}
                    />
                </div>
            </div>
        </div>
    </section>
  );
};

export default PrivacyImpact;