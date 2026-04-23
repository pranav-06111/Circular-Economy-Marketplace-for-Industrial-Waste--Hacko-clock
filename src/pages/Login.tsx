import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Leaf, UserCircle, Settings } from 'lucide-react';

export default function Login({ setAuth }: { setAuth: (val: boolean) => void }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Visual tab for login role (won't affect login api, just for UX)
  const [loginRole, setLoginRole] = useState<'seller' | 'buyer'>('seller');

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    password: '',
    location: '',
    industryType: 'Manufacturing',
    phone: '',
    role: 'seller'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email: formData.email, password: formData.password } : formData;
      const res = await axios.post(endpoint, payload);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setAuth(true);
      
      const userRole = res.data.user.role;
      if (userRole === 'buyer') {
        navigate('/buyer-dashboard');
      } else {
        navigate('/dashboard'); // default mapping or seller
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center mb-4">
          <Leaf className="w-6 h-6" />
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isLogin ? 'Sign in to your account' : 'Register your business'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none sm:rounded-2xl border border-slate-200 dark:border-slate-800">
          
          {isLogin && (
            <div className="flex border-b border-slate-200 dark:border-slate-800">
              <button 
                className={`flex-1 py-4 text-sm font-semibold transition-colors flex justify-center items-center ${loginRole === 'seller' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                onClick={() => setLoginRole('seller')}
              >
                 <Settings size={16} className="mr-2"/> Login as Seller
              </button>
              <button 
                className={`flex-1 py-4 text-sm font-semibold transition-colors flex justify-center items-center ${loginRole === 'buyer' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                onClick={() => setLoginRole('buyer')}
              >
                 <UserCircle size={16} className="mr-2"/> Login as Buyer
              </button>
            </div>
          )}

          <div className="py-8 px-4 sm:px-10">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                      <input name="name" required value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                      <input name="companyName" required value={formData.companyName} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role in Circular Economy</label>
                    <select name="role" required value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-emerald-400 font-semibold text-emerald-600">
                      <option value="seller">Seller (I produce waste)</option>
                      <option value="buyer">Buyer (I consume waste)</option>
                      <option value="both">Both (I produce and consume waste)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City</label>
                      <input name="location" required value={formData.location} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Industry Type</label>
                      <select name="industryType" value={formData.industryType} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white">
                        {['Manufacturing', 'Chemical', 'Metal', 'Plastic', 'Textile', 'Pharma', 'Food', 'Other'].map(i => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                    <input name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input name="password" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} required value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-white" />
              </div>

              <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5 text-sm font-bold text-slate-900 bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all mt-4">
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
