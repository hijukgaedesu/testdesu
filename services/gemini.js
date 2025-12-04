
import { GoogleGenAI, Type } from "@google/genai";
import { getAISettings } from "./storage.js";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeDiaryEntry = async (text, mood) => {
  const client = getClient();
  if (!client) return { reply: "API Key is missing.", tags: [] };

  const aiConfig = getAISettings();

  try {
    const prompt = `
      ${aiConfig.persona}
      
      User's Diary Entry (Mood: ${mood}):
      "${text}"
      
      Task:
      1. Write a reply (mention) to this entry based on your persona.
      2. Generate 3 relevant hashtags.

      Response Format: JSON
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["reply", "tags"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      reply: "The AI companion is currently unavailable. Your day matters!",
      tags: ["#diary", "#life", "#error"]
    };
  }
};
