
import { GoogleGenAI, Type } from "@google/genai";
import { Agent, PositionRequest } from "../types";

export const getSmartMatches = async (position: PositionRequest, agents: Agent[]): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Actúa como un experto en Recursos Humanos. Analiza el siguiente pedido de puesto y la lista de agentes disponibles para reubicación. 
  Evalúa la compatibilidad basándote en el perfil funcional, competencias y carga horaria. 
  Genera una lista de los 3 mejores candidatos indicando un puntaje de compatibilidad (0-100) y una breve justificación.

  PUESTO SOLICITADO:
  - Organismo: ${position.requestingOrg}
  - Área: ${position.requestingArea}
  - Perfil: ${position.profileRequired}
  - Funciones: ${position.mainFunctions}
  - Horas: ${position.hoursRequired}

  AGENTES DISPONIBLES:
  ${agents.map(a => `- ID: ${a.id}, Nombre: ${a.fullName}, Perfil: ${a.profile}, Competencias: ${a.keyCompetencies}, Horas: ${a.workingHours}`).join('\n')}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            agentId: { type: Type.STRING },
            fullName: { type: Type.STRING },
            score: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          },
          required: ["agentId", "fullName", "score", "reasoning"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Error parsing AI response", e);
    return [];
  }
};
