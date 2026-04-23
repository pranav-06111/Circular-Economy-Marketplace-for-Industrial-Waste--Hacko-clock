/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import Dashboard from './pages/Dashboard';
import BuyerMatches from './pages/BuyerMatches';
import AiMatcher from './pages/AiMatcher';
import Offload from './pages/Offload';
import Profile from './pages/Profile';
import SellerOrders from './pages/SellerOrders';
import BuyerOrders from './pages/BuyerOrders';
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

    // Global axios interceptor: auto-logout on 401
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      window.removeEventListener('storage', checkAuth);
      axios.interceptors.response.eject(interceptorId);
    };
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white', style: { borderRadius: '10px', background: '#fff', color: '#1e293b' } }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
        <Route path="/" element={isAuthenticated ? <Layout setAuth={setIsAuthenticated} /> : <Navigate to="/login" />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="buyer-dashboard" element={<BuyerDashboard />} />
          <Route path="matches" element={<BuyerMatches />} />
          <Route path="ai-matcher" element={<AiMatcher />} />
          <Route path="offload" element={<Offload />} />
          <Route path="profile" element={<Profile />} />
          <Route path="seller/orders" element={<SellerOrders />} />
          <Route path="buyer/orders" element={<BuyerOrders />} />
        </Route>
      </Routes>
    </Router>
  );
}
