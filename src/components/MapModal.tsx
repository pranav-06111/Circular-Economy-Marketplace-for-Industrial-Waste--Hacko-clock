import React, { Suspense, lazy } from 'react';
import { X, Truck, Leaf, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

const MatchMap = lazy(() => import('./MatchMap'));

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerCoords: [number, number];
  buyerCoords: [number, number];
  sellerName: string;
  buyerName: string;
  sellerLocation: string;
  buyerLocation: string;
  distanceKm: number;
  logisticsCost: number;
  co2Savings: number;
  wasteType: string;
  quantity: number;
  unit: string;
  compatibilityScore: number;
}

export default function MapModal({
  isOpen,
  onClose,
  sellerCoords,
  buyerCoords,
  sellerName,
  buyerName,
  sellerLocation,
  buyerLocation,
  distanceKm,
  logisticsCost,
  co2Savings,
  wasteType,
  quantity,
  unit,
  compatibilityScore,
}: MapModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl h-[90vh] bg-slate-950 rounded-3xl shadow-2xl border border-slate-800/80 overflow-hidden flex flex-col z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/50 bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20">
              <MapPin size={18} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Route Logistics Map</h2>
              <p className="text-[11px] text-slate-500">{wasteType} • {quantity} {unit}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              <span className="text-xl font-black text-emerald-400">{compatibilityScore}%</span>
              <span className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-widest">Match</span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center transition-colors border border-slate-700/50"
            >
              <X size={16} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Map area */}
        <div className="flex-1 relative min-h-0">
          <ErrorBoundary>
            <Suspense fallback={
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                <span className="text-xs text-slate-500 font-medium">Loading route map...</span>
              </div>
            }>
              <MatchMap
                sellerCoords={sellerCoords}
                buyerCoords={buyerCoords}
                sellerName={sellerName}
                buyerName={buyerName}
                sellerLocation={sellerLocation}
                buyerLocation={buyerLocation}
                distanceKm={distanceKm}
              />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* Bottom stats bar */}
        <div className="shrink-0 border-t border-slate-800/50 bg-slate-950 px-5 py-4">
          {/* Route summary */}
          <div className="flex items-center justify-center gap-2 mb-4 text-sm">
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-full px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]"></div>
              <span className="font-semibold text-rose-400 truncate max-w-[120px] text-xs">{sellerName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <div className="w-6 border-t border-dashed border-slate-600"></div>
              <span className="text-[11px] font-black text-emerald-400">{distanceKm.toFixed(0)} km</span>
              <div className="w-6 border-t border-dashed border-slate-600"></div>
              <ArrowRight size={12} className="text-emerald-500" />
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></div>
              <span className="font-semibold text-emerald-400 truncate max-w-[120px] text-xs">{buyerName}</span>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Distance */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/60 text-center">
              <div className="w-9 h-9 rounded-full bg-sky-500/15 flex items-center justify-center mx-auto mb-2 border border-sky-500/20">
                <MapPin size={16} className="text-sky-400" />
              </div>
              <div className="text-xl font-black text-white">{distanceKm.toFixed(0)}<span className="text-xs font-bold text-slate-500 ml-1">km</span></div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Route Distance</div>
            </div>

            {/* Logistics cost */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/60 text-center">
              <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-2 border border-amber-500/20">
                <Truck size={16} className="text-amber-400" />
              </div>
              <div className="text-xl font-black text-white">₹{logisticsCost.toLocaleString()}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Logistics Cost</div>
              <div className="text-[8px] text-slate-600 mt-0.5">₹15/km • flat rate</div>
            </div>

            {/* CO₂ Savings */}
            <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/15 text-center">
              <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
                <Leaf size={16} className="text-emerald-400" />
              </div>
              <div className="text-xl font-black text-emerald-400">{co2Savings.toFixed(1)}<span className="text-xs font-bold ml-1">t</span></div>
              <div className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest mt-1">CO₂ Saved</div>
              <div className="text-[8px] text-emerald-600/50 mt-0.5">Net after transport</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
