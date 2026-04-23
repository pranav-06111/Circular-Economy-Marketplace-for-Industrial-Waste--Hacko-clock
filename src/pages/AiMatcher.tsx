import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Zap, 
  Search, 
  UploadCloud, 
  CheckCircle, 
  AlertTriangle, 
  Truck, 
  Leaf, 
  Cpu, 
  ArrowRight,
  ShieldCheck,
  Copy,
  Hash,
  Activity,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface MatchResult {
  wasteId: string;
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
  industryType?: string;
}

export default function AiMatcher() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mode, setMode] = useState<'select' | 'upload'>('select');
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListingId, setSelectedListingId] = useState('');
  
  const [quickForm, setQuickForm] = useState({
    wasteType: 'Plastic Waste',
    description: '',
    location: 'Mumbai',
    quantity: '10'
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [completedMatch, setCompletedMatch] = useState<any>(null);

  // Extract role
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const role = user?.role || 'seller';

  useEffect(() => {
    if (role === 'seller' || role === 'both') {
      fetchMyListings();
    }
  }, [role]);

  const handleBuyerMatch = async () => {
    setLoading(true);
    setMatches([]);
    setCompletedMatch(null);
    try {
      const token = localStorage.getItem('token');
      const matchRes = await axios.get('/api/listings/buyer/matches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(matchRes.data.matches.sort((a: any, b: any) => b.compatibilityScore - a.compatibilityScore));
      toast.success("AI Analysis Complete!");
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.details || error.response?.data?.error || "Matching engine failed. Check API connectivity.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/listings/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(res.data.listings.filter((l: any) => l.status === 'Available' || l.status === 'Active'));
    } catch (e) {
      console.error(e);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFindMatches = async () => {
    setLoading(true);
    setMatches([]);
    setCompletedMatch(null);

    try {
      const token = localStorage.getItem('token');
      let listingId = selectedListingId;

      if (mode === 'upload') {
        if (!photo) {
          toast.error("Please upload a photo for AI analysis");
          setLoading(false);
          return;
        }
        
        const data = new FormData();
        Object.entries(quickForm).forEach(([k, v]) => data.append(k, v));
        data.append('photos', photo);

        const uploadRes = await axios.post('/api/listings', data, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        listingId = uploadRes.data.listing._id;
      }

      if (!listingId) {
        toast.error("Please select or create a listing");
        setLoading(false);
        return;
      }

      const matchRes = await axios.get(`/api/listings/${listingId}/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMatches(matchRes.data.matches.sort((a: any, b: any) => b.compatibilityScore - a.compatibilityScore));
      toast.success("AI Analysis Complete!");
    } catch (error) {
      console.error(error);
      toast.error("Matching engine failed. Check API connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteMatch = async (match: MatchResult) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/listings/${match.wasteId}/complete-match`, {
        buyerId: match.buyerId,
        matchScore: match.compatibilityScore,
        reason: match.reason,
        suggestedUseCase: match.suggestedUseCase
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCompletedMatch(res.data.match);
      toast.success("Transaction Anchored Successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to finalize match.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2 flex items-center">
            <Zap className="mr-3 text-emerald-500 fill-emerald-500" />
            AI Smart Matcher
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Connect with high-compatibility circular economy partners instantly.</p>
        </div>
        
        {role !== 'buyer' && (
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
             <button 
               onClick={() => setMode('select')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'select' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
             >
               Existing Listing
             </button>
             <button 
               onClick={() => setMode('upload')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'upload' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
             >
               Quick Match (Photo)
             </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Input */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
              {role === 'buyer' ? (
                <>
                  <h3 className="text-lg font-bold mb-6 flex items-center">
                     <Search size={20} className="mr-2 text-emerald-500" />
                     Find Raw Materials
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">Our AI will scan all active waste listings and match them against your company profile.</p>

                  <button 
                    onClick={handleBuyerMatch}
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Activity className="animate-spin" /> : <Zap size={18} />}
                    {loading ? 'AI AGENTS RUNNING...' : 'FIND MATERIALS WITH AI'}
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold mb-6 flex items-center">
                     <Search size={20} className="mr-2 text-emerald-500" />
                     {mode === 'select' ? 'Select Resource' : 'Waste Snapshot'}
                  </h3>

                  {mode === 'select' ? (
                    <div className="space-y-4">
                       <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wider">Your Active Listings</label>
                       {listings.length === 0 ? (
                         <div className="text-sm text-slate-400 py-4 italic">No active listings found.</div>
                       ) : (
                         <select 
                           value={selectedListingId} 
                           onChange={(e) => setSelectedListingId(e.target.value)}
                           className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950 font-bold"
                         >
                           <option value="">-- Select Listing --</option>
                           {listings.map(l => <option key={l._id} value={l._id}>{l.wasteType} ({l.quantity} {l.unit})</option>)}
                         </select>
                       )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                       <div 
                         className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${previewUrl ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400'}`}
                         onClick={() => fileInputRef.current?.click()}
                       >
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                         {previewUrl ? (
                           <img src={previewUrl} className="w-full h-40 object-cover rounded-xl shadow-sm" alt="Preview" />
                         ) : (
                           <div className="py-8 flex flex-col items-center">
                             <UploadCloud size={40} className="text-slate-300 mb-2" />
                             <span className="text-xs font-bold text-slate-500 uppercase">Snap to Analyze</span>
                           </div>
                         )}
                       </div>
                       
                       <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Waste Type</label>
                            <input value={quickForm.wasteType} onChange={e => setQuickForm({...quickForm, wasteType: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-transparent" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantity</label>
                               <input type="number" value={quickForm.quantity} onChange={e => setQuickForm({...quickForm, quantity: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-transparent" />
                             </div>
                             <div>
                               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">City</label>
                               <input value={quickForm.location} onChange={e => setQuickForm({...quickForm, location: e.target.value})} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-transparent" />
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  <button 
                    onClick={handleFindMatches}
                    disabled={loading}
                    className="w-full mt-8 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Activity className="animate-spin" /> : <Zap size={18} />}
                    {loading ? 'AI AGENTS RUNNING...' : 'FIND BUYERS WITH AI'}
                  </button>
                </>
              )}
           </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2 space-y-6">
           <AnimatePresence mode="wait">
             {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]"
                >
                   <div className="relative mb-8">
                      <div className="w-24 h-24 rounded-full border-4 border-emerald-100 dark:border-emerald-500/10 border-t-emerald-500 animate-spin" />
                      <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" size={32} />
                   </div>
                   <h2 className="text-2xl font-bold mb-2">Gemini 1.5 Flash Analysis</h2>
                   <p className="text-slate-500 max-w-sm">Comparing chemical fingerprints and industrial profiles across 2,400+ verified buyers...</p>
                </motion.div>
             ) : matches.length > 0 ? (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h2 className="text-xl font-bold flex items-center">
                        Matched Circular Opportunities 
                        <span className="ml-3 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">{matches.length} Verified</span>
                     </h2>
                     <button onClick={() => setMatches([])} className="text-xs text-slate-400 hover:text-rose-500 font-bold">CLEAR</button>
                  </div>

                  {matches.map((match, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm group hover:shadow-xl hover:border-emerald-500/30 transition-all relative overflow-hidden"
                    >
                       <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                          <Leaf size={120} className="text-emerald-500" />
                       </div>

                       <div className="flex flex-col md:flex-row gap-6 relative z-10">
                          <div className="flex-shrink-0 w-24 h-24 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                             <div className="text-3xl font-black text-emerald-500">{match.compatibilityScore}%</div>
                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Match</div>
                          </div>

                          <div className="flex-1">
                             <div className="flex justify-between items-start mb-2">
                                <div>
                                   <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                                     {role === 'buyer' ? (match.sellerName || 'Verified Seller') : (match.buyerName || 'Industrial Consumer')}
                                   </h3>
                                   <div className="flex items-center text-xs text-slate-500 font-medium">
                                      <MapPin size={12} className="mr-1" /> {role === 'buyer' ? (match.sellerLocation || match.location) : match.location} • {match.industryType || (role === 'buyer' ? 'Waste Producer' : 'Recycling')}
                                   </div>
                                </div>
                                <div className="flex items-center gap-2">
                                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${match.isHazardous ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                      {match.isHazardous ? 'Regulated' : 'Circular Ready'}
                                   </span>
                                </div>
                             </div>

                             <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed line-clamp-2">
                                <span className="font-bold text-emerald-600">AI Reasoning:</span> {match.reason}
                             </p>

                             <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex items-center text-xs font-bold text-slate-500">
                                   <Truck size={14} className="mr-1.5 text-slate-400" /> ₹{match.logisticsEstimate?.toLocaleString()} est.
                                </div>
                                 <div className="flex items-center text-xs font-bold text-emerald-600">
                                    <Leaf size={14} className="mr-1.5" /> {match.co2Savings?.toFixed(1)}t CO₂ Saved
                                 </div>
                                 {match.carbonCreditPotential && (
                                   <div className="flex items-center text-xs font-bold text-sky-600 bg-sky-50 dark:bg-sky-500/10 px-2 py-1 rounded-lg">
                                      <Activity size={14} className="mr-1.5" /> {match.carbonCreditPotential} Carbon Credits
                                   </div>
                                 )}
                              </div>

                              {match.regulatoryComplianceNote && (
                                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center mb-1">
                                    <ShieldCheck size={12} className="mr-1 text-emerald-500" /> Regulatory Compliance (HW Rules 2016)
                                  </p>
                                  <p className="text-[10px] text-slate-500 italic leading-tight">
                                    {match.regulatoryComplianceNote}
                                  </p>
                                </div>
                              )}
                                <button 
                                  onClick={() => handleCompleteMatch(match)}
                                  className="ml-auto bg-slate-900 dark:bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-950 px-5 py-2 rounded-xl text-xs font-black tracking-widest transition-all active:scale-95 flex items-center gap-2"
                                >
                                   EXPRESS INTEREST <ArrowRight size={14} />
                                </button>
                             </div>
                          </div>
                    </motion.div>
                  ))}
               </motion.div>
             ) : completedMatch ? (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-500 text-slate-950 rounded-3xl p-12 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
                     <CheckCircle size={40} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-black mb-4">MATCH COMPLETED</h2>
                  <p className="text-emerald-950 font-medium mb-8 max-w-md">
                     Your industrial resource has been secured. The transaction and ESG impact have been anchored on-chain.
                  </p>

                  <div className="w-full bg-slate-950/10 backdrop-blur-md rounded-2xl p-6 mb-8 text-left border border-white/10">
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">ESG Testnet Anchor (Polygon Mumbai)</span>
                        <History size={14} className="opacity-40" />
                     </div>
                     <div className="flex items-center gap-3">
                        <code className="text-sm font-mono break-all opacity-80">{completedMatch.blockchainHash}</code>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(completedMatch.blockchainHash);
                            toast.success("Hash copied!");
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                        >
                           <Copy size={16} />
                        </button>
                     </div>
                  </div>

                  <button onClick={() => navigate('/dashboard')} className="bg-slate-950 text-white px-8 py-3 rounded-xl font-bold transition-all hover:-translate-y-0.5">
                     RETURN TO DASHBOARD
                  </button>
               </motion.div>
             ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                   <Activity size={48} className="text-slate-200 mb-4" />
                   <h3 className="text-xl font-bold text-slate-400">Ready to Match</h3>
                   <p className="text-slate-500 text-sm">Select a resource on the left to activate AI agents.</p>
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function MapPin(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
