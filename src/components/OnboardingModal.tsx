import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Building2, MapPin, Phone, Briefcase, ArrowRight, Leaf, Loader2 } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
}

const industryTypes = [
  'Manufacturing', 'Automotive', 'Electronics', 'Textile', 'Furniture',
  'Chemical', 'Petrochemical', 'Pharmaceutical', 'Paints & Coatings', 'Fertilizers',
  'Construction', 'Cement', 'Energy', 'Biofuel',
  'Agriculture', 'Food Processing', 'Paper & Pulp',
  'Glass & Ceramics', 'Rubber & Plastics', 'Mining', 'Metallurgy', 'Other'
];

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    location: '',
    phone: '',
    industryType: 'Manufacturing',
    companySize: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.companyName.trim() || !form.location.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/auth/profile', {
        ...form,
        profileCompleted: true,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Profile setup complete! Welcome aboard 🎉');
      onComplete();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf size={20} />
            </div>
            <h2 className="text-xl font-bold">Complete Your Profile</h2>
          </div>
          <p className="text-emerald-100 text-sm">
            Tell us about your company so we can match you with the right buyers.
          </p>
          
          {/* Progress */}
          <div className="flex gap-2 mt-4">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          {step === 1 && (
            <div className="space-y-5 animate-in">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center">
                  <Building2 size={14} className="mr-1.5 text-emerald-500" /> Company Name <span className="text-rose-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={e => handleChange('companyName', e.target.value)}
                  placeholder="e.g. GreenTech Industries Pvt. Ltd."
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950 text-sm transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center">
                  <MapPin size={14} className="mr-1.5 text-emerald-500" /> City / Location <span className="text-rose-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => handleChange('location', e.target.value)}
                  placeholder="e.g. Pune, Maharashtra"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950 text-sm transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center">
                  <Phone size={14} className="mr-1.5 text-emerald-500" /> Phone Number
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950 text-sm transition-shadow"
                />
              </div>

              <button
                onClick={() => {
                  if (!form.companyName.trim() || !form.location.trim()) {
                    toast.error('Company Name and Location are required.');
                    return;
                  }
                  setStep(2);
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center">
                  <Briefcase size={14} className="mr-1.5 text-emerald-500" /> Industry Type
                </label>
                <select
                  value={form.industryType}
                  onChange={e => handleChange('industryType', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950 text-sm transition-shadow"
                >
                  {industryTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Company Size</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Small (1-50)', 'Medium (51-200)', 'Large (200+)'].map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleChange('companySize', size)}
                      className={`py-3 rounded-xl text-xs font-bold border-2 transition-all ${
                        form.companySize === size
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-[2] bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Leaf size={16} />}
                  {saving ? 'Saving...' : 'Start Using EcoMatch'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
