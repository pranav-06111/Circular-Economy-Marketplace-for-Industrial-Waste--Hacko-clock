import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, CheckCircle2, Factory, Trash2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Offload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('offloadDraft');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error('Draft parsing failed'); }
    }
    return {
      wasteType: 'Plastic Waste',
      description: '',
      quantity: '',
      unit: 'tonnes',
      frequency: 'One-time',
      location: '',
      processDescription: '',
      sourceIndustry: '',
      physicalForm: 'Solid',
      moistureContent: '',
      pH: '',
      flashPoint: ''
    };
  });
  
  const [contaminants, setContaminants] = useState<string[]>([]);
  const [contaminantInput, setContaminantInput] = useState('');
  
  const [composition, setComposition] = useState<Record<string, number>>({});
  const [compKey, setCompKey] = useState('');
  const [compVal, setCompVal] = useState('');
  
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const nonHazardousCategories = ['Municipal Solid Waste (MSW)', 'Industrial Non-Hazardous', 'Plastic Waste', 'Paper / Cardboard', 'Glass', 'Metal Scrap', 'E-waste', 'Composite / Other'];
  const hazardousCategories = ['Hazardous Chemical Waste', 'Solvents & Degreasers', 'Oily Wastes', 'Industrial Sludges', 'Batteries', 'Medical / Clinical Waste', 'Radioactive Waste'];
  
  const frequencies = ['One-time', 'Daily', 'Weekly', 'Monthly'];
  const units = ['tonnes', 'kg', 'litres', 'units'];
  const physicalForms = ['Solid', 'Liquid', 'Semi-solid', 'Baled', 'Loose', 'Sludge'];

  useEffect(() => {
    localStorage.setItem('offloadDraft', JSON.stringify(formData));
  }, [formData]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 5) as File[]; // Max 5 photos
      setFiles(selectedFiles);
      setPreviewUrls(selectedFiles.map((file: File) => URL.createObjectURL(file as Blob)));
    }
  };
  
  const addContaminant = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') || !contaminantInput.trim()) return;
    e.preventDefault();
    if (!contaminants.includes(contaminantInput.trim())) setContaminants([...contaminants, contaminantInput.trim()]);
    setContaminantInput('');
  };
  
  const addComposition = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!compKey.trim() || !compVal) return;
    setComposition({ ...composition, [compKey.trim()]: Number(compVal) });
    setCompKey('');
    setCompVal('');
  };

  const clearDraft = () => {
    localStorage.removeItem('offloadDraft');
    setFormData({
      wasteType: 'Plastic Waste', description: '', quantity: '', unit: 'tonnes', frequency: 'One-time', location: '', processDescription: '', sourceIndustry: '', physicalForm: 'Solid', moistureContent: '', pH: '', flashPoint: ''
    });
    setContaminants([]);
    setComposition({});
    setFiles([]);
    setPreviewUrls([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error("Please upload at least one photo for AI analysis.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
        const val = formData[key as keyof typeof formData];
        if(val) data.append(key, val);
    });
    data.append('contaminants', JSON.stringify(contaminants));
    data.append('composition', JSON.stringify(composition));
    
    files.forEach(file => {
      data.append('photos', file);
    });

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/listings', data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess(true);
      clearDraft();
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (error) {
      console.error(error);
      toast.error('Failed to list waste. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-4">Listing Successful!</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Our AI has analyzed the composition against environmental rules. Buyers can now see your listing.
        </p>
        <div className="inline-flex items-center text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
          Redirecting to Matches...
        </div>
      </div>
    );
  }

  const isHazardousSelected = hazardousCategories.includes(formData.wasteType);
  const requiresPH = ['Industrial Sludges', 'Hazardous Chemical Waste', 'Solvents & Degreasers'].includes(formData.wasteType);
  const requiresFlashPoint = ['Solvents & Degreasers', 'Oily Wastes'].includes(formData.wasteType);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-0 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
            <Factory className="mr-3 text-emerald-500" />
            List Industrial Waste
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Offer your byproduct to verified buyers. Upload photos for instant AI regulatory analysis.</p>
        </div>
        <button type="button" onClick={clearDraft} className="text-slate-400 hover:text-rose-500 text-sm flex items-center font-medium transition-colors mb-2">
          <Trash2 size={16} className="mr-1" /> Clear Draft
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Waste Category</label>
                  <select name="wasteType" value={formData.wasteType} onChange={handleTextChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950">
                    <optgroup label="Non-Hazardous & Recyclables">
                      {nonHazardousCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </optgroup>
                    <optgroup label="Hazardous & Regulated">
                      {hazardousCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </optgroup>
                  </select>
                  {isHazardousSelected && <p className="text-xs text-rose-500 mt-1 font-semibold">Strict regulatory compliance applies.</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
                  <select name="frequency" value={formData.frequency} onChange={handleTextChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950">
                    {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Available Quantity</label>
                  <input required name="quantity" type="number" min="0.1" step="0.1" value={formData.quantity} onChange={handleTextChange} placeholder="e.g. 5.5" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950 font-mono" />
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                  <select name="unit" value={formData.unit} onChange={handleTextChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950">
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Origin City/Location</label>
                    <input required name="location" value={formData.location} onChange={handleTextChange} placeholder="e.g. Pune, MIDC Industrial Area" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Physical Form</label>
                    <select name="physicalForm" value={formData.physicalForm} onChange={handleTextChange} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950">
                        {physicalForms.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea required name="description" rows={2} value={formData.description} onChange={handleTextChange} placeholder="Describe packaging and impurities." className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950" />
              </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Source Industry</label>
                    <input name="sourceIndustry" value={formData.sourceIndustry} onChange={handleTextChange} placeholder="e.g. Automotive, Pharma" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Process Description</label>
                    <input name="processDescription" value={formData.processDescription} onChange={handleTextChange} placeholder="e.g. Generated during injection molding" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950 text-sm" />
                  </div>
               </div>

            </div>

            <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contaminants / Impurities</label>
                  <div className="flex gap-2 mb-2">
                    <input 
                      value={contaminantInput} 
                      onChange={(e) => setContaminantInput(e.target.value)} 
                      onKeyDown={addContaminant}
                      placeholder="e.g. Oil, Dirt (Press Enter)" 
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950 text-sm" 
                    />
                    <button type="button" onClick={addContaminant} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-sm font-medium">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {contaminants.map(c => (
                          <span key={c} className="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs">
                              {c} <X size={12} className="ml-1 cursor-pointer hover:text-rose-500" onClick={() => setContaminants(contaminants.filter(x => x !== c))} />
                          </span>
                      ))}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Detailed Composition (%)</label>
                    <div className="flex gap-2 mb-3">
                        <input value={compKey} onChange={(e) => setCompKey(e.target.value)} placeholder="Material (e.g. PET)" className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded md:text-sm" />
                        <input value={compVal} type="number" onChange={(e) => setCompVal(e.target.value)} placeholder="%" className="w-16 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded md:text-sm" />
                        <button type="button" onClick={addComposition} className="px-2 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded"><Plus size={16}/></button>
                    </div>
                    {Object.keys(composition).length > 0 && (
                        <div className="space-y-1">
                            {Object.entries(composition).map(([k, v]) => (
                                <div key={k} className="flex justify-between items-center text-xs bg-white dark:bg-slate-950 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-800">
                                    <span>{k}</span>
                                    <div className="flex items-center">
                                       <span className="font-mono text-emerald-600 font-semibold mr-2">{v}%</span>
                                       <X size={12} className="cursor-pointer text-slate-400 hover:text-rose-500" onClick={() => {
                                           const n = {...composition};
                                           delete n[k];
                                           setComposition(n);
                                       }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {requiresPH && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">pH Level</label>
                        <input name="pH" type="number" step="0.1" value={formData.pH} onChange={handleTextChange} placeholder="e.g. 7.5" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950 font-mono text-sm" />
                      </div>
                  )}
                  {requiresFlashPoint && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Flash Point (°C)</label>
                        <input name="flashPoint" type="number" value={formData.flashPoint} onChange={handleTextChange} placeholder="e.g. 60" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-950 font-mono text-sm" />
                      </div>
                  )}
                </div>

            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Upload Photos <span className="text-emerald-500 text-xs font-semibold">(Max 5)</span>
            </label>
            <div 
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${files.length > 0 ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/5' : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
              
              {previewUrls.length > 0 ? (
                <div className="flex flex-wrap gap-4 justify-center">
                   {previewUrls.map((url, i) => (
                       <img key={i} src={url} alt={`Preview ${i}`} className="h-24 w-24 object-cover rounded shadow-sm border border-emerald-200" />
                   ))}
                   <div className="h-24 w-24 flex items-center justify-center border-2 border-dashed border-emerald-300 text-emerald-500 rounded hover:bg-emerald-50 cursor-pointer">
                       <Plus size={24} />
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud size={24} />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white block mb-1 text-lg">Select clear photos</span>
                  <span className="text-sm text-slate-500 mb-2">Provide well-lit images of the waste pile/storage for accurate AI analysis.</span>
                </div>
              )}
            </div>
          </div>

        </div>
        
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-sm text-slate-500">Drafts are saved automatically</span>
          <button 
            type="submit" 
            disabled={loading || files.length === 0}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-3 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)]"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI Regulatory Scan...
              </span>
            ) : 'Publish Waste Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
