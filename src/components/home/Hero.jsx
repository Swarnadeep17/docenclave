import React from 'react';

const Hero = ({ onScrollToTools, onScrollToFeatures }) => {
  return (
    // Reduced padding (py-12 md:py-20)
    <section className="container mx-auto px-4 py-12 md:py-20"> 
      <div className="text-center max-w-3xl mx-auto">
        {/* Reduced font size (text-4xl md:text-6xl) */}
        <h2 className="text-4xl md:text-6xl font-bold text-dark-text-primary mb-5 leading-tight">
          Process Documents
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-green-400">
            Securely. Instantly.
          </span>
        </h2>
        <p className="text-dark-text-secondary mb-10 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          All processing happens in your browser. Your files never leave your device.
          No uploads, no tracking, no compromises.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onScrollToTools}
            className="bg-dark-text-primary text-dark-primary px-8 py-3 rounded-lg font-semibold hover:bg-dark-text-secondary transition-colors"
          >
            Explore Tools
          </button>
          <button
            onClick={onScrollToFeatures} // Changed to use the new handler
            className="border border-dark-border text-dark-text-primary px-8 py-3 rounded-lg font-semibold hover:bg-dark-tertiary transition-colors"
          >
            Features {/* Changed from "How It Works" */}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;