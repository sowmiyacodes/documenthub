const { downloadDocument } = require("../utils/fileDownloader");
const { processPdf } = require("../processors/pdf.processor");
const { processImage } = require("../processors/image.processor");

const SUPPORTED_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
];

const extractText = async (document) => {
    try {
        // Download file from Supabase Storage
        const buffer = await downloadDocument(document.storage_path);

        const mimeType = document.file_type.toLowerCase();

        // -------------------------------
        // PDF
        // -------------------------------
        if (mimeType === "application/pdf") {
            return await processPdf(buffer);
        }

        // -------------------------------
        // Images
        // -------------------------------
        if (SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
            return await processImage(buffer);
        }

        throw new Error(`Unsupported file type: ${mimeType}`);

    } catch (error) {
        throw new Error(`OCR Service Error: ${error.message}`);
    }
};

module.exports = {
    extractText,
};