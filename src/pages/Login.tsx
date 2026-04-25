import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Leaf, UserCircle, Settings, Mail, Lock, Briefcase, 
  MapPin, Phone, Building2, Package, Factory, 
  CheckCircle2, ShieldCheck, Loader2, Zap
} from 'lucide-react';

declare global {
  interface Window { google?: any; }
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

export default function Login({ setAuth }: { setAuth: (val: boolean) => void }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const loginRoleRef = useRef<'seller' | 'buyer'>('seller');
  const googleBtnRef = useRef<HTMLDivElement>(null);
  
  // Visual tab for login role
  const [loginRole, setLoginRole] = useState<'seller' | 'buyer'>('seller');

  // Keep ref in sync so the Google callback always has the latest role
  useEffect(() => { loginRoleRef.current = loginRole; }, [loginRole]);

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

  // Sync role in form data when toggle changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, role: loginRole }));
  }, [loginRole]);

  // Google credential callback
  const handleGoogleResponse = useCallback(async (response: any) => {
    setGoogleLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/google', {
        credential: response.credential,
        role: loginRoleRef.current,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setAuth(true);
      navigate(res.data.user.role === 'buyer' ? '/buyer-dashboard' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  }, [setAuth, navigate]);

  // Initialize Google Identity Services
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const initGoogle = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        ux_mode: 'popup',
      });
      // Render Google's official button into our container
      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          theme: 'filled_blue',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: googleBtnRef.current.offsetWidth || 400,
        });
      }
    };
    if (window.google?.accounts) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts) { initGoogle(); clearInterval(interval); }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [handleGoogleResponse, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password, role: formData.role } 
        : formData;
      const res = await axios.post(endpoint, payload);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setAuth(true);
      
      const userRole = res.data.user.role;
      if (userRole === 'buyer') {
        navigate('/buyer-dashboard');
      } else {
        navigate('/dashboard'); 
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white font-sans text-slate-900">
      
      {/* LEFT SIDE - PRODUCT VALUE (Desktop Only) */}
      <div className="hidden lg:flex flex-col justify-center px-16 relative overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] mix-blend-overlay" />
        
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2 mb-12">
            <Leaf className="text-emerald-500 w-6 h-6" />
            <span className="font-bold text-xl tracking-tight text-white">EcoMatch India</span>
          </div>

          <h1 className="text-5xl font-bold text-white mb-6 leading-[1.15] tracking-tight">
            Turn Waste Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300">Revenue</span>
          </h1>
          
          <p className="text-lg text-slate-300 mb-12 font-medium">
            Join 100+ industries already trading waste smarter.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="mt-1">
                <Zap size={20} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base mb-1">AI Matching</h3>
                <p className="text-slate-400 text-sm">Instantly connect with the right partners.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="mt-1">
                <ShieldCheck size={20} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base mb-1">Verified Buyers</h3>
                <p className="text-slate-400 text-sm">Every participant is vetted for safety.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="mt-1">
                <CheckCircle2 size={20} className="text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base mb-1">Compliance Ready</h3>
                <p className="text-slate-400 text-sm">Automated tracking under Hazardous Waste Rules 2016.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="flex flex-col justify-center px-6 py-12 relative bg-slate-50 overflow-y-auto">
        
        <div className="w-full max-w-md mx-auto">
          
          <div className="text-center mb-8 lg:hidden">
            <Leaf className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">EcoMatch India</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 md:p-10">
            
            <div className="text-center mb-8">
               <div className="w-12 h-12 bg-emerald-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Leaf size={24} className="text-emerald-600" />
               </div>
               <h2 className="text-2xl font-bold text-slate-900 mb-2">
                 {isLogin ? 'Welcome back' : 'Create your account'}
               </h2>
               <p className="text-slate-500 text-sm">
                 {isLogin ? 'Enter your details to access your dashboard' : 'Join the circular economy marketplace'}
               </p>
            </div>

            {/* Pill Toggle Switch */}
            {isLogin && (
              <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                <button 
                  type="button"
                  onClick={() => setLoginRole('seller')}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${loginRole === 'seller' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Package size={16}/> 
                  <div>
                     <div>Seller</div>
                     <div className={`text-[10px] font-normal ${loginRole === 'seller' ? 'text-indigo-100' : 'text-slate-400'}`}>List your waste</div>
                  </div>
                </button>
                <button 
                  type="button"
                  onClick={() => setLoginRole('buyer')}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${loginRole === 'buyer' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <Factory size={16}/> 
                  <div>
                     <div>Buyer</div>
                     <div className={`text-[10px] font-normal ${loginRole === 'buyer' ? 'text-indigo-100' : 'text-slate-400'}`}>Find raw materials</div>
                  </div>
                </button>
              </div>
            )}

            {/* Social Logins */}
            {isLogin && (
              <div className="mb-6 space-y-4">
                {googleLoading ? (
                  <div className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm">
                    <Loader2 size={18} className="animate-spin text-slate-400" /> Signing in...
                  </div>
                ) : (
                  <div ref={googleBtnRef} className="w-full flex justify-center [&>div]:w-full [&_iframe]:!w-full [&_iframe]:!rounded-xl" />
                )}

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] uppercase tracking-widest font-bold">Or continue with email</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {error}
                </div>
              )}

              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <UserCircle size={18} />
                      </div>
                      <input name="name" required placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <Building2 size={18} />
                      </div>
                      <input name="companyName" required placeholder="Company Name" value={formData.companyName} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Settings size={18} />
                    </div>
                    <select name="role" required value={formData.role} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all appearance-none">
                      <option value="seller">Seller (I produce waste)</option>
                      <option value="buyer">Buyer (I consume waste)</option>
                      <option value="both">Both (Produce & Consume)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <MapPin size={18} />
                      </div>
                      <input name="location" required placeholder="City/Location" value={formData.location} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all" />
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <Briefcase size={18} />
                      </div>
                      <select name="industryType" value={formData.industryType} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all appearance-none">
                        {['Manufacturing', 'Chemical', 'Metal', 'Plastic', 'Textile', 'Pharma', 'Food', 'Other'].map(i => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Phone size={18} />
                    </div>
                    <input name="phone" required placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div>
                </>
              )}

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input name="email" type="email" autoComplete="email" required placeholder="Email address" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input name="password" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} required placeholder="Password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-3.5 flex justify-center items-center gap-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-70 transition-colors mt-6"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing...</>
                ) : (
                  isLogin ? 'Access Marketplace →' : 'Create Account →'
                )}
              </button>

              {isLogin && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, email: 'seller@ecowastes.in', password: 'password123', role: 'seller' }));
                      setLoginRole('seller');
                      toast.success('Seller credentials filled!');
                    }}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Package size={14} /> Demo Seller
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, email: 'buyer1@greenplast.in', password: 'password123', role: 'buyer' }));
                      setLoginRole('buyer');
                      toast.success('Buyer credentials filled!');
                    }}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Factory size={14} /> Demo Buyer
                  </button>
                </div>
              )}
            </form>

            <div className="mt-6 text-center">
              <button onClick={() => setIsLogin(!isLogin)} className="text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors">
                {isLogin ? "New here? Create your account in 30 seconds" : 'Already have an account? Log in'}
              </button>
            </div>
          </div>
          
          {/* Trust Signals */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1.5 text-slate-500">
               <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center"><Lock size={14} className="text-indigo-600"/></div>
               <div className="text-[10px] font-bold uppercase tracking-wider">Secure Login</div>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-slate-500">
               <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center"><ShieldCheck size={14} className="text-indigo-600"/></div>
               <div className="text-[10px] font-bold uppercase tracking-wider">Data Protected</div>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-slate-500">
               <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center"><Factory size={14} className="text-indigo-600"/></div>
               <div className="text-[10px] font-bold uppercase tracking-wider">100+ Industries</div>
            </div>
          </div>

        </div>
      </div>
    </div>  );
}
