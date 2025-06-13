import React from 'react';

const stats = [
  { label: 'Files Processed', value: '1.2M+' },
  { label: 'Active Users', value: '75K+' },
  { label: 'Tools Available', value: '20+' },
  { label: 'Avg. Processing Time', value: '0.5s' },
];

const StatsSection = () => {
  return (
    <section className="section-spacing bg-gray-900">
      <div className="container-padding mx-auto max-w-6xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 text-center">
          {stats.map(({ label, value }, idx) => (
            <div key={idx} className="border border-gray-800 rounded-lg p-6">
              <p className="text-3xl font-bold mb-1">{value}</p>
              <p className="text-gray-500 uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
