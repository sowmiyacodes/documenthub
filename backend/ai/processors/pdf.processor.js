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
const extractPdfPages = async (buffer) => {
    try {
        console.log("Starting PDF text extraction...");

        const embeddedPages = [];
        let pageNumber = 0;
        const data = await pdfParse(buffer, {
            pagerender: async (pageData) => {
                pageNumber++;
                const textContent = await pageData.getTextContent({
                    normalizeWhitespace: false,
                    disableCombineTextItems: false,
                });
                let lastY;
                let text = "";

                for (const item of textContent.items) {
                    if (lastY === item.transform[5] || lastY === undefined) {
                        text += item.str;
                    } else {
                        text += `\n${item.str}`;
                    }
                    lastY = item.transform[5];
                }

                embeddedPages.push({
                    pageNumber,
                    text: cleanText(text),
                });
                return text;
            },
        });

        const embeddedText = embeddedPages.map((page) => page.text).join("\n");

        if (cleanText(embeddedText || data.text || "").trim().length > 50) {
            console.log(
                `PDF text extraction completed. Characters extracted: ${embeddedText.length}`
            );

            return embeddedPages;
        }

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

        const ocrPages = [];
        pageNumber = 0;

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
            ocrPages.push({
                pageNumber,
                text: cleanText(pageText || ""),
            });
        }

        const finalText = cleanText(ocrPages.map((page) => page.text).join("\n"));

        console.log(
            `PDF OCR completed. Characters extracted: ${finalText.length}`
        );

        return ocrPages;
    } catch (error) {
        throw new Error(
            `PDF Processing Failed: ${error.message}`
        );
    }
};

const processPdf = async (buffer) => {
    const pages = await extractPdfPages(buffer);
    return pages.map((page) => page.text).filter(Boolean).join("\n\n");
};

module.exports = {
    processPdf,
    extractPdfPages,
};