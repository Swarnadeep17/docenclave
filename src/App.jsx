import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import PDFMerge from './tools/pdf/merge/PDFMerge.jsx'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools/pdf/merge" element={<PDFMerge />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App