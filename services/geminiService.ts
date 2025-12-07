import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Concept } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateStoryConcepts = async (referenceText: string): Promise<Concept[]> => {
  const ai = getClient();

  const prompt = `
    당신은 60대 이상 여성 관객의 감성을 깊이 이해하는 수석 드라마 작가입니다.
    
    [작업 목표]
    사용자가 제공한 '참고 대본'을 분석하여, 핵심 메타 키워드를 추출하고, 이를 바탕으로 완전히 새로운 이야기 컨셉 3가지를 제안하십시오.
    
    [제약 사항]
    1. **이름 및 지명 변경 필수**: 참고 대본에 등장하는 인물 이름이나 구체적인 지명은 절대 사용하지 마십시오. 완전히 새로운 이름과 장소를 창조하십시오.
    2. **타겟 오디언스**: 60대 이상 여성.
    3. **소재 및 분위기**: 
       - 지나온 삶을 위로하거나, 새로운 희망을 주거나, 가슴 따뜻한 가족애, 또는 흥미진진한 황혼의 로맨스.
       - 자극적이기보다는 깊은 감동과 여운, 혹은 잔잔한 유머가 있어야 합니다.
    4. **흡입력**: 이야기의 시작부터 강한 호기심을 자극해야 합니다.
    
    [참고 대본]
    ${referenceText}
  `;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.INTEGER },
        title: { type: Type.STRING, description: "매력적이고 감성적인 제목" },
        logline: { type: Type.STRING, description: "한 줄 요약 (흥미 유발)" },
        synopsis: { type: Type.STRING, description: "전체 줄거리 요약 (기승전결 포함)" },
        characters: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "등장인물 이름 리스트 (참고 대본과 겹치지 않게)"
        },
        tone: { type: Type.STRING, description: "작품의 분위기 (예: 따뜻한, 미스터리, 코믹 등)" }
      },
      required: ["id", "title", "logline", "synopsis", "characters", "tone"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are a warm, empathetic, and creative Korean drama writer specialized in stories for senior women.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text from Gemini");
    return JSON.parse(text) as Concept[];
  } catch (error) {
    console.error("Concept generation failed:", error);
    throw error;
  }
};

export const generateFullScriptContent = async (concept: Concept): Promise<string> => {
  const ai = getClient();

  const prompt = `
    당신은 오디오 드라마 전문 작가입니다. 
    아래 컨셉을 바탕으로 낭독(TTS)에 최적화된 약 30분 분량(매우 긴 호흡)의 대본을 작성해 주세요.

    [컨셉 정보]
    - 제목: ${concept.title}
    - 줄거리: ${concept.synopsis}
    - 등장인물: ${concept.characters.join(", ")}
    - 타겟: 60대 이상 여성 (감동, 흥미, 몰입감)

    [필수 작성 규칙 - 엄수]
    1. **인트로**: 청취자가 초반 10초 안에 빠져들 수 있도록 매우 강렬하고 감성적인 훅(Hook)으로 시작하십시오.
    2. **구성**: 이야기 중간중간에 반전이나 감정의 고조(Hook)를 배치하여 끝까지 듣게 만드십시오.
    3. **형식 (TTS 최적화)**:
       - **서두**: 대본 시작 전, 등장인물에 대한 간략한 소개(이름, 성격)를 먼저 명시해 주세요. (예: [등장인물 소개])
       - **본문**: 지문이나 화자 표시(예: '철수:', '내레이션:')를 **절대** 쓰지 마십시오.
       - 오직 **낭독될 텍스트**만 작성하십시오.
       - 누가 말하는지 문맥으로 알 수 있거나, 1인극 혹은 낭독극 형식으로 자연스럽게 흐르도록 쓰십시오.
       - 문장은 구어체로 자연스럽게, 낭독하기 편하게 끊어주세요.
    4. **분량**: 가능한 한 길고 자세하게, 감정선을 촘촘히 묘사하여 작성하십시오. (약 30분 낭독 분량 목표)

    [작성 예시]
    (좋은 예)
    바람이 차갑네요. 영희 씨, 혹시 지난 겨울 기억나요? 우리가 처음 만났던 그 눈 내리던 날 말이에요. 
    (나쁜 예)
    철수: 바람이 차갑네요. 
    영희: 그러게 말이에요. 
    내레이션: 철수는 영희를 바라보았다.

    위 '좋은 예'처럼 화자 이름 없이, 문맥 속에 자연스럽게 녹여내거나 내레이션과 대사를 매끄럽게 연결하여 작성하십시오.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using flash for speed, but thinking budget would be better on pro for length. 
      // However, per instructions, we stick to standard recommended models. 
      // To get length, we rely on the prompt being explicit.
      contents: prompt,
      config: {
        // High token limit to allow for long scripts
        maxOutputTokens: 8192, 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No script generated");
    return text;
  } catch (error) {
    console.error("Script generation failed:", error);
    throw error;
  }
};
