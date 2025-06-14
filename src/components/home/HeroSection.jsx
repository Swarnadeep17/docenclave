import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 pt-16">
      {/* Glassmorphism background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      </div>
      
      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-white/10 backdrop-blur-sm"
          style={{
            width: `${Math.random() * 30 + 10}px`,
            height: `${Math.random() * 30 + 10}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float${Math.floor(Math.random() * 4) + 1} ${Math.random() * 10 + 10}s infinite linear`
          }}
        />
      ))}
      
      <div className="relative z-10 text-center max-w-4xl space-y-8 py-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Document Processing,
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Reimagined
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Advanced tools that work entirely in your browser. No uploads, no servers - just pure privacy.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            to="/tools" 
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-lg font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 hover:scale-[1.03] shadow-lg shadow-cyan-500/20"
          >
            Explore Tools
          </Link>
          <Link 
            to="/signup" 
            className="px-8 py-3.5 rounded-xl bg-white/10 backdrop-blur-lg border border-white/10 text-lg font-semibold hover:bg-white/20 transition-all duration-300"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;