const pdfParse = require("pdf-parse");
const { pdf } = require("pdf-to-img");

const { cleanText } = require("../utils/textCleaner");
const { processImage } = require("./image.processor");

/**
 * Process a PDF document.
 *
 * Strategy:
 * 1. Try extracting embedded text.
 * 2. If there is no meaningful text, treat the PDF as scanned.
 * 3. Render each page into an image.
 * 4. Run the existing image OCR pipeline on every page.
 *
 * This is generic and supports different kinds of documents.
 */
const processPdf = async (buffer) => {
    try {
        console.log("Starting PDF text extraction...");

        // ---------------------------------------------
        // STEP 1: Normal PDF text extraction
        // ---------------------------------------------

        const data = await pdfParse(buffer);

        const extractedText = cleanText(data.text || "");

        if (extractedText.trim().length > 50) {
            console.log(
                `PDF text extraction completed. Characters extracted: ${extractedText.length}`
            );

            return extractedText;
        }

        // ---------------------------------------------
        // STEP 2: Scanned PDF detected
        // ---------------------------------------------

        console.log(
            "No meaningful embedded text found."
        );

        console.log(
            "PDF appears to be scanned. Starting page OCR..."
        );

        // ---------------------------------------------
        // STEP 3: Convert PDF pages to images
        // ---------------------------------------------

        const document = await pdf(buffer, {
            scale: 2,
        });

        let ocrText = "";
        let pageNumber = 0;

        for await (const page of document) {
            pageNumber++;

            console.log(
                `Processing PDF page ${pageNumber} with OCR...`
            );

            /*
             * pdf-to-img returns the rendered page as
             * an image buffer directly.
             */
            const pageBuffer = page;

            if (!Buffer.isBuffer(pageBuffer)) {
                throw new Error(
                    `Unable to render PDF page ${pageNumber} as an image.`
                );
            }

            const pageText = await processImage(pageBuffer);

            if (pageText && pageText.trim().length > 0) {
                ocrText += `\n${pageText}`;
            }
        }

        // ---------------------------------------------
        // STEP 4: Clean combined OCR text
        // ---------------------------------------------

        const finalText = cleanText(ocrText);

        console.log(
            `PDF OCR completed. Characters extracted: ${finalText.length}`
        );

        return finalText;
    } catch (error) {
        throw new Error(
            `PDF Processing Failed: ${error.message}`
        );
    }
};

module.exports = {
    processPdf,
};