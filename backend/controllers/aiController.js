const supabase = require("../config/supabase");
const ragService = require("../ai/services/rag.service");
const searchService = require("../ai/services/search.service");
// ---------------------------------------------------
// Ask AI (RAG)
// ---------------------------------------------------
// ---------------------------------------------------
// Ask AI (RAG)
// ---------------------------------------------------
const askQuestion = async (req, res) => {
    try {

        const { question, documentId } = req.body;

        if (!question || question.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Question is required.",
            });
        }

        const result = await ragService.askQuestion({
            userId: req.user.id,
            documentId,
            question,
        });

        return res.status(200).json({
            success: true,
            answer: result.answer,
            sources: result.sources,
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// ---------------------------------------------------
// Get AI Summary
// ---------------------------------------------------
const getSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const { data, error } = await supabase
            .from("documents")
            .select("id, original_name, summary, processing_status")
            .eq("id", id)
            .eq("user_id", userId)
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                message: "Document not found.",
            });
        }

        return res.status(200).json({
            success: true,
            document: data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// ---------------------------------------------------
// Get Processing Status
// ---------------------------------------------------
const getStatus = async (req, res) => {
    try {

        const userId = req.user.id;
        const { id } = req.params;

        const { data, error } = await supabase
            .from("documents")
            .select(`
                id,
                original_name,
                processing_status,
                ai_category,
                processed_at,
                uploaded_at
            `)
            .eq("id", id)
            .eq("user_id", userId)
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                message: "Document not found."
            });
        }

        return res.status(200).json({
            success: true,
            status: data
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// ---------------------------------------------------
// Semantic Search
// ---------------------------------------------------
const semanticSearch = async (req, res) => {
    try {

        const { query } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Search query is required."
            });
        }

        const results = await searchService.semanticSearch({
            userId: req.user.id,
            query,
        });

        return res.status(200).json({
            success: true,
            count: results.length,
            results,
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};
module.exports = {
    askQuestion,
    getSummary,
        semanticSearch,
     getStatus,
};