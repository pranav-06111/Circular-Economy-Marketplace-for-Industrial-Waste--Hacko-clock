import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenAI({ apiKey });

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{ role: 'user', parts: [{ text: "Hello" }] }]
    });
    console.log("Success:", response.text);
  } catch (e) {
    console.error('Gemini test failed:', e.message);
    process.exit(1);
  }
}

testGemini();
