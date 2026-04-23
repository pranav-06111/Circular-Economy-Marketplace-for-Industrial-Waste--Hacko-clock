import express, { Request, Response } from 'express';
import multer from 'multer';
import { WasteListing } from '../models/WasteListing.js';
import { ESGRecord } from '../models/ESGRecord.js';
import { User } from '../models/User.js';
import { authenticate, authorizeRole, AuthRequest } from '../middleware/auth.js';
import { analyzeWaste, getSmartMatches, checkCompliance } from '../services/ai.service.js';
import { calculateImpact } from '../services/logistics.service.js';
import CryptoJS from 'crypto-js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authenticate, authorizeRole(['seller']), upload.array('photos', 5), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      wasteType, description, quantity, unit, frequency, location, 
      processDescription, sourceIndustry, physicalForm, moistureContent, pH, flashPoint
    } = req.body;
    let contaminants: string[] = [];
    if (req.body.contaminants) {
      contaminants = Array.isArray(req.body.contaminants) ? req.body.contaminants : JSON.parse(req.body.contaminants || '[]');
    }

    let composition: any = {};
    if (req.body.composition) {
      try { composition = JSON.parse(req.body.composition); } catch(e) {}
    }

    const sellerId = req.user!.userId;
    const files = req.files as Express.Multer.File[];

    const seller = await (User as any).findById(sellerId);
    let photoBase64s: string[] = [];
    
    if (files && files.length > 0) {
       for (const file of files) {
         photoBase64s.push(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
       }
    }

    // AI Analysis
    const formData = {
      wasteType, description, quantity, unit, frequency, location, 
      processDescription, sourceIndustry, physicalForm, contaminants, moistureContent, pH, flashPoint, composition
    };
    
    const aiAnalysis = await analyzeWaste(photoBase64s, formData);
    const complianceInfo = await checkCompliance({ ...formData, aiAnalysis });
    
    const compositionReport = `AI Composition: ${JSON.stringify(aiAnalysis.inferredComposition)}. Hazardous Level: ${aiAnalysis.hazardousLevel}. Notes: ${aiAnalysis.regulatoryFlags.join(', ')} | Compliance: ${complianceInfo.isHazardous ? 'Hazardous' : 'Non-Hazardous'}. Permits: ${complianceInfo.permitsRequired.join(', ')}`;

    // Logistics & CO2
    const qtyTons = unit === 'kg' ? Number(quantity) / 1000 : Number(quantity);
    const impact = calculateImpact(seller?.location || "mumbai", location || "delhi", qtyTons, wasteType);

    const logisticsEstimate = impact.transportCostINR;
    const co2Savings = impact.co2KgSaved / 1000; // Store in tons generally

    const listing = new WasteListing({
      seller: sellerId,
      wasteType,
      description,
      photos: photoBase64s,
      quantity,
      unit,
      frequency,
      location,
      processDescription,
      sourceIndustry,
      physicalForm,
      contaminants,
      moistureContent,
      pH,
      flashPoint,
      composition,
      
      // Regulatory mappings
      isHazardous: complianceInfo.isHazardous,
      requiredPermits: complianceInfo.permitsRequired,
      complianceNotes: complianceInfo.transportRestrictions,
      aiAnalysis,

      // App legacy
      compositionReport,
      logisticsEstimate,
      co2Savings,
    });

    await listing.save();

    // Fake Blockchain ESG Anchoring (Demo)
    const timestamp = new Date().toISOString();
    const dataToHash = `${listing._id}-${sellerId}-${wasteType}-${quantity}-${co2Savings}-${timestamp}`;
    const hash = CryptoJS.SHA256(dataToHash).toString(CryptoJS.enc.Hex);

    const esgRecord = new ESGRecord({
      listing: listing._id,
      hash,
      timestamp,
      co2Saved: co2Savings,
      dataHash: dataToHash
    });
    await esgRecord.save();

    res.status(201).json({ listing, esgRecord });
  } catch (error) {
    console.error('Listing creation error:', error);
    res.status(500).json({ error: 'Failed to create waste listing' });
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.query.wasteType) query.wasteType = req.query.wasteType;
    if (req.query.location) query.location = new RegExp(req.query.location as string, 'i');
    if (req.query.minQuantity) query.quantity = { $gte: Number(req.query.minQuantity) };

    const listings = await WasteListing.find(query)
      .populate('seller', 'companyName location industryType phone')
      .sort({ createdAt: -1 });

    // for demo: also fetch ESG records and map them to listings
    const esgRecords = await ESGRecord.find();
    const esgMap = new Map();
    esgRecords.forEach(record => esgMap.set(record.listing.toString(), record.hash));

    const enrichedListings = listings.map(l => {
        const obj = l.toObject();
        obj.blockchainHash = esgMap.get(l._id.toString());
        return obj;
    });

    res.status(200).json({ listings: enrichedListings });
  } catch (error) {
    console.error('Listings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch waste listings' });
  }
});

router.get('/my', authenticate, authorizeRole(['seller']), async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const listings = await WasteListing.find({ seller: req.user!.userId } as any).sort({ createdAt: -1 });
      
      const esgRecords = await ESGRecord.find({ listing: { $in: listings.map(l => l._id) } } as any);
      const esgMap = new Map();
      esgRecords.forEach(record => esgMap.set(record.listing.toString(), record.hash));
  
      const enrichedListings = listings.map(l => {
          const obj = l.toObject();
          obj.blockchainHash = esgMap.get(l._id.toString());
          return obj;
      });

      res.status(200).json({ listings: enrichedListings });
    } catch (error) {
      console.error('My Listings fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch user listings' });
    }
});

router.get('/buyer/matches', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const buyerId = req.user!.userId;
      const buyer = await (User as any).findById(buyerId).select('companyName location industryType acceptedWasteTypes');
      
      const listings = await (WasteListing as any).find({ status: 'Available' }).populate('seller', 'companyName location');
      
      const matches = await getSmartMatches(listings.map((l: any) => l.toObject()), [buyer?.toObject()]);
      
      const enrichedMatches = matches.map((m: any) => {
         const listing = listings.find((l: any) => l._id.toString() === m.wasteId);
         if (listing) {
            return {
               ...m,
               wasteType: listing.wasteType,
               isHazardous: listing.isHazardous,
               hazardousLevel: listing.aiAnalysis?.hazardousLevel || 'Low',
               requiredPermits: listing.requiredPermits || [],
               co2Savings: listing.co2Savings,
               logisticsEstimate: listing.logisticsEstimate,
               photos: listing.photos || [],
               location: listing.location
            };
         }
         return m;
      });

      res.status(200).json({ matches: enrichedMatches });
    } catch (error) {
      console.error('Buyer matches fetch error:', error);
      res.status(500).json({ error: 'Failed to generate matches' });
    }
});

router.get('/:id/matches', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const listing = await (WasteListing as any).findById(req.params.id).populate('seller', 'companyName location');
      if (!listing) {
        res.status(404).json({ error: 'Listing not found' });
        return;
      }
      
      const buyers = await (User as any).find({ role: { $in: ['buyer', 'both'] } }).select('companyName location industryType acceptedWasteTypes');
      
      const matches = await getSmartMatches(listing.toObject(), buyers.map(b => b.toObject()));
      
      res.status(200).json({ matches });
    } catch (error) {
      console.error('Matches fetch error:', error);
      res.status(500).json({ error: 'Failed to generate matches' });
    }
});

export const listingRoutes = router;
