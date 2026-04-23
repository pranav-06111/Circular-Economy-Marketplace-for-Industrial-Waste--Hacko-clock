import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Leaf, UserCircle, Settings, Mail, Lock, Briefcase, 
  MapPin, Phone, Building2, Package, Factory, 
  CheckCircle2, ShieldCheck, Chrome, Loader2, Zap
} from 'lucide-react';

export default function Login({ setAuth }: { setAuth: (val: boolean) => void }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Visual tab for login role
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

  // Sync role in form data when toggle changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, role: loginRole }));
  }, [loginRole]);

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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-950 font-sans selection:bg-emerald-500/30">
      
      {/* LEFT SIDE - VISUAL & VALUE (Desktop Only) */}
      <div className="hidden lg:flex flex-col justify-center px-16 relative overflow-hidden bg-slate-900/50 border-r border-slate-800">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.1),transparent_40%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] mix-blend-overlay" />
        
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Leaf className="text-emerald-400 w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">EcoMatch India</span>
          </div>

          <h1 className="text-5xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Turn Waste Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Revenue</span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-12 font-medium">
            Join 100+ industries already trading waste smarter.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">AI Matching</h3>
                <p className="text-slate-400 text-sm">Instantly connect with the right partners.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Verified Buyers</h3>
                <p className="text-slate-400 text-sm">Every participant is vetted for safety.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Compliance Ready</h3>
                <p className="text-slate-400 text-sm">Automated documentation and tracking.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM CARD */}
      <div className="flex flex-col justify-center px-6 py-12 relative overflow-y-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-md mx-auto relative z-10">
          
          {/* Fake Data Feed (Power Move) */}
          <div className="mb-6 flex items-center justify-center gap-2 text-xs font-medium text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 py-2 px-4 rounded-full w-max mx-auto shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-pulse">
            <Zap size={12} />
            Last matched: Plastic waste → Buyer in Chennai
          </div>

          <div className="text-center mb-8 lg:hidden">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">EcoMatch India</h2>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-slate-800 shadow-2xl p-8 transition-all duration-300 focus-within:border-emerald-500/40 focus-within:shadow-[0_0_40px_rgba(16,185,129,0.1)]">
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-slate-400 text-sm">
                {isLogin ? 'Enter your details to access your dashboard.' : 'Join the circular economy marketplace.'}
              </p>
            </div>

            {/* Pill Toggle Switch */}
            {isLogin && (
              <div className="flex p-1 bg-slate-950 rounded-xl mb-8 border border-slate-800 relative">
                <div 
                  className={`absolute inset-y-1 w-[calc(50%-4px)] bg-emerald-500/10 border border-emerald-500/20 rounded-lg transition-transform duration-300 ease-out ${loginRole === 'buyer' ? 'translate-x-full' : 'translate-x-0'}`}
                />
                <button 
                  type="button"
                  onClick={() => setLoginRole('seller')}
                  className={`flex-1 py-3 text-sm font-semibold rounded-lg z-10 transition-colors flex flex-col items-center justify-center gap-1 ${loginRole === 'seller' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <div className="flex items-center gap-2"><Package size={16}/> Seller</div>
                  <span className="text-[10px] opacity-70 font-normal">List your waste</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setLoginRole('buyer')}
                  className={`flex-1 py-3 text-sm font-semibold rounded-lg z-10 transition-colors flex flex-col items-center justify-center gap-1 ${loginRole === 'buyer' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <div className="flex items-center gap-2"><Factory size={16}/> Buyer</div>
                  <span className="text-[10px] opacity-70 font-normal">Find raw materials</span>
                </button>
              </div>
            )}

            {/* Social Logins */}
            {isLogin && (
              <div className="mb-6 space-y-3">
                <button type="button" className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors shadow-sm">
                  <Chrome size={18} className="text-blue-500" />
                  Continue with Google
                </button>

                
                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-wider font-medium">Or continue with email</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {error}
                </div>
              )}

              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                        <UserCircle size={18} />
                      </div>
                      <input name="name" required placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                        <Building2 size={18} />
                      </div>
                      <input name="companyName" required placeholder="Company Name" value={formData.companyName} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                      <Settings size={18} />
                    </div>
                    <select name="role" required value={formData.role} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none">
                      <option value="seller">Seller (I produce waste)</option>
                      <option value="buyer">Buyer (I consume waste)</option>
                      <option value="both">Both (Produce & Consume)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                        <MapPin size={18} />
                      </div>
                      <input name="location" required placeholder="City/Location" value={formData.location} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                        <Briefcase size={18} />
                      </div>
                      <select name="industryType" value={formData.industryType} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none">
                        {['Manufacturing', 'Chemical', 'Metal', 'Plastic', 'Textile', 'Pharma', 'Food', 'Other'].map(i => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                      <Phone size={18} />
                    </div>
                    <input name="phone" required placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                  </div>
                </>
              )}

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input name="email" type="email" autoComplete="email" required placeholder="Email address" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input name="password" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} required placeholder="Password" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-3 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full h-14 flex justify-center items-center gap-2 rounded-xl text-sm font-bold text-slate-900 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 transition-all mt-6"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing...</>
                ) : (
                  isLogin ? 'Access Marketplace' : 'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <button onClick={() => setIsLogin(!isLogin)} className="text-slate-400 hover:text-emerald-400 font-medium transition-colors">
                {isLogin ? "New here? Create your account in 30 seconds" : 'Already have an account? Access Marketplace'}
              </button>
            </div>
          </div>
          
          {/* Trust Signals */}
          <div className="mt-8 flex items-center justify-center gap-6 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            <div className="flex items-center gap-1.5"><Lock size={12}/> Secure login</div>
            <div className="flex items-center gap-1.5"><ShieldCheck size={12}/> Data protected</div>
            <div className="flex items-center gap-1.5"><Factory size={12}/> Used by 100+ industries</div>
          </div>

        </div>
      </div>
    </div>
  );
}
