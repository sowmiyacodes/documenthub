const ai = require("../config/gemini");

const generateSummary = async (text) => {
    try {

        if (!text || text.trim().length === 0) {
            return "";
        }

        // Gemini has a large context window, but we'll still limit input.
        const documentText = text.substring(0, 12000);

        const prompt = `
You are an intelligent document assistant.

Summarize the following document.

Requirements:
- Keep it between 120 and 180 words.
- Preserve important names, dates and numbers.
- Use simple professional English.
- Return ONLY the summary.

Document:

${documentText}
`;

        const response = await ai.models.generateContent({
           model: "gemini-flash-latest",
            contents: prompt,
        });

        return response.text.trim();

    } catch (error) {

        console.error("Summary Error:", error);

        return "";
    }
};

module.exports = {
    generateSummary,
};