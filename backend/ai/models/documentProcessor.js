const supabase = require("../../config/supabase");

// AI Services
const ocrService = require("../services/ocr.service");
const metadataService = require("../services/metadata.service");
const categoryService = require("../services/category.service");
const entityService = require("../services/entity.service");
const summaryService = require("../services/summary.service");
const embeddingService = require("../services/embedding.service");
const vectorService = require("../services/vector.service");

/*
|--------------------------------------------------------------------------
| Process Document
|--------------------------------------------------------------------------
|
| Complete AI processing pipeline:
|
| 1. Fetch document
| 2. OCR
| 3. Metadata extraction
| 4. Category detection
| 5. Structured entity extraction
| 6. Summary generation
| 7. Embeddings + vector storage
| 8. Save AI results
|
|--------------------------------------------------------------------------
*/

const processDocument = async (documentId) => {
    try {
        console.log(
            `Starting AI Processing for Document: ${documentId}`
        );

        /*
        |--------------------------------------------------------------------------
        | STEP 1: Update Processing Status
        |--------------------------------------------------------------------------
        */

        const { error: statusError } = await supabase
            .from("documents")
            .update({
                processing_status: "processing",
                processing_error: null,
            })
            .eq("id", documentId);

        if (statusError) {
            throw new Error(
                `Failed to update processing status: ${statusError.message}`
            );
        }

        /*
        |--------------------------------------------------------------------------
        | STEP 2: Fetch Document
        |--------------------------------------------------------------------------
        */

        const {
            data: document,
            error: documentError,
        } = await supabase
            .from("documents")
            .select("*")
            .eq("id", documentId)
            .single();

        if (documentError || !document) {
            throw new Error(
                documentError?.message ||
                "Document not found."
            );
        }

        console.log(
            `Processing: ${document.original_name}`
        );

        /*
        |--------------------------------------------------------------------------
        | STEP 3: OCR
        |--------------------------------------------------------------------------
        */

        console.log("Step 1/7: Extracting text...");

        const extractedText =
            await ocrService.extractText(document);

        if (
            !extractedText ||
            extractedText.trim().length === 0
        ) {
            throw new Error(
                "No text could be extracted from the document."
            );
        }

        console.log(
            `OCR completed. Characters extracted: ${extractedText.length}`
        );

        /*
        |--------------------------------------------------------------------------
        | STEP 4: General Metadata
        |--------------------------------------------------------------------------
        */

        console.log("Step 2/7: Extracting metadata...");

        const metadata =
            await metadataService.extractMetadata(
                extractedText
            );

        console.log(
            "Metadata extracted successfully."
        );

        /*
        |--------------------------------------------------------------------------
        | STEP 5: AI Category
        |--------------------------------------------------------------------------
        */

        console.log("Step 3/7: Detecting category...");

        const aiCategory =
            await categoryService.detectCategory(
                extractedText
            );

        console.log(
            `Detected category: ${aiCategory}`
        );

        /*
        |--------------------------------------------------------------------------
        | STEP 6: Structured Entity Extraction
        |--------------------------------------------------------------------------
        |
        | Example:
        |
        | Resume:
        | {
        |   name,
        |   email,
        |   phone,
        |   degree,
        |   institution,
        |   cgpa,
        |   skills
        | }
        |
        | Aadhaar:
        | {
        |   name,
        |   dateOfBirth,
        |   gender,
        |   aadhaarNumber,
        |   address
        | }
        |
        |--------------------------------------------------------------------------
        */

        console.log(
            "Step 4/7: Extracting structured entities..."
        );

        const entities =
            await entityService.extractEntities(
                extractedText
            );

        console.log(
            "Detected document type:",
            entities.documentType
        );

        console.log(
            "Structured entities:",
            entities.fields
        );

        /*
        |--------------------------------------------------------------------------
        | Combine Existing Metadata + Structured Entities
        |--------------------------------------------------------------------------
        |
        | We keep your existing metadata fields and add:
        |
        | metadata.entities
        |
        | metadata.structuredData
        |
        |--------------------------------------------------------------------------
        */

        const combinedMetadata = {
            ...metadata,

            documentType:
                entities.documentType ||
                metadata.documentType ||
                "Others",

            entities: entities.fields || {},

            extraction: {
                method: "rule-based",
                version: "1.0",
            },
        };

        /*
        |--------------------------------------------------------------------------
        | STEP 7: Generate Summary
        |--------------------------------------------------------------------------
        */

        console.log(
            "Step 5/7: Generating summary..."
        );

        const summary =
            await summaryService.generateSummary(
                extractedText
            );

        console.log(
            summary
                ? "Summary generated successfully."
                : "Summary generation returned empty result."
        );

        /*
        |--------------------------------------------------------------------------
        | STEP 8: Generate Embeddings
        |--------------------------------------------------------------------------
        */

        console.log(
            "Step 6/7: Generating embeddings..."
        );

        await vectorService.storeEmbedding({
            documentId,
            userId: document.user_id,
            embeddingGenerator:
                embeddingService.generateEmbedding,
            text: extractedText,
        });

        console.log(
            "Embeddings stored successfully."
        );

        /*
        |--------------------------------------------------------------------------
        | STEP 9: Save Everything to Database
        |--------------------------------------------------------------------------
        */

        console.log(
            "Step 7/7: Updating document..."
        );

        const {
            error: updateError,
        } = await supabase
            .from("documents")
            .update({
                processing_status: "completed",

                processed_at:
                    new Date().toISOString(),

                ocr_text:
                    extractedText,

                metadata:
                    combinedMetadata,

                ai_category:
                    aiCategory,

                summary:
                    summary || null,

                processing_error:
                    null,
            })
            .eq("id", documentId);

        if (updateError) {
            throw new Error(
                `Failed to save AI results: ${updateError.message}`
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Completed
        |--------------------------------------------------------------------------
        */

        console.log(
            `AI Processing Completed: ${documentId}`
        );

        return {
            success: true,
            documentId,
            documentType:
                entities.documentType,
            category:
                aiCategory,
            metadata:
                combinedMetadata,
            summary,
        };

    } catch (error) {

        console.error(
            `AI Processing Failed for ${documentId}:`,
            error
        );

        /*
        |--------------------------------------------------------------------------
        | Save actual error instead of null
        |--------------------------------------------------------------------------
        */

        try {
            await supabase
                .from("documents")
                .update({
                    processing_status: "failed",

                    processing_error:
                        error.message ||
                        "Unknown AI processing error.",
                })
                .eq("id", documentId);

        } catch (dbError) {

            console.error(
                "Failed to save processing error:",
                dbError.message
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Re-throw error
        |--------------------------------------------------------------------------
        */

        throw error;
    }
};

module.exports = {
    processDocument,
};