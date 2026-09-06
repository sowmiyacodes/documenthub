const supabase = require("../../config/supabase");

const embeddingService = require("./embedding.service");
const llmService = require("./llm.service");

/*
|--------------------------------------------------------------------------
| Convert metadata into readable text
|--------------------------------------------------------------------------
*/

const formatMetadata = (metadata) => {
    if (!metadata) {
        return "";
    }

    try {
        if (typeof metadata === "string") {
            return metadata;
        }

        return Object.entries(metadata)
            .map(([key, value]) => {
                if (
                    value === null ||
                    value === undefined ||
                    value === ""
                ) {
                    return null;
                }

                if (typeof value === "object") {
                    return `${key}: ${JSON.stringify(value)}`;
                }

                return `${key}: ${value}`;
            })
            .filter(Boolean)
            .join("\n");

    } catch (error) {
        console.error(
            "Metadata formatting error:",
            error.message
        );

        return "";
    }
};

/*
|--------------------------------------------------------------------------
| Build document context
|--------------------------------------------------------------------------
*/

const buildDocumentContext = ({
    document,
    chunks,
}) => {

    const sections = [];

    /*
    |--------------------------------------------------------------------------
    | Document Summary
    |--------------------------------------------------------------------------
    */

    if (
        document &&
        document.summary &&
        document.summary.trim()
    ) {
        sections.push(`
DOCUMENT SUMMARY
----------------
${document.summary}
`);
    }

    /*
    |--------------------------------------------------------------------------
    | Extracted Metadata
    |--------------------------------------------------------------------------
    */

    const metadataText =
        formatMetadata(document?.metadata);

    if (metadataText.trim()) {
        sections.push(`
DOCUMENT METADATA
-----------------
${metadataText}
`);
    }

    /*
    |--------------------------------------------------------------------------
    | AI Category
    |--------------------------------------------------------------------------
    */

    if (
        document &&
        document.ai_category
    ) {
        sections.push(`
DOCUMENT CATEGORY
-----------------
${document.ai_category}
`);
    }

    /*
    |--------------------------------------------------------------------------
    | Relevant Document Chunks
    |--------------------------------------------------------------------------
    */

    if (
        chunks &&
        chunks.length > 0
    ) {

        const chunkText = chunks
            .map((chunk, index) => {
                return `
[Relevant Chunk ${index + 1}]
${chunk.chunk_text}
`;
            })
            .join("\n");

        sections.push(`
RELEVANT DOCUMENT CONTENT
-------------------------
${chunkText}
`);
    }

    return sections.join("\n");
};

/*
|--------------------------------------------------------------------------
| Ask AI about uploaded documents
|--------------------------------------------------------------------------
*/

const askQuestion = async ({
    userId,
    documentId,
    question,
}) => {

    try {

        /*
        |--------------------------------------------------------------------------
        | Validate question
        |--------------------------------------------------------------------------
        */

        if (
            !question ||
            question.trim().length === 0
        ) {
            throw new Error(
                "Question is required."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | 1. Fetch document information
        |--------------------------------------------------------------------------
        |
        | We now retrieve:
        |
        | - summary
        | - metadata
        | - category
        | - OCR text
        |
        | This allows RAG to answer questions using information already
        | extracted and stored in the documents table.
        |
        */

        let document = null;

        if (documentId) {

            const {
                data,
                error,
            } = await supabase
                .from("documents")
                .select(`
                    id,
                    user_id,
                    original_name,
                    summary,
                    metadata,
                    ai_category,
                    ocr_text
                `)
                .eq("id", documentId)
                .eq("user_id", userId)
                .single();

            if (error) {
                throw new Error(
                    `Failed to fetch document: ${error.message}`
                );
            }

            if (!data) {
                throw new Error(
                    "Document not found."
                );
            }

            document = data;
        }

        /*
        |--------------------------------------------------------------------------
        | 2. Generate embedding for user question
        |--------------------------------------------------------------------------
        */

        const queryEmbedding =
            await embeddingService.generateEmbedding(
                question
            );

        if (
            !queryEmbedding ||
            queryEmbedding.length === 0
        ) {
            throw new Error(
                "Failed to generate question embedding."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | 3. Retrieve relevant chunks
        |--------------------------------------------------------------------------
        */

        const {
            data,
            error,
        } = await supabase.rpc(
            "match_document_chunks",
            {
                query_embedding: queryEmbedding,
                match_user: userId,
                match_document: documentId || null,
                match_count: 5,
            }
        );

        if (error) {
            throw new Error(
                `Vector search failed: ${error.message}`
            );
        }

        const chunks =
            data || [];

        /*
        |--------------------------------------------------------------------------
        | 4. Build complete RAG context
        |--------------------------------------------------------------------------
        */

        const context =
            buildDocumentContext({
                document,
                chunks,
            });

        /*
        |--------------------------------------------------------------------------
        | 5. Check whether ANY information exists
        |--------------------------------------------------------------------------
        */

        if (
            !context ||
            context.trim().length === 0
        ) {

            return {
                answer:
                    "I couldn't find any information in the selected document.",
                sources: [],
            };
        }

        /*
        |--------------------------------------------------------------------------
        | 6. Send context to LLM
        |--------------------------------------------------------------------------
        */

        const answer =
            await llmService.generateAnswer({
                question,
                context,
            });

        /*
        |--------------------------------------------------------------------------
        | 7. Return answer + sources
        |--------------------------------------------------------------------------
        */

        return {
            answer,

            sources: chunks.map(
                (chunk) => ({
                    documentId:
                        chunk.document_id,

                    similarity:
                        chunk.similarity,
                })
            ),
        };

    } catch (error) {

        console.error(
            "RAG Error:",
            error.message
        );

        throw new Error(
            `RAG Error: ${error.message}`
        );
    }
};

module.exports = {
    askQuestion,
};