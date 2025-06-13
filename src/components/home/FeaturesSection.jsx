import React from 'react';

const features = [
  {
    icon: 'security',
    title: 'Privacy First',
    description: 'All tools run on your browser. No file uploads or data storage.',
  },
  {
    icon: 'bolt',
    title: 'Lightning Fast',
    description: 'Process large documents instantly with optimized client-side code.',
  },
  {
    icon: 'devices',
    title: 'Cross-Platform',
    description: 'Fully responsive and works on desktop, mobile, and tablets.',
  },
  {
    icon: 'verified',
    title: 'Trusted',
    description: 'Secure and reliable with premium and free plan access.',
  },
];

const FeaturesSection = () => {
  return (
    <section className="section-spacing bg-black">
      <div className="container-padding mx-auto max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-12">
        {features.map(({ icon, title, description }, idx) => (
          <div
            key={idx}
            className="card-dark flex flex-col items-center text-center p-10"
          >
            <span className="material-icons text-white text-5xl mb-4 animate-pulse-subtle">{icon}</span>
            <h3 className="text-2xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-400">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
