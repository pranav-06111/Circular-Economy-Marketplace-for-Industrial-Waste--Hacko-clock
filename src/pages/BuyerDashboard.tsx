import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Recycle, TrendingUp, Cpu, Hash, Search, Filter, Zap } from 'lucide-react';
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
  }
}

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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Browse Marketplace</h1>
          <p className="text-slate-500 dark:text-slate-400">Discover verified secondary raw materials globally.</p>
        </div>
        <Link 
          to="/matches" 
          className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm hover:-translate-y-0.5 inline-flex items-center justify-center shrink-0"
        >
          <Zap size={20} className="mr-2 text-emerald-400 dark:text-emerald-600" fill="currentColor" /> Find AI Matches
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm mb-8">
        <form onSubmit={handleApplyFilters} className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
           <div className="w-full md:w-1/4">
             <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Waste Type</label>
             <select 
               value={filters.wasteType} 
               onChange={(e) => setFilters({...filters, wasteType: e.target.value})}
               className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950 text-sm"
             >
               {categories.map(c => <option key={c} value={c}>{c === '' ? 'All Types' : c}</option>)}
             </select>
           </div>
           <div className="w-full md:w-1/4">
             <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location Filter</label>
             <input 
               value={filters.location} 
               onChange={(e) => setFilters({...filters, location: e.target.value})}
               className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950 text-sm"
               placeholder="e.g. Pune"
             />
           </div>
           <div className="w-full md:w-1/4">
             <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Min Quantity</label>
             <input 
               type="number"
               value={filters.minQuantity} 
               onChange={(e) => setFilters({...filters, minQuantity: e.target.value})}
               className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950 text-sm"
               placeholder="0"
             />
           </div>
           <div className="w-full md:w-1/4 flex gap-2">
              <button type="submit" className="flex-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex justify-center items-center">
                 <Filter size={16} className="mr-2" /> Apply
              </button>
              {(appliedFilters.wasteType || appliedFilters.location || appliedFilters.minQuantity) && (
                 <button 
                   type="button" 
                   onClick={() => {
                     setFilters({ wasteType: '', location: '', minQuantity: '' });
                     setAppliedFilters({ wasteType: '', location: '', minQuantity: '' });
                   }} 
                   className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium"
                 >
                   Clear
                 </button>
              )}
           </div>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-500">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading marketplace...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col transition-shadow hover:shadow-md group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                    {listing.wasteType}
                  </span>
                  <div className="text-xs text-slate-400 uppercase mt-2 font-semibold tracking-wider">
                    {listing.frequency}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">{listing.quantity}</div>
                  <div className="text-xs text-slate-500 font-semibold">{listing.unit}</div>
                </div>
              </div>

              {listing.seller && (
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <MapPin size={16} className="mr-2 shrink-0 text-emerald-500" />
                  <div className="leading-tight">
                    <span className="font-bold text-slate-900 dark:text-white block tracking-tight">{listing.seller.companyName}</span>
                    {listing.seller.location} • {listing.seller.industryType}
                  </div>
                </div>
              )}

              <div className="flex-1">
                <div className="mb-4">
                  <div className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    <Cpu size={14} className="mr-1" /> AI Composition & Rules Check
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed min-h-[60px] line-clamp-3 group-hover:line-clamp-none transition-all">
                    {listing.compositionReport}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 mb-1 flex items-center font-medium"><TrendingUp size={12} className="mr-1 text-emerald-500" /> Est. Logistics</div>
                    <div className="font-bold text-slate-900 dark:text-white font-mono">₹{listing.logisticsEstimate}</div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 flex items-center font-medium"><Recycle size={12} className="mr-1" /> CO₂ Savings</div>
                    <div className="font-bold text-emerald-700 dark:text-emerald-300 font-mono">{listing.co2Savings} Tons</div>
                  </div>
                </div>
                
                {listing.blockchainHash && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono break-all flex items-start bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded">
                    <Hash size={12} className="mr-1 shrink-0 mt-0.5 text-slate-500" />
                    ESG Anchor: {listing.blockchainHash.substring(0, 32)}...
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">{format(new Date(listing.createdAt), 'MMM d, yyyy')}</span>
                <button 
                  onClick={() => toast.success(`Request sent to ${listing.seller.companyName}!`)}
                  className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-md active:scale-95"
                >
                  Contact Seller
                </button>
              </div>
            </div>
          ))}
          {listings.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              No waste resources match your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
