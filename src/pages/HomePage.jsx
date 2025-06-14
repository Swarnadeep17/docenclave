// src/pages/HomePage.jsx
import React, { useState } from 'react';
import HeroSection from '../components/home/HeroSection';
import USPFeatures from '../components/home/USPFeatures';
import StatsSection from '../components/home/StatsSection';
import ToolSection from '../components/home/ToolSection';
import ComparisonSection from '../components/home/ComparisonSection';
import CTASection from '../components/home/CTASection';

const HomePage = () => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  // Mock tool data - will be replaced with GitHub API integration
  const toolCategories = [
    {
      id: 'pdf',
      name: 'PDF Tools',
      icon: 'description',
      tools: [
        { name: 'Merge PDF', status: 'live', usage: 12489 },
        { name: 'Split PDF', status: 'live', usage: 8923 },
        { name: 'Compress PDF', status: 'soon' },
        { name: 'PDF to Word', status: 'soon' },
      ]
    },
    {
      id: 'image',
      name: 'Image Tools',
      icon: 'image',
      tools: [
        { name: 'Resize Image', status: 'soon' },
        { name: 'Convert Format', status: 'soon' },
        { name: 'Compress Image', status: 'soon' },
      ]
    },
    {
      id: 'document',
      name: 'Document Tools',
      icon: 'article',
      tools: [
        { name: 'Text Extract', status: 'soon' },
        { name: 'Format Convert', status: 'soon' },
      ]
    }
  ];

  return (
    <div className="space-y-16 md:space-y-24">
      <HeroSection />
      <USPFeatures />
      <StatsSection />
      <ToolSection 
        categories={toolCategories}
        expandedCategory={expandedCategory}
        setExpandedCategory={setExpandedCategory}
      />
      <ComparisonSection />
      <CTASection />
    </div>
  );
};

export default HomePage;