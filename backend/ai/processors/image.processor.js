const Tesseract = require("tesseract.js");
const { cleanText } = require("../utils/textCleaner");

const processImage = async (buffer) => {
    try {
        const {
            data: { text },
        } = await Tesseract.recognize(buffer, "eng", {
            logger: (m) => {
                if (m.status === "recognizing text") {
                    console.log(
                        `OCR Progress: ${(m.progress * 100).toFixed(0)}%`
                    );
                }
            },
        });

        return cleanText(text);
    } catch (error) {
        throw new Error(`Image OCR Failed: ${error.message}`);
    }
};

module.exports = {
    processImage,
};