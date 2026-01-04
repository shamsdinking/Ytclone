
import { GoogleGenAI, Type } from "@google/genai";

// Standardizing SDK initialization per latest guidelines.
// Always use new GoogleGenAI({ apiKey: process.env.API_KEY }) right before making an API call.

export const generateVideoMetadata = async (topic: string, isReel: boolean = false) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const formatLabel = isReel ? "Short-form Reel/Short (under 60s)" : "Standard YouTube Video";
    const prompt = `Generate a catchy ${formatLabel} title, a detailed SEO description, and a list of 10-15 highly relevant SEO tags for a video about: ${topic}. Focus on trending keywords that increase discoverability. ${isReel ? "For Reels, prioritize high-energy, vertical-friendly language and viral hooks." : ""}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of highly relevant SEO tags/keywords"
            }
          },
          required: ["title", "description", "tags"]
        }
      }
    });
    // response.text is a property, not a method. Trimming is good practice for JSON responses.
    const text = response.text || '';
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Gemini Metadata Error:", error);
    return null;
  }
};

export const generateThumbnail = async (prompt: string, aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "16:9") => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `High quality ${aspectRatio === '9:16' ? 'vertical portrait' : 'horizontal cinematic'} video thumbnail for: ${prompt}. Cinematic lighting, vibrant colors, 4k, professional photography style.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    });

    // Iterate through all candidates and parts to find the inlineData image part.
    const candidates = response.candidates || [];
    for (const candidate of candidates) {
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Error:", error);
    return null;
  }
};
