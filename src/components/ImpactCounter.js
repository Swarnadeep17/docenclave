'use client';

import { useEffect } from 'react';
import CountUp from 'react-countup';

export default function ImpactCounter({ initialVisits, initialDownloads, isLoading }) {
  
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('docenclave_visited');
    if (!hasVisited) {
      sessionStorage.setItem('docenclave_visited', 'true');
      fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statToIncrement: 'visits' }),
      }).catch(err => console.error("Failed to increment visit count:", err));
    }
  }, []);

  if (isLoading) {
    return (
        <div className="text-center my-8 p-4 border-y-2 border-gray-700 h-[56px]">
            <p className="text-sm text-gray-500 animate-pulse">Loading community stats...</p>
        </div>
    )
  }

  return (
    <div className="text-center my-8 p-4 border-y-2 border-gray-700">
      <p className="text-sm sm:text-base text-gray-400">
        This month, our community has secured{' '}
        <span className="font-bold text-accent text-lg sm:text-xl px-2">
          <CountUp start={0} end={initialVisits} duration={2.5} separator="," />
        </span>
        documents and saved{' '}
        <span className="font-bold text-accent text-lg sm:text-xl px-2">
          <CountUp start={0} end={initialDownloads} duration={2.5} separator="," />
        </span>
        files from the cloud.
      </p>
    </div>
  );
}