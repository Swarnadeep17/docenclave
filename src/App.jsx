
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './components/Home'
import ToolsLayout from './components/ToolsLayout'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools/*" element={<ToolsLayout />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
