import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
  console.warn("GEMINI_API_KEY is missing. Translations will not work.");
}
const ai = new GoogleGenAI({ apiKey });

export const translateMetadata = async (text: string, targetLangs: string[]) => {
  if (!text || targetLangs.length === 0) return {};

  console.log(`Translating metadata: "${text}" to ${targetLangs.join(', ')}`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following photography metadata text to these languages: ${targetLangs.join(', ')}. 
      The input text is: "${text}"
      
      IMPORTANT: 
      1. Return ONLY a valid JSON object.
      2. Use the language codes (${targetLangs.join(', ')}) as keys.
      3. Provide the translation for EVERY key, even if the input is already in that language.
      4. If the text is a proper noun that doesn't change, keep it as is for that language.`,
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

    const result = JSON.parse(response.text || '{}');
    console.log("Translation result:", result);
    return result;
  } catch (error) {
    console.error("Translation error:", error);
    return {};
  }
};

export const translateObject = async (data: Record<string, string>, targetLangs: string[]) => {
  const keysToTranslate = Object.keys(data).filter(k => data[k] && data[k].trim() !== '');
  if (keysToTranslate.length === 0 || targetLangs.length === 0) return {};

  console.log("Translating object:", data, "to", targetLangs);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the values of the following JSON object to these languages: ${targetLangs.join(', ')}.
      
      JSON to translate:
      ${JSON.stringify(data, null, 2)}
      
      IMPORTANT:
      1. Return ONLY a valid JSON object.
      2. The top-level keys MUST be the language codes: ${targetLangs.join(', ')}.
      3. Each language key must contain an object with the same keys as the input, but with translated values.
      4. Provide translations for ALL languages and ALL keys.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: targetLangs.reduce((acc: any, lang) => {
            acc[lang] = {
              type: Type.OBJECT,
              properties: keysToTranslate.reduce((propAcc: any, key) => {
                propAcc[key] = { type: Type.STRING };
                return propAcc;
              }, {})
            };
            return acc;
          }, {})
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    console.log("Object translation result:", result);
    return result;
  } catch (error) {
    console.error("Translation error:", error);
    return {};
  }
};
