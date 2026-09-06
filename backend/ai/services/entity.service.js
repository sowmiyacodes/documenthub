/*
|--------------------------------------------------------------------------
| LifeHub AI - Generic Entity Extraction Service
|--------------------------------------------------------------------------
|
| This service is intentionally NOT document-specific.
|
| It extracts common entities from ANY document:
|
| - Names
| - Emails
| - Phone numbers
| - Dates
| - Amounts
| - Addresses
| - URLs
| - Aadhaar numbers
| - PAN numbers
| - Passport numbers
| - GST numbers
| - Account numbers
| - Document numbers
| - Organizations
|
| It also detects a broad document type.
|
| Document-specific intelligence can be added later without changing
| this generic extraction layer.
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Utility Functions
|--------------------------------------------------------------------------
*/

const cleanValue = (value) => {
    if (!value) {
        return null;
    }

    return value
        .replace(/\s+/g, " ")
        .replace(/[|]+/g, "")
        .trim();
};


const normalizeText = (text) => {
    return text
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};


const unique = (array) => {
    return [...new Set(
        array.filter(
            (value) =>
                value !== null &&
                value !== undefined &&
                value !== ""
        )
    )];
};


const getLines = (text) => {
    return normalizeText(text)
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
};


/*
|--------------------------------------------------------------------------
| Document Type Detection
|--------------------------------------------------------------------------
|
| This is broad classification.
| It does NOT assume that the document is a resume.
|--------------------------------------------------------------------------
*/

const detectDocumentType = (text) => {

    const lower = text.toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Identity Documents
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("aadhaar") ||
        lower.includes("aadhar") ||
        lower.includes("uidai") ||
        lower.includes("unique identification")
    ) {
        return "Aadhaar";
    }


    if (
        lower.includes("permanent account number") ||
        lower.includes("income tax department") ||
        lower.includes("pan card")
    ) {
        return "PAN";
    }


    if (
        lower.includes("passport") ||
        (
            lower.includes("nationality") &&
            lower.includes("date of birth")
        )
    ) {
        return "Passport";
    }


    if (
        lower.includes("driving licence") ||
        lower.includes("driving license") ||
        lower.includes("transport department")
    ) {
        return "Driving License";
    }


    if (
        lower.includes("voter") &&
        (
            lower.includes("election") ||
            lower.includes("elector")
        )
    ) {
        return "Voter ID";
    }


    /*
    |--------------------------------------------------------------------------
    | Education
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("marksheet") ||
        lower.includes("mark sheet") ||
        lower.includes("grade card") ||
        lower.includes("semester result") ||
        lower.includes("academic transcript")
    ) {
        return "Marksheet";
    }


    if (
        lower.includes("degree certificate") ||
        lower.includes("bachelor of technology") ||
        lower.includes("bachelor of engineering") ||
        lower.includes("master of technology") ||
        lower.includes("master of engineering")
    ) {
        return "Degree Certificate";
    }


    if (
        lower.includes("certificate") &&
        (
            lower.includes("university") ||
            lower.includes("college") ||
            lower.includes("school")
        )
    ) {
        return "Certificate";
    }


    /*
    |--------------------------------------------------------------------------
    | Financial Documents
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("bank statement") ||
        (
            lower.includes("account number") &&
            lower.includes("transaction")
        )
    ) {
        return "Bank Statement";
    }


    if (
        lower.includes("invoice") ||
        lower.includes("tax invoice")
    ) {
        return "Invoice";
    }


    if (
        lower.includes("receipt") ||
        lower.includes("payment receipt")
    ) {
        return "Receipt";
    }


    if (
        lower.includes("salary slip") ||
        lower.includes("salary statement") ||
        lower.includes("pay slip") ||
        lower.includes("payslip")
    ) {
        return "Salary Slip";
    }


    if (
        lower.includes("income tax") ||
        lower.includes("tax return") ||
        lower.includes("itr")
    ) {
        return "Tax Document";
    }


    /*
    |--------------------------------------------------------------------------
    | Insurance
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("insurance policy") ||
        lower.includes("policy number") ||
        lower.includes("insured")
    ) {
        return "Insurance";
    }


    /*
    |--------------------------------------------------------------------------
    | Medical
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("hospital") ||
        lower.includes("patient") ||
        lower.includes("diagnosis") ||
        lower.includes("prescription") ||
        lower.includes("medical report") ||
        lower.includes("laboratory report")
    ) {
        return "Medical";
    }


    /*
    |--------------------------------------------------------------------------
    | Legal
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("agreement") ||
        lower.includes("contract") ||
        lower.includes("affidavit") ||
        lower.includes("legal notice") ||
        lower.includes("lease agreement") ||
        lower.includes("court")
    ) {
        return "Legal";
    }


    /*
    |--------------------------------------------------------------------------
    | Resume / CV
    |--------------------------------------------------------------------------
    |
    | Resume is only ONE possible document type.
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("curriculum vitae") ||
        lower.includes("professional experience") ||
        lower.includes("work experience") ||
        lower.includes("technical skills")
    ) {
        return "Resume";
    }


    return "Others";
};


/*
|--------------------------------------------------------------------------
| Email Extraction
|--------------------------------------------------------------------------
*/

