import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ShoppingCart, Leaf, Truck, MapPin, Calendar, CheckCircle,
  Clock, Search, Filter, X, Eye, Hash, Copy, Globe, Loader2, Inbox, Map as MapIcon, RefreshCw, MoreVertical, Package, ShieldCheck, FileText, Ban
} from 'lucide-react';
import MapModal from '../components/MapModal';
import { getCoordinates, haversineDistance, calculateLogisticsCost, calculateCO2Savings } from '../utils/geoUtils';
interface OrderMatch {
  _id: string;
  listing: {
    _id: string;
    wasteType: string;
    quantity: number;
    unit: string;
    location: string;
    co2Savings: number;
    logisticsEstimate: number;
    description: string;
    photos?: string[];
    isHazardous?: boolean;
    seller?: {
      _id: string;
      companyName: string;
      location: string;
      name: string;
    };
  };
  status: string;
  matchScore: number;
  reason: string;
  suggestedUseCase: string;
  blockchainHash?: string;
  createdAt: string;
}

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  'Pending': { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30', icon: Clock },
  'Accepted': { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30', icon: CheckCircle },
  'Rejected': { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30', icon: X },
};

export default function BuyerOrders() {
  const [matches, setMatches] = useState<OrderMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>('All Orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailMatch, setDetailMatch] = useState<OrderMatch | null>(null);
  const [mapMatch, setMapMatch] = useState<OrderMatch | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/orders/buyer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(res.data.matches || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch your matches.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = matches
    .filter(m => {
      if (tab !== 'All Orders') {
         if (tab === 'Confirmed' && m.status !== 'Accepted') return false;
         if (tab === 'Pending' && m.status !== 'Pending') return false;
         if (tab === 'Cancelled' && m.status !== 'Rejected') return false;
         // Mock 'In Transit' and 'Delivered' for UI since backend only has Pending/Accepted/Rejected
         if (tab === 'In Transit' && m.status !== 'In Transit') return false; 
         if (tab === 'Delivered' && m.status !== 'Delivered') return false;
      }
      return true;
    })
    .filter(m => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          m.listing?.wasteType?.toLowerCase().includes(q) ||
          m.listing?.seller?.companyName?.toLowerCase().includes(q) ||
          m.listing?.location?.toLowerCase().includes(q)
        );
      }
      return true;
    });

  const carbonCredits = (co2: number) => Math.floor(co2);

  const getGeoForMap = (match: OrderMatch) => {
    const sellerLoc = match.listing?.seller?.location || match.listing?.location || 'Mumbai';
    const buyerLoc = user?.location || 'Delhi';
    const sellerCoords = getCoordinates(sellerLoc);
    const buyerCoords = getCoordinates(buyerLoc);
    const distanceKm = haversineDistance(sellerCoords, buyerCoords);
    const qty = match.listing?.quantity || 1;
    const qtyTons = (match.listing?.unit === 'kg') ? qty / 1000 : qty;
    const logisticsCost = calculateLogisticsCost(distanceKm, qtyTons);
    const co2Savings = calculateCO2Savings(distanceKm, qtyTons, match.listing?.wasteType || 'plastic');
    return { sellerCoords, buyerCoords, sellerLoc, buyerLoc: buyerLoc, distanceKm, logisticsCost, co2Savings, qty };
  };

  return (
    <div className="max-w-[1400px] mx-auto py-6 md:py-8 px-4 md:px-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
         <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 text-slate-900 dark:text-white flex items-center">
               My <span className="text-purple-500 ml-2">Orders</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-gray-400 font-medium">
               Track all your orders and shipments in one place.
            </p>
         </div>
         <div className="hidden md:flex shrink-0">
            {/* Header Visual */}
            <svg width="220" height="80" viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg">
               <rect x="130" y="20" width="80" height="40" rx="4" fill="#10b981" fillOpacity="0.2" />
               <rect x="140" y="30" width="60" height="20" rx="2" fill="#10b981" />
               <circle cx="160" cy="55" r="8" fill="#1e293b" />
               <circle cx="190" cy="55" r="8" fill="#1e293b" />
               <rect x="205" y="35" width="15" height="15" rx="2" fill="#10b981" fillOpacity="0.8" />
               
               <path d="M40 50 L100 50" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
               <circle cx="30" cy="50" r="10" fill="#f0fdf4" stroke="#10b981" strokeWidth="2" />
               <path d="M30 46 L30 54 M26 50 L34 50" stroke="#10b981" strokeWidth="2" />
            </svg>
         </div>
      </div>

      {/* TABS SECTION */}
      <div className="flex flex-wrap gap-3 mb-6">
         {['All Orders', 'Pending', 'Confirmed', 'In Transit', 'Delivered', 'Cancelled'].map((t) => (
            <button
               key={t}
               onClick={() => setTab(t)}
               className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center ${tab === t ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
               {t} 
               <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${tab === t ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {t === 'All Orders' ? matches.length : (t === 'Pending' ? matches.filter(m => m.status === 'Pending').length : (t === 'Confirmed' ? matches.filter(m => m.status === 'Accepted').length : (t === 'Cancelled' ? matches.filter(m => m.status === 'Rejected').length : 0)))}
               </span>
            </button>
         ))}
      </div>

      {/* FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm mb-8">
         <div className="flex flex-wrap lg:flex-nowrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by waste type, seller, order ID..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-emerald-500 focus:border-indigo-500" 
               />
            </div>
            
            <div className="flex gap-4 shrink-0">
               <div className="hidden lg:block">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest px-1">Date Range</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select className="pl-8 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:ring-emerald-500 min-w-[130px] appearance-none">
                       <option>Select Date</option>
                       <option>Last 7 Days</option>
                       <option>Last 30 Days</option>
                    </select>
                  </div>
               </div>
               <div className="hidden xl:block">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest px-1">Order Status</label>
                  <select 
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:ring-emerald-500 min-w-[120px]"
                  >
                     <option value="all">All Status</option>
                     <option value="Pending">Pending</option>
                     <option value="Accepted">Accepted</option>
                     <option value="Rejected">Rejected</option>
                  </select>
               </div>
               <div className="hidden xl:block">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest px-1">Payment Status</label>
                  <select className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:ring-emerald-500 min-w-[120px]">
                     <option>All Status</option>
                     <option>Paid</option>
                     <option>Pending</option>
                  </select>
               </div>
            </div>

            <div className="flex gap-2 shrink-0 self-end mt-4 lg:mt-0">
               <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors h-[42px]">
                  <Filter size={14} className="mr-2" /> More Filters
               </button>
               <button onClick={fetchOrders} className="p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors h-[42px] flex items-center justify-center" disabled={loading}>
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
               </button>
            </div>
         </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-purple-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading your orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Package size={36} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-700 dark:text-slate-300">No Orders Found</h3>
          <p className="text-slate-500 text-sm max-w-sm text-center">
            You don't have any orders matching the current filters.
          </p>
        </div>
      ) : (
        <div className="space-y-5 mb-12">
          {filtered.map(match => {
            const geo = getGeoForMap(match);
            const isConfirmed = match.status === 'Accepted';
            const isPending = match.status === 'Pending';
            const isRejected = match.status === 'Rejected';
            
            // Generate mock timeline state based on status
            const currentStep = isConfirmed ? 2 : isRejected ? -1 : 1;
            
            return (
              <div key={match._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-lg transition-all flex flex-col xl:flex-row overflow-hidden group">
                 {/* Left Section - Info */}
                 <div className="w-full xl:w-[340px] shrink-0 p-5 md:p-6 border-b xl:border-b-0 xl:border-r border-slate-100 dark:border-slate-800 flex gap-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden relative">
                       {match.listing?.photos?.[0] ? (
                          <img src={`/uploads/${match.listing.photos[0]}`} className="w-full h-full object-cover" alt="Waste" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                             <Package size={32} />
                          </div>
                       )}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded inline-block mb-2">
                          {match.listing?.wasteType || 'Waste Material'}
                       </div>
                       <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mb-2 truncate">
                          {match.suggestedUseCase || match.listing?.wasteType || 'Industrial Resource'}
                       </h3>
                       <div className="flex items-center text-xs text-slate-500 mb-1.5 font-medium truncate">
                          <ShieldCheck size={12} className="mr-1 text-purple-500 shrink-0" />
                          {match.listing?.seller?.companyName || 'Verified Seller'}
                       </div>
                       <div className="flex items-center text-xs text-slate-500 font-medium truncate">
                          <MapPin size={12} className="mr-1 text-slate-400 shrink-0" />
                          {match.listing?.seller?.location || 'Location'} • {geo.distanceKm.toFixed(0)} km
                       </div>
                    </div>
                 </div>

                 {/* Middle Section - Metrics & Timeline */}
                 <div className="flex-1 p-5 md:p-6 flex flex-col justify-center">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                       <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order ID</div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">#{match._id.slice(-8).toUpperCase()}</div>
                       </div>
                       <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quantity</div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{geo.qty} {match.listing?.unit || 'tonnes'}</div>
                       </div>
                       <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Price</div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">₹{(geo.logisticsCost).toLocaleString()} <span className="text-[10px] text-slate-500 font-medium">/total</span></div>
                       </div>
                       <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order Date</div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{new Date(match.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                       </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="relative">
                       <div className="absolute top-3 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 rounded-full z-0"></div>
                       {isRejected ? (
                          <div className="relative z-10 flex items-center gap-2 text-rose-500">
                             <Ban size={20} className="bg-white dark:bg-slate-900" />
                             <span className="text-xs font-bold bg-white dark:bg-slate-900 pr-2">Order Cancelled</span>
                          </div>
                       ) : (
                          <div className="relative z-10 flex justify-between">
                             <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white dark:bg-slate-900 mb-2 ${currentStep >= 1 ? 'border-emerald-500 text-purple-500' : 'border-slate-300 text-slate-300'}`}>
                                   <FileText size={10} />
                                </div>
                                <div className={`text-[10px] font-bold ${currentStep >= 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Order Confirmed</div>
                                <div className="text-[9px] text-slate-400">{new Date(match.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                             </div>
                             <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white dark:bg-slate-900 mb-2 ${currentStep >= 2 ? 'border-emerald-500 text-purple-500' : 'border-slate-300 text-slate-300'}`}>
                                   <CheckCircle size={10} />
                                </div>
                                <div className={`text-[10px] font-bold ${currentStep >= 2 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Payment Completed</div>
                             </div>
                             <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white dark:bg-slate-900 mb-2 ${currentStep >= 3 ? 'border-sky-500 text-sky-500' : 'border-slate-300 text-slate-300'}`}>
                                   <Truck size={10} />
                                </div>
                                <div className={`text-[10px] font-bold ${currentStep >= 3 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>In Transit</div>
                             </div>
                             <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white dark:bg-slate-900 mb-2 ${currentStep >= 4 ? 'border-emerald-500 text-purple-500' : 'border-slate-300 text-slate-300'}`}>
                                   <MapIcon size={10} />
                                </div>
                                <div className={`text-[10px] font-bold ${currentStep >= 4 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Delivered</div>
                             </div>
                          </div>
                       )}
                    </div>
                 </div>

                 {/* Right Section - Status & Actions */}
                 <div className="w-full xl:w-64 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 p-5 md:p-6 border-t xl:border-t-0 xl:border-l border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                    <div className="flex justify-between xl:flex-col gap-4 mb-4 xl:mb-0">
                       <div className="flex items-center xl:justify-between gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold ${isConfirmed ? 'bg-sky-50 text-sky-600 border border-sky-100' : isRejected ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                             {isConfirmed ? <><Truck size={12}/> In Transit</> : isRejected ? <><Ban size={12}/> Cancelled</> : <><Clock size={12}/> Pending</>}
                          </span>
                       </div>
                       
                       <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                             <span className="text-slate-500">Payment Status</span>
                             <span className={`font-bold ${isConfirmed ? 'text-emerald-600 bg-emerald-100 px-1.5 rounded' : 'text-amber-600 bg-amber-100 px-1.5 rounded'}`}>{isConfirmed ? 'Paid' : 'Pending'}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                             <span className="text-slate-500">Payment Method</span>
                             <span className="font-bold text-slate-700 dark:text-slate-300">{isConfirmed ? 'Bank Transfer' : '-'}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col gap-2">
                       <button onClick={() => setDetailMatch(match)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold transition-colors shadow-sm active:scale-95">
                          View Details
                       </button>
                       {isConfirmed && (
                         <button onClick={() => setMapMatch(match)} className="w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center shadow-sm active:scale-95">
                            <MapIcon size={14} className="mr-1.5" /> Track Shipment
                         </button>
                       )}
                       {isPending && (
                         <button className="w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/30 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center shadow-sm active:scale-95 mt-1">
                            <Ban size={14} className="mr-1.5" /> Cancel Order
                         </button>
                       )}
                    </div>
                 </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ORDERS SUMMARY SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
         <div className="flex items-center gap-2 mb-6">
            <Package className="text-indigo-500" size={20} />
            <h3 className="font-bold text-slate-900 dark:text-white">Orders Summary</h3>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-x divide-slate-100 dark:divide-slate-800">
            <div className="px-4">
               <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center"><Package size={12}/></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Total Orders</span>
               </div>
               <div className="text-xl font-black text-slate-900 dark:text-white">{matches.length}</div>
               <div className="text-[10px] font-bold text-purple-500">+2 this month</div>
            </div>
            <div className="px-4">
               <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center"><ShoppingCart size={12}/></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Total Quantity</span>
               </div>
               <div className="text-xl font-black text-slate-900 dark:text-white">83 <span className="text-sm font-bold text-slate-500">tonnes</span></div>
               <div className="text-[10px] font-bold text-purple-500">+15 tonnes</div>
            </div>
            <div className="px-4">
               <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">₹</div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Total Spent</span>
               </div>
               <div className="text-xl font-black text-slate-900 dark:text-white">₹4,56,750</div>
               <div className="text-[10px] font-bold text-purple-500">+₹1,25,000</div>
            </div>
            <div className="px-4">
               <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center"><Leaf size={12}/></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">CO₂ Saved</span>
               </div>
               <div className="text-xl font-black text-slate-900 dark:text-white">20.8 <span className="text-sm font-bold text-slate-500">tons</span></div>
               <div className="text-[10px] font-bold text-purple-500">+3.6 tons</div>
            </div>
            <div className="px-4">
               <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <div className="w-6 h-6 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center"><Clock size={12}/></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">On-Time Delivery</span>
               </div>
               <div className="text-xl font-black text-slate-900 dark:text-white">92%</div>
               <div className="text-[10px] font-bold text-purple-500">Excellent</div>
            </div>
         </div>
      </div>

      {/* Map Modal */}     {mapMatch && (() => {
        const geo = getGeoForMap(mapMatch);
        return (
          <MapModal
            isOpen={!!mapMatch}
            onClose={() => setMapMatch(null)}
            sellerCoords={geo.sellerCoords}
            buyerCoords={geo.buyerCoords}
            sellerName={mapMatch.listing?.seller?.companyName || 'Seller'}
            buyerName={user?.companyName || user?.name || 'Buyer'}
            sellerLocation={geo.sellerLoc}
            buyerLocation={geo.buyerLoc}
            distanceKm={geo.distanceKm}
            logisticsCost={geo.logisticsCost}
            co2Savings={geo.co2Savings}
            wasteType={mapMatch.listing?.wasteType || 'Industrial Waste'}
            quantity={geo.qty}
            unit={mapMatch.listing?.unit || 'tonnes'}
            compatibilityScore={mapMatch.matchScore}
          />
        );
      })()}

      {/* Detail Modal */}
      {detailMatch && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailMatch(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Match Details</h2>
                  <p className="text-emerald-100 text-xs">Match ID: {detailMatch._id.slice(-8)}</p>
                </div>
                <button onClick={() => setDetailMatch(null)} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waste Type</span>
                  <p className="font-bold">{detailMatch.listing?.wasteType}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</span>
                  <p className="font-bold">{detailMatch.listing?.quantity} {detailMatch.listing?.unit}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seller</span>
                  <p className="font-bold">{detailMatch.listing?.seller?.companyName || detailMatch.listing?.seller?.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seller Location</span>
                  <p className="font-bold">{detailMatch.listing?.seller?.location || detailMatch.listing?.location}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Match Score</span>
                  <p className="font-bold text-emerald-600">{detailMatch.matchScore}%</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                  <p className="font-bold">{detailMatch.status}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logistics Cost</span>
                  <p className="font-bold text-amber-600">₹{(detailMatch.listing?.logisticsEstimate || 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CO₂ Saved</span>
                  <p className="font-bold text-emerald-600">{(detailMatch.listing?.co2Savings || 0).toFixed(1)} tonnes</p>
                </div>
              </div>

              {detailMatch.reason && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Reasoning</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{detailMatch.reason}</p>
                </div>
              )}

              {detailMatch.suggestedUseCase && (
                <div className="bg-emerald-50 dark:bg-emerald-500/5 rounded-xl p-4 border border-purple-100 dark:border-purple-500/20">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Suggested Use Case</p>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300">{detailMatch.suggestedUseCase}</p>
                </div>
              )}

              {detailMatch.blockchainHash && (
                <div className="bg-slate-900 dark:bg-slate-950 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <Hash size={10} className="mr-1" /> ESG Blockchain Anchor
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-[11px] font-mono text-emerald-400 break-all flex-1">
                      {detailMatch.blockchainHash}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(detailMatch.blockchainHash!);
                        toast.success('Hash copied!');
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                    >
                      <Copy size={14} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => setDetailMatch(null)}
                className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-3 rounded-xl transition-all text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
