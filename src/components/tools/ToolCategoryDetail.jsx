import React from 'react';
import { Link } from 'react-router-dom';

const categoryData = {
  pdf: {
    name: 'PDF Tools',
    icon: 'picture_as_pdf',
    description: 'Comprehensive PDF manipulation tools for all your document needs',
    tools: [
      {
        id: 'merge',
        name: 'PDF Merge',
        description: 'Combine multiple PDF files into one document',
        icon: 'merge',
        path: '/tools/pdf/merge',
        isPremium: false,
        featured: true
      },
      {
        id: 'split',
        name: 'PDF Split',
        description: 'Split PDF files into separate pages or sections',
        icon: 'call_split',
        path: '/tools/pdf/split',
        isPremium: false,
        featured: true
      },
      {
        id: 'compress',
        name: 'PDF Compress',
        description: 'Reduce PDF file size while maintaining quality',
        icon: 'compress',
        path: '/tools/pdf/compress',
        isPremium: true,
        featured: true
      },
      {
        id: 'convert-to-image',
        name: 'PDF to Image',
        description: 'Convert PDF pages to high-quality images',
        icon: 'image',
        path: '/tools/pdf/to-image',
        isPremium: false,
        featured: false
      },
      {
        id: 'image-to-pdf',
        name: 'Image to PDF',
        description: 'Convert images to PDF documents',
        icon: 'picture_as_pdf',
        path: '/tools/pdf/from-image',
        isPremium: false,
        featured: false
      },
      {
        id: 'rotate',
        name: 'PDF Rotate',
        description: 'Rotate PDF pages to correct orientation',
        icon: 'rotate_right',
        path: '/tools/pdf/rotate',
        isPremium: true,
        featured: false
      }
    ]
  },
  image: {
    name: 'Image Tools',
    icon: 'image',
    description: 'Professional image editing and conversion tools',
    tools: [
      {
        id: 'resize',
        name: 'Image Resize',
        description: 'Resize images while maintaining aspect ratio',
        icon: 'photo_size_select_large',
        path: '/tools/image/resize',
        isPremium: false,
        featured: true
      },
      {
        id: 'compress',
        name: 'Image Compress',
        description: 'Reduce image file size without quality loss',
        icon: 'compress',
        path: '/tools/image/compress',
        isPremium: false,
        featured: true
      },
      {
        id: 'convert',
        name: 'Image Convert',
        description: 'Convert between different image formats',
        icon: 'transform',
        path: '/tools/image/convert',
        isPremium: true,
        featured: true
      }
    ]
  },
  document: {
    name: 'Document Tools',
    icon: 'description',
    description: 'Convert and manipulate various document formats',
    tools: [
      {
        id: 'word-to-pdf',
        name: 'Word to PDF',
        description: 'Convert Word documents to PDF format',
        icon: 'picture_as_pdf',
        path: '/tools/document/word-to-pdf',
        isPremium: true,
        featured: true
      },
      {
        id: 'excel-to-pdf',
        name: 'Excel to PDF',
        description: 'Convert Excel spreadsheets to PDF format',
        icon: 'picture_as_pdf',
        path: '/tools/document/excel-to-pdf',
        isPremium: true,
        featured: true
      }
    ]
  }
};

const ToolCategoryDetail = ({ category, onBack }) => {
  const categoryInfo = categoryData[category];

  if (!categoryInfo) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
        <button
          onClick={onBack}
          className="btn-primary"
        >
          Back to Tools
        </button>
      </div>
    );
  }

  const featuredTools = categoryInfo.tools.filter(tool => tool.featured);
  const otherTools = categoryInfo.tools.filter(tool => !tool.featured);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300"
        >
          <span className="material-icons">arrow_back</span>
          <span>Back to Tools</span>
        </button>
      </div>

      {/* Category Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
            <span className="material-icons text-3xl text-white">{categoryInfo.icon}</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{categoryInfo.name}</h1>
            <p className="text-gray-400 mt-2">{categoryInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Featured Tools */}
      {featuredTools.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Featured Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {/* Other Tools */}
      {otherTools.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">All Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ToolCard = ({ tool }) => {
  return (
    <Link
      to={tool.path}
      className="group bg-gray-900 border border-gray-800 rounded-xl p-6 hover:bg-gray-800 hover:border-gray-600 hover:scale-105 transition-all duration-300 relative overflow-hidden"
    >
      {/* Premium Badge */}
      {tool.isPremium && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-xs font-bold px-2 py-1 rounded-full">
          PRO
        </div>
      )}

      {/* Icon */}
      <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg mb-4 group-hover:bg-white/20 transition-colors duration-300">
        <span className="material-icons text-xl text-white">{tool.icon}</span>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors duration-300">
        {tool.name}
      </h3>
      <p className="text-gray-400 text-sm mb-4 group-hover:text-gray-300 transition-colors duration-300">
        {tool.description}
      </p>

      {/* Action */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">
          {tool.isPremium ? 'Premium' : 'Free'}
        </span>
        <span className="material-icons text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
          arrow_forward
        </span>
      </div>
    </Link>
  );
};

export default ToolCategoryDetail;
