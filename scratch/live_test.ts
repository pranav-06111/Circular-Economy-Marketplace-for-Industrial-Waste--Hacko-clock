import { analyzeWaste, checkCompliance } from '../server/services/ai.service.js';
import dotenv from 'dotenv';
dotenv.config();

async function runLiveTest() {
  console.log("🚀 Running Live Gemini 1.5 Flash Test...\n");

  const mockWaste = {
    wasteType: "chemical sludge",
    processDescription: "Spent solvent and heavy metal sludge from an electroplating unit in Ahmedabad.",
  };

  try {
    console.log("📡 Calling Gemini for Analysis...");
    const analysis = await analyzeWaste("", mockWaste);
    console.log("📦 AI Analysis Result:");
    console.log(JSON.stringify(analysis, null, 2));

    console.log("\n📡 Calling Gemini for Compliance Check...");
    const compliance = await checkCompliance({ ...mockWaste, aiAnalysis: analysis });
    console.log("⚖️ Compliance Result:");
    console.log(JSON.stringify(compliance, null, 2));

  } catch (error) {
    console.error("❌ Test Failed:", error);
  }
}

runLiveTest();
