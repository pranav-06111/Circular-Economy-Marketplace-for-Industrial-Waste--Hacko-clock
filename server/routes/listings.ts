import express, { Request, Response } from 'express';
import multer from 'multer';
import { WasteListing } from '../models/WasteListing.js';
import { ESGRecord } from '../models/ESGRecord.js';
import { Match } from '../models/Match.js';
import { User } from '../models/User.js';
import { authenticate, authorizeRole, AuthRequest } from '../middleware/auth.js';
import { analyzeWastePhoto, getSmartMatches, checkRegulatoryCompliance } from '../services/ai.service.js';
import { calculateImpact } from '../services/logistics.service.js';
import CryptoJS from 'crypto-js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// --- New AI Photo Analysis Endpoint ---
router.post('/analyze-photo', authenticate, authorizeRole(['seller']), upload.array('photos', 5), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { processDescription } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'Please upload at least one photo.' });
      return;
    }

    // Convert to base64
    const photoBase64s = files.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`);

    // Call Gemini for Photo Analysis
    const aiAnalysis = await analyzeWastePhoto(photoBase64s, processDescription || "Unknown industrial process.");
    
    // Check Compliance against rules
    const complianceInfo = await checkRegulatoryCompliance(aiAnalysis);

    res.status(200).json({ success: true, aiAnalysis, complianceInfo });
  } catch (error: any) {
    console.error('Error analyzing photo:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze photo.' });
  }
});

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

    // AI Analysis (fallback if they didn't use the pre-analysis button)
    let aiAnalysis = req.body.aiAnalysis ? JSON.parse(req.body.aiAnalysis) : null;
    let complianceInfo = req.body.complianceInfo ? JSON.parse(req.body.complianceInfo) : null;

    if (!aiAnalysis) {
      aiAnalysis = await analyzeWastePhoto(photoBase64s, processDescription || description);
      complianceInfo = await checkRegulatoryCompliance(aiAnalysis);
    }
    
    const compositionReport = `AI Composition: ${JSON.stringify(aiAnalysis.composition || aiAnalysis.inferredComposition)}. Hazardous Level: ${aiAnalysis.hazardousLevel}. | Compliance: ${complianceInfo.badge}. Permits: ${complianceInfo.permitsRequired.join(', ')}`;

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
      complianceNotes: complianceInfo.warnings ? complianceInfo.warnings.join(' | ') : '',
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
    console.log('>>> Hit /api/listings/buyer/matches route handler');
    try {
      const buyerId = req.user!.userId;
      const buyer = await (User as any).findById(buyerId).select('companyName location industryType acceptedWasteTypes');
      
      const listings = await (WasteListing as any).find({ 
        status: { $in: ['Available', 'Active'] } 
      }).populate('seller', 'companyName location');

      if (!listings || listings.length === 0) {
        res.status(200).json({ matches: [] });
        return;
      }
      
      console.log(`Buyer Match Request - Buyer ID: ${buyerId}, Listings Found: ${listings.length}`);
      
      // Strip photos to avoid token limit issues with Gemini
      const listingsForAi = listings.map((l: any) => {
         const obj = l.toObject();
         delete obj.photos;
         return obj;
      });

      const matches = await getSmartMatches(listingsForAi, [buyer?.toObject()]);
      console.log(`AI Matching complete - Matches returned: ${matches.length}`);
      
      const enrichedMatches = matches.map((m: any) => {
         const listing = listings.find((l: any) => l._id.toString() === m.wasteId);
         if (!listing) console.warn(`Match returned wasteId ${m.wasteId} not found in current listings`);
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
               location: listing.location,
               sellerName: listing.seller?.companyName,
               sellerLocation: listing.seller?.location,
               carbonCreditPotential: m.carbonCreditPotential,
               regulatoryComplianceNote: m.regulatoryComplianceNote
            };
         }
         return m;
      });

      res.status(200).json({ matches: enrichedMatches });
    } catch (error: any) {
      console.error('Buyer matches fetch error - Full Stack:', error);
      res.status(500).json({ error: 'Failed to generate matches', details: error.message });
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
      
      const listingForAi = listing.toObject();
      delete listingForAi.photos;
      
      const matches = await getSmartMatches(listingForAi, buyers.map(b => b.toObject()));
      
      res.status(200).json({ matches });
    } catch (error) {
      console.error('Matches fetch error:', error);
      res.status(500).json({ error: 'Failed to generate matches' });
    }
});

router.post('/:id/complete-match', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { buyerId, matchScore, reason, suggestedUseCase } = req.body;
      const listing = await (WasteListing as any).findById(req.params.id);
      
      if (!listing) {
        res.status(404).json({ error: 'Listing not found' });
        return;
      }

      // 1. Create Match Record
      const match = new Match({
        listing: listing._id,
        buyer: buyerId,
        matchScore,
        reason,
        suggestedUseCase,
        status: 'Accepted'
      });

      // 2. Generate Blockchain Anchor (Demo)
      const timestamp = new Date().toISOString();
      const dataToHash = `${match._id}-${timestamp}-${listing._id}`;
      const hash = CryptoJS.SHA256(dataToHash).toString(CryptoJS.enc.Hex);
      match.blockchainHash = hash;

      await match.save();

      // 3. Update Listing Status
      listing.status = 'Matched';
      await listing.save();

      res.status(200).json({ success: true, match });
    } catch (error) {
      console.error('Complete match error:', error);
      res.status(500).json({ error: 'Failed to complete match' });
    }
});

export const listingRoutes = router;
