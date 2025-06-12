import React, { useEffect } from 'react';
import { trackVisitor, hasTrackedThisSession, markVisitorTracked } from '../utils/analytics.js';

import Hero from '../components/home/Hero.jsx';
import ToolsHub from '../components/home/ToolsHub.jsx';
import ComparisonTable from '../components/home/ComparisonTable.jsx';

const Home = () => {
  useEffect(() => {
    if (!hasTrackedThisSession()) {
      trackVisitor();
      markVisitorTracked();
    }
  }, []);

  const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Hero 
        onScrollToTools={() => scrollToElement('tools-hub')}
        onScrollToFeatures={() => scrollToElement('features-comparison')}
      />

      <div id="tools-hub">
        <ToolsHub />
      </div>

      <div id="features-comparison">
        <ComparisonTable />
      </div>
    </>
  );
};

export default Home;