const Tesseract = require("tesseract.js");
const sharp = require("sharp");
const { cleanText } = require("../utils/textCleaner");

/**
 * Preprocess image to improve OCR accuracy.
 *
 * Works with different document types:
 * - Aadhaar
 * - PAN
 * - Passports
 * - Certificates
 * - Receipts
 * - Invoices
 * - Medical documents
 * - Scanned documents
 * - General images containing text
 */
const preprocessImage = async (buffer) => {
    try {
        return await sharp(buffer)
            // Automatically correct image orientation using EXIF data
            .rotate()

            // Resize small images while keeping aspect ratio
            .resize({
                width: 2200,
                withoutEnlargement: false,
                fit: "inside",
            })

            // Convert to grayscale
            .grayscale()

            // Improve contrast and brightness distribution
            .normalize()

            // Sharpen text edges
            .sharpen()

            // Output as PNG for OCR
            .png()
            .toBuffer();
    } catch (error) {
        throw new Error(
            `Image Preprocessing Failed: ${error.message}`
        );
    }
};

/**
 * Extract text from an image using Tesseract OCR.
 */
const processImage = async (buffer) => {
    try {
        console.log("Starting image preprocessing...");

        const processedBuffer = await preprocessImage(buffer);

        console.log("Image preprocessing completed.");
        console.log("Starting OCR...");

        const {
            data: { text },
        } = await Tesseract.recognize(
            processedBuffer,
            "eng",
            {
                logger: (m) => {
                    if (m.status === "recognizing text") {
                        console.log(
                            `OCR Progress: ${(m.progress * 100).toFixed(0)}%`
                        );
                    }
                },
            }
        );

        const cleanedText = cleanText(text);

        console.log(
            `OCR completed. Characters extracted: ${cleanedText.length}`
        );

        return cleanedText;
    } catch (error) {
        throw new Error(
            `Image OCR Failed: ${error.message}`
        );
    }
};

module.exports = {
    processImage,
};