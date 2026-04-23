import { useState, useEffect } from 'react';
import { Zap, Activity, Cpu, CheckCircle, AlertTriangle, Truck, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

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
}

export default function BuyerMatches() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/listings/buyer/matches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sort matches descending by score
      const sorted = (res.data.matches || []).sort((a: MatchResult, b: MatchResult) => b.compatibilityScore - a.compatibilityScore);
      setMatches(sorted);
    } catch (error) {
      console.error(error);
      toast.error('Failed to run AI matching engine.');
    } finally {
      setLoading(false);
    }
  };

  const getHazardBadge = (level?: 'Low' | 'Medium' | 'High', isHazardous?: boolean) => {
      if (!isHazardous) return <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">Non-Hazardous</span>;
      if (level === 'High') return <span className="px-2.5 py-1 rounded text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400">High Risk Hazard</span>;
      if (level === 'Medium') return <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400">Medium Risk Hazard</span>;
      return <span className="px-2.5 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400">Low Risk Hazard</span>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Zap size={40} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">AI Matching Engine</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Our proprietary AI analyzed your company profile against active waste streams to find optimal circular economy matches.
        </p>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col items-center max-w-xl mx-auto mt-8">
           <Cpu size={48} className="text-slate-300 dark:text-slate-700 mb-6 animate-pulse" />
           <h3 className="text-xl font-bold mb-2">Analyzing supply chains...</h3>
           <p className="text-slate-500 mb-8 text-center">
             The matchmaking algorithm is currently running baseline analysis on your industry profiles and identifying geographical arbitrage opportunities.
           </p>
           <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-6 overflow-hidden">
             <div className="bg-emerald-500 h-2.5 rounded-full w-2/3 animate-pulse"></div>
           </div>
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col items-center max-w-xl mx-auto mt-8">
           <p className="text-slate-500 mb-6">No high-compatibility AI matches found right now.</p>
           <Link to="/dashboard" className="text-emerald-600 hover:text-emerald-500 font-semibold flex items-center">
             <Activity size={16} className="mr-1" /> Browse marketplace manually
           </Link>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Top Matched Opportunities</h3>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                {matches.length} matches found
              </span>
           </div>
           
           {matches.map((match, i) => (
             <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:shadow-md transition-shadow">
               <div className="flex-shrink-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-xl p-4 min-w-[140px] border border-slate-100 dark:border-slate-800 z-10">
                 <div className="text-4xl font-black text-emerald-500">{match.compatibilityScore}%</div>
                 <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mt-1 text-center">Match<br/>Score</div>
               </div>
               
               <div className="flex-1 z-10">
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{match.suggestedUseCase}</h4>
                     {getHazardBadge(match.hazardousLevel, match.isHazardous)}
                  </div>
                  
                  <p className="text-sm font-medium text-slate-400 mb-2">{match.wasteType}</p>
                  
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">AI Analysis:</span> "{match.reason}"
                  </p>
                  
                  <div className="flex flex-wrap gap-3 text-xs mb-4">
                     <div className="flex items-center text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                       <CheckCircle size={14} className="mr-1.5 text-emerald-500" /> Volume: {match.estimatedMonthlyVolume}
                     </div>
                     <div className="flex items-center text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                       <Leaf size={14} className="mr-1.5 text-emerald-500" /> Save {match.co2Savings?.toFixed(1)}t CO₂
                     </div>
                     <div className="flex items-center text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                       <Truck size={14} className="mr-1.5 text-slate-400" /> Est. Trans: ₹{match.logisticsEstimate?.toLocaleString()}
                     </div>
                  </div>

                  {match.isHazardous && match.requiredPermits && match.requiredPermits.length > 0 && (
                      <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-lg border border-rose-100 dark:border-rose-900/50 mt-2">
                          <p className="text-xs font-semibold text-rose-800 dark:text-rose-400 flex items-center mb-1"><AlertTriangle size={12} className="mr-1"/> Regulatory Requirements</p>
                          <p className="text-xs text-rose-700 dark:text-rose-500">Requires: {match.requiredPermits.join(', ')}</p>
                      </div>
                  )}
               </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
