import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format, isThisMonth } from 'date-fns';
import { PackagePlus, TrendingUp, Cpu, Activity, Info } from 'lucide-react';
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
}

export default function SellerDashboard() {
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/listings/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(res.data.listings);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const currentMonthTons = listings
    .filter(l => isThisMonth(new Date(l.createdAt)))
    .reduce((acc, curr) => {
      let val = curr.quantity;
      if (curr.unit === 'kg') val = val / 1000;
      return acc + val;
    }, 0);

  const activeCount = listings.filter(l => l.status === 'Available').length;
  const matchedCount = listings.filter(l => l.status === 'Matched').length;

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-slate-500">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading your active listings...
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Seller Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your industrial byproducts and secondary resources.</p>
        </div>
        <Link 
          to="/offload" 
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-2.5 rounded-lg font-bold transition-all shadow-sm hover:-translate-y-0.5 inline-flex items-center justify-center shrink-0"
        >
          <PackagePlus size={20} className="mr-2" /> List New Waste
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500"><TrendingUp size={48} /></div>
           <div className="text-sm font-semibold text-slate-500 mb-1 z-10 uppercase tracking-wider">Tons Listed This Month</div>
           <div className="text-4xl font-black text-slate-900 dark:text-white z-10 tracking-tight">{currentMonthTons.toFixed(1)}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 text-slate-500"><Activity size={48} /></div>
           <div className="text-sm font-semibold text-slate-500 mb-1 z-10 uppercase tracking-wider">Active Listings</div>
           <div className="text-4xl font-black text-slate-900 dark:text-white z-10 tracking-tight">{activeCount}</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-20 text-emerald-600 dark:text-emerald-400"><Cpu size={48} /></div>
           <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 mb-1 z-10 uppercase tracking-wider">AI Matched</div>
           <div className="text-4xl font-black text-emerald-900 dark:text-white z-10 tracking-tight">{matchedCount}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="text-lg font-bold">My Listings Directory</h2>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest md:hidden">Scroll left to view more →</div>
        </div>
        
        {listings.length === 0 ? (
          <div className="py-16 text-center">
             <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
               <Info size={24} />
             </div>
             <p className="text-slate-500 font-medium mb-4">You haven't listed any waste resources yet.</p>
             <Link to="/offload" className="text-emerald-600 font-semibold hover:underline">Create your first listing &rarr;</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 font-semibold">Waste Category</th>
                  <th className="px-6 py-4 font-semibold">Quantity</th>
                  <th className="px-6 py-4 font-semibold">Frequency</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Listed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {listings.map((listing) => (
                  <tr key={listing._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{listing.wasteType}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{listing.compositionReport.substring(0, 40)}...</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">
                      {listing.quantity} <span className="text-slate-500 text-xs">{listing.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {listing.frequency}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                         listing.status === 'Available' ? 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                         listing.status === 'Matched' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                         'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                       }`}>
                         {listing.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                       {format(new Date(listing.createdAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
