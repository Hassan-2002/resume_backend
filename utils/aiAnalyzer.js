const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); 

const analyzeResume = async (resumeText) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        You are a top-tier resume analyst. Analyze the following resume and return only the top 5 primitive structural metrics that influence resume quality. Be extremely concise, structured, and return raw data only — no fluff.
      
        Return JSON in this format:
        { "personalDetails" : [
             "name" : true | false,
             "email" : true | false,
             "phoneNumber" : true | false
              ]
          "atsScore": 0-10,  // scrutnise extra hard Overall ATS compatibility score
          "quantifiedAchievements": true | false,  // Uses metrics ($, %, #) in experience/project bullets?
          "actionVerbs": true | false,             // Uses strong verbs like Led, Built, Created, etc.?
          "coreSectionsPresent": {
            "experience": true | false,
            "projects": true | false,
            "education": true | false,
            "skills": true | false
          },
          "formatting": {
            "consistent": true | false,
            "issues": [string]  // Example: ["Inconsistent font sizes", "Date format mismatch"]
          },
          "buzzwords": {
               "buzz": [ "Implemented", "Optimized", "Led", "Designed" ]
              }, //find buzzwords and return atleast 2
          "length" : true | false //analyse the length and return if its optimal 
        }
          ### 💡 Urgent Fixes (Required for ATS pass)
      * [Fix 1: Describe essential, quick fixes. Example: 'Add a professional summary.']
      * [Fix 2: Describe essential, quick fixes. Example: 'Change all dates to MM/YYYY format.']
      * [Fix 3: ...]

      ###  Content Suggestions (To boost score)
      * [Suggestion 1: Focus on improving quantified achievements. Example: 'Rewrite 3 bullet points in your Experience section to include specific metrics (e.g., money saved, percentage increase).']
      * [Suggestion 2: Focus on keyword usage. Example: 'Incorporate skills like [Keyword 1] and [Keyword 2] into your job descriptions.']
      * [Suggestion 3: ...]
      * ### **Rules for Output**
      // - **Consistency**: Follow the above JSON format exactly—avoid extra text.
      // - **Readability**: Keep descriptions **concise (≤15 words each)** for easy display.
      // - **Uniqueness**: The joke must be different every time.
        resume text : ${resumeText}
        
        ONLY return this JSON. No explanations. Be strict. Penalize missing structure. Reward clarity.
        `
        

        const result = await model.generateContent(prompt);
        
        // Extract and print the response
        const responseText = result.response.candidates[0].content.parts[0].text;

        return responseText;
    } catch (error) {
        console.error("Error:", error);
    }
};
// "ats_score": (integer, 0-100, rating based on ATS keyword relevance, clarity, and formatting),
// "summary": "(A one-sentence high-level assessment of the resume)",
// "strengths": [
//     {"title": "(Concise strength category)", "description": "(Short, specific reason why this is a strength)"}
// ],
// "weaknesses": [
//     {"title": "(Concise weakness category)", "description": "(Short, specific reason why this is a weakness)"}
// ],
// "improvements": [
//     {"title": "(Area for improvement)", "description": "(Specific, actionable step to fix this issue)"}
// ],
// "job_fit": [
//     {"role": "(Software role name)", "fit_score": (integer, 0-100), "reason": "(Short explanation of why the resume is or isn't a strong fit for this role)"}
// ],

// ### **Rules for Output**
// - **Consistency**: Follow the above JSON format exactly—avoid extra text.
// - **Readability**: Keep descriptions **concise (≤15 words each)** for easy display.
// - **Uniqueness**: The joke must be different every time.
// - **Job Fit Section**: Analyze how well the resume matches **at least 3 common software roles** (e.g., Backend Developer, Frontend Developer, Full Stack Engineer).

module.exports = analyzeResume;
