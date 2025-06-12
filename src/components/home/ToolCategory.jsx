import React from 'react';
import { Link } from 'react-router-dom';

const ToolCategory = ({ title, icon, description, tools, isExpanded, onToggle }) => {
  return (
    // Glassmorphism effect: transparent background, border, and backdrop blur
    <div className={`bg-dark-primary/30 rounded-lg border border-dark-border/50 backdrop-blur-xl transition-all duration-300 group hover:border-blue-500/60`}>
      <div
        onClick={onToggle}
        className="p-6 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="text-3xl transition-transform duration-300 group-hover:scale-110">{icon}</div>
            <div>
              <h4 className="text-lg font-semibold text-dark-text-primary">{title}</h4>
              <p className="text-sm text-dark-text-secondary">{description}</p>
            </div>
          </div>
          <div className={`text-2xl text-dark-text-secondary transition-all duration-300 ${isExpanded ? 'rotate-180' : ''} group-hover:text-white`}>
            ⌄
          </div>
        </div>
      </div>
      
      {/* Expanded Tools Section with smoother animation */}
      <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
            <div className="border-t border-dark-border/50 bg-dark-primary/20 p-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tools.map((tool) => (
                        tool.available ? (
                            <Link key={tool.name} to={tool.path} className="group/item flex items-center justify-between bg-dark-tertiary/50 p-3 rounded-md hover:bg-dark-tertiary transition-colors">
                                <div>
                                    <h6 className="font-medium text-dark-text-primary">{tool.name}</h6>
                                </div>
                                <span className="flex items-center text-xs text-green-400 ml-4 opacity-70 group-hover/item:opacity-100 transition-opacity">
                                    <span className="relative flex h-2 w-2 mr-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-40-_400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Go
                                </span>
                            </Link>
                        ) : (
                            <div key={tool.name} className="flex items-center justify-between bg-dark-tertiary/30 p-3 rounded-md opacity-50 cursor-not-allowed">
                                <div>
                                    <h6 className="font-medium text-dark-text-primary">{tool.name}</h6>
                                </div>
                                <span className="text-xs text-dark-text-secondary ml-4">Soon</span>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ToolCategory;