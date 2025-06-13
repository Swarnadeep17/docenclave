
import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import ToolCategoryGrid from '../components/tools/ToolCategoryGrid';
import ToolCategoryDetail from '../components/tools/ToolCategoryDetail';
import PDFMergeTool from '../components/tools/pdf/PDFMergeTool';

const ToolsPage = () => {
  const { category, tool } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    navigate(`/tools/${categoryId}`);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
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

        {/* Tools Content */}
        <Routes>
          <Route 
            path="/" 
            element={
              <ToolCategoryGrid 
                onCategorySelect={handleCategorySelect}
              />
            } 
          />
          <Route 
            path="/:category" 
            element={
              <ToolCategoryDetail 
                category={selectedCategory}
                onBack={handleBackToCategories}
              />
            } 
          />
          <Route 
            path="/pdf/merge" 
            element={<PDFMergeTool />} 
          />
        </Routes>
      </div>
    </div>
  );
};

export default ToolsPage;

