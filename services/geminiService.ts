
import { GoogleGenAI } from "@google/genai";

// Always use { apiKey: process.env.API_KEY } for initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGigDescription = async (title: string, category: string, skills: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a professional, persuasive gig description for a freelance platform in Nepal. 
      Title: ${title}
      Category: ${category}
      Key Skills: ${skills.join(', ')}
      Target Audience: Small to medium businesses in Nepal.
      Style: Professional, encouraging, and localized for the Nepali market.`,
      config: { temperature: 0.7 },
    });
    return response.text;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Failed to generate AI description. Please write manually.";
  }
};

export const generateProposal = async (projectTitle: string, projectDesc: string, freelancerSkills: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a winning project proposal for: "${projectTitle}".
      Project Details: ${projectDesc}
      My Skills: ${freelancerSkills.join(', ')}
      Address the client professionally and explain why I am the best fit.`,
      config: { temperature: 0.8 },
    });
    return response.text;
  } catch (error) {
    console.error("AI Proposal Error:", error);
    return "Failed to generate AI proposal.";
  }
};

export const optimizeProfile = async (currentBio: string, skills: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this freelancer profile bio and skills for the Nepali market.
      Bio: "${currentBio}"
      Skills: ${skills.join(', ')}
      
      Provide a single, short, actionable tip (max 20 words) to improve their profile visibility to high-paying clients in Kathmandu.`,
      config: { temperature: 0.7 },
    });
    return response.text;
  } catch (error) {
    return "Add 'Unicode Nepali' and 'Next.js' to your skills to boost visibility by 40%.";
  }
};
