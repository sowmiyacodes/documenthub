const supabase = require("../../config/supabase");

// AI Services
const ocrService = require("../services/ocr.service");
const metadataService = require("../services/metadata.service");
const categoryService = require("../services/category.service");
const summaryService = require("../services/summary.service");
const embeddingService = require("../services/embedding.service");
const vectorService = require("../services/vector.service");

const processDocument = async (documentId) => {
    try {
        console.log(`Starting AI Processing for Document: ${documentId}`);

        // --------------------------------------------------
        // Update Status -> Processing
        // --------------------------------------------------
        await supabase
            .from("documents")
            .update({
                processing_status: "processing",
            })
            .eq("id", documentId);

        // --------------------------------------------------
        // Fetch Document Details
        // --------------------------------------------------
        const { data: document, error } = await supabase
            .from("documents")
            .select("*")
            .eq("id", documentId)
            .single();

        if (error || !document) {
            throw new Error("Document not found.");
        }

        /*
        ======================================================
        STEP 1 : OCR
        ======================================================
        */

        const extractedText = await ocrService.extractText(document);

        
        if (!extractedText || extractedText.trim().length === 0) {
            throw new Error("No text could be extracted from the document.");
        }
        const metadata = await metadataService.extractMetadata(extractedText);
        console.log("Metadata:", metadata);

        const aiCategory = await categoryService.detectCategory(extractedText);
        console.log("Category:", aiCategory);

        const summary = await summaryService.generateSummary(extractedText);
        console.log("Summary:", summary);

        /*
        ======================================================
        STEP 5 : Embedding
        ======================================================
        */

        await vectorService.storeEmbedding({
            documentId,
            userId: document.user_id,
            embeddingGenerator: embeddingService.generateEmbedding,
            text: extractedText,
        });

        /*
        ======================================================
        STEP 7 : Update Database
        ======================================================
        */

        await supabase
            .from("documents")
            .update({
                processing_status: "completed",
                processed_at: new Date().toISOString(),

                ocr_text: extractedText,
                metadata,
                ai_category: aiCategory,
                summary,
            })
            .eq("id", documentId);

        console.log(`AI Processing Completed : ${documentId}`);
    } catch (error) {
        console.error(error.message);

        await supabase
            .from("documents")
            .update({
                processing_status: "failed",
                processing_error: null,
            })
            .eq("id", documentId);
    }
};

module.exports = {
    processDocument,
};