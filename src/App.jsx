
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './components/Home'
import ToolsLayout from './components/ToolsLayout'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools/*" element={<ToolsLayout />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
