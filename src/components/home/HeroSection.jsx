import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to tools page with search query
      // This will be implemented when we create the tools page
      console.log('Search:', searchQuery);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.03)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.02)_0%,transparent_50%)]"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-20 w-1 h-1 bg-white/30 rounded-full animate-bounce-gentle"></div>
      <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-white/15 rounded-full animate-pulse"></div>

      <div className="relative container-padding mx-auto text-center space-y-8 md:space-y-12">
        {/* Main Heading */}
        <div className="space-y-4 md:space-y-6">
          <h1 className="text-responsive-xl font-black tracking-tight leading-[0.95] animate-fade-in">
            Transform Your{' '}
            <span className="relative">
              Documents
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-lg -skew-x-12 transform"></div>
            </span>
          </h1>
          <p className="text-responsive-md text-gray-400 max-w-3xl mx-auto leading-relaxed animate-slide-up">
            Powerful, client-side document tools that work entirely in your browser. 
            No uploads, no servers, complete privacy.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center">
              <span className="material-icons absolute left-4 text-gray-500 text-xl">search</span>
              <input
                type="text"
                placeholder="Search for tools (e.g., PDF merge, image resize...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 py-4 md:py-5 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-300 hover:border-gray-600"
              />
              <button
                type="submit"
                className="absolute right-2 px-6 py-2.5 md:py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Link to="/tools" className="btn-primary text-lg px-8 py-4 min-w-[200px]">
            Explore Tools
          </Link>
          <Link to="/auth?mode=signup" className="btn-ghost text-lg px-8 py-4 min-w-[200px]">
            Get Started Free
          </Link>
        </div>

        {/* Features Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 pt-8 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          {[
            { icon: 'security', text: '100% Secure' },
            { icon: 'flash_on', text: 'Lightning Fast' },
            { icon: 'cloud_off', text: 'No Upload Required' },
            { icon: 'verified', text: 'Privacy First' }
          ].map((feature, index) => (
            <div 
              key={index}
              className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
            >
              <span className="material-icons text-sm text-gray-300">{feature.icon}</span>
              <span className="text-sm font-medium text-gray-300">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/40 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
