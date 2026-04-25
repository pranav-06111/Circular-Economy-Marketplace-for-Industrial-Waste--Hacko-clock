import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { LayoutDashboard, LogOut, PackagePlus, Leaf, Search, Zap, Activity, UserCircle, ClipboardList, Menu, X, Sparkles } from 'lucide-react';

import OnboardingModal from './OnboardingModal';

export default function Layout({ setAuth }: { setAuth: (val: boolean) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
   const [showOnboarding, setShowOnboarding] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(false);
    navigate('/');
  };

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const role = user?.role || 'seller';

  // Check if seller needs onboarding (first-time Google login with no profile)
  useEffect(() => {
    if (user && role === 'seller' && !user.profileCompleted) {
      // Check if critical fields are missing
      if (!user.companyName || !user.location) {
        setShowOnboarding(true);
      }
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Force re-read user from localStorage (it was updated by the modal)
    window.location.reload();
  };

  let navItems: any[] = [];
  
  const sellerItems = [
    { name: 'My Listings', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Matcher', path: '/ai-matcher', icon: Zap },
    { name: 'Your Impact', path: '/impact', icon: Leaf },
    { name: 'List Waste', path: '/offload', icon: PackagePlus },
    { name: 'My Orders', path: '/seller/orders', icon: ClipboardList },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  const buyerItems = [
    { name: 'Browse Waste', path: '/buyer-dashboard', icon: Search },
    { name: 'AI Matcher', path: '/ai-matcher', icon: Zap },
    { name: 'Your Impact', path: '/impact', icon: Leaf },
    { name: 'My Matches', path: '/matches', icon: Activity },
    { name: 'My Orders', path: '/buyer/orders', icon: ClipboardList },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];
  
  if (role === 'buyer') {
    navItems = buyerItems;
  } else if (role === 'seller') {
    navItems = sellerItems;
  } else {
    // Both
    navItems = [...buyerItems, ...sellerItems.filter(s => s.path !== '/profile')];
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-emerald-50 dark:from-gray-950 dark:to-emerald-950/30 text-slate-900 dark:text-white font-sans relative z-0 before:absolute before:w-[400px] before:h-[400px] before:bg-emerald-500/10 before:blur-3xl before:rounded-full before:-top-20 before:-left-20 before:pointer-events-none">
       {/* Onboarding Modal for first-time sellers */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-purple-900/10 z-50 md:hidden flex flex-col shadow-2xl"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center">
                  <Leaf className="text-emerald-500 mr-2" />
                  <span className="font-bold text-xl tracking-tight">EcoMatch</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.name + item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 ease-in-out ${
                        isActive 
                        ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                        : 'hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={20} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      {item.name === 'My Matches' && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-emerald-600' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                          8
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

          <div className="px-4 pb-4 overflow-y-auto shrink-0">
            <div className="mb-4 p-4 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-500/20 rounded-xl shadow-sm">
              <div className="flex items-center mb-3">
                <Leaf className="text-emerald-500 mr-2" size={16} />
                <span className="font-bold text-sm">Your Impact</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-slate-500">CO₂ Saved</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">14.2K <span className="text-sm font-medium">tons</span></div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Waste Diverted</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">2,341 <span className="text-sm font-medium">tons</span></div>
                </div>
              </div>
              <Link to="/impact" className="block mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-500">
                View Full Impact &rarr;
              </Link>
            </div>
            
            {/* Promo Card */}
            <div className="mb-4 p-5 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg relative overflow-hidden group">
               <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
               <div className="relative z-10">
                  <div className="flex items-center mb-2">
                     <Sparkles className="text-yellow-300 mr-2 shrink-0" size={18} />
                     <span className="font-bold text-sm leading-tight">Upgrade Your Impact</span>
                  </div>
                  <p className="text-[10px] text-white/90 mb-3 leading-relaxed mt-2 font-medium">
                     Unlock advanced analytics, priority matches and more.
                  </p>
                  <button className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-shadow active:scale-95 w-full">
                     Upgrade Now
                  </button>
               </div>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors shrink-0"
            >
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </motion.aside>
      </>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-white/5 dark:backdrop-blur-xl border-r border-slate-200 dark:border-white/10 hidden md:flex flex-col relative z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Leaf className="text-emerald-500 mr-2" />
          <span className="font-bold text-xl tracking-tight">EcoMatch</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name + item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 ease-in-out ${
                  isActive 
                  ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                  : 'hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.name === 'My Matches' && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white text-emerald-600' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                    8
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-4">
          <div className="mb-4 p-4 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-500/20 rounded-xl shadow-sm">
            <div className="flex items-center mb-3">
              <Leaf className="text-emerald-500 mr-2" size={16} />
              <span className="font-bold text-sm">Your Impact</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500">CO₂ Saved</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">14.2K <span className="text-sm font-medium">tons</span></div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Waste Diverted</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">2,341 <span className="text-sm font-medium">tons</span></div>
              </div>
            </div>
            <Link to="/impact" className="block mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-500">
              View Full Impact &rarr;
            </Link>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop Header */}
        <header className="h-20 bg-white/50 dark:bg-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-purple-900/10/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 hidden md:flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search waste types, locations, sellers..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-6 ml-4">
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-[1.02] transition-all flex items-center">
              <Zap size={16} className="mr-2" fill="currentColor" />
              Find AI Matches
            </button>
            
            <div className="relative cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors">
              <div className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-900"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 dark:text-slate-300"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            </div>

            <Link to="/profile" className="flex items-center border-l border-slate-200 dark:border-slate-800 pl-6 cursor-pointer group hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border-2 border-emerald-500/20 group-hover:border-emerald-500 overflow-hidden mr-3 transition-colors shadow-sm">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={20} className="text-emerald-500" />
                )}
              </div>
              <div className="hidden lg:block">
                <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user?.name || user?.companyName || 'User'}</div>
                <div className="text-xs text-slate-500 capitalize">{role} Account</div>
              </div>
            </Link>
          </div>
        </header>


        <header className="h-16 bg-white dark:bg-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-purple-900/10 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:hidden sticky top-0 z-30">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 mr-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center">
              <Leaf className="text-emerald-500 mr-2" />
              <span className="font-bold text-lg tracking-tight">EcoMatch</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/profile" className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border border-emerald-500/20 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={18} className="text-emerald-500" />
              )}
            </Link>
          </div>
        </header>


        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
