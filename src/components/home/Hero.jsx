import React from 'react';

const Hero = ({ onCategoryToggle }) => {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-bold text-dark-text-primary mb-6 leading-tight">
          Process Documents
          <span className="block text-dark-text-muted">Securely</span>
        </h2>
        <p className="text-dark-text-secondary mb-12 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
          All processing happens in your browser. Your files never leave your device.
          No uploads, no tracking, no compromises.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            onClick={onCategoryToggle}
            className="bg-dark-text-primary text-dark-primary px-8 py-4 rounded-lg font-semibold hover:bg-dark-text-secondary transition-colors"
          >
            Explore Tools
          </button>
          <button
            onClick={onCategoryToggle}
            className="border border-dark-border text-dark-text-primary px-8 py-4 rounded-lg font-semibold hover:bg-dark-tertiary transition-colors"
          >
            How It Works
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;