const extractEmails = (text) => {

    const matches = text.match(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/g
    );

    return unique(
        matches || []
    );
};


/*
|--------------------------------------------------------------------------
| Phone Number Extraction
|--------------------------------------------------------------------------
*/

const extractPhoneNumbers = (text) => {

    const matches = text.match(
        /(?:\+91[\s-]?)?[6-9]\d{9}\b/g
    );

    if (!matches) {
        return [];
    }

    return unique(
        matches.map(
            (phone) =>
                phone
                    .replace(/[^\d+]/g, "")
                    .trim()
        )
    );
};


/*
|--------------------------------------------------------------------------
| Date Extraction
|--------------------------------------------------------------------------
*/

const extractDates = (text) => {

    const matches = text.match(
        /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}[\/\-][A-Za-z]{3,9}[\/\-]\d{2,4}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/gi
    );

    return unique(
        matches || []
    );
};


/*
|--------------------------------------------------------------------------
| Amount Extraction
|--------------------------------------------------------------------------
*/

const extractAmounts = (text) => {

    const matches = text.match(
        /(?:₹|Rs\.?|INR)\s?[\d,]+(?:\.\d{1,2})?|\b\d[\d,]*(?:\.\d{1,2})?\s?(?:INR|USD|EUR|GBP)\b/gi
    );

    return unique(
        matches || []
    );
};


/*
|--------------------------------------------------------------------------
| URL Extraction
|--------------------------------------------------------------------------
*/

const extractUrls = (text) => {

    const matches = text.match(
        /https?:\/\/[^\s]+|www\.[^\s]+/gi
    );

    return unique(
        matches || []
    );
};


/*
|--------------------------------------------------------------------------
| Aadhaar Number
|--------------------------------------------------------------------------
*/

const extractAadhaar = (text) => {

    const match = text.match(
        /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/
    );

    return match
        ? match[0].replace(/[\s-]/g, "")
        : null;
};


/*
|--------------------------------------------------------------------------
| PAN Number
|--------------------------------------------------------------------------
*/

const extractPAN = (text) => {

    const match = text.match(
        /\b[A-Z]{5}[0-9]{4}[A-Z]\b/i
    );

    return match
        ? match[0].toUpperCase()
        : null;
};


/*
|--------------------------------------------------------------------------
| Passport Number
|--------------------------------------------------------------------------
*/

const extractPassport = (text) => {

    const match = text.match(
        /\b[A-Z][0-9]{7}\b/i
    );

    return match
        ? match[0].toUpperCase()
        : null;
};


/*
|--------------------------------------------------------------------------
| GST Number
|--------------------------------------------------------------------------
*/

const extractGST = (text) => {

    const match = text.match(
        /\b\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]\b/i
    );

    return match
        ? match[0].toUpperCase()
        : null;
};


/*
|--------------------------------------------------------------------------
| Account Number
|--------------------------------------------------------------------------
|
| We only extract when a clear account-number label exists.
| This avoids treating random numbers as bank accounts.
|--------------------------------------------------------------------------
*/

const extractAccountNumbers = (text) => {

    const matches = [];

    const patterns = [
        /(?:account number|account no\.?|a\/c number|a\/c no\.?)\s*[:\-]?\s*([0-9]{8,20})/gi
    ];

    for (const pattern of patterns) {

        let match;

        while ((match = pattern.exec(text)) !== null) {

            if (match[1]) {
                matches.push(match[1]);
            }
        }
    }

    return unique(matches);
};


