const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); // Ensure you load env variables

const analyzeResume = async (resumeText, jobDescription, jobTitle) => {

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
         
Analyze the following resume against the given job title and description. Evaluate it based on ATS optimization, industry relevance, and hiring trends. Return the analysis in structured JSON format for front-end compatibility.

### Job Title & Description:
\`\`\`
${jobTitle}
${jobDescription}
\`\`\`

### Resume Content:
\`\`\`
${resumeText}
\`\`\`

### Response Format (Strictly Follow This)
\`\`\`json
{
    "ats_score": (integer, 0-100, rating based on ATS keyword relevance, clarity, and formatting),
    "summary": "(A one-sentence high-level assessment of the resume’s alignment with the job description)",
    "strengths": [
        {"title": "(Concise strength category)", "description": "(Short, specific reason why this is a strength)"}
    ],
    "weaknesses": [
        {"title": "(Concise weakness category)", "description": "(Short, specific reason why this is a weakness)"}
    ],
    "improvements": [
        {"title": "(Area for improvement)", "description": "(Specific, actionable step to fix this issue)"}
    ],
    "suggestions": [
        {"title": "(Suggested addition/change)", "description": "(Explain why this change improves alignment with the job)"}
    ],
    "changes": [
        {"title": "(Specific change required)", "before": "(Original content)", "after": "(Suggested improved content)"}
    ],
    "job_fit": [
        {"role": "(Software role name)", "fit_score": (integer, 0-100), "reason": "(Short explanation of why the resume is or isn't a strong fit for this role)"}
    ]
}
\`\`\`

### Rules for Output:
- **Strict JSON Compliance**: No extra text outside the JSON structure.
- **Concise & Readable**: Keep descriptions **≤15 words** for easy display.
- **Customization**: The job_fit section must analyze alignment with **at least 3 software engineering roles**, explaining the fit score.
- **Actionable Changes**: The "changes" section must provide **before-and-after** improvements for clarity.
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
