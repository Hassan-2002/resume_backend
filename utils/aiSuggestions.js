// AI Suggestion Engine for Resume Builder
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

/**
 * Generate AI suggestions for a specific resume section
 * @param {string} sectionType - Type of section (experience, project, summary, skills)
 * @param {object} content - The current content of the section
 * @param {string} jobTitle - Target job title for optimization (optional)
 * @returns {object} - AI suggestions with score and improvements
 */
const generateSectionSuggestions = async (sectionType, content, jobTitle = "") => {
  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    const prompt = buildSuggestionPrompt(sectionType, content, jobTitle);

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const rawText = result.text;
    return JSON.parse(rawText);

  } catch (error) {
    console.error("Error generating suggestions:", error);
    return { error: "AI suggestion failed", details: error.message };
  }
};

/**
 * Build prompt for different section types
 */
const buildSuggestionPrompt = (sectionType, content, jobTitle) => {
  const baseInstruction = `You are an expert resume writer and ATS optimization specialist. 
Analyze the following ${sectionType} content and provide improvements.
${jobTitle ? `Optimize for the role: ${jobTitle}` : ""}

Return a JSON response with this exact structure:
{
  "score": <number 0-100>,
  "overallFeedback": "<brief overall assessment>",
  "suggestions": [
    {
      "original": "<original text being improved>",
      "suggested": "<improved version>",
      "reasoning": "<why this change improves the content>"
    }
  ],
  "keywords": ["<relevant ATS keywords to consider>"],
  "actionVerbs": ["<strong action verbs to use>"]
}`;

  switch (sectionType) {
    case "summary":
      return `${baseInstruction}

Professional Summary to improve:
"${content.summary || content}"

Guidelines:
- Make it compelling and concise (2-4 sentences)
- Include years of experience if mentioned
- Highlight key skills and specializations
- Add quantifiable achievements if possible
- Use industry-relevant keywords`;

    case "experience":
      return `${baseInstruction}

Work Experience to improve:
Position: ${content.position || "Not specified"}
Company: ${content.company || "Not specified"}
Description: ${content.description || ""}
Highlights/Achievements:
${Array.isArray(content.highlights) ? content.highlights.map((h, i) => `${i + 1}. ${h}`).join("\n") : content.highlights || ""}

Guidelines:
- Start each bullet with a strong action verb
- Quantify achievements with numbers/percentages
- Focus on impact and results, not just duties
- Use STAR method (Situation, Task, Action, Result)
- Include relevant technical skills and tools
- Avoid repetitive language`;

    case "project":
      return `${baseInstruction}

Project to improve:
Name: ${content.name || "Not specified"}
Description: ${content.description || ""}
Technologies: ${Array.isArray(content.technologies) ? content.technologies.join(", ") : content.technologies || ""}
Highlights:
${Array.isArray(content.highlights) ? content.highlights.map((h, i) => `${i + 1}. ${h}`).join("\n") : content.highlights || ""}

Guidelines:
- Clearly state the problem solved
- Highlight technical complexity
- Quantify impact (users, performance, etc.)
- Mention specific technologies effectively
- Show your role and contributions`;

    case "skills":
      return `${baseInstruction}

Current Skills:
${JSON.stringify(content, null, 2)}

Guidelines:
- Organize skills by category (Frontend, Backend, etc.)
- Prioritize most relevant/in-demand skills first
- Include both technical and soft skills
- Add proficiency levels if appropriate
- Remove outdated or less relevant skills`;

    default:
      return `${baseInstruction}

Content to improve:
${JSON.stringify(content, null, 2)}

Provide actionable suggestions to improve this content for ATS and recruiters.`;
  }
};

/**
 * Generate full resume review with AI
 */
const generateFullResumeReview = async (resumeData) => {
  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    const prompt = `You are an expert resume reviewer and ATS specialist.
Analyze this complete resume and provide a comprehensive review.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Return a JSON response with this exact structure:
{
  "overallScore": <number 0-100>,
  "sectionScores": {
    "personalInfo": <number 0-100>,
    "summary": <number 0-100>,
    "experience": <number 0-100>,
    "projects": <number 0-100>,
    "education": <number 0-100>,
    "skills": <number 0-100>
  },
  "strengths": ["<list of resume strengths>"],
  "improvements": ["<list of key improvements needed>"],
  "atsCompatibility": {
    "score": <number 0-100>,
    "issues": ["<list of ATS compatibility issues>"],
    "recommendations": ["<list of ATS optimization tips>"]
  },
  "missingKeywords": ["<important keywords missing>"],
  "formattingIssues": ["<any formatting concerns>"]
}`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const rawText = result.text;
    return JSON.parse(rawText);

  } catch (error) {
    console.error("Error generating full review:", error);
    return { error: "AI review failed", details: error.message };
  }
};

/**
 * Rewrite content completely with AI
 */
const rewriteContent = async (sectionType, content, style = "professional") => {
  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    const prompt = `You are an expert resume writer. Completely rewrite the following ${sectionType} content in a ${style} tone.

Original Content:
${JSON.stringify(content, null, 2)}

Return a JSON response with this exact structure:
{
  "rewritten": <the completely rewritten content in the same structure as input>,
  "changes": ["<list of key changes made>"],
  "improvement": "<percentage improvement estimate>"
}

Make it:
- ATS-optimized with relevant keywords
- Compelling and achievement-focused
- Professional and concise
- Quantified where possible`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const rawText = result.text;
    return JSON.parse(rawText);

  } catch (error) {
    console.error("Error rewriting content:", error);
    return { error: "AI rewrite failed", details: error.message };
  }
};

/**
 * Generate bullet points from job description
 */
const generateBulletPoints = async (jobDescription, count = 4) => {
  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    const prompt = `You are an expert resume writer. Generate ${count} strong bullet points for a resume based on this job/role description.

Job/Role Description:
${jobDescription}

Return a JSON response with this exact structure:
{
  "bulletPoints": [
    {
      "text": "<the bullet point text>",
      "keywords": ["<relevant keywords used>"]
    }
  ],
  "tips": ["<tips for customizing these bullets>"]
}

Guidelines:
- Start each bullet with a strong action verb
- Include quantifiable metrics (use realistic placeholders like X%, X users, etc.)
- Focus on impact and results
- Use industry-relevant keywords
- Keep each bullet to 1-2 lines`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const rawText = result.text;
    return JSON.parse(rawText);

  } catch (error) {
    console.error("Error generating bullet points:", error);
    return { error: "AI generation failed", details: error.message };
  }
};

module.exports = {
  generateSectionSuggestions,
  generateFullResumeReview,
  rewriteContent,
  generateBulletPoints
};
