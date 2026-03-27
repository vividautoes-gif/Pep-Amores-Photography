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

export const translateReview = async (text: string, targetLang: string) => {
  if (!text || !targetLang) return null;

  console.log(`Translating review: "${text}" to ${targetLang}`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following review text to the language code: ${targetLang}. 
      The input text is: "${text}"
      
      IMPORTANT: 
      1. Return ONLY a valid JSON object.
      2. Identify the original language of the input text and return its language code (e.g., 'es', 'en', 'ca', 'fr', 'zh', etc.) in the 'originalLang' field.
      3. Return the translated text in the 'translatedText' field.
      4. If the original language is the same as the target language, 'translatedText' should be the same as the input text.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalLang: { type: Type.STRING },
            translatedText: { type: Type.STRING }
          },
          required: ["originalLang", "translatedText"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    console.log("Review translation result:", result);
    return result as { originalLang: string, translatedText: string };
  } catch (error) {
    console.error("Review translation error:", error);
    return null;
  }
};

export const translateObject = async (data: Record<string, string>, targetLangs: string[]) => {
  const dataToTranslate: Record<string, string> = {};
  for (const key of Object.keys(data)) {
    if (data[key] && data[key].trim() !== '') {
      dataToTranslate[key] = data[key];
    }
  }
  
  const keysToTranslate = Object.keys(dataToTranslate);
  if (keysToTranslate.length === 0 || targetLangs.length === 0) return {};

  console.log("Translating object:", dataToTranslate, "to", targetLangs);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the values of the following JSON object to these languages: ${targetLangs.join(', ')}.
      
      JSON to translate:
      ${JSON.stringify(dataToTranslate, null, 2)}
      
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
