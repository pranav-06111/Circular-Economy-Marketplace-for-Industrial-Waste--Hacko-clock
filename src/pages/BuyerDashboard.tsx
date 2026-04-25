import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Recycle, TrendingUp, Cpu, Hash, Search, Filter, Zap, Users, Box, Target, CheckCircle2, Package, LayoutGrid, List, Leaf } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface WasteListing {
  _id: string;
  wasteType: string;
  quantity: number;
  unit: string;
  frequency: string;
  status: string;
  compositionReport: string;
  logisticsEstimate: number;
  co2Savings: number;
  blockchainHash: string;
  createdAt: string;
  seller: {
    companyName: string;
    location: string;
    industryType: string;
  };
  photos?: string[];
}

const getImageUrl = (type: string, photos?: string[]) => {
  if (photos && photos.length > 0) return photos[0];
  
  const typeLower = type.toLowerCase();
  if (typeLower.includes('plastic')) return 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=2070&auto=format&fit=crop';
  if (typeLower.includes('metal')) return 'https://images.unsplash.com/photo-1558222218-b7b54eede3f3?q=80&w=1974&auto=format&fit=crop';
  if (typeLower.includes('paper') || typeLower.includes('cardboard')) return 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=2070&auto=format&fit=crop';
  if (typeLower.includes('electronic') || typeLower.includes('e-waste')) return 'https://images.unsplash.com/photo-1550009158-9ebf6d1736dd?q=80&w=2001&auto=format&fit=crop';
  if (typeLower.includes('glass')) return 'https://images.unsplash.com/photo-1517457222485-eb9f8f265b74?q=80&w=2070&auto=format&fit=crop';
  if (typeLower.includes('chemical')) return 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=2070&auto=format&fit=crop';
  if (typeLower.includes('organic')) return 'https://images.unsplash.com/photo-1581062031105-098e9860b73b?q=80&w=2070&auto=format&fit=crop';
  if (typeLower.includes('wood')) return 'https://images.unsplash.com/photo-1533227260828-53146592230a?q=80&w=2071&auto=format&fit=crop';
  if (typeLower.includes('textile')) return 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1972&auto=format&fit=crop';
  
  return 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=1974&auto=format&fit=crop';
};

