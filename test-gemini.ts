import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following photography metadata text to en and ca. 
      Return ONLY a JSON object with the language codes as keys.
      Text: "París"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            en: { type: Type.STRING },
            ca: { type: Type.STRING }
          }
        }
      }
    });
    console.log("Response:", response.text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
