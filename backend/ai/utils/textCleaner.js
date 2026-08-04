const cleanText = (text) => {
    if (!text || typeof text !== "string") {
        return "";
    }

    return text
        // Normalize line endings
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")

        // Remove tabs
        .replace(/\t/g, " ")

        // Remove multiple spaces
        .replace(/[ ]{2,}/g, " ")

        // Remove multiple blank lines
        .replace(/\n{3,}/g, "\n\n")

        // Remove non-printable ASCII characters
        .replace(/[^\x20-\x7E\n]/g, "")

        // Trim each line
        .split("\n")
        .map(line => line.trim())
        .join("\n")

        // Final trim
        .trim();
};

module.exports = {
    cleanText,
};