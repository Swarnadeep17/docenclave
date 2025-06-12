import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import PDFMerge from './tools/pdf/merge/PDFMerge.jsx';
import PDFSplit from './tools/pdf/split/PDFSplit.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Account from './pages/Account.jsx';
import AdminRoute from './auth/AdminRoute.jsx';

// LAZY LOAD the dashboard component
const Dashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));

// A simple loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex justify-center items-center h-64">
    <p className="text-dark-text-secondary">Loading Page...</p>
  </div>
);

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
          
          {/* Admin Route with Lazy Loading and Suspense */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              </AdminRoute>
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;