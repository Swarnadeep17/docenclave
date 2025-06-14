// src/components/home/ToolSection.jsx
import React from 'react';

const ToolSection = ({ categories, expandedCategory, setExpandedCategory }) => {
  const toggleCategory = (id) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  return (
    <section className="px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Powerful Document Tools
        </h2>
        
        <div className="space-y-4 max-w-4xl mx-auto">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className={`bg-white/5 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300 ${
                expandedCategory === category.id 
                  ? 'border-cyan-500/30' 
                  : 'border-white/10 hover:border-cyan-500/30'
              }`}
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-cyan-500/10 rounded-lg">
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {category.tools.filter(t => t.status === 'live').length} available, 
                      {' '}{category.tools.filter(t => t.status === 'soon').length} coming soon
                    </p>
                  </div>
                </div>
                <div className="text-2xl transform transition-transform duration-300">
                  {expandedCategory === category.id ? '−' : '+'}
                </div>
              </button>
              
              {expandedCategory === category.id && (
                <div className="px-6 pb-6">
                  <div className="border-t border-white/10 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.tools.map((tool, index) => (
                        <div 
                          key={index} 
                          className={`p-4 rounded-xl flex justify-between items-center ${
                            tool.status === 'soon' 
                              ? 'bg-white/5 border border-dashed border-white/10' 
                              : 'bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/10'
                          }`}
                        >
                          <div>
                            <h4 className="font-medium">{tool.name}</h4>
                            <div className="flex items-center mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                tool.status === 'soon' 
                                  ? 'bg-yellow-500/10 text-yellow-400' 
                                  : 'bg-cyan-500/10 text-cyan-400'
                              }`}>
                                {tool.status === 'soon' ? 'Coming Soon' : 'Available'}
                              </span>
                              {tool.status === 'live' && tool.usage && (
                                <span className="ml-2 text-xs text-gray-400">
                                  {tool.usage.toLocaleString()} processed
                                </span>
                              )}
                            </div>
                          </div>
                          {tool.status === 'live' ? (
                            <button className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-colors text-sm">
                              Use Tool
                            </button>
                          ) : (
                            <div className="px-4 py-2 rounded-lg bg-white/5 text-sm">
                              Notify Me
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ToolSection;