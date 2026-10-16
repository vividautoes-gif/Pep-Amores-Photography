import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  app.post("/api/translate", async (req, res) => {
    try {
      const { text, sourceLang, targetLang } = req.body;
      
      if (!text) {
        return res.json({ translatedText: "" });
      }

      // Check if API key is real and valid (not the placeholder)
      const hasValidApiKey = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith("MY_");

      if (hasValidApiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const prompt = `Translate the following text from ${sourceLang === 'auto' ? 'its original language' : sourceLang} to ${targetLang}. Only return the translated text without any quotes, markdown formatting, or additional commentary.\n\nText to translate:\n${text}`;
          
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          const translatedText = response.text?.trim() || "";
          return res.json({ translatedText, originalLang: sourceLang === 'auto' ? 'auto' : sourceLang });
        } catch (geminiError: any) {
          console.error("Gemini API error, falling back to Google Translate:", geminiError.message);
          // Fall through to Google Translate fallback below
        }
      }

      // Fallback to Google Translate unofficial API on the server side to avoid CORS
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error from Google Translate! status: ${response.status}`);
        }
        const data = await response.json();
        
        let translated = '';
        if (data && data[0]) {
          data[0].forEach((segment: any) => {
            if (segment[0]) translated += segment[0];
          });
        }
        return res.json({ translatedText: translated, originalLang: sourceLang === 'auto' ? 'auto' : sourceLang });
      } catch (gtError) {
        console.error("Google Translate error, falling back to MyMemory:", gtError);
        // Secondary fallback to MyMemory API
        const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang === 'auto' ? 'es' : sourceLang}|${targetLang}`;
        const myMemoryResponse = await fetch(myMemoryUrl);
        const myMemoryData = await myMemoryResponse.json();
        if (myMemoryData.responseData && myMemoryData.responseData.translatedText) {
          return res.json({ translatedText: myMemoryData.responseData.translatedText, originalLang: sourceLang === 'auto' ? 'auto' : sourceLang });
        }
        throw new Error("All translation services failed.");
      }
    } catch (error: any) {
      console.error("Translation API error:", error);
      res.status(500).json({ error: "Translation failed", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
