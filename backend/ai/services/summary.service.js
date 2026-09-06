/*
|--------------------------------------------------------------------------
| Local AI Summary Service
|--------------------------------------------------------------------------
|
| Uses Ollama instead of Gemini.
|
| Advantages:
| - No Gemini 503 errors
| - No API key required
| - Runs locally
| - Better privacy
| - No per-request API cost
| - Works with LifeHub's local AI architecture
|
| Fallback:
| If Ollama is unavailable, a basic extractive summary is generated
| so document processing can still complete successfully.
|
|--------------------------------------------------------------------------
*/

const OLLAMA_URL =
    process.env.OLLAMA_URL ||
    "http://localhost:11434/api/generate";

const OLLAMA_MODEL =
    process.env.OLLAMA_MODEL ||
    "gemma3:4b";

/*
|--------------------------------------------------------------------------
| Clean generated text
|--------------------------------------------------------------------------
*/

const cleanSummary = (text) => {
    if (!text) {
        return "";
    }

    return text
        .replace(/^summary\s*:\s*/i, "")
        .replace(/^here is the summary\s*:\s*/i, "")
        .trim();
};

/*
|--------------------------------------------------------------------------
| Fallback Summary
|--------------------------------------------------------------------------
|
| Used when Ollama is unavailable.
|
| This prevents:
|
| Gemini/Ollama error
|       ↓
| summary = ""
|       ↓
| document loses summary
|
|--------------------------------------------------------------------------
*/

const generateFallbackSummary = (text) => {
    if (!text || text.trim().length === 0) {
        return "";
    }

    const cleanedText = text
        .replace(/\s+/g, " ")
        .trim();

    /*
    |--------------------------------------------------------------------------
    | Split into sentences
    |--------------------------------------------------------------------------
    */

    const sentences = cleanedText
        .split(/(?<=[.!?])\s+/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 20);

    /*
    |--------------------------------------------------------------------------
    | If sentence splitting fails
    |--------------------------------------------------------------------------
    */

    if (sentences.length === 0) {
        return cleanedText.substring(0, 800);
    }

    /*
    |--------------------------------------------------------------------------
    | Take the first important sentences
    |--------------------------------------------------------------------------
    */

    const selectedSentences = sentences.slice(0, 5);

    let summary = selectedSentences.join(" ");

    /*
    |--------------------------------------------------------------------------
    | Limit summary length
    |--------------------------------------------------------------------------
    */

    if (summary.length > 1000) {
        summary = summary.substring(0, 1000);

        const lastSpace = summary.lastIndexOf(" ");

        if (lastSpace > 0) {
            summary = summary.substring(0, lastSpace);
        }

        summary += "...";
    }

    return summary;
};

/*
|--------------------------------------------------------------------------
| Generate Summary using Ollama
|--------------------------------------------------------------------------
*/

const generateSummary = async (text) => {
    try {
        /*
        |--------------------------------------------------------------------------
        | Validate text
        |--------------------------------------------------------------------------
        */

        if (!text || text.trim().length === 0) {
            return "";
        }

        /*
        |--------------------------------------------------------------------------
        | Limit input size
        |--------------------------------------------------------------------------
        |
        | Prevent unnecessarily large prompts.
        |
        */

        const documentText = text
            .substring(0, 12000)
            .trim();

        /*
        |--------------------------------------------------------------------------
        | Prompt
        |--------------------------------------------------------------------------
        */

        const prompt = `
You are the document summarization engine for LifeHub AI.

Summarize the following document.

Rules:
- Produce a concise professional summary.
- Preserve important names.
- Preserve important dates.
- Preserve important numbers.
- Preserve important qualifications.
- Preserve important organizations and institutions.
- Do not invent information.
- Do not add information that is not present.
- Do not mention that you are an AI.
- Do not use headings.
- Return only the summary.
- Keep it approximately 100 to 150 words.

DOCUMENT:
${documentText}
`;

        console.log(
            `Generating summary using local model: ${OLLAMA_MODEL}`
        );

        /*
        |--------------------------------------------------------------------------
        | Call Ollama
        |--------------------------------------------------------------------------
        */

        const response = await fetch(
            OLLAMA_URL,
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
                        temperature: 0.2,
                        num_predict: 250,
                    },
                }),
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Check HTTP response
        |--------------------------------------------------------------------------
        */

        if (!response.ok) {
            const errorText =
                await response.text();

            throw new Error(
                `Ollama HTTP ${response.status}: ${errorText}`
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Parse response
        |--------------------------------------------------------------------------
        */

        const result =
            await response.json();

        /*
        |--------------------------------------------------------------------------
        | Validate response
        |--------------------------------------------------------------------------
        */

        if (
            !result ||
            !result.response ||
            result.response.trim().length === 0
        ) {
            throw new Error(
                "Ollama returned an empty response."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Clean summary
        |--------------------------------------------------------------------------
        */

        const summary =
            cleanSummary(result.response);

        console.log(
            "Local AI summary generated successfully."
        );

        return summary;

    } catch (error) {

        /*
        |--------------------------------------------------------------------------
        | Ollama unavailable
        |--------------------------------------------------------------------------
        */

        console.error(
            "Local AI Summary Error:",
            error.message
        );

        console.log(
            "Using fallback extractive summary..."
        );

        /*
        |--------------------------------------------------------------------------
        | Fallback
        |--------------------------------------------------------------------------
        */

        return generateFallbackSummary(text);
    }
};

module.exports = {
    generateSummary,
};