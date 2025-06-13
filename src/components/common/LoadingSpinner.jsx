import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className={`${sizeClasses[size]} border-3 border-gray-700 border-t-white rounded-full animate-spin`}></div>
      <p className="text-gray-400 text-sm font-medium">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
