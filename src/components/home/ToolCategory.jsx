import React from 'react';
import { Link } from 'react-router-dom';

const ToolCategory = ({ title, icon, description, tools, isExpanded, onToggle }) => {
  return (
    <div className="bg-dark-secondary rounded-xl border border-dark-border overflow-hidden transition-all duration-300">
      <div
        onClick={onToggle}
        className="p-8 cursor-pointer hover:bg-dark-tertiary transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl mb-4">{icon}</div>
            <h4 className="text-xl font-semibold text-dark-text-primary mb-3">{title}</h4>
            <p className="text-dark-text-secondary mb-4">{description}</p>
          </div>
          <div className={`text-2xl text-dark-text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            ⌄
          </div>
        </div>
      </div>
      
      {/* Expanded Tools Section */}
      <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-dark-border bg-dark-primary p-6">
          <h5 className="text-lg font-semibold text-dark-text-primary mb-4">Available Tools:</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool, index) => (
              <div key={index} className="flex items-center justify-between">
                {tool.available ? (
                  <Link
                    to={tool.path}
                    className="flex-1 bg-dark-secondary p-4 rounded-lg hover:bg-dark-tertiary transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h6 className="text-dark-text-primary font-medium group-hover:text-white transition-colors">
                          {tool.name}
                        </h6>
                        <p className="text-dark-text-muted text-sm">{tool.description}</p>
                      </div>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded ml-4">
                        Available
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="flex-1 bg-dark-secondary p-4 rounded-lg opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <h6 className="text-dark-text-primary font-medium">{tool.name}</h6>
                        <p className="text-dark-text-muted text-sm">{tool.description}</p>
                      </div>
                      <span className="text-xs bg-dark-tertiary text-dark-text-secondary px-2 py-1 rounded ml-4">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolCategory;