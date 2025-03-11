const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); // Ensure you load env variables

const analyzeResume = async (resumeText, jobDescription, jobTitle) => {

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        "You are an ATS (Applicant Tracking System) analyzer. Your task is to evaluate a resume against a given job title and job description. Follow these steps:

        ATS Score (0-100): Calculate a numerical ATS score based on keyword relevance, formatting, and experience alignment.
        Job Compatibility (%): Determine how well the resume matches the job description based on skills, experience, and qualifications.
        Missing Skills & Gaps: Identify any missing or weak areas in the resume compared to the job description.
        Improvement Suggestions: Provide actionable steps to enhance the resume for better ATS performance.
    

        Job Title: ${jobTitle}
        Job Description: ${jobDescription}
        Resume Text: ${resumeText}`



        const result = await model.generateContent(prompt);
        
        // Extract and print the response
        const responseText = result.response.candidates[0].content.parts[0].text;
        return responseText;
    } catch (error) {
        console.error("Error:", error);
    }
};

module.exports = analyzeResume;
