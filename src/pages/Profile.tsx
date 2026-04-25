import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Building2, MapPin, Phone, Mail, Globe, FileText, Save, Shield, Loader2, Camera } from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  companyName: string;
  location: string;
  phone: string;
  industryType: string;
  bio: string;
  companySize: string;
  gstNumber: string;
  address: string;
  website: string;
  avatar: string;
  role: string;
  authProvider: string;
  acceptedWasteTypes: string[];
  wasteTypesGenerated: string[];
  preferredSupplyRadius: string;
  createdAt: string;
}

const industryTypes = [
  'Manufacturing', 'Automotive', 'Electronics', 'Textile', 'Furniture',
  'Chemical', 'Petrochemical', 'Pharmaceutical', 'Paints & Coatings', 'Fertilizers',
  'Construction', 'Cement', 'Bricks', 'Insulation',
  'Energy', 'Biofuel', 'Waste-to-Energy',
  'Agriculture', 'Food Processing', 'Paper & Pulp',
  'Glass & Ceramics', 'Rubber & Plastics', 'Mining', 'Metallurgy',
  'IT / Services', 'Logistics', 'Other'
];

const wasteTypes = [
  'Plastic Waste', 'Metal Scrap', 'Paper / Cardboard', 'Glass',
  'E-waste', 'Hazardous Chemical Waste', 'Solvents & Degreasers',
  'Oily Wastes', 'Industrial Sludges', 'Organic Waste',
  'Textile Waste', 'Rubber Waste', 'Wood / Biomass',
  'Fly Ash', 'Slag', 'Batteries'
];

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<ProfileData>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.user);
      setForm(res.data.user);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('/api/auth/profile', {
        ...form,
        profileCompleted: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update localStorage with fresh user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setProfile(res.data.fullProfile);
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    const current = (form as any)[field] || [];
    if (current.includes(item)) {
      handleChange(field, current.filter((i: string) => i !== item));
    } else {
      handleChange(field, [...current, item]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!profile) return <div className="text-center py-20 text-slate-500">Profile not found.</div>;

  const role = profile.role;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0tNiA2aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        </div>
        
        {/* Avatar + Basic Info */}
        <div className="px-8 pb-6 -mt-12 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="relative">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <User size={36} className="text-emerald-500" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <Camera size={12} className="text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile.name || 'Unnamed User'}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                <span className="flex items-center"><Mail size={14} className="mr-1" /> {profile.email}</span>
                {profile.location && <span className="flex items-center"><MapPin size={14} className="mr-1" /> {profile.location}</span>}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${role === 'buyer' ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                  {role}
                </span>
                {profile.authProvider === 'google' && (
                  <span className="flex items-center text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Google
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => editMode ? handleSave() : setEditMode(true)}
              disabled={saving}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shrink-0 ${
                editMode
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : editMode ? <Save size={16} /> : <FileText size={16} />}
              {saving ? 'Saving...' : editMode ? 'Save Profile' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Information */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-5 flex items-center">
            <User size={18} className="mr-2 text-emerald-500" /> Personal Information
          </h2>
          <div className="space-y-4">
            <FieldRow label="Full Name" value={form.name || ''} field="name" editMode={editMode} onChange={handleChange} />
            <FieldRow label="Email" value={profile.email} field="email" editMode={false} onChange={() => {}} disabled />
            <FieldRow label="Phone" value={form.phone || ''} field="phone" editMode={editMode} onChange={handleChange} placeholder="+91 98765 43210" />
            <FieldRow label="City / Location" value={form.location || ''} field="location" editMode={editMode} onChange={handleChange} placeholder="e.g. Mumbai, Maharashtra" />
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-5 flex items-center">
            <Building2 size={18} className="mr-2 text-emerald-500" /> Company Information
          </h2>
          <div className="space-y-4">
            <FieldRow label="Company Name" value={form.companyName || ''} field="companyName" editMode={editMode} onChange={handleChange} placeholder="Your Company Ltd." />
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Industry Type</label>
              {editMode ? (
                <select
                  value={form.industryType || 'Manufacturing'}
                  onChange={e => handleChange('industryType', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-indigo-500 dark:bg-slate-950 text-sm"
                >
                  {industryTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              ) : (
                <p className="text-sm font-medium">{profile.industryType || '—'}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Company Size</label>
              {editMode ? (
                <select
                  value={form.companySize || ''}
                  onChange={e => handleChange('companySize', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-indigo-500 dark:bg-slate-950 text-sm"
                >
                  <option value="">Select size</option>
                  <option value="Small (1-50)">Small (1-50)</option>
                  <option value="Medium (51-200)">Medium (51-200)</option>
                  <option value="Large (200+)">Large (200+)</option>
                </select>
              ) : (
                <p className="text-sm font-medium">{(profile as any).companySize || '—'}</p>
              )}
            </div>

            <FieldRow label="GST Number" value={form.gstNumber || ''} field="gstNumber" editMode={editMode} onChange={handleChange} placeholder="22AAAAA0000A1Z5" />
          </div>
        </div>

        {/* Address & Web */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-5 flex items-center">
            <Globe size={18} className="mr-2 text-emerald-500" /> Address & Web
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Address</label>
              {editMode ? (
                <textarea
                  value={form.address || ''}
                  onChange={e => handleChange('address', e.target.value)}
                  rows={2}
                  placeholder="Plot No. 12, MIDC Industrial Area, Pune 411018"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-indigo-500 dark:bg-slate-950 text-sm"
                />
              ) : (
                <p className="text-sm font-medium">{(profile as any).address || '—'}</p>
              )}
            </div>
            <FieldRow label="Website" value={form.website || ''} field="website" editMode={editMode} onChange={handleChange} placeholder="https://yourcompany.com" />
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bio / About</label>
              {editMode ? (
                <textarea
                  value={form.bio || ''}
                  onChange={e => handleChange('bio', e.target.value)}
                  rows={3}
                  placeholder="Tell us about your company and sustainability goals..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-indigo-500 dark:bg-slate-950 text-sm"
                />
              ) : (
                <p className="text-sm font-medium">{(profile as any).bio || '—'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Waste Preferences */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-5 flex items-center">
            <Shield size={18} className="mr-2 text-emerald-500" /> Waste Preferences
          </h2>

          {(role === 'seller' || role === 'both') && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Waste Types You Generate</label>
              {editMode ? (
                <div className="flex flex-wrap gap-2">
                  {wasteTypes.map(w => {
                    const selected = (form.wasteTypesGenerated || []).includes(w);
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => toggleArrayItem('wasteTypesGenerated', w)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          selected
                            ? 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                        }`}
                      >
                        {w}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {((profile as any).wasteTypesGenerated || []).length > 0
                    ? (profile as any).wasteTypesGenerated.map((w: string) => (
                        <span key={w} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded text-xs font-medium">{w}</span>
                      ))
                    : <span className="text-sm text-slate-400">No waste types selected</span>
                  }
                </div>
              )}
            </div>
          )}

          {(role === 'buyer' || role === 'both') && (
            <>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Accepted Waste Types</label>
                {editMode ? (
                  <div className="flex flex-wrap gap-2">
                    {wasteTypes.map(w => {
                      const selected = (form.acceptedWasteTypes || []).includes(w);
                      return (
                        <button
                          key={w}
                          type="button"
                          onClick={() => toggleArrayItem('acceptedWasteTypes', w)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            selected
                              ? 'bg-sky-500 text-white border-sky-500'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-sky-400'
                          }`}
                        >
                          {w}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(profile.acceptedWasteTypes || []).length > 0
                      ? profile.acceptedWasteTypes.map((w: string) => (
                          <span key={w} className="px-2 py-1 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 rounded text-xs font-medium">{w}</span>
                        ))
                      : <span className="text-sm text-slate-400">No waste types selected</span>
                    }
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Preferred Supply Radius</label>
                {editMode ? (
                  <select
                    value={form.preferredSupplyRadius || ''}
                    onChange={e => handleChange('preferredSupplyRadius', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-indigo-500 dark:bg-slate-950 text-sm"
                  >
                    <option value="">Select radius</option>
                    <option value="50km">50 km</option>
                    <option value="100km">100 km</option>
                    <option value="250km">250 km</option>
                    <option value="500km">500 km</option>
                    <option value="Pan-India">Pan-India</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium">{(profile as any).preferredSupplyRadius || '—'}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-400 pb-8">
        Member since {new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}

// Reusable field row component
function FieldRow({ label, value, field, editMode, onChange, placeholder, disabled }: {
  label: string; value: string; field: string; editMode: boolean;
  onChange: (field: string, value: string) => void; placeholder?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
      {editMode && !disabled ? (
        <input
          type="text"
          value={value}
          onChange={e => onChange(field, e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-indigo-500 dark:bg-slate-950 text-sm"
        />
      ) : (
        <p className="text-sm font-medium">{value || '—'}</p>
      )}
    </div>
  );
}
