const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const analyzeResume = async (resumeText, jobDescription, jobTitle) => {
  try {
    // 1. Initialize the new client
    const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    const prompt = `
      Analyze the following resume against the given job title and description. 
      Evaluate it based on ATS optimization, industry relevance, and hiring trends.

      ### Job Title & Description:
      ${jobTitle}
      ${jobDescription}

      ### Resume Content:
      ${resumeText}

      ### Output Requirement:
      Return ONLY raw JSON. Follow this schema exactly:
      {
        "ats_score": "integer (0-100)",
        "strengths": [{"title": "string", "description": "string"}],
        "weaknesses": [{"title": "string", "description": "string"}],
        "improvements": [{"title": "string", "description": "string"}],
        "suggestions": [{"title": "string", "description": "string"}],
        "changes": [{"title": "string", "before": "string", "after": "string"}],
        "job_fit": [{"role": "string", "fit_score": "integer", "reason": "string"}]
      }
    `;

    // 2. Call the new method structure
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash", //
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      config: {
        responseMimeType: "application/json", // Forces strictly valid JSON
      }
    });

    // 3. Parse the result (No need to strip markdown fences manually anymore)
    const responseText = result.text(); 
    return JSON.parse(responseText);

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null; // or throw error depending on how you handle it frontend-side
  }
};

module.exports = analyzeResume;