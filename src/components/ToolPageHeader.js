// src/components/ToolPageHeader.js
import Link from 'next/link';

export default function ToolPageHeader({ title, description }) {
  return (
    <div className="text-center mb-12 relative pt-12 sm:pt-0">
      {/* Back to Home Button */}
      <div className="absolute top-0 left-0 pt-2">
        <Link 
          href="/#tools" // This links to the homepage and scrolls to the #tools section
          className="text-accent hover:text-gray-200 transition-colors flex items-center group"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
              clipRule="evenodd" 
            />
          </svg>
          All Tools
        </Link>
      </div>

      {/* Page Title and Description */}
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <p className="text-lg text-gray-400 max-w-3xl mx-auto">
        {description}
      </p>
    </div>
  );
}