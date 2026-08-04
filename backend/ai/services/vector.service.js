const supabase = require("../../config/supabase");

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

/**
 * Split text into overlapping chunks
 * This version:

✅ Uses Supabase RPC
✅ Chunks the document
✅ Generates embeddings
✅ Stores embeddings via PostgreSQL
✅ Updates chunk_count
 */




const splitIntoChunks = (text) => {
    const chunks = [];

    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + CHUNK_SIZE, text.length);

        const chunk = text.slice(start, end).trim();

        if (chunk.length > 0) {
            chunks.push(chunk);
        }

        if (end >= text.length) break;

        start += CHUNK_SIZE - CHUNK_OVERLAP;
    }

    return chunks;
};

/**
 * Store document embeddings
 */
const storeEmbedding = async ({
    documentId,
    userId,
    embeddingGenerator,
    text,
}) => {
    // Delete old chunks if document is reprocessed
    const { error: deleteError } = await supabase
        .from("document_chunks")
        .delete()
        .eq("document_id", documentId);

    if (deleteError) {
        throw new Error(deleteError.message);
    }

    const chunks = splitIntoChunks(text);

    for (let i = 0; i < chunks.length; i++) {
        const embedding = await embeddingGenerator(chunks[i]);

        const { error } = await supabase.rpc(
            "insert_document_chunk",
            {
                p_document_id: documentId,
                p_user_id: userId,
                p_chunk_index: i,
                p_chunk_text: chunks[i],
                p_embedding: embedding,
            }
        );

        if (error) {
            throw new Error(error.message);
        }
    }

    const { error: updateError } = await supabase
        .from("documents")
        .update({
            chunk_count: chunks.length,
        })
        .eq("id", documentId);

    if (updateError) {
        throw new Error(updateError.message);
    }

    return true;
};

module.exports = {
    storeEmbedding,
};