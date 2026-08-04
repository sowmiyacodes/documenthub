import api from "./api";

/*
=========================================
Ask AI
=========================================
*/

export const askAI = async ({ question, documentId }) => {
    const response = await api.post("/ai/chat", {
        question,
        documentId,
    });

    return response.data;
};

/*
=========================================
Semantic Search
=========================================
*/

export const semanticSearch = async (query) => {
    const response = await api.post("/ai/search", {
        query,
    });

    return response.data;
};

/*
=========================================
Document Summary
=========================================
*/

export const getSummary = async (documentId) => {
    const response = await api.get(
        `/ai/document/${documentId}/summary`
    );

    return response.data;
};

/*
=========================================
Processing Status
=========================================
*/

export const getStatus = async (documentId) => {
    const response = await api.get(
        `/ai/document/${documentId}/status`
    );

    return response.data;
};