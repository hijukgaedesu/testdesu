
import { getAISettings } from "./storage.js";

const API_ENDPOINT = 'https://testdesu-beryl.vercel.app/api/generate';

// Helper function to extract text from various response formats
const extractTextFromResponse = (data) => {
  if (typeof data === 'string') return data;
  if (data.text) return data.text;
  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }
  // If the data itself is the JSON object we want, return it serialized to string for parsing logic
  return JSON.stringify(data);
};

export const analyzeDiaryEntry = async (text, aiConfig) => {
  // Fallback if no config passed
  const persona = aiConfig?.persona || "You are a helpful AI.";

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
    Do not include markdown formatting (like \`\`\`json).
  `;

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

    // Clean up markdown code blocks if present
    jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Backend analysis failed:", error);
    return {
      reply: "The AI companion is currently unavailable. Your day matters!"
    };
  }
};

export const getChatResponse = async (history, aiConfig) => {
  try {
    const persona = aiConfig?.persona || "You are a helpful AI.";
    
    // Construct a chat prompt manually
    let prompt = `${persona}\n\n`;
    
    // Add conversation history
    history.forEach(msg => {
      const role = msg.sender === 'user' ? 'User' : 'Model';
      prompt += `${role}: ${msg.text}\n`;
    });
    
    // Prompt for the next response
    prompt += `Model: `;

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
    
    // Clean up JSON formatting if the model accidentally outputted JSON
    if (resultText.trim().startsWith('{') && resultText.trim().endsWith('}')) {
        try {
            const parsed = JSON.parse(resultText);
            if (parsed.text) return parsed.text;
            if (parsed.reply) return parsed.reply;
        } catch (e) {
            // ignore
        }
    }

    return resultText;
  } catch (error) {
    console.error("Backend chat failed:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
};
