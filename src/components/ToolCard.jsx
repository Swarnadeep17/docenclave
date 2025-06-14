
import React from 'react'
import { Link } from 'react-router-dom'

const ToolCard = ({ tool }) => {
  const { id, name, description, icon, status } = tool
  
  return (
    <div className="card transition-transform hover:scale-105">
      <div className="flex items-center justify-between mb-4">
        <i className={`fas ${icon} text-2xl text-primary-600`}></i>
        {status === 'soon' && (
          <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">
            Coming Soon
          </span>
        )}
      </div>
      <h3 className="mb-2 text-xl font-semibold">{name}</h3>
      <p className="mb-4 text-sm text-gray-600">{description}</p>
      {status === 'soon' ? (
        <button disabled className="w-full btn-secondary opacity-50 cursor-not-allowed">
          Coming Soon
        </button>
      ) : (
        <Link to={`/tools/${id}`} className="block w-full text-center btn-primary">
          Use Tool
        </Link>
      )}
    </div>
  )
}

export default ToolCard