export default function BuyerDashboard() {
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ wasteType: '', location: '', minQuantity: '' });
  const [appliedFilters, setAppliedFilters] = useState({ wasteType: '', location: '', minQuantity: '' });

  const categories = ['', 'Plastic', 'Metal', 'Chemical', 'Textile', 'Organic', 'E-Waste', 'Glass', 'Paper', 'Wood', 'Other'];

  useEffect(() => {
    fetchListings();
  }, [appliedFilters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams();
      if (appliedFilters.wasteType) queryParams.append('wasteType', appliedFilters.wasteType);
      if (appliedFilters.location) queryParams.append('location', appliedFilters.location);
      if (appliedFilters.minQuantity) queryParams.append('minQuantity', appliedFilters.minQuantity);

      const res = await axios.get(`/api/listings?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(res.data.listings);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load marketplace data.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilters(filters);
    toast.success('Filters applied');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Browse Marketplace</h1>
          <p className="text-slate-500 dark:text-gray-400">Discover verified secondary raw materials globally.</p>
        </div>
        <Link 
          to="/matches" 
          className="bg-slate-900 hover:bg-slate-800 dark:bg-gradient-to-r dark:from-emerald-500 dark:to-green-600 text-white px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ease-in-out dark:shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-[1.02] inline-flex items-center justify-center shrink-0"
        >
          <Zap size={20} className="mr-2 text-emerald-400 dark:text-white" fill="currentColor" /> Find AI Matches
        </Link>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Total Listings', value: '1,248', growth: '+18 this week', icon: Recycle, color: 'emerald' },
          { title: 'Active Sellers', value: '342', growth: '+12 this week', icon: Users, color: 'purple' },
          { title: 'Materials Available', value: '56', sub: 'Types', icon: Box, color: 'amber' },
          { title: 'Avg. Match Score', value: '92%', sub: 'High Accuracy', icon: Target, color: 'blue' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          const isGreen = stat.color === 'emerald';
          return (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-500 mb-1">{stat.title}</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                </div>
                <div className={`p-2.5 rounded-xl ${
                  stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
                  stat.color === 'purple' ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' :
                  stat.color === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                  'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                }`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className={`mt-3 text-sm font-medium ${isGreen ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                {stat.growth || stat.sub}
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm mb-6">
        <form onSubmit={handleApplyFilters} className="flex flex-col md:flex-row gap-4 items-end">
           <div className="w-full md:w-1/4">
             <label className="block text-xs font-bold text-slate-500 mb-1.5">Waste Type</label>
             <select 
               value={filters.wasteType} 
               onChange={(e) => setFilters({...filters, wasteType: e.target.value})}
               className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-emerald-500 focus:border-indigo-500 dark:bg-slate-950 text-sm font-medium transition-colors"
             >
               {categories.map(c => <option key={c} value={c}>{c === '' ? 'All Types' : c}</option>)}
             </select>
           </div>
           <div className="w-full md:w-1/4">
             <label className="block text-xs font-bold text-slate-500 mb-1.5">Location</label>
             <input 
               value={filters.location} 
               onChange={(e) => setFilters({...filters, location: e.target.value})}
               className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-emerald-500 focus:border-indigo-500 dark:bg-slate-950 text-sm font-medium transition-colors"
               placeholder="e.g. Pune, Maharashtra"
             />
           </div>
           <div className="w-full md:w-1/5">
             <label className="block text-xs font-bold text-slate-500 mb-1.5">Min Quantity</label>
             <div className="relative">
               <input 
                 type="number"
                 value={filters.minQuantity} 
                 onChange={(e) => setFilters({...filters, minQuantity: e.target.value})}
                 className="w-full pl-3 pr-12 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-emerald-500 focus:border-indigo-500 dark:bg-slate-950 text-sm font-medium transition-colors"
                 placeholder="0"
               />
               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">tonnes</span>
             </div>
           </div>
           <div className="w-full md:w-1/5">
             <label className="block text-xs font-bold text-slate-500 mb-1.5">Max Distance</label>
             <select 
               className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-emerald-500 focus:border-indigo-500 dark:bg-slate-950 text-sm font-medium transition-colors"
             >
               <option>Any Distance</option>
               <option>50 km</option>
               <option>100 km</option>
               <option>200 km</option>
             </select>
           </div>
           <div className="w-full md:flex-1 flex gap-2">
              <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex justify-center items-center">
                 <Filter size={16} className="mr-2" /> Filter
              </button>
              {(appliedFilters.wasteType || appliedFilters.location || appliedFilters.minQuantity) && (
                 <button 
                   type="button" 
                   onClick={() => {
                     setFilters({ wasteType: '', location: '', minQuantity: '' });
                     setAppliedFilters({ wasteType: '', location: '', minQuantity: '' });
                   }} 
                   className="px-4 py-2 text-emerald-600 hover:text-emerald-700 text-sm font-bold"
                 >
                   Clear All
                 </button>
              )}
           </div>
        </form>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mr-3">Available Listings</h2>
          <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded text-xs font-bold">128</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center text-sm font-medium text-slate-500">
            <span className="mr-2 hidden md:inline">Sort by:</span>
            <select className="bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-bold cursor-pointer">
              <option>Newest First</option>
              <option>Highest Match</option>
              <option>Lowest Price</option>
            </select>
          </div>
          <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button className="p-1.5 bg-white dark:bg-slate-700 shadow-sm rounded text-emerald-600"><LayoutGrid size={16} /></button>
            <button className="p-1.5 text-slate-500 hover:text-slate-700"><List size={16} /></button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-500">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading marketplace...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl group">
              <div className="relative h-48 -mt-5 -mx-5 mb-4 rounded-t-2xl overflow-hidden border-b border-slate-100 dark:border-slate-800 group-hover:shadow-inner">
                <img 
                  src={getImageUrl(listing.wasteType, listing.photos)} 
                  alt={listing.wasteType} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-1 rounded shadow-sm">
                    {listing.wasteType}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{listing.wasteType} Scrap</h3>
              
              {listing.seller && (
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mb-2">
                  <span className="font-bold">{listing.seller.companyName}</span>
                  <CheckCircle2 size={14} className="text-purple-500 ml-1 shrink-0" fill="currentColor" color="white" />
                </div>
              )}

              <div className="flex items-center text-xs text-slate-500 mb-5 font-medium">
                <MapPin size={12} className="mr-1 text-slate-400" />
                {listing.seller?.location || 'India'} • {Math.floor(Math.random() * 200) + 10} km
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl mb-5 border border-slate-100 dark:border-slate-800 mt-auto">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">AI Match</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-none">{Math.floor(Math.random() * 10) + 90}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Quantity</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{listing.quantity}<br/><span className="text-[10px] text-slate-500 font-semibold">{listing.unit}</span></div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Price</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">₹{listing.logisticsEstimate}<br/><span className="text-[10px] text-slate-500 font-semibold">/ton</span></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 mb-5 font-medium px-1">
                <div className="flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                  <Leaf size={12} className="mr-1.5" />
                  {listing.co2Savings} tons saved
                </div>
                <div className="flex items-center">
                  <TrendingUp size={12} className="mr-1.5 text-slate-400" />
                  {format(new Date(listing.createdAt), 'MMM d, yyyy')}
                </div>
              </div>

              <button 
                onClick={() => toast.success(`Request sent to ${listing.seller?.companyName || 'Seller'}!`)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-bold transition-all duration-300 ease-in-out shadow-sm hover:shadow-indigo-500/20"
              >
                View Details
              </button>
            </div>
          ))}
          {listings.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              No waste resources match your filters.
            </div>
          )}
        </div>
      )}
      {/* Features Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
        {[
          { icon: Zap, title: 'AI-Powered Matching', desc: 'Get matched with the best buyers using our advanced AI engine.' },
          { icon: CheckCircle2, title: 'Quality Assured', desc: 'All listings are verified for quality and compliance standards.' },
          { icon: Package, title: 'Secure Transactions', desc: 'Safe and secure transactions with verified buyers.' },
          { icon: Leaf, title: 'ESG Impact Tracking', desc: 'Track your environmental impact and sustainability metrics.' }
        ].map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-sm border border-emerald-200 dark:border-emerald-800">
                <Icon size={24} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  );
}
