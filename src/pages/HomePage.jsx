import React from 'react';
import HeroSection from '../components/home/HeroSection';
import ToolCategories from '../components/home/ToolCategories';
import FeaturesSection from '../components/home/FeaturesSection';
import StatsSection from '../components/home/StatsSection';
import CTASection from '../components/home/CTASection';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ToolCategories />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
    </div>
  );
};

export default HomePage;
