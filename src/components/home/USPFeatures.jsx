// src/components/home/USPFeatures.jsx
import React from 'react';

const USPFeatures = () => {
  const features = [
    {
      icon: '🔒',
      title: 'Complete Privacy',
      description: 'All processing happens in your browser - no file uploads to servers',
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Optimized Web Workers process files in milliseconds',
    },
    {
      icon: '🌐',
      title: 'No Limits',
      description: 'Free tier with generous 20MB file size limit',
    },
    {
      icon: '🎨',
      title: 'Premium Tools',
      description: 'Advanced features for power users',
    }
  ];

  return (
    <section className="px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default USPFeatures;