import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 backdrop-blur-2xl rounded-3xl border border-cyan-500/20 p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Document Workflow?
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Join thousands of users who process documents securely with DocEnclave
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/signup" 
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-lg font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/20"
            >
              Get Started Free
            </Link>
            <Link 
              to="/tools" 
              className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/10 text-lg font-semibold hover:bg-white/20 transition-all duration-300"
            >
              Explore Tools
            </Link>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-gray-400">
            <span>No credit card required</span>
            <span>•</span>
            <span>Free forever plan</span>
            <span>•</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;