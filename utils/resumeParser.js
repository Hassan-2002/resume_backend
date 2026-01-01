const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

/**
 * Parse resume text into structured resume data for the resume builder
 */
const parseResumeToStructuredData = async (resumeText) => {
  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    const prompt = `
You are a resume parser. Extract all information from the resume text below and return ONLY valid JSON matching the schema exactly.

Required JSON shape:
{
  "personalInfo": {
    "fullName": "Full name of the candidate",
    "email": "Email address or empty string",
    "phone": "Phone number or empty string",
    "location": "City, State/Country or empty string",
    "linkedin": "LinkedIn URL or empty string",
    "github": "GitHub URL or empty string",
    "portfolio": "Portfolio/Website URL or empty string",
    "summary": "Professional summary/objective if present, or empty string",
    "tagline": "Job title/tagline if present, or empty string"
  },
  "experiences": [
    {
      "id": "exp-1",
      "company": "Company name",
      "position": "Job title",
      "location": "City, State/Country or empty string",
      "startDate": "Start date (e.g., Jan 2023 or 2023)",
      "endDate": "End date or 'Present'",
      "current": true if currently working there,
      "description": "Brief role description or empty string",
      "highlights": ["Achievement/responsibility 1", "Achievement 2", ...]
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": "Project name",
      "description": "Brief project description",
      "technologies": ["Tech1", "Tech2", ...],
      "link": "Project URL if available or empty string",
      "highlights": ["Key achievement 1", "Key achievement 2", ...]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "institution": "University/School name",
      "degree": "Degree type (e.g., Bachelor of Science, Master's)",
      "field": "Field of study",
      "location": "City, State/Country or empty string",
      "startDate": "Start year",
      "endDate": "End year or 'Present'",
      "gpa": "GPA if mentioned or empty string",
      "highlights": ["Honor/achievement 1", ...]
    }
  ],
  "skills": [
    {
      "id": "skill-1",
      "category": "Programming Languages",
      "items": ["JavaScript", "Python", ...]
    },
    {
      "id": "skill-2", 
      "category": "Frameworks & Libraries",
      "items": ["React", "Node.js", ...]
    },
    {
      "id": "skill-3",
      "category": "Tools & Platforms",
      "items": ["Git", "Docker", ...]
    }
  ],
  "certifications": [
    {
      "id": "cert-1",
      "name": "Certification name",
      "issuer": "Issuing organization",
      "date": "Date obtained or empty string",
      "link": "Verification URL or empty string"
    }
  ]
}

Rules:
- Output must be a single valid JSON object with no Markdown fencing or extra text.
- Extract ALL experiences, projects, education entries, and skills mentioned.
- For skills, group them into logical categories (Programming Languages, Frameworks, Tools, Databases, Cloud, Soft Skills, etc.)
- Generate unique IDs for each item (exp-1, exp-2, proj-1, edu-1, skill-1, cert-1, etc.)
- If a section is not present in the resume, return an empty array for that section.
- Convert bullet points into the highlights array.
- Parse dates as they appear in the resume.
- If currently employed, set current: true and endDate: "Present"

Resume to parse:
<<<RESUME_START>>>
${resumeText}
<<<RESUME_END>>>
`;

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
    const parsedData = JSON.parse(rawText);

    return parsedData;

  } catch (error) {
    console.error("Error parsing resume:", error);
    return { error: "Resume parsing failed", details: error.message };
  }
};

module.exports = { parseResumeToStructuredData };
