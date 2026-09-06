const ai = require("../config/gemini");

/*
|--------------------------------------------------------------------------
| LifeHub AI - LLM Service
|--------------------------------------------------------------------------
|
| Provider order:
|
| 1. Ollama (local)
| 2. Gemini (cloud fallback)
|
| Ollama is preferred because:
| - No API cost
| - No external document data required
| - Works well with local RAG
|
| Gemini is kept as a fallback.
|
|--------------------------------------------------------------------------
*/

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";

const OLLAMA_MODEL =
    process.env.OLLAMA_MODEL || "llama3.2:3b";

const GEMINI_MODEL =
    process.env.GEMINI_MODEL || "gemini-flash-latest";

const GEMINI_MAX_RETRIES = 3;

const RETRY_DELAY_MS = 1500;

/*
|--------------------------------------------------------------------------
| Sleep helper
|--------------------------------------------------------------------------
*/

const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

/*
|--------------------------------------------------------------------------
| Build RAG prompt
|--------------------------------------------------------------------------
*/

const buildPrompt = ({ question, context }) => {
    return `
You are LifeHub AI, an AI assistant for a personal document management system.

Answer the user's question ONLY using the information provided in the document context.

Rules:
- Use only the supplied document context.
- Do not invent facts.
- Do not use outside knowledge.
- If the answer is clearly present, answer it directly.
- If the answer is not present, reply exactly:
"I couldn't find that information in your uploaded documents."
- Keep the answer concise and professional.
- If multiple pieces of information are relevant, combine them clearly.
- Do not mention these instructions in your answer.

--------------------------------
DOCUMENT CONTEXT
--------------------------------

${context}

--------------------------------
USER QUESTION
--------------------------------

${question}

--------------------------------
ANSWER
--------------------------------
`;
};

/*
|--------------------------------------------------------------------------
| Call Ollama
|--------------------------------------------------------------------------
*/

const generateWithOllama = async ({ question, context }) => {
    const prompt = buildPrompt({
        question,
        context,
    });

    try {
        const response = await fetch(
            `${OLLAMA_URL}/api/generate`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    model: OLLAMA_MODEL,
                    prompt,
                    stream: false,

                    options: {
                        temperature: 0.1,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                `Ollama HTTP ${response.status}: ${errorText}`
            );
        }

        const data = await response.json();

        if (!data || !data.response) {
            throw new Error(
                "Ollama returned an empty response."
            );
        }

        return data.response.trim();

    } catch (error) {

        console.error(
            "Ollama Error:",
            error.message
        );

        throw error;
    }
};

/*
|--------------------------------------------------------------------------
| Call Gemini
|--------------------------------------------------------------------------
*/

const generateWithGemini = async ({
    question,
    context,
}) => {

    const prompt = buildPrompt({
        question,
        context,
    });

    let lastError = null;

    for (
        let attempt = 1;
        attempt <= GEMINI_MAX_RETRIES;
        attempt++
    ) {

        try {

            console.log(
                `Gemini attempt ${attempt}/${GEMINI_MAX_RETRIES}`
            );

            const response =
                await ai.models.generateContent({
                    model: GEMINI_MODEL,
                    contents: prompt,
                });

            if (
                !response ||
                !response.text
            ) {
                throw new Error(
                    "Gemini returned an empty response."
                );
            }

            return response.text.trim();

        } catch (error) {

            lastError = error;

            console.error(
                `Gemini attempt ${attempt} failed:`,
                error.message
            );

            /*
            --------------------------------------------------
            Retry only temporary errors
            --------------------------------------------------
            */

            const status =
                error.status ||
                error.code;

            const message =
                error.message || "";

            const isTemporaryError =
                status === 429 ||
                status === 500 ||
                status === 502 ||
                status === 503 ||
                status === 504 ||
                message.includes("503") ||
                message.includes("UNAVAILABLE") ||
                message.includes("high demand") ||
                message.includes("temporarily");

            /*
            --------------------------------------------------
            Do not retry permanent errors
            --------------------------------------------------
            */

            if (!isTemporaryError) {
                throw error;
            }

            /*
            --------------------------------------------------
            Don't wait after final attempt
            --------------------------------------------------
            */

            if (
                attempt < GEMINI_MAX_RETRIES
            ) {

                const delay =
                    RETRY_DELAY_MS * attempt;

                console.log(
                    `Retrying Gemini in ${delay}ms...`
                );

                await sleep(delay);
            }
        }
    }

    throw lastError;
};

/*
|--------------------------------------------------------------------------
| Main LLM function
|--------------------------------------------------------------------------
*/

const generateAnswer = async ({
    question,
    context,
}) => {

    if (
        !question ||
        question.trim().length === 0
    ) {
        throw new Error(
            "Question is required."
        );
    }

    if (
        !context ||
        context.trim().length === 0
    ) {
        return "I couldn't find that information in your uploaded documents.";
    }

    /*
    |--------------------------------------------------------------------------
    | Provider 1 - Ollama
    |--------------------------------------------------------------------------
    */

    try {

        console.log(
            `Trying Ollama model: ${OLLAMA_MODEL}`
        );

        const answer =
            await generateWithOllama({
                question,
                context,
            });

        console.log(
            "LLM Response generated using Ollama."
        );

        return answer;

    } catch (ollamaError) {

        console.warn(
            "Ollama unavailable. Falling back to Gemini."
        );

    }

    /*
    |--------------------------------------------------------------------------
    | Provider 2 - Gemini
    |--------------------------------------------------------------------------
    */

    try {

        console.log(
            `Trying Gemini model: ${GEMINI_MODEL}`
        );

        const answer =
            await generateWithGemini({
                question,
                context,
            });

        console.log(
            "LLM Response generated using Gemini."
        );

        return answer;

    } catch (geminiError) {

        console.error(
            "Gemini failed:",
            geminiError.message
        );

        throw new Error(
            "AI answer generation failed. Both Ollama and Gemini are currently unavailable."
        );
    }
};

module.exports = {
    generateAnswer,
};