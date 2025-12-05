
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

export const analyzeDiaryEntry = async (text, aiConfig) => {
  const ai = getClient();
  if (!ai) return { reply: "API Key가 설정되지 않았습니다." };

  const persona = aiConfig?.persona || "You are a helpful AI.";
  
  const prompt = `
    ${persona}
    
    User's Diary Entry:
    "${text}"
    
    Task:
    1. Write a reply (mention) to this entry based on your persona.
    
    Response Format:
    Return ONLY a valid JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
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
      reply: "AI 분석을 불러올 수 없었어요. 잠시 후 다시 시도해주세요."
    };
  }
};

export const getChatResponse = async (history, aiConfig) => {
  const ai = getClient();
  if (!ai) return "API Key가 설정되지 않았습니다.";

  const persona = aiConfig?.persona || "You are a helpful AI.";
  
  // Construct prompt from history
  let prompt = `${persona}\n\nCurrent Conversation:\n`;
  history.forEach(msg => {
    const role = msg.sender === 'user' ? 'User' : 'Model';
    prompt += `${role}: ${msg.text}\n`;
  });
  prompt += `Model: `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini chat failed:", error);
    return "죄송합니다. 지금은 대답하기 어렵네요. 잠시 후 다시 말을 걸어주세요!";
  }
};
