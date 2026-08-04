const pdfParse = require("pdf-parse");
const { cleanText } = require("../utils/textCleaner");

const processPdf = async (buffer) => {
    try {
        const data = await pdfParse(buffer);

        const extractedText = cleanText(data.text);

        return extractedText;
    } catch (error) {
        throw new Error(`PDF Processing Failed: ${error.message}`);
    }
};

module.exports = {
    processPdf,
};