import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String }, // Individual user name
  companyName: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google OAuth users
  location: { type: String, default: '' }, // city
  industryType: { 
    type: String, 
    default: 'Manufacturing',
  },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['seller', 'buyer', 'both'], default: 'seller' },
  acceptedWasteTypes: [{ type: String }],
  googleId: { type: String }, // Google OAuth sub
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  avatar: { type: String }, // Google profile picture
  
  // Extended profile fields
  bio: { type: String, default: '' },
  companySize: { type: String, enum: ['', 'Small (1-50)', 'Medium (51-200)', 'Large (200+)'], default: '' },
  gstNumber: { type: String, default: '' },
  address: { type: String, default: '' },
  website: { type: String, default: '' },
  wasteTypesGenerated: [{ type: String }], // For sellers: what waste they produce
  preferredSupplyRadius: { type: String, default: '' }, // For buyers
  profileCompleted: { type: Boolean, default: false }, // Onboarding flag

  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
