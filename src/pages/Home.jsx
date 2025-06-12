import React, { useEffect, useState } from 'react';
import { trackVisitor, hasTrackedThisSession, markVisitorTracked } from '../utils/analytics.js';
import { toolCategories } from '../data/toolData.js';

// Import the new and updated components
import Hero from '../components/home/Hero.jsx';
import PrivacyImpact from '../components/home/PrivacyImpact.jsx';
import ToolCategory from '../components/home/ToolCategory.jsx';
import ComparisonTable from '../components/home/ComparisonTable.jsx';

const Home = () => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    // Automatically open the first tool category on page load for better discovery
    setExpandedCategory('pdf');

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

      <PrivacyImpact />

      {/* Tools Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold text-dark-text-primary mb-4">
            A Complete Suite of Privacy-First Tools
          </h3>
          <p className="text-dark-text-secondary max-w-2xl mx-auto text-lg">
            Select a category to explore tools. All processing is secure and happens on your device.
          </p>
        </div>
        
        <div className="space-y-6 max-w-4xl mx-auto">
          {toolCategories.map((category) => (
            <ToolCategory
              key={category.id}
              {...category} // Pass all category props directly
              isExpanded={expandedCategory === category.id}
              onToggle={() => handleCategoryToggle(category.id)}
            />
          ))}
        </div>
      </section>

      <ComparisonTable />
    </>
  );
};

export default Home;