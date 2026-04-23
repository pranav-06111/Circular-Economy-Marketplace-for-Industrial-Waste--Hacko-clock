import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function simpleTest() {
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    console.log("Calling Gemini Flash Latest...");
    const response = await genAI.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{ role: 'user', parts: [{ text: "Say hello" }] }]
    });
    console.log("Response:", response.text);
  } catch (error: any) {
    console.error("Error:", error.message);
    if (error.status) console.error("Status:", error.status);
  }
}

simpleTest();
