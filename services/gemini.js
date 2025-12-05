
import { GoogleGenAI, Type } from "@google/genai";
import { getAISettings } from "./storage.js";

const API_ENDPOINT = 'https://testdesu-beryl.vercel.app/api/generate';

const getClient = () => {
  // Ensure we can access the API key safely
  const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : '';
  if (!apiKey) {
    console.warn("API Key not found for fallback");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Helper function to extract text from various response formats
const extractTextFromResponse = (data) => {
  if (typeof data === 'string') return data;
  if (data.text) return data.text;
  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }
  return JSON.stringify(data);
};

export const analyzeDiaryEntry = async (text, aiConfig) => {
  // 1. Prepare Persona
  const persona = aiConfig?.persona || "You are a helpful AI.";
  
  // 2. Prepare Prompt
  const prompt = `
    ${persona}
    
    User's Diary Entry:
    "${text}"
    
    Task:
    1. Write a reply (mention) to this entry based on your persona.
    
    Response Format:
    Return ONLY a valid JSON object with the following structure:
    {
      "reply": "Your reply here"
    }
    Do not include markdown formatting.
  `;

  // 3. Try Backend First
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt })
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    let jsonText = extractTextFromResponse(data);
    jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    return JSON.parse(jsonText);

  } catch (error) {
    console.warn("Backend analysis failed, attempting fallback to SDK:", error);
    
    // 4. Fallback to SDK
    const client = getClient();
    if (!client) {
      return { reply: "AI connect failed and no API key available." };
    }

    try {
      const result = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(result.text);
    } catch (sdkError) {
      console.error("SDK Fallback failed:", sdkError);
      return { reply: "Unable to generate a response at this time." };
    }
  }
};

export const getChatResponse = async (history, aiConfig) => {
  const persona = aiConfig?.persona || "You are a helpful AI.";
  
  // Construct prompt
  let prompt = `${persona}\n\n`;
  history.forEach(msg => {
    const role = msg.sender === 'user' ? 'User' : 'Model';
    prompt += `${role}: ${msg.text}\n`;
  });
  prompt += `Model: `;

  // Try Backend
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt })
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    let resultText = extractTextFromResponse(data);
    
    // Cleanup potential JSON wrapping
    if (resultText.trim().startsWith('{') && resultText.trim().endsWith('}')) {
        try {
            const parsed = JSON.parse(resultText);
            if (parsed.text) return parsed.text;
            if (parsed.reply) return parsed.reply;
        } catch (e) { /* ignore */ }
    }
    return resultText;

  } catch (error) {
    console.warn("Backend chat failed, attempting fallback to SDK:", error);

    // Fallback to SDK
    const client = getClient();
    if (!client) return "Connection failed.";

    try {
      // Re-construct history for SDK format (Content objects)
      // Note: SDK works best with array of Content objects, but strictly `generateContent` takes `contents`.
      // We'll just pass the string prompt we already built for simplicity in this fallback.
      const result = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return result.text;
    } catch (sdkError) {
      console.error("SDK Fallback failed:", sdkError);
      return "I'm having trouble responding right now.";
    }
  }
};
