
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

// Modified to accept a specific AI configuration
export const analyzeDiaryEntry = async (text, aiConfig) => {
  const client = getClient();
  if (!client) return { reply: "API Key is missing." };

  // Fallback if no config passed
  const persona = aiConfig?.persona || "You are a helpful AI.";

  try {
    const prompt = `
      ${persona}
      
      User's Diary Entry:
      "${text}"
      
      Task:
      1. Write a reply (mention) to this entry based on your persona.
      
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
            reply: { type: Type.STRING }
          },
          required: ["reply"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      reply: "The AI companion is currently unavailable. Your day matters!"
    };
  }
};

export const getChatResponse = async (history, aiConfig) => {
  const client = getClient();
  if (!client) return "API Key is missing or invalid.";

  try {
    // Filter history for current chat session logic (simplified here)
    const previousHistory = history.slice(0, -1).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const lastMessage = history[history.length - 1].text;

    const chat = client.chats.create({
      model: 'gemini-2.5-flash',
      history: previousHistory,
      config: {
        systemInstruction: aiConfig.persona,
      },
    });

    // Updated: sendMessage takes an object with message property
    const result = await chat.sendMessage({ message: lastMessage });
    return result.text;
  } catch (error) {
    console.error("Gemini chat failed:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
};
