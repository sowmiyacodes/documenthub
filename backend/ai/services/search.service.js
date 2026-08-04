const supabase = require("../../config/supabase");
const embeddingService = require("./embedding.service");

const semanticSearch = async ({ userId, query }) => {

    if (!query || query.trim().length === 0) {
        throw new Error("Search query is required.");
    }

    // Generate query embedding
    const embedding = await embeddingService.generateEmbedding(query);

    // Search similar chunks
    const { data, error } = await supabase.rpc(
        "match_document_chunks",
        {
            query_embedding: embedding,
            match_user: userId,
            match_count: 10,
        }
    );

    if (error) {
        throw new Error(error.message);
    }

    return data || [];
};

module.exports = {
    semanticSearch,
};