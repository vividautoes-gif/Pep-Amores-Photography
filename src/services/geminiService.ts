import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const translateMetadata = async (text: string, targetLangs: string[]) => {
  if (!text || targetLangs.length === 0) return {};

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following photography metadata text to ${targetLangs.join(' and ')}. 
      Return ONLY a JSON object with the language codes as keys.
      Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: targetLangs.reduce((acc: any, lang) => {
            acc[lang] = { type: Type.STRING };
            return acc;
          }, {})
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Translation error:", error);
    return {};
  }
};
