import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import Footer from './components/layout/Footer';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />
      <main className="flex-grow pt-16 md:pt-20"> {/* Added padding for fixed header */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;