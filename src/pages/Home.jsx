import React, { useEffect, useState } from 'react';
import { trackVisitor, hasTrackedThisSession, markVisitorTracked } from '../utils/analytics.js';
import { toolCategories } from '../data/toolData.js'; // Import data from its new location

// Import the new modular components
import Hero from '../components/home/Hero.jsx';
import PrivacyCounter from '../components/home/PrivacyCounter.jsx';
import ToolCategory from '../components/home/ToolCategory.jsx';

// A new simple component for the "Why Choose Us" section
const Features = () => (
  <section className="bg-dark-secondary py-20">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h3 className="text-3xl md:text-4xl font-bold text-dark-text-primary mb-4">
          Why Choose DocEnclave
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="text-center">
          <div className="text-5xl mb-6">🔒</div>
          <h4 className="text-xl font-semibold text-dark-text-primary mb-3">100% Private</h4>
          <p className="text-dark-text-secondary">
            Files never leave your device. Complete client-side processing ensures maximum privacy.
          </p>
        </div>
        
        <div className="text-center">
          <div className="text-5xl mb-6">⚡</div>
          <h4 className="text-xl font-semibold text-dark-text-primary mb-3">Lightning Fast</h4>
          <p className="text-dark-text-secondary">
            No upload delays. Process documents instantly without waiting for server responses.
          </p>
        </div>
        
        <div className="text-center">
          <div className="text-5xl mb-6">🌐</div>
          <h4 className="text-xl font-semibold text-dark-text-primary mb-3">Works Offline</h4>
          <p className="text-dark-text-secondary">
            Once loaded, tools work without internet. Perfect for sensitive environments.
          </p>
        </div>
      </div>
    </div>
  </section>
);


const Home = () => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    if (!hasTrackedThisSession()) {
      trackVisitor();
      markVisitorTracked();
    }
  }, []);

  const handleCategoryToggle = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <>
      <Hero onCategoryToggle={handleCategoryToggle} />

      <PrivacyCounter />

      {/* Tools Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-dark-text-primary mb-4">
            Our Suite of Tools
          </h3>
          <p className="text-dark-text-secondary max-w-2xl mx-auto">
            Click on any file type below to see available processing tools. All tools work entirely in your browser.
          </p>
        </div>
        
        <div className="space-y-6 max-w-4xl mx-auto">
          {toolCategories.map((category) => (
            <ToolCategory
              key={category.id}
              title={category.title}
              icon={category.icon}
              description={category.description}
              tools={category.tools}
              isExpanded={expandedCategory === category.id}
              onToggle={() => handleCategoryToggle(category.id)}
            />
          ))}
        </div>
      </section>

      <Features />
    </>
  );
};

export default Home;