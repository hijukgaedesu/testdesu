
import { getAISettings } from "./storage.js";

const VERCEL_ENDPOINT = 'https://testdesu-beryl.vercel.app/api/generate';

async function callAI(promptText) {
  const response = await fetch(VERCEL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt: promptText })
  });

  if (!response.ok) {
    throw new Error('AI 서버리스 함수 호출 실패');
  }

  const data = await response.json();
  return data.aiResponse; 
}

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
    let jsonText = await callAI(prompt);
    
    // Cleanup markdown if present
    jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Backend analysis failed:", error);
    return { reply: "AI 분석을 불러올 수 없었어요. 잠시 후 다시 시도해주세요." };
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
    let resultText = await callAI(prompt);
    
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