/*
|--------------------------------------------------------------------------
| Generic Document / Reference Numbers
|--------------------------------------------------------------------------
*/

const extractReferenceNumbers = (text) => {

    const matches = [];

    const patterns = [
        /(?:document number|document no\.?|reference number|reference no\.?|ref no\.?|application number|application no\.?|registration number|registration no\.?)\s*[:\-]?\s*([A-Za-z0-9\/\-]+)/gi
    ];

    for (const pattern of patterns) {

        let match;

        while ((match = pattern.exec(text)) !== null) {

            if (match[1]) {
                matches.push(match[1]);
            }
        }
    }

    return unique(matches);
};


/*
|--------------------------------------------------------------------------
| Names
|--------------------------------------------------------------------------
|
| Generic extraction.
|
| First preference:
|   Name: XXXXX
|
| Then:
|   Full Name: XXXXX
|
|--------------------------------------------------------------------------
*/

const extractNames = (text) => {

    const names = [];

    const patterns = [
        /(?:^|\n)\s*(?:full\s+name|name|customer\s+name|applicant\s+name|patient\s+name|candidate\s+name)\s*[:\-]\s*([A-Za-z][A-Za-z .'-]{2,100})/gi,

        /(?:^|\n)\s*(?:mr|mrs|ms|miss|dr)\.?\s+([A-Za-z][A-Za-z .'-]{2,80})/gi
    ];

    for (const pattern of patterns) {

        let match;

        while ((match = pattern.exec(text)) !== null) {

            const value =
                cleanValue(
                    match[1]
                );

            if (value) {
                names.push(value);
            }
        }
    }

    return unique(names);
};


/*
|--------------------------------------------------------------------------
| Organization Names
|--------------------------------------------------------------------------
*/

const extractOrganizations = (text) => {

    const organizations = [];

    const patterns = [
        /(?:organization|organisation|company|employer|institution|university|college|hospital)\s*[:\-]\s*([^\n]+)/gi
    ];

    for (const pattern of patterns) {

        let match;

        while ((match = pattern.exec(text)) !== null) {

            const value =
                cleanValue(match[1]);

            if (
                value &&
                value.length >= 3 &&
                value.length <= 150
            ) {
                organizations.push(value);
            }
        }
    }

    return unique(organizations);
};


/*
|--------------------------------------------------------------------------
| Addresses
|--------------------------------------------------------------------------
*/

const extractAddresses = (text) => {

    const addresses = [];

    const patterns = [
        /(?:address|permanent address|residential address|registered address)\s*[:\-]\s*([^\n]+)/gi
    ];

    for (const pattern of patterns) {

        let match;

        while ((match = pattern.exec(text)) !== null) {

            const value =
                cleanValue(match[1]);

            if (
                value &&
                value.length >= 5
            ) {
                addresses.push(value);
            }
        }
    }

    return unique(addresses);
};


/*
|--------------------------------------------------------------------------
| Gender
|--------------------------------------------------------------------------
*/

const extractGender = (text) => {

    const match = text.match(
        /(?:gender|sex)\s*[:\-]?\s*(male|female|m|f)\b/i
    );

    if (!match) {
        return null;
    }

    const value =
        match[1].toLowerCase();

    if (
        value === "male" ||
        value === "m"
    ) {
        return "Male";
    }

    if (
        value === "female" ||
        value === "f"
    ) {
        return "Female";
    }

    return null;
};


/*
|--------------------------------------------------------------------------
| Date of Birth
|--------------------------------------------------------------------------
*/

const extractDateOfBirth = (text) => {

    const patterns = [
        /(?:date\s+of\s+birth|dob|d\.o\.b)\s*[:\-]?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,

        /(?:date\s+of\s+birth|dob|d\.o\.b)\s*[:\-]?\s*([0-9]{1,2}[\/\-][A-Za-z]{3,9}[\/\-][0-9]{2,4})/i,

        /(?:date\s+of\s+birth|dob|d\.o\.b)\s*[:\-]?\s*([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i
    ];

    for (const pattern of patterns) {

        const match =
            text.match(pattern);

        if (match) {
            return cleanValue(match[1]);
        }
    }

    return null;
};


/*
|--------------------------------------------------------------------------
| Nationality
|--------------------------------------------------------------------------
*/

const extractNationality = (text) => {

    const match = text.match(
        /nationality\s*[:\-]?\s*([A-Za-z ]+)/i
    );

    return match
        ? cleanValue(match[1])
        : null;
};


/*
|--------------------------------------------------------------------------
| Generic Label-Value Extraction
|--------------------------------------------------------------------------
|
| This is important for ANY unknown document.
|
| Example:
|
| Policy Number: ABC123
| Invoice Number: INV001
| Course: Information Technology
| Blood Group: O+
| Department: IT
|
| The system doesn't need to know the document type beforehand.
|--------------------------------------------------------------------------
*/

const extractLabeledFields = (text) => {

    const fields = {};

    const lines =
        getLines(text);

    for (const line of lines) {

        const match =
            line.match(
                /^([A-Za-z][A-Za-z0-9 /()._-]{1,50})\s*[:\-]\s*(.+)$/
            );

        if (!match) {
            continue;
        }

        const key =
            cleanValue(match[1]);

        const value =
            cleanValue(match[2]);

        if (
            !key ||
            !value
        ) {
            continue;
        }

        /*
        |--------------------------------------------------------------------------
        | Avoid extremely large values
        |--------------------------------------------------------------------------
        */

        if (value.length > 300) {
            continue;
        }

        const normalizedKey =
            key
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "");

        if (
            normalizedKey &&
            !fields[normalizedKey]
        ) {
            fields[normalizedKey] = value;
        }
    }

    return fields;
};


/*
|--------------------------------------------------------------------------
| Main Generic Entity Extraction
|--------------------------------------------------------------------------
*/

const extractEntities = async (text) => {

    if (
        !text ||
        text.trim().length === 0
    ) {
        return {
            documentType: "Others",
            entities: {}
        };
    }


    const normalizedText =
        normalizeText(text);


    /*
    |--------------------------------------------------------------------------
    | Detect broad document type
    |--------------------------------------------------------------------------
    */

    const documentType =
        detectDocumentType(
            normalizedText
        );


    /*
    |--------------------------------------------------------------------------
    | Extract generic entities
    |--------------------------------------------------------------------------
    */

    const entities = {

        names:
            extractNames(
                normalizedText
            ),

        emails:
            extractEmails(
                normalizedText
            ),

        phoneNumbers:
            extractPhoneNumbers(
                normalizedText
            ),

        dates:
            extractDates(
                normalizedText
            ),

        amounts:
            extractAmounts(
                normalizedText
            ),

        addresses:
            extractAddresses(
                normalizedText
            ),

        urls:
            extractUrls(
                normalizedText
            ),

        organizations:
            extractOrganizations(
                normalizedText
            ),

        aadhaarNumber:
            extractAadhaar(
                normalizedText
            ),

        panNumber:
            extractPAN(
                normalizedText
            ),

        passportNumber:
            extractPassport(
                normalizedText
            ),

        gstNumber:
            extractGST(
                normalizedText
            ),

        accountNumbers:
            extractAccountNumbers(
                normalizedText
            ),

        referenceNumbers:
            extractReferenceNumbers(
                normalizedText
            ),

        gender:
            extractGender(
                normalizedText
            ),

        dateOfBirth:
            extractDateOfBirth(
                normalizedText
            ),

        nationality:
            extractNationality(
                normalizedText
            ),

        labeledFields:
            extractLabeledFields(
                normalizedText
            )
    };


    /*
    |--------------------------------------------------------------------------
    | Remove empty values
    |--------------------------------------------------------------------------
    */

    const cleanedEntities = {};

    for (
        const [key, value]
        of Object.entries(entities)
    ) {

        if (Array.isArray(value)) {

            if (value.length > 0) {
                cleanedEntities[key] =
                    value;
            }

        } else if (
            value !== null &&
            value !== undefined &&
            value !== ""
        ) {

            /*
            |--------------------------------------------------------------------------
            | Do not store empty labeled fields
            |--------------------------------------------------------------------------
            */

            if (
                typeof value === "object" &&
                Object.keys(value).length === 0
            ) {
                continue;
            }

            cleanedEntities[key] =
                value;
        }
    }


    return {

        documentType,

        entities:
            cleanedEntities
    };
};


/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {

    extractEntities,

    detectDocumentType

};