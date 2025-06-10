'use client';

import { useEffect } from 'react';
import CountUp from 'react-countup';

export default function ImpactCounter({ initialVisits, initialDownloads }) {
  
  useEffect(() => {
    // This effect runs only once when the component mounts on the client
    const hasVisited = sessionStorage.getItem('docenclave_visited');
    if (!hasVisited) {
      sessionStorage.setItem('docenclave_visited', 'true');
      // Send a request to our API to increment the visit count
      fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statToIncrement: 'visits' }),
      });
    }
  }, []);

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