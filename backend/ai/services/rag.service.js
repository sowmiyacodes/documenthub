const supabase = require("../../config/supabase");
const embeddingService = require("./embedding.service");
const llmService = require("./llm.service");
const { selectRelevantChunks } = require("../utils/documentChunks");

const NO_EVIDENCE_ANSWER =
    "I couldn't find enough relevant information in your uploaded documents to answer reliably.";
const MINIMUM_SIMILARITY = 0.1;
const RETRIEVAL_LIMIT = 12;
const SOURCE_LIMIT = 8;
const EXCERPT_LIMIT = 640;

const createExcerpt = (text, question) => {
    const cleanText = text.trim();
    if (cleanText.length <= EXCERPT_LIMIT) return cleanText;

    const stopWords = new Set(["about", "does", "from", "have", "that", "this", "what", "when", "where", "which", "with"]);
    const terms = (question.toLowerCase().match(/[a-z0-9]{4,}/g) || [])
        .filter((term) => !stopWords.has(term))
        .sort((left, right) => right.length - left.length);
    const lowerText = cleanText.toLowerCase();
    const matchPosition = terms
        .map((term) => lowerText.indexOf(term))
        .filter((position) => position >= 0)
        .sort((left, right) => left - right)[0];
    const start = Math.min(
        Math.max((matchPosition ?? 0) - 120, 0),
        cleanText.length - EXCERPT_LIMIT
    );
    const end = start + EXCERPT_LIMIT;

    return `${start ? "… " : ""}${cleanText.slice(start, end).trim()}${end < cleanText.length ? " …" : ""}`;
};

const getChunkIndex = (chunk) => {
    const value = chunk.chunk_index ?? chunk.chunkIndex;
    return Number.isInteger(Number(value)) ? Number(value) : null;
};

const enrichSources = async ({ chunks, userId, question }) => {
    const documentIds = [...new Set(chunks.map((chunk) => chunk.document_id).filter(Boolean))];
    if (!documentIds.length) return [];

    const { data: documents, error: documentsError } = await supabase
        .from("documents")
        .select("id, original_name")
        .eq("user_id", userId)
        .in("id", documentIds);

    if (documentsError) throw new Error(`Failed to verify source ownership: ${documentsError.message}`);

    const documentsById = new Map((documents || []).map((document) => [String(document.id), document]));
    const ownedChunks = chunks.filter((chunk) => documentsById.has(String(chunk.document_id)));
    if (!ownedChunks.length) return [];

    const ownedDocumentIds = [...new Set(ownedChunks.map((chunk) => chunk.document_id))];
    const chunkIndexes = [...new Set(ownedChunks.map(getChunkIndex).filter((index) => index !== null))];
    const chunkTexts = [...new Set(ownedChunks.map((chunk) => chunk.chunk_text))];

    let chunkQuery = supabase
        .from("document_chunks")
        .select("document_id, chunk_index, chunk_text, page_number")
        .in("document_id", ownedDocumentIds);

    if (chunkIndexes.length === ownedChunks.length) {
        chunkQuery = chunkQuery.in("chunk_index", chunkIndexes);
    } else {
        chunkQuery = chunkQuery.in("chunk_text", chunkTexts);
    }

    const { data: chunkMetadata, error: chunkMetadataError } = await chunkQuery;
    if (chunkMetadataError) {
        throw new Error(`Failed to load source metadata: ${chunkMetadataError.message}`);
    }

    const rows = chunkMetadata || [];
    return ownedChunks.map((chunk) => {
        const document = documentsById.get(String(chunk.document_id));
        const chunkIndex = getChunkIndex(chunk);
        const matchingRows = rows.filter((row) => (
            String(row.document_id) === String(chunk.document_id)
            && (
                chunkIndex !== null
                    ? Number(row.chunk_index) === chunkIndex
                    : row.chunk_text === chunk.chunk_text
            )
        ));
        const pageNumbers = [...new Set(
            matchingRows
                .map((row) => Number(row.page_number))
                .filter((page) => Number.isInteger(page) && page > 0)
        )];
        const excerpt = createExcerpt(chunk.chunk_text, question);

        return {
            citationNumber: 0,
            documentId: document.id,
            documentName: document.original_name,
            chunkId: chunk.chunk_id ?? chunk.id ?? null,
            pageNumber: pageNumbers.length === 1 ? pageNumbers[0] : null,
            excerpt,
            similarity: chunk.similarity,
            chunkText: chunk.chunk_text,
        };
    });
};

const buildEvidenceContext = (sources) => sources.map((source) => {
    return [
        `[${source.citationNumber}] Source: ${JSON.stringify({
            documentName: source.documentName,
            pageNumber: source.pageNumber,
        })}`,
        `Untrusted document evidence (JSON string): ${JSON.stringify(source.chunkText)}`,
    ].join("\n");
}).join("\n\n");

const removeUnknownCitationMarkers = (answer, sources) => {
    const validNumbers = new Set(sources.map((source) => String(source.citationNumber)));
    return answer.replace(/\[(\d+)\]/g, (marker, number) => (
        validNumbers.has(number) ? marker : ""
    )).trim();
};

const askQuestion = async ({ userId, documentId, question }) => {
    const cleanQuestion = typeof question === "string" ? question.trim() : "";
    if (!cleanQuestion) throw new Error("Question is required.");
    if (cleanQuestion.length > 10000) throw new Error("Question must be 10,000 characters or fewer.");

    try {
        const queryEmbedding = await embeddingService.generateEmbedding(cleanQuestion);
        if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
            throw new Error("Question embedding generation returned no vector.");
        }

        const { data, error } = await supabase.rpc("match_document_chunks", {
            query_embedding: queryEmbedding,
            match_user: userId,
            match_document: documentId || null,
            match_count: RETRIEVAL_LIMIT,
        });

        if (error) throw new Error(`Vector search failed: ${error.message}`);

        const relevantChunks = selectRelevantChunks(data, {
            minimumSimilarity: MINIMUM_SIMILARITY,
            limit: SOURCE_LIMIT,
        });
        if (!relevantChunks.length) {
            return { answer: NO_EVIDENCE_ANSWER, sources: [], insufficientEvidence: true };
        }

        const sources = await enrichSources({ chunks: relevantChunks, userId, question: cleanQuestion });
        if (!sources.length) {
            return { answer: NO_EVIDENCE_ANSWER, sources: [], insufficientEvidence: true };
        }

        sources.forEach((source, index) => {
            source.citationNumber = index + 1;
        });

        const generatedAnswer = await llmService.generateAnswer({
            question: cleanQuestion,
            context: buildEvidenceContext(sources),
        });
        if (typeof generatedAnswer !== "string" || !generatedAnswer.trim()) {
            throw new Error("The language model returned an empty answer.");
        }

        const answer = removeUnknownCitationMarkers(generatedAnswer, sources);
        const containsCitation = sources.some((source) => (
            new RegExp(`\\[${source.citationNumber}\\]`).test(answer)
        ));
        if (!containsCitation) {
            return { answer: NO_EVIDENCE_ANSWER, sources: [], insufficientEvidence: true };
        }

        const citedSources = sources.filter((source) => (
            new RegExp(`\\[${source.citationNumber}\\]`).test(answer)
        ));

        return {
            answer,
            sources: citedSources.map(({ chunkText, ...source }) => source),
            insufficientEvidence: false,
        };
    } catch (error) {
        console.error("RAG Error:", error.message);
        throw new Error(`RAG Error: ${error.message}`);
    }
};

module.exports = { askQuestion };
