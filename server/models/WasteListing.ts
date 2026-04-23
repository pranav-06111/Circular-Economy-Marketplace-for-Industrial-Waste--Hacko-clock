import mongoose from 'mongoose';

const WasteListingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  wasteType: { 
    type: String, 
    enum: [
      'Municipal Solid Waste (MSW)', 
      'Industrial Non-Hazardous', 
      'Plastic Waste', 
      'Paper / Cardboard', 
      'Glass', 
      'Metal Scrap',
      'Hazardous Chemical Waste',
      'Solvents & Degreasers',
      'Oily Wastes',
      'Industrial Sludges',
      'E-waste',
      'Batteries',
      'Medical / Clinical Waste',
      'Radioactive Waste',
      'Composite / Other'
    ],
    required: true 
  },
  
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ['tonnes', 'kg', 'litres', 'units'], default: 'tonnes' },
  frequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'One-time'] },
  location: { type: String, required: true },
  
  composition: { type: Map, of: Number },
  physicalForm: { type: String, enum: ['Solid', 'Liquid', 'Semi-solid', 'Baled', 'Loose', 'Sludge'] },
  contaminants: [{ type: String }],
  moistureContent: { type: Number },
  pH: { type: Number },
  flashPoint: { type: Number },
  
  isHazardous: { type: Boolean, default: false },
  regulatoryClass: { type: String },
  requiredPermits: [{ type: String }],
  labCertificates: [{ type: String }],
  complianceNotes: { type: String },
  
  photos: [{ type: String }],
  
  processDescription: { type: String },
  sourceIndustry: { type: String },
  
  aiAnalysis: {
    inferredComposition: { type: Object },
    hazardousLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
    keyChemicals: [{ type: String }],
    confidenceScore: { type: Number },
    regulatoryFlags: [{ type: String }]
  },

  // Legacy/App compatibility fields
  compositionReport: { type: String }, 
  logisticsEstimate: { type: Number },
  co2Savings: { type: Number },
  
  status: { 
    type: String, 
    enum: ['Active', 'Matched', 'Completed', 'Expired', 'Available'], 
    default: 'Active' 
  },
  
  createdAt: { type: Date, default: Date.now }
});

export const WasteListing = mongoose.models.WasteListing || mongoose.model('WasteListing', WasteListingSchema);
