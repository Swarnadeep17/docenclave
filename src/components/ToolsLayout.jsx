
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { toolCategories } from '../config/tools'
import ToolCard from './ToolCard'

const ToolsLayout = () => {
  return (
    <div className="container px-4 py-8 mx-auto">
      {Object.entries(toolCategories).map(([categoryId, category]) => (
        <div key={categoryId} className="mb-12">
          <div className="flex items-center mb-6">
            <i className={`fas ${category.icon} text-2xl text-primary-600 mr-3`}></i>
            <h2 className="text-2xl font-bold">{category.name}</h2>
          </div>
          <p className="mb-6 text-gray-600">{category.description}</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(category.tools).map(([toolId, tool]) => (
              <ToolCard key={toolId} tool={{ ...tool, id: toolId }} />
            ))}
          </div>
        </div>
      ))}
      <Routes>
        {/* Tool routes will be dynamically added here as we implement them */}
      </Routes>
    </div>
  )
}

export default ToolsLayout
