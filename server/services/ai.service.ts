import Groq from 'groq-sdk';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

/**
 * analyzeWastePhoto(photosBase64, processDescription)
 * Uses Gemini 1.5 Flash to analyze uploaded waste photos and the declared process.
 */
export async function analyzeWastePhoto(photosBase64: string[], processDescription: string) {
  if (!ai) return getDefaultAnalysis();

  try {
    const prompt = `You are an expert industrial waste auditor in India.
    Analyze the provided photos of the waste and the declared process description: "${processDescription}".
    
    Reference the "Hazardous and Other Wastes (Management and Transboundary Movement) Rules, 2016".
    Determine the likely chemical composition, pH, moisture content, flash point, physical form, and key contaminants.
    
    Return ONLY a JSON object with this EXACT structure (no markdown tags):
    {
      "composition": { "ChemicalA": 40, "ChemicalB": 60 },
      "physicalForm": "Solid" | "Liquid" | "Sludge" | "Baled" | "Loose",
      "pH": number (1-14, use 7 if neutral/solid),
      "moistureContent": number (0-100 percentage),
      "flashPoint": number (Celsius, use 999 if not flammable),
      "contaminants": ["contaminant1", "contaminant2"],
      "hazardousLevel": "Low" | "Medium" | "High",
      "confidence": number (0.0 to 1.0)
    }`;

    // Convert base64 strings to inlineData objects for Gemini
    const contents = photosBase64.map(base64 => {
      // Remove data URL prefix if present
      const cleanBase64 = base64.includes('base64,') ? base64.split('base64,')[1] : base64;
      return { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } };
    });

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [prompt, ...contents]
    });

    let text = response.text || "";
    // Clean markdown if present
    if (text.startsWith('\`\`\`json')) text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    if (text.startsWith('\`\`\`')) text = text.replace(/\`\`\`/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("analyzeWastePhoto error:", error);
    return getDefaultAnalysis();
  }
}

function getDefaultAnalysis() {
  return {
    composition: { "Unknown Polymer": 80, "Dirt": 20 },
    physicalForm: "Solid",
    pH: 7,
    moistureContent: 5,
    flashPoint: 999,
    contaminants: ["Dust"],
    hazardousLevel: "Low",
    confidence: 0.5
  };
}

export async function getSmartMatches(wasteData: any, buyerProfiles: any[]) {
  // Helper to generate fallback matches from real data without AI
  const generateFallback = (wastes: any[], buyers: any[]) => {
    const wasteArray = Array.isArray(wastes) ? wastes : [wastes];
    return wasteArray.slice(0, 5).map((w: any, i: number) => ({
      wasteId: w._id?.toString() || String(i),
      buyerId: buyers[0]?._id?.toString() || `buyer-${i}`,
      buyerName: buyers[0]?.companyName || 'Industrial Buyer',
      compatibilityScore: Math.max(70, 95 - (i * 5)),
      reason: `${w.wasteType || 'This material'} is a strong circular economy match based on industrial profile and location proximity.`,
      suggestedUseCase: `Co-processing or recycling of ${w.wasteType || 'material'} in manufacturing processes.`,
      estimatedMonthlyVolume: `${w.quantity || 10} ${w.unit || 'tonnes'}`
    }));
  };

  if (!groq) {
    console.warn('Groq API key missing — using fallback matches.');
    return generateFallback(wasteData, buyerProfiles);
  }

  try {
    const prompt = `You are the EcoMatch AI, a world-class circular economy engine. 
    Your task is to rank the top 5 matches for this buyer against the available waste listings.
    
    KNOWLEDGE BASE (50+ INDUSTRIES):
    Manufacturing (Automotive, Electronics, Textile, Furniture), Chemical (Petrochem, Pharma, Paints, Fertilizers), Construction (Cement, Bricks, Insulation), Energy (Biofuel, Waste-to-Energy), Agriculture (Compost, Animal Feed), Food Processing, Paper & Pulp, Glass & Ceramics, Rubber & Plastics, Mining, Metallurgy, etc.

    REGULATORY CONTEXT:
    Strictly adhere to India's "Hazardous and Other Wastes (Management and Transboundary Movement) Rules, 2016".
    
    Waste Listings: ${JSON.stringify(wasteData)}
    Buyer Profile: ${JSON.stringify(buyerProfiles)}
    
    Return ONLY a JSON array of top 5 matches:
    [{
      "wasteId": "string (MUST use the exact _id from the waste data)",
      "buyerId": "string (MUST use the exact _id from the buyer profile)",
      "compatibilityScore": 0-100,
      "reason": "1-2 sentences explaining compatibility based on industrial synergy",
      "suggestedUseCase": "Specific repurposing method (e.g., 'Feedstock for cement kilns')",
      "estimatedMonthlyVolume": "string",
      "carbonCreditPotential": "0.0 - 5.0 (credits per month based on diversion)",
      "regulatoryComplianceNote": "Note regarding HW Rules 2016"
    }]`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a circular economy matchmaking AI. Return only JSON arrays.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const text = chatCompletion.choices[0]?.message?.content || "";
    // Groq might return the array inside an object if response_format is json_object
    // Or it might return the array directly. Let's handle both.
    let parsed = JSON.parse(text);
    if (parsed.matches) parsed = parsed.matches;
    if (!Array.isArray(parsed)) {
       // Search for array in the object
       const keys = Object.keys(parsed);
       for (const k of keys) {
         if (Array.isArray(parsed[k])) {
           parsed = parsed[k];
           break;
         }
       }
    }

    if (!Array.isArray(parsed)) return generateFallback(wasteData, buyerProfiles);
    return parsed;
  } catch (error) {
    console.error("getSmartMatches error:", error);
    return generateFallback(wasteData, buyerProfiles);
  }
}

export async function checkRegulatoryCompliance(aiAnalysisData: any) {
  if (!groq) return getDefaultCompliance();

  try {
    const prompt = `You are a strict Environmental Regulatory AI in India.
    Check compliance for this waste under the "Hazardous and Other Wastes (Management and Transboundary Movement) Rules, 2016".
    
    Waste Analysis Data: ${JSON.stringify(aiAnalysisData)}
    
    Return ONLY a JSON object with this EXACT structure (no markdown tags):
    {
      "isHazardous": boolean,
      "badge": "Green" | "Yellow" | "Red",
      "regulatoryClass": "Schedule I" | "Schedule II" | "Non-Hazardous" | "Other",
      "permitsRequired": ["Form 13", "SPCB Authorization", "Form 10 Manifest", etc],
      "warnings": ["Specific warning message 1", "Warning 2"]
    }`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    let text = chatCompletion.choices[0]?.message?.content || "";
    // Clean markdown if present
    if (text.startsWith('\`\`\`json')) text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    if (text.startsWith('\`\`\`')) text = text.replace(/\`\`\`/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("checkRegulatoryCompliance error:", error);
    return getDefaultCompliance();
  }
}

function getDefaultCompliance() {
  return {
    isHazardous: false,
    badge: "Green",
    regulatoryClass: "Non-Hazardous",
    permitsRequired: ["Standard Transport Challan"],
    warnings: []
  };
}
