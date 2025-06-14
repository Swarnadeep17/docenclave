
import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            DocEnclave
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/tools" className="btn-secondary">
              Tools
            </Link>
            <button className="btn-primary">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
