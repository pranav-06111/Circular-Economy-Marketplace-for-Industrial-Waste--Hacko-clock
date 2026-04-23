import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  X, CreditCard, Shield, Leaf, Truck, CheckCircle, Copy,
  Hash, Loader2, Sparkles, Zap, IndianRupee, Globe
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchData: {
    sellerName: string;
    buyerName: string;
    wasteType: string;
    quantity: number;
    unit: string;
    logisticsCost: number;
    co2Savings: number;
    compatibilityScore: number;
    matchId?: string;
  };
  onSuccess: (result: any) => void;
}

const PLATFORM_FEE = 99; // ₹99 platform fee

export default function PaymentModal({ isOpen, onClose, matchData, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<'summary' | 'processing' | 'success'>('summary');
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  if (!isOpen) return null;

  const totalAmount = PLATFORM_FEE;
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleRazorpayPayment = async () => {
    try {
      setStep('processing');
      const token = localStorage.getItem('token');

      // Step 1: Create order on backend
      const orderRes = await axios.post('/api/payment/create-order', {
        amount: totalAmount,
        matchId: matchData.matchId || `match_${Date.now()}`,
        wasteType: matchData.wasteType,
        sellerName: matchData.sellerName,
        buyerName: matchData.buyerName,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { orderId, keyId } = orderRes.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key: keyId,
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'EcoMatch India',
        description: `Match Fee: ${matchData.wasteType}`,
        order_id: orderId,
        handler: async function (response: any) {
          // Step 3: Verify payment on backend
          try {
            const verifyRes = await axios.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              matchData: {
                co2Savings: matchData.co2Savings,
                carbonCredits: Math.floor(matchData.co2Savings),
              },
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });

            setPaymentResult(verifyRes.data);
            setStep('success');
            onSuccess(verifyRes.data);
          } catch (err) {
            console.error('Verify error:', err);
            toast.error('Payment captured but verification failed. Contact support.');
            setStep('summary');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#10b981',
          backdrop_color: 'rgba(0,0,0,0.7)',
        },
        modal: {
          ondismiss: () => {
            setStep('summary');
            toast('Payment cancelled', { icon: '⚠️' });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Payment init error:', error);
      toast.error(error.response?.data?.error || 'Failed to initiate payment');
      setStep('summary');
    }
  };

  const handleSimulatePayment = async () => {
    setSimulating(true);
    setStep('processing');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/payment/simulate', {
        matchData: {
          co2Savings: matchData.co2Savings,
          carbonCredits: Math.floor(matchData.co2Savings),
        },
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Small delay for dramatic effect
      await new Promise(r => setTimeout(r, 1500));

      setPaymentResult(res.data);
      setStep('success');
      onSuccess(res.data);
    } catch (error: any) {
      toast.error('Simulation failed');
      setStep('summary');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={step === 'processing' ? undefined : onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10">

        {/* ─── STEP 1: Payment Summary ─── */}
        {step === 'summary' && (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-6 py-5 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 right-4 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
              </div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Secure Checkout</h2>
                    <p className="text-emerald-100 text-xs">Powered by Razorpay</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Match summary */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Match Details</span>
                  <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {matchData.compatibilityScore}% Match
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Waste Type</span>
                    <span className="font-semibold">{matchData.wasteType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Seller</span>
                    <span className="font-semibold">{matchData.sellerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity</span>
                    <span className="font-semibold">{matchData.quantity} {matchData.unit}</span>
                  </div>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center text-slate-500"><Truck size={14} className="mr-2 text-amber-500" /> Est. Logistics</span>
                  <span className="font-semibold text-slate-400">₹{matchData.logisticsCost.toLocaleString()} <span className="text-[10px] text-slate-400">(pay later)</span></span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center text-slate-500"><Leaf size={14} className="mr-2 text-emerald-500" /> CO₂ Savings</span>
                  <span className="font-semibold text-emerald-600">{matchData.co2Savings.toFixed(1)} tonnes</span>
                </div>
                <hr className="border-slate-200 dark:border-slate-700" />
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center text-slate-500"><Zap size={14} className="mr-2 text-emerald-500" /> Platform Match Fee</span>
                  <span className="font-bold">₹{PLATFORM_FEE}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total Due Now</span>
                  <span className="text-2xl font-black text-emerald-600">₹{totalAmount}</span>
                </div>
              </div>

              {/* Security badge */}
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20 rounded-xl px-4 py-2.5">
                <Shield size={16} className="text-emerald-600 shrink-0" />
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  Secured by Razorpay. 256-bit SSL encryption. ESG record anchored on-chain.
                </p>
              </div>

              {/* Pay button */}
              <button
                onClick={handleRazorpayPayment}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] text-sm active:scale-[0.98]"
              >
                <IndianRupee size={16} /> Pay ₹{totalAmount} with Razorpay
              </button>

              {/* Simulate button for demo */}
              <button
                onClick={handleSimulatePayment}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
              >
                <Sparkles size={14} /> Simulate Payment (Demo Mode for Judges)
              </button>
            </div>
          </>
        )}

        {/* ─── STEP 2: Processing ─── */}
        {step === 'processing' && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Loader2 size={32} className="text-emerald-500 animate-spin" />
            </div>
            <h3 className="text-xl font-bold mb-2">Processing Payment...</h3>
            <p className="text-slate-500 text-sm">
              {simulating ? 'Simulating payment and generating ESG record...' : 'Please complete payment in the Razorpay window.'}
            </p>
          </div>
        )}

        {/* ─── STEP 3: Success ─── */}
        {step === 'success' && paymentResult && (
          <div className="text-center">
            {/* Green success header */}
            <div className="bg-gradient-to-b from-emerald-500 to-teal-600 px-6 pt-8 pb-10 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 right-8 w-40 h-40 rounded-full bg-white blur-3xl"></div>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <CheckCircle size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-1">Payment Successful!</h2>
                <p className="text-emerald-100 text-sm">Match secured & ESG record anchored</p>
              </div>
            </div>

            <div className="px-6 pb-6 -mt-4 relative z-10">
              {/* Transaction card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-5 mb-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Transaction ID</span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{paymentResult.paymentId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Amount</span>
                    <span className="font-bold text-emerald-600">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">CO₂ Savings</span>
                    <span className="font-bold text-emerald-600">{paymentResult.esgRecord?.co2Savings} tonnes</span>
                  </div>
                  <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-500/10 p-2 rounded-lg mt-2">
                    <span className="text-indigo-800 dark:text-indigo-300 font-semibold flex items-center">
                      <Globe size={14} className="mr-2" /> Earned Carbon Credits
                    </span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-lg">{paymentResult.esgRecord?.carbonCredits}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Status</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
                      <CheckCircle size={12} /> {paymentResult.esgRecord?.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Blockchain hash */}
              <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-4 mb-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <Hash size={10} className="mr-1" /> ESG Blockchain Anchor
                  </span>
                  <span className="text-[9px] text-slate-500">{paymentResult.esgRecord?.network}</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-[11px] font-mono text-emerald-400 break-all flex-1">
                    {paymentResult.blockchainHash}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(paymentResult.blockchainHash);
                      toast.success('Hash copied!');
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                  >
                    <Copy size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* ESG Badge */}
              <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-full px-4 py-2 mb-5">
                <Shield size={14} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Verified for ESG Reporting</span>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-3 rounded-xl transition-all text-sm"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
