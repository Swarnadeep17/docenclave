
import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { toolCategories } from '../config/tools'
import ToolCard from './ToolCard'
import PdfMerge from './tools/pdf/PdfMerge'
import { useStats } from '../contexts/StatsContext'

const ToolsLayout = () => {
  const location = useLocation()
  const isToolPage = location.pathname !== '/tools'
  const { stats: globalStats } = useStats();

  if (isToolPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="pdf-merge" element={<PdfMerge />} />
          {/* Add more tool routes here as we implement them */}
        </Routes>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          All Tools
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose from our comprehensive collection of document processing tools
        </p>
      </div>

      {Object.entries(toolCategories).map(([categoryId, category]) => (
        <div key={categoryId} className="mb-12">
          <div className="flex items-center mb-6">
            <i className={`fas ${category.icon} text-2xl text-primary-600 mr-3`}></i>
            <h2 className="text-2xl font-bold">{category.name}</h2>
          </div>
          <p className="mb-6 text-gray-600">{category.description}</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(category.tools).map(([toolId, tool]) => (
              <ToolCard key={toolId} tool={{ ...tool, id: toolId }} usage={(globalStats?.toolUsage && globalStats.toolUsage[toolId]) || 0} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ToolsLayout
