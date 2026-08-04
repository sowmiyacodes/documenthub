const supabase = require("../../config/supabase");

const embeddingService = require("./embedding.service");
const llmService = require("./llm.service");

/**
 * Ask a question about a user's uploaded documents
 */
const askQuestion = async ({ userId, question }) => {
    try {

        if (!question || question.trim().length === 0) {
            throw new Error("Question is required.");
        }

        // Generate embedding for the question
        const queryEmbedding =
            await embeddingService.generateEmbedding(question);

        // Retrieve most relevant chunks
        const { data, error } = await supabase.rpc(
            "match_document_chunks",
            {
                query_embedding: queryEmbedding,
                match_user: userId,
                match_count: 5,
            }
        );

        if (error) {
            throw new Error(error.message);
        }

        if (!data || data.length === 0) {
            return {
                answer:
                    "I couldn't find any relevant information in your uploaded documents.",
                sources: [],
            };
        }

        // Combine retrieved chunks into one context
        const context = data
            .map((chunk) => chunk.chunk_text)
            .join("\n\n");

        // Generate final answer
        const answer = await llmService.generateAnswer({
            question,
            context,
        });

        return {
            answer,
            sources: data.map((chunk) => ({
                documentId: chunk.document_id,
                similarity: chunk.similarity,
            })),
        };

    } catch (error) {
        throw new Error(`RAG Error: ${error.message}`);
    }
};

module.exports = {
    askQuestion,
};