const buildPrompt = (resumeText) => `
You are an ATS evaluator. Analyze the resume content below and return ONLY valid JSON matching the schema exactly.

Required JSON shape:
{
  "overallScore": integer 0-100,
  "atsEssentials": [
    {
      "subheading": "File Format & Size" | "Design" | "Email Address" | "Hyperlink in Header",
      "passed": true | false,
      "summary": "1-2 sentence explanation"
      - in case file format and size are not provided assume 5mb and pdf or docx, do not mention the assumption in response, just respond with "format and size are acceptable" or something more professional
    },
    ...
  ],
  "content": [
    {
      "subheading": "ATS Parse Rate" | "Quantifying Impact" | "Repetition" | "Spelling & Grammar",
      "passed": true | false,
      "summary": "1-2 sentence explanation"
    },
    ...
  ],
  "sections": [
    {
      "subheading": "Experience" | "Education" | "Summary" | "Contact Information",
      "passed": true | false,
      "summary": "1-2 sentence explanation",
      "details": {
        "phone": "Extracted phone number or \"Not found\"",
        "email": "Extracted email or \"Not found\"",
        "linkedin": "Extracted LinkedIn URL or \"Not found\""
      } // include details ONLY when subheading is Contact Information; omit for others
    },
    ...
  ],
  "urgentFixes": [
    {
      "subheading": "GPA Visibility",
      "passed": true | false,
      -if less than 8 return false
      "summary": "1-2 sentence explanation",
      "action": "Directive for GPA handling"
    },
    {
      "subheading": "Employment Gaps",
      "passed": true | false,
      "summary": "1-2 sentence explanation",
      "action": "Instruction on addressing gaps"
    },
    {
      "subheading": "Repetitive Language",
      "passed": true | false,
      -if present return false
      "summary": "1-2 sentence explanation",
      "action": "List of 1-3 alternative words"
      - provide alternate words here
    }
  ]
}

Non-negotiable rules:
- Output must be a single JSON object with no Markdown fencing or extra commentary.
- Include each subheading exactly once in the order listed for its array.
- Every subheading object must have a boolean passed field (true or false, nothing else).
- Summaries must be grounded in resume evidence; be specific about missing or present items.
- If information is insufficient, set passed to false and explain why in the summary.
- For Contact Information, extract the phone, email, and LinkedIn exactly as written or return "Not found".
- Treat GPA/CGPA below 3.0 on a 4-point scale or below 8.0 on a 10-point scale as low; when passed is false, set action to "Suggest removing low GPA" or similar.
- Employment Gaps should flag multi-year gaps (≥6 months) in experience chronology; action must tell the user to explain or fill the gap.
- Repetitive Language must highlight repeated verbs or phrases; action must list 1-3 concise alternative words or phrases.
- In case file format and size are not returned, assume pdf or docx and 5mb
Resume to evaluate:
<<<RESUME_START>>>
${resumeText}
<<<RESUME_END>>>
`;

module.exports = buildPrompt;
