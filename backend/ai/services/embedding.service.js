const { pipeline } = require("@xenova/transformers");

let extractor = null;

/*
 * Load the embedding model only once.
 */
const loadModel = async () => {
    if (!extractor) {
        console.log("Loading Embedding Model...");

        extractor = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );

        console.log("Embedding Model Loaded.");
    }

    return extractor;
};

const generateEmbedding = async (text) => {
    if (!text || text.trim().length === 0) {
        return [];
    }

    const model = await loadModel();

    const output = await model(text, {
        pooling: "mean",
        normalize: true,
    });

    return Array.from(output.data);
};

module.exports = {
    generateEmbedding,
};