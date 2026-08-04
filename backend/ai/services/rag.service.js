const supabase = require("../../config/supabase");

const embeddingService = require("./embedding.service");
const llmService = require("./llm.service");

/**
 * Ask AI about uploaded documents
 */
const askQuestion = async ({
    userId,
    documentId,
    question,
}) => {
    try {

        if (!question || question.trim().length === 0) {
            throw new Error("Question is required.");
        }

        // Generate embedding for the question
        const queryEmbedding =
            await embeddingService.generateEmbedding(question);

        // Retrieve relevant chunks
        const { data, error } = await supabase.rpc(
            "match_document_chunks",
            {
                query_embedding: queryEmbedding,
                match_user: userId,
                match_document: documentId || null,
                match_count: 5,
            }
        );

        if (error) {
            throw new Error(error.message);
        }

        if (!data || data.length === 0) {
            return {
                answer:
                    "I couldn't find any relevant information in the selected document.",
                sources: [],
            };
        }

        const context = data
            .map(chunk => chunk.chunk_text)
            .join("\n\n");

        const answer = await llmService.generateAnswer({
            question,
            context,
        });

        return {
            answer,
            sources: data.map(chunk => ({
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