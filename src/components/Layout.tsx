import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, PackagePlus, Leaf, Search, Zap, Activity, UserCircle } from 'lucide-react';
import OnboardingModal from './OnboardingModal';

export default function Layout({ setAuth }: { setAuth: (val: boolean) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);

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
    { name: 'List Waste', path: '/offload', icon: PackagePlus },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  const buyerItems = [
    { name: 'Browse Waste', path: '/buyer-dashboard', icon: Search },
    { name: 'AI Matcher', path: '/ai-matcher', icon: Zap },
    { name: 'My Matches', path: '/matches', icon: Activity },
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans">
      {/* Onboarding Modal for first-time sellers */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col">
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
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Link to="/profile" className="flex items-center px-4 py-3 mb-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-9 h-9 rounded-full mr-3 border-2 border-emerald-500/30 group-hover:border-emerald-500 transition-colors" />
            ) : (
              <div className="w-9 h-9 rounded-full mr-3 bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border-2 border-emerald-500/30">
                <UserCircle size={18} className="text-emerald-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{user?.name || user?.companyName || 'User'}</div>
              <div className="text-xs text-slate-500 capitalize">{role} Account</div>
            </div>
          </Link>
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
        <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 md:hidden">
          <div className="flex items-center">
            <Leaf className="text-emerald-500 mr-2" />
            <span className="font-bold text-xl tracking-tight">EcoMatch</span>
          </div>
          <button onClick={handleLogout} className="text-slate-600 hover:text-rose-500">
            <LogOut size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
