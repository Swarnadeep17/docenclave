import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import PDFMerge from './tools/pdf/merge/PDFMerge.jsx'
import PDFSplit from './tools/pdf/split/PDFSplit.jsx'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tools/pdf/merge" element={<PDFMerge />} />
          <Route path="/tools/pdf/split" element={<PDFSplit />} />
          {/* Future routes */}
          {/* <Route path="/tools/pdf/compress" element={<PDFCompress />} /> */}
          {/* <Route path="/tools/image/resize" element={<ImageResize />} /> */}
        </Routes>
      </Layout>
    </Router>
  )
}

export default App