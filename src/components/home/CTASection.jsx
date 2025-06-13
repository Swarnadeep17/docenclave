import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="section-spacing bg-black text-center">
      <div className="container-padding mx-auto max-w-3xl space-y-6">
        <h2 className="text-4xl font-extrabold">
          Ready to Elevate Your Document Experience?
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Join thousands of users transforming files with DocEnclave today.
        </p>
        <div className="space-x-6">
          <Link to="/auth?mode=signup" className="btn-primary px-12 py-4">
            Get Started Free
          </Link>
          <Link to="/pricing" className="btn-ghost px-12 py-4">
            See Pricing Plans
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
