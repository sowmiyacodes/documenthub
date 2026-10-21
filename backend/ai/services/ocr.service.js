const { downloadDocument } = require("../utils/fileDownloader");
const { extractPdfPages } = require("../processors/pdf.processor");
const { processImage } = require("../processors/image.processor");

const SUPPORTED_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
];

const extractPages = async (document) => {
    try {
        // Download file from Supabase Storage
        const buffer = await downloadDocument(document.storage_path);

        const mimeType = document.file_type.toLowerCase();

        // -------------------------------
        // PDF
        // -------------------------------
        if (mimeType === "application/pdf") {
            return await extractPdfPages(buffer);
        }

        // -------------------------------
        // Images
        // -------------------------------
        if (SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
            return [{ pageNumber: null, text: await processImage(buffer) }];
        }

        throw new Error(`Unsupported file type: ${mimeType}`);

    } catch (error) {
        throw new Error(`OCR Service Error: ${error.message}`);
    }
};

const extractText = async (document) => {
    const pages = await extractPages(document);
    return pages.map((page) => page.text).filter(Boolean).join("\n\n");
};

module.exports = {
    extractText,
    extractPages,
};