
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { StatsProvider } from './contexts/StatsContext'
import Navbar from './components/Navbar'
import Home from './components/Home'
import PdfMerge from './components/tools/pdf/PdfMerge'

function App() {
  return (
    <AuthProvider>
      <StatsProvider>
        <div className="min-h-screen bg-black">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools/pdf-merge" element={<PdfMerge />} />
            {/* Redirect all other tools routes to home with tools section */}
            <Route path="/tools/*" element={<Navigate to="/#tools" replace />} />
          </Routes>
        </div>
      </StatsProvider>
    </AuthProvider>
  )
}

export default App
