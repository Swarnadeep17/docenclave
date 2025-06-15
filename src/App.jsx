
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { StatsProvider } from './contexts/StatsContext'
import Navbar from './components/Navbar'
import Home from './components/Home'
import ToolsLayout from './components/ToolsLayout'
import PdfMerge from './components/tools/pdf/PdfMerge'

function App() {
  return (
    <AuthProvider>
      <StatsProvider>
        <div className="min-h-screen bg-black">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools" element={<ToolsLayout />} /> {/* Render ToolsLayout for /tools */}
            <Route path="/tools/pdf-merge" element={<PdfMerge />} /> {/* Specific tool route */}
          </Routes>
        </div>
      </StatsProvider>
    </AuthProvider>
  )
}

export default App
