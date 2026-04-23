/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import Dashboard from './pages/Dashboard';
import BuyerMatches from './pages/BuyerMatches';
import Offload from './pages/Offload';
import Layout from './components/Layout';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white', style: { borderRadius: '10px', background: '#fff', color: '#1e293b' } }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/" element={isAuthenticated ? <Layout setAuth={setIsAuthenticated} /> : <Navigate to="/login" />}>
          <Route path="buyer-dashboard" element={<BuyerDashboard />} />
          <Route path="matches" element={<BuyerMatches />} />
          <Route path="offload" element={<Offload />} />
        </Route>
      </Routes>
    </Router>
  );
}
