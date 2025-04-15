const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); // Ensure you load env variables

const analyzeResume = async (resumeText) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `You are a resume analysis engine built to provide a structured evaluation of resumes based on industry best practices and ATS standards.

        Given the following resume text, analyze and return results in **strict JSON format** under the following 3 buckets:
        
        ---
        
        ### 1. "scoreOverview" – Core metrics for UI summary (shown under the score bar):
        - atsScore: number (0-100)
        - formatting: {
            dateConsistency: boolean,
            fontConsistency: boolean,
            bulletPointsUsed: boolean,
            oneColumnLayout: boolean
          }
        - quantifiedAchievements: boolean
        - actionVerbs: boolean
        - atsFriendly: boolean
        
        ---
        
        ### 2. "sectionBreakdown" – Evaluation by category (shown as cards on the right):
        - spellingErrors: [string]
        - grammarIssues: [string]
        - punctuationIssues: [string]
        - redundancy: [string]
        - keywordMatch: {
            found: [string],
            missing: [string]
          }
        - sectionStructure: {
            experience: boolean,
            education: boolean,
            projects: boolean,
            skills: boolean
          }
        
        ---
        
        ### 3. "improvements" – One-line suggestions (shown as a final section):
        - Return as object where keys are short improvement headings, and values are one-line improvement suggestions.
        
        ---
        
        Return ONLY JSON in the following structure:
        
        {
          "scoreOverview": { ... },
          "sectionBreakdown": { ... },
          "improvements": {
            "Heading 1": "One-line insight",
            "Heading 2": "One-line insight"
          }
        }
        
        ### Resume to Analyze:
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
