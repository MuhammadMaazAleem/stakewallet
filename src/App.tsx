import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              border: '1px solid rgba(168, 85, 247, 0.3)',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
