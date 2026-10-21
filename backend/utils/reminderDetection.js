const { dateTimeInTimeZoneToIso, isValidDateOnly, shiftDateOnly } = require("./reminderUtils");

const DATE_PATTERN = /\b(?:20\d{2}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]20\d{2}|\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*,?\s*20\d{2}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?\s*,?\s*20\d{2})\b/gi;
const CONTEXT_PATTERN = /\b(expir(?:y|es|ation)|valid\s+(?:until|through|till)|renew(?:al|s|ed)|due(?:\s+date|\s+on)?|payment\s+due|bill\s+due|warranty(?:\s+(?:ends?|expires?))?|subscription(?:\s+(?:renews?|ends?))?)\b/i;
const MONTHS = {
    jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
    apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
    aug: 8, august: 8, sep: 9, september: 9, oct: 10, october: 10,
    nov: 11, november: 11, dec: 12, december: 12,
};

const normalizeDate = (match) => {
    let year;
    let month;
    let day;
    let parts;

    if (/^20\d{2}[-/.]/.test(match)) {
        parts = match.split(/[-/.]/).map(Number);
        [year, month, day] = parts;
    } else if (/^[a-z]/i.test(match)) {
        const monthName = match.match(/^[A-Za-z]+/);
        const numbers = match.match(/\d+/g)?.map(Number);
        if (!monthName || !numbers || numbers.length !== 2) return null;
        month = MONTHS[monthName[0].toLowerCase()];
        [day, year] = numbers;
    } else if (/[a-z]/i.test(match)) {
        const monthName = match.match(/[A-Za-z]+/);
        const numbers = match.match(/\d+/g)?.map(Number);
        if (!monthName || !numbers || numbers.length !== 2) return null;
        [day, year] = numbers;
        month = MONTHS[monthName[0].toLowerCase()];
    } else {
        parts = match.split(/[-/.]/).map(Number);
        if (parts.length !== 3) return null;
        const [first, second, numericYear] = parts;
        if (first <= 12 && second <= 12) return null;
        year = numericYear;
        month = first > 12 ? second : first;
        day = first > 12 ? first : second;
    }

    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
        return null;
    }

    const normalized = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return isValidDateOnly(normalized) ? normalized : null;
};

const getReminderType = (evidence) => {
    if (/\brenew(?:al|s|ed)\b/i.test(evidence)) return "renewal";
    if (/\bsubscription\b/i.test(evidence)) return "subscription";
    if (/\b(expir(?:y|es|ation)|valid\s+(?:until|through|till)|warranty)\b/i.test(evidence)) return "expiry";
    if (/\b(bill|payment|invoice|due)\b/i.test(evidence)) return "bill_due";
    return "custom";
};

const getDateEvidence = (text, match) => {
    const lineStart = text.lastIndexOf("\n", match.index - 1) + 1;
    const nextLineBreak = text.indexOf("\n", match.index);
    const lineEnd = nextLineBreak === -1 ? text.length : nextLineBreak;
    const currentLine = text.slice(lineStart, lineEnd);
    const matchStartInLine = match.index - lineStart;
    const matchEndInLine = matchStartInLine + match[0].length;
    const lineDatePattern = new RegExp(DATE_PATTERN.source, "gi");
    const otherDates = [...currentLine.matchAll(lineDatePattern)]
        .filter((candidate) => candidate.index !== matchStartInLine);
    const previousDateEnd = otherDates
        .filter((candidate) => candidate.index < matchStartInLine)
        .reduce((end, candidate) => Math.max(end, candidate.index + candidate[0].length), 0);
    const nextDateStart = otherDates
        .filter((candidate) => candidate.index > matchStartInLine)
        .reduce((start, candidate) => Math.min(start, candidate.index), currentLine.length);
    const nearbyLineText = currentLine.slice(
        Math.max(previousDateEnd, matchStartInLine - 80),
        Math.min(nextDateStart, matchEndInLine + 80)
    );
    if (CONTEXT_PATTERN.test(nearbyLineText)) return nearbyLineText;

    const previousLineEnd = lineStart > 0 ? lineStart - 1 : -1;
    const previousLineStart = previousLineEnd > 0
        ? text.lastIndexOf("\n", previousLineEnd - 1) + 1
        : 0;
    const nextLineStart = lineEnd < text.length ? lineEnd + 1 : -1;
    const nextLineEnd = nextLineStart >= 0 ? text.indexOf("\n", nextLineStart) : -1;
    const adjacentLines = [
        previousLineEnd >= 0 ? text.slice(previousLineStart, previousLineEnd) : "",
        nextLineStart >= 0 ? text.slice(nextLineStart, nextLineEnd === -1 ? text.length : nextLineEnd) : "",
    ];
    const adjacentContext = adjacentLines.find((line) => (
        CONTEXT_PATTERN.test(line) && !new RegExp(DATE_PATTERN.source, "i").test(line)
    ));
    return adjacentContext ? `${adjacentContext} ${match[0]}` : null;
};

const detectReminderCandidates = ({ text, documentName, defaultReminderDays, timeZone }) => {
    if (typeof text !== "string" || !text.trim()) return [];

    const candidates = [];
    const seen = new Set();
    const matches = text.matchAll(DATE_PATTERN);

    for (const match of matches) {
        const evidence = getDateEvidence(text, match);
        if (!evidence) continue;

        const dueDate = normalizeDate(match[0]);
        if (!dueDate) continue;

        const type = getReminderType(evidence);
        const key = `${type}:${dueDate}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const safeTitle = String(documentName || "Document").trim().slice(0, 160);
        const titlePrefix = {
            expiry: "Expiry",
            renewal: "Renewal",
            bill_due: "Payment due",
            subscription: "Subscription renewal",
            custom: "Important date",
        }[type];
        const reminderDate = shiftDateOnly(dueDate, -defaultReminderDays);
        const remindAt = reminderDate
            ? dateTimeInTimeZoneToIso(reminderDate, "09:00", timeZone)
            : null;

        candidates.push({
            title: `${titlePrefix}: ${safeTitle}`.slice(0, 250),
            description: `Detected from document text: "${match[0]}" near "${evidence.trim().replace(/\s+/g, " ").slice(0, 240)}"`,
            reminder_type: type,
            due_date: dueDate,
            remind_at: remindAt,
            status: "pending",
            priority: "medium",
            source: "ai",
            notification_enabled: true,
        });
    }

    return candidates;
};

module.exports = { detectReminderCandidates, normalizeDate };
