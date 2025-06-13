import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import ToolCategoryGrid from '../components/tools/ToolCategoryGrid';
import ToolCategoryDetail from '../components/tools/ToolCategoryDetail';
import PDFMergeTool from '../components/tools/pdf/PDFMergeTool';

const ToolsPage = () => {
  const navigate = useNavigate();

  const handleBackToCategories = () => {
    navigate('/tools');
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container-padding mx-auto py-8 md:py-12">
        {/* Header */}
        <div className="text-center space-y-4 mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
            Document Tools
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
            Professional-grade tools that run entirely in your browser
          </p>
        </div>

        {/* Tools Content - FIXED ROUTING */}
        <Routes>
          {/* Base route for /tools shows the category grid */}
          <Route 
            path="/" 
            element={<ToolCategoryGrid />} 
          />
          
          {/* Specific tool route - This must come before the general category route */}
          <Route 
            path="pdf/merge" 
            element={<PDFMergeTool />} 
          />

          {/* General category route - This will match /pdf, /image, etc. */}
          <Route 
            path=":category" 
            element={
              <ToolCategoryDetail 
                onBack={handleBackToCategories}
              />
            } 
          />
        </Routes>
      </div>
    </div>
  );
};

export default ToolsPage;