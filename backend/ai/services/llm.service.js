const ai = require("../config/gemini");

/**
 * Generate an answer using Gemini
 */
const generateAnswer = async ({ question, context }) => {
    try {

        const prompt = `
You are an AI Document Assistant.

Answer ONLY using the information provided in the document context.

Rules:
- If the answer is present in the context, answer clearly.
- If the context does not contain the answer, reply:
  "I couldn't find that information in your uploaded documents."
- Do not make up information.
- Keep the answer concise and professional.

------------------------
DOCUMENT CONTEXT
------------------------
${context}

------------------------
USER QUESTION
------------------------
${question}

------------------------
ANSWER
------------------------
`;

        const response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt,
        });

        return response.text.trim();

    } catch (error) {

        console.error("LLM Error:", error);

        throw new Error("Failed to generate AI answer.");

    }
};

module.exports = {
    generateAnswer,
};