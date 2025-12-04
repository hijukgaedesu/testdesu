import { GoogleGenAI, Type } from "@google/genai";

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
  if (!client) return { reply: "API Key가 설정되지 않았습니다.", tags: [] };

  try {
    const prompt = `
      사용자가 다음 기분으로 일기를 작성했습니다: "${mood}".
      일기 내용: "${text}"
      
      이 일기에 대해 공감하는 짧은 댓글(트위터 답글 스타일)과 내용을 요약하는 해시태그 3개를 JSON으로 생성해주세요.
      댓글은 따뜻하고 격려하는 어조 혹은 상황에 맞는 위로/축하를 담아야 합니다. 반말(~했구나, ~야)을 사용해 친근하게 해주세요.
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
      reply: "AI 분석을 불러올 수 없었어요. 하지만 당신의 하루는 소중해요!",
      tags: ["#기록", "#하루", "#오류"]
    };
  }
};