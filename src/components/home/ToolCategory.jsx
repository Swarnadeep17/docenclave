import React from 'react';
import { Link } from 'react-router-dom';

const ToolCategory = ({ title, icon, description, tools, isExpanded, onToggle }) => {
  return (
    // Simpler styling: a solid background with a subtle border
    <div className={`bg-dark-tertiary rounded-lg border border-dark-border/50 transition-all duration-300`}>
      <div
        onClick={onToggle}
        className="p-4 md:p-5 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl">{icon}</div>
            <div>
              <h4 className="text-base font-semibold text-dark-text-primary">{title}</h4>
              <p className="hidden md:block text-xs text-dark-text-secondary">{description}</p>
            </div>
          </div>
          <div className={`text-xl text-dark-text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            ⌄
          </div>
        </div>
      </div>
      
      <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
            <div className="border-t border-dark-border/50 bg-dark-primary/50 p-3 mx-4 mb-4 rounded-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {tools.map((tool) => (
                        tool.available ? (
                            <Link key={tool.name} to={tool.path} className="group flex items-center justify-between bg-dark-secondary p-2.5 rounded-md hover:bg-dark-border transition-colors">
                                <h6 className="text-sm font-medium text-dark-text-primary">{tool.name}</h6>
                                <span className="flex items-center text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Go →
                                </span>
                            </Link>
                        ) : (
                            <div key={tool.name} className="flex items-center justify-between bg-dark-secondary/50 p-2.5 rounded-md opacity-60 cursor-not-allowed">
                                <h6 className="text-sm font-medium text-dark-text-primary">{tool.name}</h6>
                                <span className="text-xs text-dark-text-secondary">Soon</span>
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