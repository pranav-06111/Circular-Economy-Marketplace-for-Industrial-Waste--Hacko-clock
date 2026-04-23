import express, { Request, Response } from 'express';
import multer from 'multer';
import { Waste } from '../models/Waste.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { GoogleGenAI } from '@google/genai';
import CryptoJS from 'crypto-js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authenticate, upload.single('photo'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, quantity, category } = req.body;
    const userId = req.user!.userId;
    const file = req.file;

    let compositionReport = "Analysis skipped. No photo provided.";
    let logisticsEstimate = parseInt(quantity || 0) * 50; // Simple calc: $50 per ton
    let co2Savings = parseInt(quantity || 0) * 1.5; // Simple calc: 1.5 tons CO2 per ton of waste

    if (file) {
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const base64EncodeString = file.buffer.toString('base64');
          
          const prompt = `Analyze this industrial waste photo. Provide:
1. Expected composition (e.g., 80% plastic, 20% metal).
2. Regulatory checker against Hazardous Waste Rules 2016 (is it hazardous?).
Keep the response professional, concise, and formatted as a short summary.`;

          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
              parts: [
                { inlineData: { mimeType: file.mimetype, data: base64EncodeString } },
                { text: prompt }
              ]
            }
          });
          compositionReport = response.text || "AI analysis failed to generate text.";
        } catch (aiError) {
          console.error("AI Error:", aiError);
          compositionReport = "Failed to analyze photo with AI.";
        }
      } else {
        compositionReport = "GEMINI_API_KEY not set. AI analysis unavailable.";
      }
    }

    // Fake Blockchain ESG Anchoring
    const timestamp = Date.now().toString();
    const dataToHash = `${userId}-${title}-${quantity}-${timestamp}`;
    const blockchainHash = CryptoJS.SHA256(dataToHash).toString(CryptoJS.enc.Hex);

    const waste = new Waste({
      userId,
      title,
      description,
      quantity,
      category,
      compositionReport,
      logisticsEstimate,
      co2Savings,
      blockchainHash,
    });

    await waste.save();

    res.status(201).json({ waste });
  } catch (error) {
    console.error('Waste creation error:', error);
    res.status(500).json({ error: 'Failed to offload waste' });
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const wastes = await Waste.find().populate('userId', 'companyName location industryType').sort({ createdAt: -1 });
    res.status(200).json({ wastes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch waste listings' });
  }
});

router.get('/my', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const wastes = await Waste.find({ userId: req.user!.userId } as any).sort({ createdAt: -1 });
      res.status(200).json({ wastes });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user listings' });
    }
});

export const wasteRoutes = router;
