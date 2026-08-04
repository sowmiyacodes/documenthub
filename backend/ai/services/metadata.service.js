const compromise = require("compromise");

const extractFirst = (regex, text) => {
    const match = text.match(regex);
    return match ? match[0] : null;
};

const extractAll = (regex, text) => {
    const matches = text.match(regex);
    return matches ? [...new Set(matches)] : [];
};

const detectDocumentType = (text) => {
    const lower = text.toLowerCase();

    if (lower.includes("passport"))
        return "Passport";

    if (
        lower.includes("aadhaar") ||
        lower.includes("uidai")
    )
        return "Aadhaar";

    if (
        lower.includes("permanent account number") ||
        lower.includes("income tax department")
    )
        return "PAN";

    if (
        lower.includes("driving licence") ||
        lower.includes("driving license")
    )
        return "Driving License";

    if (
        lower.includes("mark sheet") ||
        lower.includes("marksheet")
    )
        return "Marksheet";

    if (
        lower.includes("degree certificate")
    )
        return "Degree Certificate";

    if (
        lower.includes("medical") ||
        lower.includes("hospital")
    )
        return "Medical";

    if (
        lower.includes("insurance")
    )
        return "Insurance";

    return "Others";
};

const extractMetadata = async (text) => {
    const doc = compromise(text);

    const people = doc.people().out("array");

    const metadata = {

        documentType: detectDocumentType(text),

        names: [...new Set(people)],

        emails: extractAll(
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/g,
            text
        ),

        phoneNumbers: extractAll(
            /\b(?:\+91[- ]?)?[6-9]\d{9}\b/g,
            text
        ),

        dates: extractAll(
            /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
            text
        ),

        aadhaar: extractFirst(
            /\b\d{4}\s?\d{4}\s?\d{4}\b/,
            text
        ),

        pan: extractFirst(
            /\b[A-Z]{5}[0-9]{4}[A-Z]\b/,
            text
        ),

        passport: extractFirst(
            /\b[A-Z][0-9]{7}\b/,
            text
        ),

        gst: extractFirst(
            /\b\d{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]\b/,
            text
        ),

    };

    return metadata;
};

module.exports = {
    extractMetadata,
};

//No AI model is used here because regex is faster, cheaper, and more accurate for structured data.