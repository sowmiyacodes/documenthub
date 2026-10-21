const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

const splitPagesIntoChunks = (pages) => {
    const chunks = [];

    for (const page of pages) {
        const text = typeof page?.text === "string" ? page.text : "";
        const pageNumber = Number.isInteger(page?.pageNumber) && page.pageNumber > 0
            ? page.pageNumber
            : null;

        let start = 0;

        while (start < text.length) {
            const end = Math.min(start + CHUNK_SIZE, text.length);
            const chunkText = text.slice(start, end).trim();

            if (chunkText) {
                chunks.push({ text: chunkText, pageNumber });
            }

            if (end >= text.length) break;
            start += CHUNK_SIZE - CHUNK_OVERLAP;
        }
    }

    return chunks;
};

const selectRelevantChunks = (chunks, { minimumSimilarity = 0.1, limit = 8 } = {}) => {
    const scored = (chunks || [])
        .map((chunk) => ({
            ...chunk,
            similarity: Number(chunk.similarity ?? chunk.similarity_score ?? chunk.score),
        }))
        .filter((chunk) => (
            Number.isFinite(chunk.similarity)
            && chunk.similarity >= minimumSimilarity
            && typeof chunk.chunk_text === "string"
            && chunk.chunk_text.trim()
        ))
        .sort((left, right) => right.similarity - left.similarity);

    const selected = [];
    const selectedTokens = new Map();
    const perDocumentCount = new Map();

    for (const chunk of scored) {
        const documentId = String(chunk.document_id || "");
        const normalizedText = chunk.chunk_text.toLowerCase().replace(/\s+/g, " ").trim();
        const tokens = new Set(normalizedText.split(/\W+/).filter(Boolean));
        const duplicatesExisting = selected.some((item) => {
            if (String(item.document_id || "") !== documentId) return false;
            const prior = selectedTokens.get(item);
            if (!prior?.size || !tokens.size) return normalizedText === item.chunk_text;
            let shared = 0;
            for (const token of tokens) {
                if (prior.has(token)) shared++;
            }
            const union = prior.size + tokens.size - shared;
            const overlap = Math.min(prior.size, tokens.size);
            return union > 0 && overlap > 0 && shared / overlap >= 0.9;
        });

        if (duplicatesExisting) continue;

        const count = perDocumentCount.get(documentId) || 0;
        if (count >= 4) continue;
        selected.push(chunk);
        selectedTokens.set(chunk, tokens);
        perDocumentCount.set(documentId, count + 1);
        if (selected.length >= limit) break;
    }

    return selected;
};

module.exports = { splitPagesIntoChunks, selectRelevantChunks };
