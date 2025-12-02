import { GoogleGenAI, Type } from "@google/genai";
import type { ProjectData, AISummary } from "../types";

const apiKey = import.meta.env.VITE_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateProjectSummary = async (data: ProjectData): Promise<AISummary> => {
  if (!ai) {
    throw new Error("API Key is missing");
  }

  const prompt = `
    Analyze the following project data (Tasks, Team, Notes, Holidays).
    Provide a concise executive summary of the project status.
    Identify potential risks based on missed deadlines, dependencies, holidays, and team time off mentioned in the notes or data.
    Suggest specific mitigations for these risks.
    
    Project Data:
    ${JSON.stringify(data, null, 2)}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "A paragraph summarizing the timeline and status." },
          risks: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }, 
            description: "List of identified risks." 
          },
          mitigations: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }, 
            description: "List of suggested mitigations." 
          }
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as AISummary;
  }
  
  throw new Error("Failed to generate summary");
};