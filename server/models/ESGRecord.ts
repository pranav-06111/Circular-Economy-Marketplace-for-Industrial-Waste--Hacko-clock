import mongoose from 'mongoose';

const ESGRecordSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'WasteListing', required: true },
  hash: { type: String, required: true }, // Blockchain mock hash
  timestamp: { type: String, required: true },
  co2Saved: { type: Number, required: true },
  dataHash: { type: String, required: true }, // The string that was hashed
  createdAt: { type: Date, default: Date.now }
});

export const ESGRecord = mongoose.models.ESGRecord || mongoose.model('ESGRecord', ESGRecordSchema);
