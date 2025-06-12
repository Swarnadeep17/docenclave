import React, { useEffect } from 'react';
import { trackVisitor, hasTrackedThisSession, markVisitorTracked } from '../utils/analytics.js';

// Import the final, high-level components
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

  // State is now managed within the ToolsHub component itself
  // so Home.jsx is purely for layout.

  return (
    <>
      <Hero onCategoryToggle={() => {
        // The hero buttons can scroll to the tools hub
        const toolsHubElement = document.querySelector('#tools-hub');
        if (toolsHubElement) {
            toolsHubElement.scrollIntoView({ behavior: 'smooth' });
        }
      }} />

      {/* Adding an ID for the scroll behavior */}
      <div id="tools-hub">
        <ToolsHub />
      </div>

      <ComparisonTable />
    </>
  );
};

export default Home;