import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

/**
 * analyzeWaste(photoBase64, processDescription)
 * Robustly handles industrial waste analysis with regulatory context.
 */
export async function analyzeWaste(photoOrPhotos: string | string[], descriptionOrForm: any) {
  if (!genAI) return getDefaultAnalysis();

  try {
    let photoBase64 = Array.isArray(photoOrPhotos) ? photoOrPhotos[0] : photoOrPhotos;
    let processDescription = typeof descriptionOrForm === 'string' ? descriptionOrForm : (descriptionOrForm.processDescription || descriptionOrForm.description || JSON.stringify(descriptionOrForm));

    const systemPrompt = `You are an expert industrial waste auditor in India. 
    Reference the "Hazardous and Other Wastes (Management and Transboundary Movement) Rules, 2016".
    Flag if the waste matches chemical sludge, solvents, e-waste, or heavy metals.
    Analyze the provided image and description.
    
    Return ONLY a JSON object with this structure:
    {
      "inferredComposition": "Description of materials",
      "hazardousLevel": "Low" | "Medium" | "High",
      "keyChemicals": ["chemical1", "chemical2"],
      "confidence": 0.0 to 1.0,
      "regulatoryNotes": "Detailed notes referencing specific schedules/rules",
      "regulatoryFlags": ["Rule 1", "Rule 2"] 
    }`;

    const promptText = `Description: ${processDescription} \nFull Data: ${typeof descriptionOrForm === 'object' ? JSON.stringify(descriptionOrForm) : ''}`;
    
    const parts: any[] = [{ text: systemPrompt + "\n\n" + promptText }];

    if (photoBase64 && photoBase64.startsWith('data:')) {
      const mimeType = photoBase64.split(';')[0].split(':')[1];
      const data = photoBase64.split(',')[1];
      parts.push({
        inlineData: {
          mimeType,
          data
        }
      });
    }

    const response = await genAI.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{ role: 'user', parts }]
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return getDefaultAnalysis();
    
    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.regulatoryFlags && parsed.regulatoryNotes) {
      parsed.regulatoryFlags = [parsed.regulatoryNotes];
    }
    return parsed;
  } catch (error) {
    console.error("analyzeWaste error:", error);
    return getDefaultAnalysis();
  }
}

function getDefaultAnalysis() {
  return {
    inferredComposition: "Unknown industrial byproduct",
    hazardousLevel: "Medium",
    keyChemicals: [],
    confidence: 0,
    regulatoryNotes: "Manual audit recommended under HW Rules 2016.",
    regulatoryFlags: ["Manual verification required."]
  };
}

export async function getSmartMatches(wasteData: any, buyerProfiles: any[]) {
  if (!genAI) return [];

  try {
    const prompt = `Rank the top 5 matches for this waste against the buyer profiles.
    Waste: ${JSON.stringify(wasteData)}
    Buyers: ${JSON.stringify(buyerProfiles)}
    
    Return ONLY a JSON array of top 5 matches:
    [{
      "wasteId": "string",
      "buyerId": "string",
      "compatibilityScore": 0-100,
      "reason": "1-2 sentences explaining compatibility",
      "suggestedUseCase": "How they will use it",
      "estimatedMonthlyVolume": "string"
    }]`;

    const response = await genAI.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (error) {
    console.error("getSmartMatches error:", error);
    return [];
  }
}

export async function checkCompliance(wasteData: any) {
  if (!genAI) return getDefaultCompliance();

  try {
    const prompt = `Check compliance for this waste under Indian environmental laws (CPCB/SPCB).
    Waste Data: ${JSON.stringify(wasteData)}
    
    Return ONLY a JSON object:
    {
      "isHazardous": boolean,
      "permitsRequired": ["string"],
      "transportRestrictions": "string",
      "esgImpact": "string"
    }`;

    const response = await genAI.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : getDefaultCompliance();
  } catch (error) {
    console.error("checkCompliance error:", error);
    return getDefaultCompliance();
  }
}

function getDefaultCompliance() {
  return {
    isHazardous: false,
    permitsRequired: ["Form 3 (HW Rules 2016)"],
    transportRestrictions: "Manifest system (Form 10) required if hazardous.",
    esgImpact: "Potential reduction in virgin resource extraction."
  };
}
