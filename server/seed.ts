import { User } from './models/User.js';
import { WasteListing } from './models/WasteListing.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const buyersData = [
  { name: 'Buyer 1', companyName: 'GreenPlast Recycling Mumbai', email: 'buyer1@greenplast.in', password: 'password123', location: 'Mumbai', industryType: 'Plastic', role: 'buyer', acceptedWasteTypes: ['HDPE', 'LDPE', 'PET'], phone: '+91 9876543210' },
  { name: 'Buyer 2', companyName: 'Tata Steel (Scrap Division)', email: 'scrap@tatasteel.com', password: 'password123', location: 'Jamshedpur', industryType: 'Metal', role: 'buyer', acceptedWasteTypes: ['Iron', 'Steel', 'Aluminium'], phone: '+91 9876543211' },
  { name: 'Buyer 3', companyName: 'EcoTex Panipat', email: 'procurement@ecotex.in', password: 'password123', location: 'Panipat', industryType: 'Textile', role: 'buyer', acceptedWasteTypes: ['Cotton Scrap', 'Polyester Yarns', 'Fabric Cutouts'], phone: '+91 9876543212' },
  { name: 'Buyer 4', companyName: 'ChemRecv Ankleshwar', email: 'solvents@chemrecv.com', password: 'password123', location: 'Ankleshwar', industryType: 'Chemical', role: 'buyer', acceptedWasteTypes: ['Spent Solvents', 'Acidic Waste', 'Used Oil'], phone: '+91 9876543213' },
  { name: 'Buyer 5', companyName: 'AgriFeed Bio', email: 'biowaste@agrifeed.in', password: 'password123', location: 'Pune', industryType: 'Food', role: 'buyer', acceptedWasteTypes: ['Organic Waste', 'Food Peels', 'Spent Grain'], phone: '+91 9876543214' },
  { name: 'Buyer 6', companyName: 'E-Waste Solutions Blr', email: 'recycle@ewasteblr.in', password: 'password123', location: 'Bengaluru', industryType: 'E-Waste', role: 'buyer', acceptedWasteTypes: ['PCBs', 'Batteries', 'Old Machinery'], phone: '+91 9876543215' },
  { name: 'Buyer 7', companyName: 'GlassWorks Firozabad', email: 'cullets@glassworks.in', password: 'password123', location: 'Firozabad', industryType: 'Glass', role: 'buyer', acceptedWasteTypes: ['Clear Glass', 'Colored Glass Cullets'], phone: '+91 9876543216' },
  { name: 'Buyer 8', companyName: 'PaperMills Vapi', email: 'fibers@papermills.com', password: 'password123', location: 'Vapi', industryType: 'Paper', role: 'buyer', acceptedWasteTypes: ['Cardboard', 'Office Paper', 'Pulp Waste'], phone: '+91 9876543217' },
  { name: 'Buyer 9', companyName: 'RubberRegen Chennai', email: 'tires@rubberregen.in', password: 'password123', location: 'Chennai', industryType: 'Rubber', role: 'buyer', acceptedWasteTypes: ['Used Tires', 'Vulcanized Rubber'], phone: '+91 9876543218' },
  { name: 'Buyer 10', companyName: 'LeatherBoard Kanpur', email: 'scraps@leatherboard.in', password: 'password123', location: 'Kanpur', industryType: 'Textile', role: 'buyer', acceptedWasteTypes: ['Leather Scraps', 'Trimmings'], phone: '+91 9876543219' },
  { name: 'Buyer 11', companyName: 'AluShred Delhi', email: 'cans@alushred.in', password: 'password123', location: 'Delhi', industryType: 'Metal', role: 'buyer', acceptedWasteTypes: ['Aluminium Cans', 'UBC', 'Foil'], phone: '+91 9876543220' },
  { name: 'Buyer 12', companyName: 'WoodPellets Hubli', email: 'sawdust@woodpellets.com', password: 'password123', location: 'Hubli', industryType: 'Wood', role: 'buyer', acceptedWasteTypes: ['Sawdust', 'Wood Chips', 'Pallets'], phone: '+91 9876543221' },
];

export const seedDatabase = async () => {
  try {
    const buyerCount = await User.countDocuments({ role: 'buyer' } as any);
    if (buyerCount === 0) {
      console.log('Seeding initial buyers array...');
      
      for (const buyerData of buyersData) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(buyerData.password, salt);
        
        await User.create({
            ...buyerData,
            password: hashedPassword
        });
      }
      console.log('Database explicitly seeded with 12 generic circular economy buyers.');
    } else {
        console.log(`Database already has ${buyerCount} buyers seeded.`);
    }

    // Seed sample listings
    const listingCount = await WasteListing.countDocuments();
    if (listingCount === 0) {
      console.log('Seeding sample waste listings...');
      
      // Get or create a seller
      let seller = await User.findOne({ role: 'seller' });
      if (!seller) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        seller = await User.create({
          name: 'Demo Seller',
          companyName: 'EcoWastes India',
          email: 'seller@ecowastes.in',
          password: hashedPassword,
          location: 'Pune',
          role: 'seller',
          industryType: 'Manufacturing',
          phone: '+91 9988776655'
        });
      }

      const sampleListings = [
        {
          seller: seller._id,
          wasteType: 'Plastic Waste',
          description: 'High-quality HDPE plastic scrap from manufacturing process.',
          quantity: 5,
          unit: 'tonnes',
          frequency: 'Monthly',
          location: 'Pune, Maharashtra',
          physicalForm: 'Baled',
          status: 'Active'
        },
        {
          seller: seller._id,
          wasteType: 'Metal Scrap',
          description: 'Mixed aluminium scrap including cans and foil.',
          quantity: 500,
          unit: 'kg',
          frequency: 'One-time',
          location: 'Mumbai, Maharashtra',
          physicalForm: 'Loose',
          status: 'Active'
        },
        {
          seller: seller._id,
          wasteType: 'Hazardous Chemical Waste',
          description: 'Spent solvents from industrial cleaning operations.',
          quantity: 200,
          unit: 'litres',
          frequency: 'Weekly',
          location: 'Ankleshwar, Gujarat',
          physicalForm: 'Liquid',
          isHazardous: true,
          status: 'Active'
        }
      ];

      await WasteListing.insertMany(sampleListings);
      console.log('✅ Sample waste listings seeded successfully.');
    }
  } catch (e) {
    console.error('Error seeding DB:', e);
  }
};
