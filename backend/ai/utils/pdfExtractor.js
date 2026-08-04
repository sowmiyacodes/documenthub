const pdfParse = require("pdf-parse");

const extractPdfText = async (buffer) => {
    const result = await pdfParse(buffer);

    return result.text.trim();
};

module.exports = {
    extractPdfText,
};