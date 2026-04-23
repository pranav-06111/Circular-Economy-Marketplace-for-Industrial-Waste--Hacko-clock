import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String }, // Individual user name
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, required: true }, // city
  industryType: { 
    type: String, 
    required: true,
  },
  phone: { type: String, required: true },
  role: { type: String, enum: ['seller', 'buyer', 'both'], default: 'seller' },
  acceptedWasteTypes: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
