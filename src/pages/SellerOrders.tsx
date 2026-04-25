import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Package, Leaf, Truck, MapPin, Calendar, CheckCircle,
  Clock, AlertTriangle, Search, Filter, X, Eye, Hash,
  Copy, Globe, Loader2, Inbox
} from 'lucide-react';

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
    compositionReport?: string;
  };
  buyer: {
    _id: string;
    companyName: string;
    location: string;
    name: string;
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

export default function SellerOrders() {
  const [matches, setMatches] = useState<OrderMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailMatch, setDetailMatch] = useState<OrderMatch | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/orders/seller', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(res.data.matches || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  const activeStatuses = ['Pending', 'Accepted'];
  const pastStatuses = ['Rejected'];

  const filtered = matches
    .filter(m => {
      if (tab === 'active') return activeStatuses.includes(m.status);
      return pastStatuses.includes(m.status);
    })
    .filter(m => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          m.listing?.wasteType?.toLowerCase().includes(q) ||
          m.buyer?.companyName?.toLowerCase().includes(q) ||
          m.buyer?.location?.toLowerCase().includes(q)
        );
      }
      return true;
    });

  const carbonCredits = (co2: number) => Math.floor(co2);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-1 flex items-center">
          <Package className="mr-3 text-purple-500" /> My Waste Matches
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Track all buyer interest and completed transactions for your waste listings.
        </p>
      </div>

      {/* Tabs + Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setTab('active')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'active' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            Active / Present
          </button>
          <button
            onClick={() => setTab('past')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'past' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            Past / Completed
          </button>
        </div>

        <div className="flex-1 flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search waste type, buyer..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-emerald-500 focus:border-indigo-500"
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 font-medium appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-purple-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading your orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Inbox size={36} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-700 dark:text-slate-300">No {tab === 'active' ? 'Active' : 'Past'} Orders</h3>
          <p className="text-slate-500 text-sm max-w-sm text-center">
            {tab === 'active'
              ? 'When buyers match with your waste listings, they will appear here.'
              : 'Completed and rejected matches will show up in this tab.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {filtered.map(match => {
            const cfg = statusConfig[match.status] || statusConfig['Pending'];
            const StatusIcon = cfg.icon;
            const co2 = match.listing?.co2Savings || 0;
            const logistics = match.listing?.logisticsEstimate || 0;

            return (
              <div
                key={match._id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-lg hover:border-emerald-500/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Left: Score */}
                  <div className="flex-shrink-0 w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                    <div className="text-2xl font-black text-purple-500">{match.matchScore || 0}%</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Match</div>
                  </div>

                  {/* Center: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">
                          {match.listing?.wasteType || 'Unknown Waste'}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center font-medium">
                          <MapPin size={12} className="mr-1" />
                          Buyer: {match.buyer?.companyName || match.buyer?.name || 'Unknown'} • {match.buyer?.location || 'N/A'}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon size={12} /> {match.status}
                      </span>
                    </div>

                    {match.reason && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                        <span className="font-bold text-emerald-600">AI:</span> {match.reason}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs font-bold">
                      <div className="flex items-center text-slate-600 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg">
                        <Package size={12} className="mr-1.5 text-slate-400" />
                        {match.listing?.quantity} {match.listing?.unit}
                      </div>
                      <div className="flex items-center text-amber-700 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1.5 rounded-lg">
                        <Truck size={12} className="mr-1.5" /> ₹{logistics.toLocaleString()}
                      </div>
                      <div className="flex items-center text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg">
                        <Leaf size={12} className="mr-1.5" /> {co2.toFixed(1)}t CO₂
                      </div>
                      <div className="flex items-center text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1.5 rounded-lg">
                        <Globe size={12} className="mr-1.5" /> {carbonCredits(co2)} Carbon Credits
                      </div>
                      <div className="flex items-center text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg">
                        <Calendar size={12} className="mr-1.5" /> {new Date(match.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      {match.blockchainHash && (
                        <div className="flex items-center text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 rounded-lg">
                          <Hash size={12} className="mr-1.5" /> Paid & Anchored
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => setDetailMatch(match)}
                        className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all active:scale-95 border border-slate-200 dark:border-slate-700"
                      >
                        <Eye size={14} /> VIEW DETAILS
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {detailMatch && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailMatch(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Order Details</h2>
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
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Buyer</span>
                  <p className="font-bold">{detailMatch.buyer?.companyName || detailMatch.buyer?.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Buyer Location</span>
                  <p className="font-bold">{detailMatch.buyer?.location || 'N/A'}</p>
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
