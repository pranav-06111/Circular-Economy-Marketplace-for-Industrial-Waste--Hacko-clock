import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, PackagePlus, Leaf, Search, Zap } from 'lucide-react';

export default function Layout({ setAuth }: { setAuth: (val: boolean) => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(false);
    navigate('/');
  };

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const role = user?.role || 'seller';

  let navItems: any[] = [];
  
  const sellerItems = [
    { name: 'My Listings', path: '/dashboard', icon: LayoutDashboard },
    { name: 'List Waste', path: '/offload', icon: PackagePlus },
  ];

  const buyerItems = [
    { name: 'Browse Waste', path: '/buyer-dashboard', icon: Search },
    { name: 'My Matches', path: '/matches', icon: Zap },
  ];
  
  if (role === 'buyer') {
    navItems = buyerItems;
  } else if (role === 'seller') {
    navItems = sellerItems;
  } else {
    // Both
    navItems = [...buyerItems, ...sellerItems];
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Leaf className="text-emerald-500 mr-2" />
          <span className="font-bold text-xl tracking-tight">EcoMatch</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Prevent /dashboard from matching /buyer-dashboard falsely in styling
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
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
          <div className="px-4 py-3 mb-2">
             <div className="text-sm font-bold truncate">{user?.name || user?.companyName}</div>
             <div className="text-xs text-slate-500 capitalize">{role} Account</div>
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
