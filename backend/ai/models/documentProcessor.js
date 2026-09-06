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
| Complete AI pipeline:
|
| 1. OCR
| 2. Metadata extraction
| 3. Category detection
| 4. Structured entity extraction
| 5. Summary generation
| 6. Embeddings / vector storage
| 7. Database update
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
        | STEP 1
        | Update processing status
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
        | STEP 2
        | Fetch document
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


        if (
            documentError ||
            !document
        ) {
            throw new Error(
                "Document not found."
            );
        }


        console.log(
            `Processing: ${document.original_name}`
        );


        /*
        |--------------------------------------------------------------------------
        | STEP 3
        | OCR
        |--------------------------------------------------------------------------
        */

        console.log(
            "Step 1/7: Extracting text..."
        );


        const extractedText =
            await ocrService.extractText(
                document
            );


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
        | STEP 4
        | Metadata
        |--------------------------------------------------------------------------
        */

        console.log(
            "Step 2/7: Extracting metadata..."
        );


        const metadata =
            await metadataService.extractMetadata(
                extractedText
            );


        console.log(
            "Metadata extracted successfully."
        );


        /*
        |--------------------------------------------------------------------------
        | STEP 5
        | Category
        |--------------------------------------------------------------------------
        */

        console.log(
            "Step 3/7: Detecting category..."
        );


        const aiCategory =
            await categoryService.detectCategory(
                extractedText
            );


        console.log(
            `Detected category: ${aiCategory}`
        );


        /*
        |--------------------------------------------------------------------------
        | STEP 6
        | Structured Entity Extraction
        |--------------------------------------------------------------------------
        */

        console.log(
            "Step 4/7: Extracting structured entities..."
        );


        const structuredData =
            await entityService.extractEntities(
                extractedText
            );


        console.log(
            `Detected document type: ${structuredData.documentType}`
        );


        console.log(
            "Structured entities:",
            structuredData.entities
        );


        /*
        |--------------------------------------------------------------------------
        | STEP 7
        | Summary
        |--------------------------------------------------------------------------
        */

        console.log(
            "Step 5/7: Generating summary..."
        );


        const summary =
            await summaryService.generateSummary(
                extractedText
            );


        if (summary) {

            console.log(
                "Summary generated successfully."
            );

        } else {

            console.log(
                "Summary generation returned empty result."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | STEP 8
        | Embeddings
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
        | STEP 9
        | Update database
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

                /*
                |--------------------------------------------------------------------------
                | Processing
                |--------------------------------------------------------------------------
                */

                processing_status:
                    "completed",

                processing_error:
                    null,

                processed_at:
                    new Date().toISOString(),


                /*
                |--------------------------------------------------------------------------
                | OCR
                |--------------------------------------------------------------------------
                */

                ocr_text:
                    extractedText,


                /*
                |--------------------------------------------------------------------------
                | Existing metadata
                |--------------------------------------------------------------------------
                */

                metadata:
                    metadata,


                /*
                |--------------------------------------------------------------------------
                | AI category
                |--------------------------------------------------------------------------
                */

                ai_category:
                    aiCategory,


                /*
                |--------------------------------------------------------------------------
                | Structured AI entities
                |--------------------------------------------------------------------------
                */

                structured_data:
                    structuredData,


                /*
                |--------------------------------------------------------------------------
                | Summary
                |--------------------------------------------------------------------------
                */

                summary:
                    summary || null,
            })
            .eq("id", documentId);


        if (updateError) {

            throw new Error(
                `Failed to update document: ${updateError.message}`
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


    } catch (error) {

        console.error(
            "AI Processing Error:",
            error
        );


        /*
        |--------------------------------------------------------------------------
        | Mark document as failed
        |--------------------------------------------------------------------------
        */

        try {

            await supabase
                .from("documents")
                .update({

                    processing_status:
                        "failed",

                    processing_error:
                        error.message,

                })
                .eq("id", documentId);

        } catch (updateError) {

            console.error(
                "Failed to update processing error:",
                updateError.message
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Important
        |--------------------------------------------------------------------------
        |
        | Do NOT throw again here.
        |
        | The document upload has already succeeded.
        | Only AI processing failed.
        |--------------------------------------------------------------------------
        */

    }
};


module.exports = {
    processDocument,
};