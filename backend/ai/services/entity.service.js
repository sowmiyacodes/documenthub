/*
|--------------------------------------------------------------------------
| LifeHub AI - Entity Extraction Service
|--------------------------------------------------------------------------
|
| Extracts structured information from OCR text.
|
| This service intentionally uses deterministic rules / regex instead
| of an LLM for sensitive identifiers such as Aadhaar and PAN numbers.
|
| Supported document types:
|
| - Resume
| - Aadhaar
| - PAN
| - Passport
| - Driving License
| - Marksheet
| - Degree Certificate
| - Medical
| - Insurance
| - Generic documents
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

const unique = (array) => {
    return [
        ...new Set(
            array
                .filter(Boolean)
                .map((item) => cleanValue(item))
                .filter(Boolean)
        ),
    ];
};

/*
|--------------------------------------------------------------------------
| Document Type Detection
|--------------------------------------------------------------------------
*/

const detectDocumentType = (text) => {
    const lower = text.toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Aadhaar
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("aadhaar") ||
        lower.includes("uidai") ||
        lower.includes("unique identification authority")
    ) {
        return "Aadhaar";
    }

    /*
    |--------------------------------------------------------------------------
    | PAN
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("permanent account number") ||
        lower.includes("income tax department") ||
        lower.includes("pan card")
    ) {
        return "PAN";
    }

    /*
    |--------------------------------------------------------------------------
    | Passport
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("passport") ||
        lower.includes("republic of india") &&
        lower.includes("nationality")
    ) {
        return "Passport";
    }

    /*
    |--------------------------------------------------------------------------
    | Driving License
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("driving licence") ||
        lower.includes("driving license") ||
        lower.includes("transport department")
    ) {
        return "Driving License";
    }

    /*
    |--------------------------------------------------------------------------
    | Marksheet
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("marksheet") ||
        lower.includes("mark sheet") ||
        lower.includes("grade card") ||
        lower.includes("semester marks")
    ) {
        return "Marksheet";
    }

    /*
    |--------------------------------------------------------------------------
    | Degree Certificate
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("degree certificate") ||
        lower.includes("degree") &&
        lower.includes("university")
    ) {
        return "Degree Certificate";
    }

    /*
    |--------------------------------------------------------------------------
    | Resume / CV
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("resume") ||
        lower.includes("curriculum vitae") ||
        lower.includes("professional summary") ||
        lower.includes("work experience") ||
        lower.includes("technical skills") ||
        lower.includes("projects") &&
        lower.includes("education")
    ) {
        return "Resume";
    }

    /*
    |--------------------------------------------------------------------------
    | Medical
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("hospital") ||
        lower.includes("medical") ||
        lower.includes("prescription") ||
        lower.includes("patient") ||
        lower.includes("diagnosis")
    ) {
        return "Medical";
    }

    /*
    |--------------------------------------------------------------------------
    | Insurance
    |--------------------------------------------------------------------------
    */

    if (
        lower.includes("insurance") ||
        lower.includes("policy number") ||
        lower.includes("premium")
    ) {
        return "Insurance";
    }

    return "Others";
};

/*
|--------------------------------------------------------------------------
| Email Extraction
|--------------------------------------------------------------------------
*/

const extractEmails = (text) => {
    return unique(
        text.match(
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/g
        ) || []
    );
};

/*
|--------------------------------------------------------------------------
| Indian Phone Number Extraction
|--------------------------------------------------------------------------
*/

const extractPhoneNumbers = (text) => {
    return unique(
        text.match(
            /(?:\+91[\s-]?)?[6-9]\d{9}\b/g
        ) || []
    );
};

/*
|--------------------------------------------------------------------------
| Aadhaar Number
|--------------------------------------------------------------------------
|
| Accepts:
|
| 1234 5678 9012
| 123456789012
|
|--------------------------------------------------------------------------
*/

const extractAadhaar = (text) => {
    const match = text.match(
        /\b\d{4}\s?\d{4}\s?\d{4}\b/
    );

    if (!match) {
        return null;
    }

    return match[0].replace(/\s+/g, "");
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

const extractPassportNumber = (text) => {
    const match = text.match(
        /\b[A-Z][0-9]{7}\b/i
    );

    return match
        ? match[0].toUpperCase()
        : null;
};

/*
|--------------------------------------------------------------------------
| Date Extraction
|--------------------------------------------------------------------------
*/

const extractDates = (text) => {
    return unique(
        text.match(
            /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4})\b/gi
        ) || []
    );
};

/*
|--------------------------------------------------------------------------
| Date Of Birth
|--------------------------------------------------------------------------
*/

