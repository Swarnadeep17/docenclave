
import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="py-8 bg-gray-900 text-gray-300">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-lg font-semibold">DocEnclave</h3>
            <p className="text-sm">
              Modern document processing tools for everyone
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/tools" className="text-sm hover:text-white">
                  All Tools
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm hover:text-white">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-sm hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 mt-8 text-sm text-center border-t border-gray-800">
          © {new Date().getFullYear()} DocEnclave. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer
