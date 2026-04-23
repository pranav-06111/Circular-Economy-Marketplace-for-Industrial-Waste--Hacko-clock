import { useState, useEffect } from 'react';
import { Zap, Activity, Cpu, CheckCircle, AlertTriangle, Truck, Leaf, MapPin, Map, ShoppingCart, ArrowRight, Globe } from 'lucide-react';
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
           
           {matches.map((match, i) => {
             const geo = getGeoData(match);
             return (
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
                   
                   <p className="text-sm font-medium text-slate-400 mb-1">{match.wasteType}</p>
                   {match.sellerName && (
                     <p className="text-xs text-slate-400 mb-2 flex items-center">
                       <MapPin size={12} className="mr-1" /> {match.sellerName} — {match.sellerLocation || match.location}
                     </p>
                   )}
                   
                   <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">
                     <span className="font-semibold text-emerald-600 dark:text-emerald-400">AI Analysis:</span> "{match.reason}"
                   </p>
                   
                   {/* Geo-calculated stats row */}
                   <div className="flex flex-wrap gap-3 text-xs mb-4">
                      <div className="flex items-center text-slate-600 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg">
                        <CheckCircle size={14} className="mr-1.5 text-emerald-500" /> Volume: {match.estimatedMonthlyVolume}
                      </div>
                      <div className="flex items-center text-sky-700 bg-sky-50 dark:bg-sky-500/10 px-2.5 py-1.5 rounded-lg font-bold">
                        <MapPin size={14} className="mr-1.5" /> {geo.distanceKm.toFixed(0)} km
                      </div>
                      <div className="flex items-center text-amber-700 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1.5 rounded-lg font-bold">
                        <Truck size={14} className="mr-1.5" /> ₹{geo.logisticsCost.toLocaleString()}
                      </div>
                      <div className="flex items-center text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg font-bold">
                        <Leaf size={14} className="mr-1.5" /> {geo.co2Savings.toFixed(1)}t CO₂
                      </div>
                      <div className="flex items-center text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1.5 rounded-lg font-bold">
                        <Globe size={14} className="mr-1.5" /> 🌍 Eligible for {Math.floor(geo.co2Savings)} Carbon Credits
                      </div>
                      {match.carbonCreditPotential && (
                        <div className="flex items-center text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg font-bold">
                          <Activity size={14} className="mr-1.5" /> {match.carbonCreditPotential} AI Credits
                        </div>
                      )}
                   </div>

                   {match.regulatoryComplianceNote && (
                     <div className="text-[10px] text-slate-400 italic mb-2">
                       {match.regulatoryComplianceNote}
                     </div>
                   )}

                   {match.isHazardous && match.requiredPermits && match.requiredPermits.length > 0 && (
                       <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-lg border border-rose-100 dark:border-rose-900/50 mt-2">
                           <p className="text-xs font-semibold text-rose-800 dark:text-rose-400 flex items-center mb-1"><AlertTriangle size={12} className="mr-1"/> Regulatory Requirements</p>
                           <p className="text-xs text-rose-700 dark:text-rose-500">Requires: {match.requiredPermits.join(', ')}</p>
                       </div>
                   )}

                   {/* Action buttons */}
                   <div className="mt-4 flex items-center gap-3 flex-wrap">
                     <button
                       onClick={() => setMapMatch(match)}
                       className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-500/10 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
                     >
                       <Map size={14} /> VIEW ON MAP
                     </button>
                     <button
                       onClick={() => setPaymentMatch(match)}
                       className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-5 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all hover:-translate-y-0.5 active:scale-95 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
                     >
                       <ShoppingCart size={14} /> BUY NOW <ArrowRight size={12} />
                     </button>
                   </div>
                </div>
              </div>
             );
           })}
        </div>
      )}

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
