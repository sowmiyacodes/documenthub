const detectCategory = async (text) => {
    const content = text.toLowerCase();

    const categories = {
        Identity: [
            "passport",
            "aadhaar",
            "uidai",
            "driving licence",
            "driving license",
            "voter id",
            "identity",
            "government of india",
            "permanent account number",
            "pan card",
        ],

        Education: [
            "marksheet",
            "mark sheet",
            "grade card",
            "semester",
            "university",
            "college",
            "school",
            "certificate",
            "transcript",
            "cgpa",
            "student",
            "hall ticket",
        ],

        Medical: [
            "hospital",
            "medical",
            "doctor",
            "patient",
            "prescription",
            "diagnosis",
            "blood",
            "medicine",
            "health",
            "laboratory",
            "clinic",
            "vaccination",
        ],

        Financial: [
            "bank",
            "account",
            "statement",
            "transaction",
            "invoice",
            "receipt",
            "salary",
            "payment",
            "credit",
            "debit",
            "gst",
            "tax",
            "insurance",
            "loan",
        ],

        Legal: [
            "agreement",
            "contract",
            "legal",
            "affidavit",
            "court",
            "lease",
            "deed",
            "property",
            "will",
            "notary",
        ],
    };

    let bestCategory = "Others";
    let highestScore = 0;

    for (const [category, keywords] of Object.entries(categories)) {
        let score = 0;

        for (const keyword of keywords) {
            if (content.includes(keyword)) {
                score++;
            }
        }

        if (score > highestScore) {
            highestScore = score;
            bestCategory = category;
        }
    }

    return bestCategory;
};

module.exports = {
    detectCategory,
};