const extractDateOfBirth = (text) => {

    const patterns = [
        /(?:date\s*of\s*birth|dob|birth\s*date)\s*[:\-]?\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,

        /(?:date\s*of\s*birth|dob|birth\s*date)\s*[:\-]?\s*([0-9]{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4})/i,

        /(?:date\s*of\s*birth|dob|birth\s*date)\s*[:\-]?\s*([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4})/i,
    ];

    for (const pattern of patterns) {

        const match = text.match(pattern);

        if (match && match[1]) {
            return cleanValue(match[1]);
        }
    }

    return null;
};

/*
|--------------------------------------------------------------------------
| Gender
|--------------------------------------------------------------------------
*/

const extractGender = (text) => {

    const match = text.match(
        /(?:gender|sex)\s*[:\-]?\s*(male|female|other|m|f)\b/i
    );

    if (!match) {
        return null;
    }

    const value = match[1].toLowerCase();

    if (value === "m") {
        return "Male";
    }

    if (value === "f") {
        return "Female";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
};

/*
|--------------------------------------------------------------------------
| Label Based Extraction
|--------------------------------------------------------------------------
*/

const extractLabeledValue = (
    text,
    labels
) => {

    for (const label of labels) {

        const escapedLabel =
            label.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

        const regex = new RegExp(
            `${escapedLabel}\\s*[:\\-]?\\s*([^\\n|]{2,100})`,
            "i"
        );

        const match = text.match(regex);

        if (match && match[1]) {

            const value =
                cleanValue(match[1]);

            if (value) {
                return value;
            }
        }
    }

    return null;
};

/*
|--------------------------------------------------------------------------
| Name Extraction
|--------------------------------------------------------------------------
*/

const extractName = (
    text,
    documentType
) => {

    /*
    |--------------------------------------------------------------------------
    | Explicit name labels
    |--------------------------------------------------------------------------
    */

    const labeledName =
        extractLabeledValue(
            text,
            [
                "name",
                "full name",
                "candidate name",
                "student name",
                "applicant name",
                "holder name",
                "given name",
                "surname",
            ]
        );

    if (
        labeledName &&
        labeledName.length <= 100
    ) {

        /*
        Avoid accidentally accepting another field.
        */

        const invalidValues = [
            "date of birth",
            "dob",
            "gender",
            "male",
            "female",
            "address",
            "email",
            "phone",
        ];

        if (
            !invalidValues.includes(
                labeledName.toLowerCase()
            )
        ) {
            return labeledName;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Resume fallback
    |--------------------------------------------------------------------------
    |
    | Usually the first meaningful line of a resume is the person's name.
    |
    */

    if (documentType === "Resume") {

        const lines = text
            .split(/\r?\n/)
            .map((line) =>
                cleanValue(line)
            )
            .filter(Boolean);

        for (const line of lines.slice(0, 10)) {

            if (
                line.length >= 3 &&
                line.length <= 60 &&
                /^[A-Za-z][A-Za-z .'-]+$/.test(line) &&
                !line.toLowerCase().includes("resume") &&
                !line.toLowerCase().includes("curriculum") &&
                !line.toLowerCase().includes("engineer") &&
                !line.toLowerCase().includes("developer")
            ) {
                return line;
            }
        }
    }

    return null;
};

/*
|--------------------------------------------------------------------------
| Address Extraction
|--------------------------------------------------------------------------
*/

const extractAddress = (text) => {

    const labels = [
        "address",
        "residential address",
        "permanent address",
        "current address",
        "communication address",
    ];

    return extractLabeledValue(
        text,
        labels
    );
};

/*
|--------------------------------------------------------------------------
| CGPA Extraction
|--------------------------------------------------------------------------
*/

const extractCGPA = (text) => {

    const patterns = [

        /*
        CGPA: 9.95
        CGPA - 9.95
        */

        /\bCGPA\s*[:\-]?\s*(10(?:\.0)?|[0-9](?:\.[0-9]{1,2})?)/i,

        /*
        C.G.P.A. 9.95
        */

        /\bC\.?\s*G\.?\s*P\.?\s*A\.?\s*[:\-]?\s*(10(?:\.0)?|[0-9](?:\.[0-9]{1,2})?)/i,

        /*
        GPA: 9.95
        */

        /\bGPA\s*[:\-]?\s*(10(?:\.0)?|[0-9](?:\.[0-9]{1,2})?)/i,
    ];

    for (const pattern of patterns) {

        const match =
            text.match(pattern);

        if (match && match[1]) {

            const value =
                parseFloat(match[1]);

            if (
                value >= 0 &&
                value <= 10
            ) {
                return value;
            }
        }
    }

    return null;
};

/*
|--------------------------------------------------------------------------
| Degree Extraction
|--------------------------------------------------------------------------
*/

const extractDegree = (text) => {

    const degreePatterns = [

        /\bB\.?\s*Tech\b[^\n,;]*/i,

        /\bB\.?\s*E\b[^\n,;]*/i,

        /\bM\.?\s*Tech\b[^\n,;]*/i,

        /\bM\.?\s*E\b[^\n,;]*/i,

        /\bB\.?\s*Sc\b[^\n,;]*/i,

        /\bM\.?\s*Sc\b[^\n,;]*/i,

        /\bBachelor\s+of\s+[^\n,;]+/i,

        /\bMaster\s+of\s+[^\n,;]+/i,

        /\bDoctor\s+of\s+Philosophy\b/i,
    ];

    for (const pattern of degreePatterns) {

        const match =
            text.match(pattern);

        if (match) {

            return cleanValue(
                match[0]
            );
        }
    }

    return null;
};

/*
|--------------------------------------------------------------------------
| Branch / Specialization
|--------------------------------------------------------------------------
*/

const extractSpecialization = (text) => {

    const patterns = [

        /(?:specialization|specialisation|branch|major)\s*[:\-]?\s*([^\n|]{2,100})/i,

        /\b(?:B\.?\s*Tech|B\.?\s*E|M\.?\s*Tech|M\.?\s*E)\s+(?:in|-)\s+([^\n,;|]+)/i,
    ];

    for (const pattern of patterns) {

        const match =
            text.match(pattern);

        if (match && match[1]) {

            return cleanValue(
                match[1]
            );
        }
    }

    return null;
};

/*
|--------------------------------------------------------------------------
| College / University
|--------------------------------------------------------------------------
*/

const extractInstitution = (text) => {

    const value =
        extractLabeledValue(
            text,
            [
                "college",
                "university",
                "institution",
                "school",
            ]
        );

    if (value) {
        return value;
    }

    /*
    Common Indian university/college wording
    */

    const patterns = [

        /(?:studying|studied|pursuing)[^.\n]{0,50}(?:at|from)\s+([A-Za-z0-9 .,&'-]{3,100})/i,

        /\b([A-Za-z0-9 .,&'-]+University)\b/i,

        /\b([A-Za-z0-9 .,&'-]+College)\b/i,
    ];

    for (const pattern of patterns) {

        const match =
            text.match(pattern);

        if (
            match &&
            match[1]
        ) {
            return cleanValue(
                match[1]
            );
        }
    }

    return null;
};

/*
|--------------------------------------------------------------------------
| Father's Name
|--------------------------------------------------------------------------
*/

const extractFatherName = (text) => {

    return extractLabeledValue(
        text,
        [
            "father's name",
            "father name",
            "fathers name",
            "father",
        ]
    );
};

/*
|--------------------------------------------------------------------------
| Nationality
|--------------------------------------------------------------------------
*/

const extractNationality = (text) => {

    return extractLabeledValue(
        text,
        [
            "nationality",
        ]
    );
};

/*
|--------------------------------------------------------------------------
| Passport Dates
|--------------------------------------------------------------------------
*/

const extractIssueDate = (text) => {

    return extractLabeledValue(
        text,
        [
            "date of issue",
            "issue date",
            "issued on",
        ]
    );
};

const extractExpiryDate = (text) => {

    return extractLabeledValue(
        text,
        [
            "date of expiry",
            "expiry date",
            "expires on",
            "valid until",
        ]
    );
};

/*
|--------------------------------------------------------------------------
| Skills Extraction
|--------------------------------------------------------------------------
*/

const extractSkills = (text) => {

    const skillSectionMatch =
        text.match(
            /(?:technical skills|skills|technologies|technical expertise)\s*[:\-]?\s*([\s\S]{0,1000})/i
        );

    if (!skillSectionMatch) {
        return [];
    }

    const section =
        skillSectionMatch[1];

    const knownSkills = [
        "Java",
        "JavaScript",
        "Python",
        "C",
        "C++",
        "React",
        "React.js",
        "Node.js",
        "Express",
        "MongoDB",
        "PostgreSQL",
        "MySQL",
        "Supabase",
        "Firebase",
        "Next.js",
        "Vite",
        "HTML",
        "CSS",
        "Tailwind CSS",
        "Machine Learning",
        "Deep Learning",
        "TensorFlow",
        "PyTorch",
        "OpenCV",
        "Git",
        "GitHub",
        "Docker",
        "AWS",
        "Azure",
        "GCP",
        "SQL",
        "NoSQL",
        "REST API",
        "MERN",
        "LangChain",
        "LlamaIndex",
    ];

    const foundSkills = [];

    for (const skill of knownSkills) {

        const regex =
            new RegExp(
                `\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
                "i"
            );

        if (regex.test(section)) {
            foundSkills.push(skill);
        }
    }

    return unique(foundSkills);
};

/*
|--------------------------------------------------------------------------
| Resume Extraction
|--------------------------------------------------------------------------
*/

const extractResumeEntities = (text) => {

    return {
        name: extractName(
            text,
            "Resume"
        ),

        email:
            extractEmails(text)[0] ||
            null,

        phone:
            extractPhoneNumbers(text)[0] ||
            null,

        degree:
            extractDegree(text),

        specialization:
            extractSpecialization(text),

        institution:
            extractInstitution(text),

        cgpa:
            extractCGPA(text),

        skills:
            extractSkills(text),

        dates:
            extractDates(text),
    };
};

/*
|--------------------------------------------------------------------------
| Aadhaar Extraction
|--------------------------------------------------------------------------
*/

const extractAadhaarEntities = (text) => {

    return {
        name:
            extractName(
                text,
                "Aadhaar"
            ),

        dateOfBirth:
            extractDateOfBirth(text),

        gender:
            extractGender(text),

        aadhaarNumber:
            extractAadhaar(text),

        address:
            extractAddress(text),
    };
};

/*
|--------------------------------------------------------------------------
| PAN Extraction
|--------------------------------------------------------------------------
*/

const extractPANEntities = (text) => {

    return {
        name:
            extractName(
                text,
                "PAN"
            ),

        fatherName:
            extractFatherName(text),

        dateOfBirth:
            extractDateOfBirth(text),

        panNumber:
            extractPAN(text),
    };
};

/*
|--------------------------------------------------------------------------
| Passport Extraction
|--------------------------------------------------------------------------
*/

const extractPassportEntities = (text) => {

    return {
        name:
            extractName(
                text,
                "Passport"
            ),

        passportNumber:
            extractPassportNumber(text),

        dateOfBirth:
            extractDateOfBirth(text),

        gender:
            extractGender(text),

        nationality:
            extractNationality(text),

        issueDate:
            extractIssueDate(text),

        expiryDate:
            extractExpiryDate(text),

        address:
            extractAddress(text),
    };
};

/*
|--------------------------------------------------------------------------
| Driving License
|--------------------------------------------------------------------------
*/

const extractDrivingLicenseEntities = (text) => {

    return {
        name:
            extractName(
                text,
                "Driving License"
            ),

        dateOfBirth:
            extractDateOfBirth(text),

        address:
            extractAddress(text),

        dates:
            extractDates(text),
    };
};

/*
|--------------------------------------------------------------------------
| Marksheet / Education
|--------------------------------------------------------------------------
*/

const extractEducationEntities = (
    text,
    documentType
) => {

    return {
        name:
            extractName(
                text,
                documentType
            ),

        degree:
            extractDegree(text),

        specialization:
            extractSpecialization(text),

        institution:
            extractInstitution(text),

        cgpa:
            extractCGPA(text),

        dates:
            extractDates(text),
    };
};

/*
|--------------------------------------------------------------------------
| Generic Extraction
|--------------------------------------------------------------------------
*/

const extractGenericEntities = (text) => {

    return {
        names: [],

        emails:
            extractEmails(text),

        phoneNumbers:
            extractPhoneNumbers(text),

        dates:
            extractDates(text),

        aadhaar:
            extractAadhaar(text),

        pan:
            extractPAN(text),

        passport:
            extractPassportNumber(text),
    };
};

/*
|--------------------------------------------------------------------------
| Main Entity Extraction
|--------------------------------------------------------------------------
*/

const extractEntities = async (text) => {

    if (
        !text ||
        text.trim().length === 0
    ) {
        return {
            documentType: "Others",
            fields: {},
        };
    }

    const documentType =
        detectDocumentType(text);

    let fields = {};

    switch (documentType) {

        case "Resume":

            fields =
                extractResumeEntities(text);

            break;

        case "Aadhaar":

            fields =
                extractAadhaarEntities(text);

            break;

        case "PAN":

            fields =
                extractPANEntities(text);

            break;

        case "Passport":

            fields =
                extractPassportEntities(text);

            break;

        case "Driving License":

            fields =
                extractDrivingLicenseEntities(text);

            break;

        case "Marksheet":

        case "Degree Certificate":

            fields =
                extractEducationEntities(
                    text,
                    documentType
                );

            break;

        default:

            fields =
                extractGenericEntities(text);
    }

    return {
        documentType,
        fields,
    };
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
    extractEntities,
    detectDocumentType,
};