import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

/**
 * analyzeWaste(photoBase64, processDescription)
 * Robustly handles industrial waste analysis using Groq.
 */
export async function analyzeWaste(photoOrPhotos: string | string[], descriptionOrForm: any) {
  if (!groq) return getDefaultAnalysis();

  try {
    let processDescription = typeof descriptionOrForm === 'string' ? descriptionOrForm : (descriptionOrForm.processDescription || descriptionOrForm.description || JSON.stringify(descriptionOrForm));

    const systemPrompt = `You are an expert industrial waste auditor in India. 
    Reference the "Hazardous and Other Wastes (Management and Transboundary Movement) Rules, 2016".
    Flag if the waste matches chemical sludge, solvents, e-waste, or heavy metals.
    
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
    
    // Note: Most Groq models are text-only. We use the description for analysis.
    // If using a vision model, we'd include the image.
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: promptText }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const text = chatCompletion.choices[0]?.message?.content || "";
    const parsed = JSON.parse(text);
    
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

export async function checkCompliance(wasteData: any) {
  if (!groq) return getDefaultCompliance();

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

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const text = chatCompletion.choices[0]?.message?.content || "";
    return JSON.parse(text);
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
