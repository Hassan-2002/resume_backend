const parseGeminiResponse = (response) => {
  try {
    const rawText = response?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("Empty or invalid response format.");

    // ✅ Clean out markdown code block markers (```json ... ```)
    const cleanedText = rawText.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();

    // ✅ Parse as JSON
    const json = JSON.parse(cleanedText);

    return { success: true, data: json };

  } catch (err) {
    return {
      success: false,
      error: "Failed to parse Gemini response as JSON.",
      raw: response,
    };
  }
};

module.exports = parseGeminiResponse;
