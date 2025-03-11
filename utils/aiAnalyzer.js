const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); // Ensure you load env variables

const analyzeResume = async (resumeText) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Evaluate the following resume for a software engineering role based on ATS optimization, industry relevance, and hiring trends. Return the analysis in **structured JSON format**, ensuring readability and front-end compatibility. 

### **Response Format (Strictly Follow This)**
{
    "ats_score": (integer, 0-100, rating based on ATS keyword relevance, clarity, and formatting),
    "summary": "(A one-sentence high-level assessment of the resume)",
    "strengths": [
        {"title": "(Concise strength category)", "description": "(Short, specific reason why this is a strength)"}
    ],
    "weaknesses": [
        {"title": "(Concise weakness category)", "description": "(Short, specific reason why this is a weakness)"}
    ],
    "improvements": [
        {"title": "(Area for improvement)", "description": "(Specific, actionable step to fix this issue)"}
    ],
    "job_fit": [
        {"role": "(Software role name)", "fit_score": (integer, 0-100), "reason": "(Short explanation of why the resume is or isn't a strong fit for this role)"}
    ],
   
}

### **Rules for Output**
- **Consistency**: Follow the above JSON format exactly—avoid extra text.
- **Readability**: Keep descriptions **concise (≤15 words each)** for easy display.
- **Uniqueness**: The joke must be different every time.
- **Job Fit Section**: Analyze how well the resume matches **at least 3 common software roles** (e.g., Backend Developer, Frontend Developer, Full Stack Engineer).

### **Resume to Analyze:**
"""
${resumeText}
"""

        `;
        


        const result = await model.generateContent(prompt);
        
        // Extract and print the response
        const responseText = result.response.candidates[0].content.parts[0].text;
        return responseText;
    } catch (error) {
        console.error("Error:", error);
    }
};

module.exports = analyzeResume;
