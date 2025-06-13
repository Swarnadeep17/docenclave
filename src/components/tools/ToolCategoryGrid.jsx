import React from 'react';
import { Link } from 'react-router-dom';

const toolCategories = [
  {
    id: 'pdf',
    name: 'PDF Tools',
    icon: 'picture_as_pdf',
    description: 'Merge, split, compress, convert and manipulate PDF files',
    toolCount: 8,
    color: 'from-red-500 to-red-700',
    tools: [
      'PDF Merge', 'PDF Split', 'PDF Compress', 'PDF to Image', 
      'Image to PDF', 'PDF Rotate', 'PDF Unlock', 'PDF Protect'
    ]
  },
  {
    id: 'image',
    name: 'Image Tools',
    icon: 'image',
    description: 'Resize, compress, convert and edit images',
    toolCount: 6,
    color: 'from-green-500 to-green-700',
    tools: [
      'Image Resize', 'Image Compress', 'Image Convert', 
      'Image Crop', 'Image Rotate', 'Image Enhance'
    ]
  },
  {
    id: 'document',
    name: 'Document Tools',
    icon: 'description',
    description: 'Convert and manipulate Word, Excel, PowerPoint files',
    toolCount: 4,
    color: 'from-blue-500 to-blue-700',
    tools: [
      'Word to PDF', 'Excel to PDF', 'PowerPoint to PDF', 'Document Converter'
    ]
  }
];

const ToolCategoryGrid = () => {
  return (
    <div className="space-y-12">
      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {toolCategories.map((category) => (
          <Link
            key={category.id}
            to={`/tools/${category.id}`}
            className="group relative bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:bg-gray-800 hover:border-gray-600 hover:scale-105 transition-all duration-500 cursor-pointer overflow-hidden"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-white/10 rounded-xl mb-6 group-hover:bg-white/20 transition-colors duration-300">
                <span className="material-icons text-3xl text-white">{category.icon}</span>
              </div>
              
              {/* Category Info */}
              <h3 className="text-2xl font-bold mb-3 group-hover:text-white transition-colors duration-300">
                {category.name}
              </h3>
              <p className="text-gray-400 mb-4 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                {category.description}
              </p>
              
              {/* Tool Count */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-sm font-medium">
                  {category.toolCount} Tools
                </span>
                <span className="material-icons text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                  arrow_forward
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recently Used Tools (Placeholder) */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6">Recently Used Tools</h2>
        <div className="text-center py-12">
          <span className="material-icons text-6xl text-gray-600 mb-4">history</span>
          <p className="text-gray-400 text-lg">No recent tools yet</p>
          <p className="text-gray-500 text-sm mt-2">Start using tools to see your history here</p>
        </div>
      </div>

      {/* Quick Access Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
        <div className="flex flex-wrap gap-3">
          {['PDF Merge', 'Image Resize', 'PDF Compress', 'Image Convert'].map((tool) => (
            <button
              key={tool}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors duration-300"
            >
              {tool}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolCategoryGrid;