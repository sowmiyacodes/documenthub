const supabase = require("../../config/supabase");
const { splitPagesIntoChunks } = require("../utils/documentChunks");

/**
 * Store document embeddings
 */
const storeEmbedding = async ({
    documentId,
    userId,
    embeddingGenerator,
    pages,
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

    const sourcePages = Array.isArray(pages) && pages.length
        ? pages
        : [{ pageNumber: null, text: text || "" }];
    const chunks = splitPagesIntoChunks(sourcePages);

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await embeddingGenerator(chunk.text);

        const { error } = await supabase.rpc(
            "insert_document_chunk",
            {
                p_document_id: documentId,
                p_user_id: userId,
                p_chunk_index: i,
                p_chunk_text: chunk.text,
                p_embedding: embedding,
            }
        );

        if (error) {
            throw new Error(error.message);
        }

        if (chunk.pageNumber !== null) {
            const { error: pageError } = await supabase
                .from("document_chunks")
                .update({ page_number: chunk.pageNumber })
                .eq("document_id", documentId)
                .eq("chunk_index", i);

            if (pageError) {
                throw new Error(pageError.message);
            }
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