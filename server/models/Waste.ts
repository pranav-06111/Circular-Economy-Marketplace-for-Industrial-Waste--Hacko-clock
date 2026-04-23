import mongoose from 'mongoose';

const WasteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, required: true }, // in tons
  unit: { type: String, default: 'tons' },
  category: { type: String, required: true }, // e.g. Plastic, Metal, Chemical
  compositionReport: { type: String }, // AI generated
  logisticsEstimate: { type: Number }, // Cost estimate
  co2Savings: { type: Number }, // Estimated CO2 savings in tons
  imageUrl: { type: String },
  blockchainHash: { type: String }, // ESG Anchoring
  status: { type: String, enum: ['Available', 'Matched', 'Recycled'], default: 'Available' },
  createdAt: { type: Date, default: Date.now }
});

export const Waste = mongoose.models.Waste || mongoose.model('Waste', WasteSchema);
