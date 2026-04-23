import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function analyzeWaste(photoBase64s: string[], formData: any) {
  if (!ai) return getDefaultAnalysis();

  try {
    const parts: any[] = [];
    if (photoBase64s && photoBase64s.length > 0) {
      for (const photo of photoBase64s) {
        if (photo.startsWith('data:')) {
          const mimeType = photo.split(';')[0].split(':')[1];
          const data = photo.split(',')[1];
          parts.push({ inlineData: { mimeType, data } });
        }
      }
    }
    
    parts.push({
      text: `Analyze this industrial waste. 
      Form Data provided by user: ${JSON.stringify(formData)}
      Reference the Hazardous Waste Rules 2016 Schedules, SWM Rules 2016, Plastic Waste Rules, BMW Rules 2016, Battery Rules 2022.
      Determine inferred composition, hazardous level (Low/Medium/High), key chemicals, and regulatory flags (applicable rules/schedules).`
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            inferredComposition: { type: Type.OBJECT, description: "Key-value pair of materials and estimated percentages" },
            hazardousLevel: { type: Type.STRING, description: "One of: Low, Medium, High" },
            keyChemicals: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidenceScore: { type: Type.NUMBER, description: "Confidence score 0.0 to 1.0" },
            regulatoryFlags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["inferredComposition", "hazardousLevel", "keyChemicals", "confidenceScore", "regulatoryFlags"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("analyzeWaste error:", error);
    return getDefaultAnalysis();
  }
}

function getDefaultAnalysis() {
  return {
    inferredComposition: { "Unknown": 100 },
    hazardousLevel: "Low",
    keyChemicals: [],
    confidenceScore: 0,
    regulatoryFlags: ["Manual verification required."]
  };
}

export async function getSmartMatches(wasteData: any, buyerProfiles: any[]) {
  if (!ai) return [];

  try {
    const prompt = `Find the top 5 smart matches for this waste listing against the array of buyer profiles.
    Waste Data: ${JSON.stringify(wasteData)}
    Buyer Profiles: ${JSON.stringify(buyerProfiles)}
    Evaluate purely on circular economy compatibility, location, and waste types accepted.
    CRITICAL: You must perform a regulatory compatibility check. Hazardous waste MUST ONLY be matched with buyers who indicate they have licenses or explicitly accept hazardous waste.
    Factor in wasteType compatibility with buyer industries heavily.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              wasteId: { type: Type.STRING, description: "ID of the waste listing being matched" },
              buyerId: { type: Type.STRING },
              buyerName: { type: Type.STRING },
              compatibilityScore: { type: Type.NUMBER, description: "1-100 score" },
              reason: { type: Type.STRING, description: "1-2 sentences explaining the match, reference regulatory compatibility if applicable." },
              suggestedUseCase: { type: Type.STRING },
              estimatedMonthlyVolume: { type: Type.STRING }
            },
            required: ["wasteId", "buyerId", "buyerName", "compatibilityScore", "reason", "suggestedUseCase", "estimatedMonthlyVolume"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("getSmartMatches error:", error);
    return [];
  }
}

export async function checkCompliance(wasteData: any) {
  if (!ai) return getDefaultCompliance();

  try {
    const prompt = `Check compliance for this waste data based on India's Hazardous Waste Rules 2016.
    Waste Data: ${JSON.stringify(wasteData)}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isHazardous: { type: Type.BOOLEAN },
            permitsRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
            transportRestrictions: { type: Type.STRING },
            esgImpact: { type: Type.STRING }
          },
          required: ["isHazardous", "permitsRequired", "transportRestrictions", "esgImpact"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("checkCompliance error:", error);
    return getDefaultCompliance();
  }
}

function getDefaultCompliance() {
  return {
    isHazardous: false,
    permitsRequired: ["Standard Transport Permit"],
    transportRestrictions: "Standard handling recommended.",
    esgImpact: "Neutral footprint impact calculated statically."
  };
}
