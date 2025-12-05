
import { getAISettings } from "./storage.js";

const API_ENDPOINT = 'https://testdesu-beryl.vercel.app/api/generate';

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

  // 3. Call Backend
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
    console.error("Backend analysis failed:", error);
    return { reply: "AI 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요." };
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

  // Call Backend
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
    console.error("Backend chat failed:", error);
    return "죄송합니다. 지금은 대답하기 어렵네요. 잠시 후 다시 말을 걸어주세요!";
  }
};
