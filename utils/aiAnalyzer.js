// 1. IMPORT the new SDK
const { GoogleGenAI } = require("@google/genai"); 
require("dotenv").config();

const buildPrompt = require("./promptBuilder");
const parseGeminiResponse = require("./responseParser");

const analyzeResume = async (resumeText) => {
  try {
    // 2. INITIALIZE client (Notice the new 'apiKey' parameter object)
    const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    // 3. CALL generateContent (No more 'getGenerativeModel')
    // You call 'models.generateContent' directly from the client instance
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash", //
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(resumeText) }]
        }
      ],
      config: {
        responseMimeType: "application/json", // Optional: Enforces JSON output
      }
    });

    // 4. EXTRACT Response (Structure has changed)
    // The new SDK returns the text more directly
    const rawText = result.text(); // or result.text depending on version, usually a method now

    // 5. PARSE as before
    // We pass the raw string to your parser, not the full result object
    // You might need to update parseGeminiResponse to accept a string, 
    // or just JSON.parse(rawText) here.
    
    // Assuming your parser expects the raw string now:
    const parsedData = JSON.parse(rawText); 
    
    return parsedData;

  } catch (error) {
    console.error("Error analyzing resume:", error);
    return { error: "Gemini API call failed", details: error.message };
  }
};

module.exports = analyzeResume;