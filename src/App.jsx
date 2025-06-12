import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import PDFMerge from './tools/pdf/merge/PDFMerge.jsx';
import PDFSplit from './tools/pdf/split/PDFSplit.jsx';

// Import new pages and the admin route
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Account from './pages/Account.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminRoute from './auth/AdminRoute.jsx';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Tool Routes */}
          <Route path="/tools/pdf/merge" element={<PDFMerge />} />
          <Route path="/tools/pdf/split" element={<PDFSplit />} />

          {/* Protected Routes */}
          <Route path="/account" element={<Account />} />
          <Route path="/admin" element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          } />

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;