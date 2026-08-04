const Tesseract = require("tesseract.js");

const extractImageText = async (buffer) => {
    const {
        data: { text },
    } = await Tesseract.recognize(buffer, "eng");

    return text.trim();
};

module.exports = {
    extractImageText,
};