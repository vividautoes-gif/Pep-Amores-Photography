// Free translation service using Google Translate's unofficial API or Gemini via backend

export const translateText = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
  if (!text) return '';
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, sourceLang, targetLang })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.translatedText || '';
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Error en el servicio de traducción.");
  }
};

export const translateMetadata = async (text: string, targetLangs: string[]) => {
  if (!text || targetLangs.length === 0) return {};

  console.log(`Translating metadata: "${text}" to ${targetLangs.join(', ')}`);

  try {
    const result: Record<string, string> = {};
    // We assume the source language is Spanish ('es') for metadata in the backoffice
    for (const lang of targetLangs) {
      result[lang] = await translateText(text, 'es', lang);
    }
    
    console.log("Translation result:", result);
    return result;
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};

export const translateReview = async (text: string, targetLang: string) => {
  if (!text || !targetLang) return null;

  console.log(`Translating review: "${text}" to ${targetLang}`);

  try {
    // For reviews, we let Google auto-detect the source language by using 'auto'
    const translatedText = await translateText(text, 'auto', targetLang);
    
    // The unofficial API doesn't reliably return the detected source language in a simple format,
    // so we'll just return 'auto' as the originalLang for simplicity, or try to extract it if possible.
    // For now, we'll just return 'auto'.
    const result = {
      originalLang: 'auto', 
      translatedText
    };
    
    console.log("Review translation result:", result);
    return result;
  } catch (error) {
    console.error("Review translation error:", error);
    throw error;
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
    const result: Record<string, Record<string, string>> = {};
    
    for (const lang of targetLangs) {
      result[lang] = {};
      for (const key of keysToTranslate) {
        // Assume source is Spanish ('es')
        result[lang][key] = await translateText(dataToTranslate[key], 'es', lang);
      }
    }

    console.log("Object translation result:", result);
    return result;
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};

