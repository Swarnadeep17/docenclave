import React from 'react';

const ComparisonSection = () => {
  const features = [
    { name: 'Client-side Processing', docenclave: true, competitors: false },
    { name: 'No File Uploads', docenclave: true, competitors: false },
    { name: 'No Watermarks', docenclave: true, competitors: false },
    { name: 'Free Tier Available', docenclave: true, competitors: true },
    { name: 'Advanced PDF Tools', docenclave: true, competitors: true },
    { name: 'File Size Limit (Free)', docenclave: '20MB', competitors: '10MB' },
    { name: 'Privacy Focused', docenclave: true, competitors: false },
    { name: 'Offline Support', docenclave: true, competitors: false },
  ];

  return (
    <section className="px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Why Choose DocEnclave?
        </h2>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
          We're redefining document processing with privacy-first, client-side solutions
        </p>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
          <div className="grid grid-cols-3 gap-px bg-white/10">
            <div className="bg-gray-900 p-6"></div>
            <div className="bg-gray-900 p-6 text-center">
              <div className="font-bold text-xl">DocEnclave</div>
              <div className="text-cyan-400 mt-1">The Future</div>
            </div>
            <div className="bg-gray-900 p-6 text-center">
              <div className="font-bold text-xl">Competitors</div>
              <div className="text-gray-400 mt-1">Traditional Approach</div>
            </div>
            
            {features.map((feature, index) => (
              <React.Fragment key={index}>
                <div className="bg-gray-900/80 p-4 md:p-6 flex items-center border-t border-white/5">
                  {feature.name}
                </div>
                <div className="bg-gray-900/50 p-4 md:p-6 flex items-center justify-center">
                  {typeof feature.docenclave === 'boolean' ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      feature.docenclave 
                        ? 'bg-cyan-500/20 text-cyan-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {feature.docenclave ? '✓' : '✗'}
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                      {feature.docenclave}
                    </div>
                  )}
                </div>
                <div className="bg-gray-900/50 p-4 md:p-6 flex items-center justify-center">
                  {typeof feature.competitors === 'boolean' ? (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      feature.competitors 
                        ? 'bg-gray-600/20 text-gray-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {feature.competitors ? '✓' : '✗'}
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 bg-gray-600/20 text-gray-400 rounded-full text-sm">
                      {feature.competitors}
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;