import { useState, useEffect } from 'react';
import { Zap, Activity, Cpu, CheckCircle, AlertTriangle, Truck, Leaf, MapPin, Map, ShoppingCart, ArrowRight, Globe, Search, Filter, RefreshCw, MoreVertical, MessageSquare, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import MapModal from '../components/MapModal';
import PaymentModal from '../components/PaymentModal';
import { getCoordinates, haversineDistance, calculateLogisticsCost, calculateCO2Savings } from '../utils/geoUtils';

interface MatchResult {
  wasteId: string;
  wasteType?: string;
  buyerId: string;
  buyerName: string;
  compatibilityScore: number;
  reason: string;
  suggestedUseCase: string;
  estimatedMonthlyVolume: string;
  isHazardous?: boolean;
  hazardousLevel?: 'Low' | 'Medium' | 'High';
  requiredPermits?: string[];
  co2Savings?: number;
  logisticsEstimate?: number;
  location?: string;
  sellerName?: string;
  sellerLocation?: string;
  carbonCreditPotential?: string;
  regulatoryComplianceNote?: string;
  quantity?: number;
  unit?: string;
  industryType?: string;
}

export default function BuyerMatches() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapMatch, setMapMatch] = useState<MatchResult | null>(null);
  const [paymentMatch, setPaymentMatch] = useState<MatchResult | null>(null);
  const [completedPayment, setCompletedPayment] = useState<any>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const buyerLocation = user?.location || user?.companyName || 'Mumbai';

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/listings/buyer/matches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sorted = (res.data.matches || []).sort((a: MatchResult, b: MatchResult) => b.compatibilityScore - a.compatibilityScore);
      setMatches(sorted);
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.details || error.response?.data?.error || 'Failed to run AI matching engine.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getHazardBadge = (level?: 'Low' | 'Medium' | 'High', isHazardous?: boolean) => {
      if (!isHazardous) return <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">Non-Hazardous</span>;
      if (level === 'High') return <span className="px-2.5 py-1 rounded text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400">High Risk Hazard</span>;
      if (level === 'Medium') return <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400">Medium Risk Hazard</span>;
      return <span className="px-2.5 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400">Low Risk Hazard</span>;
  };

  // Calculate geo data for a match
  const getGeoData = (match: MatchResult) => {
    const sellerLoc = match.sellerLocation || match.location || 'Mumbai';
    const sellerCoords = getCoordinates(sellerLoc);
    const buyerCoords = getCoordinates(buyerLocation);
    const distanceKm = haversineDistance(sellerCoords, buyerCoords);
    const qty = match.quantity || parseFloat(match.estimatedMonthlyVolume) || 5;
    const logisticsCost = calculateLogisticsCost(distanceKm, qty);
    const co2Savings = calculateCO2Savings(distanceKm, qty, match.wasteType || 'Plastic');
    return { sellerCoords, buyerCoords, distanceKm, logisticsCost, co2Savings, qty, sellerLoc };
  };

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-8 px-4 md:px-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
         <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 text-slate-900 dark:text-white flex items-center">
               My <span className="text-purple-500 ml-2">Matches</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-gray-400 font-medium">
               Track and manage your active and completed waste matches
            </p>
         </div>
         <div className="hidden md:flex shrink-0">
            {/* Header Visual */}
            <svg width="220" height="80" viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg">
               <circle cx="110" cy="40" r="30" fill="#10b981" fillOpacity="0.1" />
               <circle cx="110" cy="40" r="20" fill="#10b981" fillOpacity="0.2" />
               <path d="M100 40 L115 30 L115 50 Z" fill="#10b981" />
               <path d="M50 40 L80 40" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
               <path d="M140 40 L170 40" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
               <circle cx="40" cy="40" r="10" fill="#f0fdf4" stroke="#10b981" strokeWidth="2" />
               <circle cx="180" cy="40" r="10" fill="#f0fdf4" stroke="#10b981" strokeWidth="2" />
               <path d="M180 30 Q 150 10 110 20" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" fill="transparent" />
               <path d="M40 50 Q 70 70 110 60" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" fill="transparent" />
            </svg>
         </div>
      </div>

      {/* TABS + FILTER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm mb-8">
         <div className="flex flex-col md:flex-row gap-6">
            <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 self-start">
               <button className="px-5 py-2.5 rounded-lg text-sm font-bold bg-indigo-600 text-white shadow-sm flex items-center">
                  Active / Present <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{matches.length}</span>
               </button>
               <button className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center">
                  Past / Completed <span className="ml-2 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[10px]">3</span>
               </button>
            </div>

            <div className="flex-1 flex flex-wrap lg:flex-nowrap gap-3 items-center">
               <div className="relative flex-1 min-w-[200px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search waste type, seller, location..." className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-emerald-500 focus:border-indigo-500" />
               </div>
               
               <div className="flex gap-3 shrink-0">
                  <div className="hidden lg:block">
                     <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest px-1">Status</label>
                     <select className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:ring-emerald-500 min-w-[100px]">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Pending</option>
                     </select>
                  </div>
                  <div className="hidden xl:block">
                     <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest px-1">Order Status</label>
                     <select className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:ring-emerald-500 min-w-[100px]">
                        <option>All</option>
                        <option>Confirmed</option>
                        <option>Pending</option>
                     </select>
                  </div>
                  <div className="hidden xl:block">
                     <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest px-1">Payment Status</label>
                     <select className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium focus:ring-emerald-500 min-w-[100px]">
                        <option>All</option>
                        <option>Paid</option>
                        <option>Awaiting</option>
                     </select>
                  </div>
               </div>

               <div className="flex gap-2 shrink-0 self-end">
                  <button className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                     <Filter size={14} className="mr-2" /> More Filters
                  </button>
                  <button onClick={fetchMatches} className="p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" disabled={loading}>
                     <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  </button>
               </div>
            </div>
         </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 shadow-sm flex flex-col items-center max-w-xl mx-auto mt-8">
           <Cpu size={48} className="text-slate-300 dark:text-slate-700 mb-6 animate-pulse" />
           <h3 className="text-xl font-bold mb-2">Refreshing matches...</h3>
           <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-6 overflow-hidden">
             <div className="bg-emerald-500 h-2.5 rounded-full w-2/3 animate-pulse"></div>
           </div>
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 shadow-sm flex flex-col items-center max-w-xl mx-auto mt-8">
           <p className="text-slate-500 mb-6 font-medium">No matches found right now.</p>
           <Link to="/ai-matcher" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center hover:bg-emerald-600 transition-colors">
             <Zap size={18} className="mr-2" /> Find AI Matches
           </Link>
        </div>
      ) : (
        <div className="space-y-6 mb-12">
           {matches.map((match, i) => {
             const geo = getGeoData(match);
             const score = match.compatibilityScore;
             const theme = score >= 90 ? 'purple' : score >= 80 ? 'blue' : 'indigo';
             const isConfirmed = i % 2 === 0; // Mock status for UI preview
             
             return (
               <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-lg transition-all flex flex-col lg:flex-row gap-6 relative group">
                  {/* Left Section - Score */}
                  <div className={`w-full lg:w-56 shrink-0 rounded-2xl p-6 border flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 ${theme === 'purple' ? 'border-purple-100 dark:border-purple-500/20' : theme === 'blue' ? 'border-sky-100 dark:border-sky-500/20' : 'border-indigo-100 dark:border-indigo-500/20'}`}>
                     <div className={`text-[10px] font-black uppercase tracking-widest mb-4 px-2.5 py-1 rounded-sm bg-white dark:bg-slate-900 border shadow-sm ${theme === 'purple' ? 'text-purple-600 border-purple-100' : theme === 'blue' ? 'text-sky-600 border-sky-100' : 'text-indigo-600 border-indigo-100'}`}>
                        {match.wasteType || 'Industrial Waste'}
                     </div>
                     <div className="relative w-28 h-28 mb-4">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                           <circle className="text-slate-200 dark:text-slate-800 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                           <circle className={`stroke-current ${theme === 'purple' ? 'text-purple-500' : theme === 'blue' ? 'text-sky-500' : 'text-indigo-500'}`} strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray={`${score * 2.51} 251`} strokeDashoffset="0" transform="rotate(-90 50 50)"></circle>
                        </svg>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-black text-slate-900 dark:text-white">
                           {score}<span className="text-xl">%</span>
                        </div>
                     </div>
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Match Score</div>
                     <div className={`text-xs font-bold flex items-center ${theme === 'purple' ? 'text-emerald-600' : theme === 'blue' ? 'text-sky-600' : 'text-indigo-600'}`}>
                        <Zap size={14} className="mr-1" /> {score >= 90 ? 'Excellent Match' : 'Very Good Match'}
                     </div>
                  </div>

                  {/* Middle Section - Details & Metrics */}
                  <div className="flex-1 flex flex-col justify-between">
                     <div>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center flex-wrap gap-2 mb-2">
                           {match.suggestedUseCase || match.wasteType || 'Industrial Waste'} 
                           <ArrowRight className="text-slate-300" size={18} />
                           <span className="text-slate-600 dark:text-slate-300">{match.industryType || 'Manufacturing Industry'}</span>
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm font-medium text-slate-500 mb-4">
                           <span className="flex items-center text-slate-700 dark:text-slate-300"><MapPin size={14} className="mr-1.5 text-slate-400" /> {match.sellerLocation || match.location || 'Pune, Maharashtra'} • {geo.distanceKm.toFixed(0)} km</span>
                           <span className="flex items-center text-slate-700 dark:text-slate-300"><CheckCircle size={14} className="mr-1.5 text-purple-500" /> {match.sellerName || 'Verified Seller'}</span>
                        </div>
                        
                        <div className="bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl p-3 mb-5">
                           <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">AI Reasoning:</span> {match.reason || 'High compatibility with consistent demand, low logistics cost and strong ESG alignment.'}
                           </p>
                        </div>
                     </div>

                     {/* Metrics Row Pills */}
                     <div className="flex flex-wrap gap-3">
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg px-4 py-2">
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Quantity</div>
                           <div className="text-sm font-bold text-slate-900 dark:text-white">{geo.qty} <span className="text-xs font-medium text-slate-500">tonnes/wk</span></div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg px-4 py-2">
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">CO₂ Saved</div>
                           <div className="text-sm font-bold text-slate-900 dark:text-white">{geo.co2Savings.toFixed(1)} <span className="text-xs font-medium text-slate-500">tons/mo</span></div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg px-4 py-2">
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Price</div>
                           <div className="text-sm font-bold text-slate-900 dark:text-white">₹{geo.logisticsCost.toLocaleString()} <span className="text-xs font-medium text-slate-500">/tonne</span></div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg px-4 py-2">
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Distance</div>
                           <div className="text-sm font-bold text-slate-900 dark:text-white">{geo.distanceKm.toFixed(0)} <span className="text-xs font-medium text-slate-500">km</span></div>
                        </div>
                     </div>
                  </div>

                  {/* Right Section - Status Panel */}
                  <div className="w-full lg:w-64 shrink-0 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-6 relative">
                     <button className="absolute top-0 right-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><MoreVertical size={20}/></button>
                     
                     <div className="mb-4">
                        <div className="flex items-center gap-2 mb-4">
                           <Activity size={16} className={isConfirmed ? "text-purple-500" : "text-sky-500"} />
                           <span className={`text-xs font-bold ${isConfirmed ? 'text-emerald-600' : 'text-sky-600'}`}>
                              {isConfirmed ? 'Active' : 'Pending'}
                           </span>
                        </div>

                        <div className="space-y-3">
                           <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                              <span className="text-slate-500 flex items-center"><CheckCircle size={12} className="mr-1.5"/> Order Status</span>
                              <span className={`font-bold ${isConfirmed ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded' : 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded'}`}>{isConfirmed ? 'Confirmed' : 'Pending'}</span>
                           </div>
                           <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                              <span className="text-slate-500 flex items-center"><Activity size={12} className="mr-1.5"/> Payment Status</span>
                              <span className={`font-bold ${isConfirmed ? 'text-blue-600 bg-blue-50 px-2 py-0.5 rounded' : 'text-purple-600 bg-purple-50 px-2 py-0.5 rounded'}`}>{isConfirmed ? 'Paid' : 'Awaiting'}</span>
                           </div>
                           <div className="flex items-center justify-between text-xs pb-1">
                              <span className="text-slate-500 flex items-center"><Truck size={12} className="mr-1.5"/> Logistics Status</span>
                              <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{isConfirmed ? 'In Transit' : 'Scheduled'}</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col gap-2 mt-auto">
                        <button onClick={() => setMapMatch(match)} className={`w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 ${isConfirmed ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/20' : 'bg-gradient-to-r from-sky-500 to-blue-500 hover:shadow-sky-500/20'}`}>
                           View Details
                        </button>
                        <button className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                           <MessageSquare size={14} className="mr-1.5" /> Chat with Seller
                        </button>
                     </div>
                  </div>
               </div>
             );
           })}
        </div>
      )}

      {/* MATCH INSIGHTS PANEL */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8">
         <div className="flex items-center gap-2 mb-6">
            <Cpu className="text-purple-500" size={20} />
            <h3 className="font-bold text-slate-900 dark:text-white">Match Insights</h3>
         </div>
         
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Active Matches</div>
               <div className="flex items-end gap-2">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">5</div>
                  <div className="text-xs font-bold text-purple-500 mb-1">+1 this week</div>
               </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center"><Leaf size={12} className="mr-1 text-emerald-500"/> Total CO₂ Savings</div>
               <div className="flex items-end gap-2">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">20.8</div>
                  <div className="text-xs font-bold text-purple-500 mb-1">+2.4 tons vs last week</div>
               </div>
               <div className="text-[10px] text-slate-500 mt-1">tons/month</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center"><Activity size={12} className="mr-1 text-purple-500"/> Active Value</div>
               <div className="flex items-end gap-2">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">₹4.2</div>
                  <div className="text-xs font-bold text-purple-500 mb-1">+12% this week</div>
               </div>
               <div className="text-[10px] text-slate-500 mt-1">Lakhs</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center"><Target size={12} className="mr-1 text-sky-500"/> Avg. Match Score</div>
               <div className="flex items-end gap-2">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">89%</div>
                  <div className="text-xs font-bold text-sky-500 mb-1">Excellent</div>
               </div>
            </div>
         </div>
      </div>

      {/* Map Modal */}
      {mapMatch && (() => {
        const geo = getGeoData(mapMatch);
        return (
          <MapModal
            isOpen={!!mapMatch}
            onClose={() => setMapMatch(null)}
            sellerCoords={geo.sellerCoords}
            buyerCoords={geo.buyerCoords}
            sellerName={mapMatch.sellerName || 'Seller'}
            buyerName={user?.companyName || user?.name || 'Buyer'}
            sellerLocation={geo.sellerLoc}
            buyerLocation={buyerLocation}
            distanceKm={geo.distanceKm}
            logisticsCost={geo.logisticsCost}
            co2Savings={geo.co2Savings}
            wasteType={mapMatch.wasteType || 'Industrial Waste'}
            quantity={geo.qty}
            unit={mapMatch.unit || 'tonnes'}
            compatibilityScore={mapMatch.compatibilityScore}
          />
        );
      })()}
      {/* Payment Modal */}
      {paymentMatch && (() => {
        const geo = getGeoData(paymentMatch);
        return (
          <PaymentModal
            isOpen={!!paymentMatch}
            onClose={() => {
              setPaymentMatch(null);
            }}
            matchData={{
              sellerName: paymentMatch.sellerName || 'Seller',
              buyerName: user?.companyName || user?.name || 'Buyer',
              wasteType: paymentMatch.wasteType || 'Industrial Waste',
              quantity: geo.qty,
              unit: paymentMatch.unit || 'tonnes',
              logisticsCost: geo.logisticsCost,
              co2Savings: geo.co2Savings,
              compatibilityScore: paymentMatch.compatibilityScore,
              matchId: paymentMatch.wasteId,
            }}
            onSuccess={(result) => {
              setCompletedPayment(result);
              setPaymentMatch(null);
              toast.success('Purchase complete! ESG record anchored.');
            }}
          />
        );
      })()}
    </div>
  );
}
