const test = require("node:test");
const assert = require("node:assert/strict");
const {
    dateTimeInTimeZoneToIso,
    getDateInTimeZone,
    isReminderInAppDue,
    isValidDateOnly,
    shiftDateOnly,
    summarizeReminders,
} = require("../utils/reminderUtils");
const { detectReminderCandidates, normalizeDate } = require("../utils/reminderDetection");
const { validateReminderInput } = require("../controllers/reminderController");

test("validates date-only values without timezone shifts", () => {
    assert.equal(isValidDateOnly("2026-02-28"), true);
    assert.equal(isValidDateOnly("2026-02-30"), false);
    assert.equal(isValidDateOnly("2026-2-03"), false);
});

test("converts wall-clock reminder time in selected timezone to an ISO instant", () => {
    const result = dateTimeInTimeZoneToIso("2026-10-21", "09:00", "Asia/Kolkata");
    assert.equal(result, "2026-10-21T03:30:00.000Z");
    assert.equal(getDateInTimeZone(result, "Asia/Kolkata"), "2026-10-21");
    assert.equal(dateTimeInTimeZoneToIso("2026-03-08", "02:30", "America/New_York"), null);
});

test("shifts calendar dates without local machine timezone influence", () => {
    assert.equal(shiftDateOnly("2026-01-03", -7), "2025-12-27");
});

test("normalizes explicit dates and rejects ambiguous numeric dates", () => {
    assert.equal(normalizeDate("2027-03-04"), "2027-03-04");
    assert.equal(normalizeDate("31/03/2027"), "2027-03-31");
    assert.equal(normalizeDate("03/04/2027"), null);
    assert.equal(normalizeDate("31 February 2027"), null);
});

test("detects contextual expiry reminders but ignores unrelated and ambiguous dates", () => {
    const candidates = detectReminderCandidates({
        text: "Passport expiry date: 31/03/2027.\nInvoice issued 03/04/2027.",
        documentName: "Passport.pdf",
        defaultReminderDays: 7,
        timeZone: "Asia/Kolkata",
    });

    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].due_date, "2027-03-31");
    assert.equal(candidates[0].reminder_type, "expiry");
    assert.equal(candidates[0].source, "ai");
});

test("detects an expiry label on an adjacent OCR line without borrowing another date's context", () => {
    const candidates = detectReminderCandidates({
        text: "Expiry date:\n31/03/2027\nInvoice issued: 03/04/2027",
        documentName: "Passport.pdf",
        defaultReminderDays: 7,
        timeZone: "Asia/Kolkata",
    });

    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].due_date, "2027-03-31");
    assert.equal(candidates[0].reminder_type, "expiry");
});

test("keeps nearby dates attached to their own labels when OCR puts them on one line", () => {
    const candidates = detectReminderCandidates({
        text: "Expiry date: 31/03/2027. Invoice issued: 03/04/2027.",
        documentName: "Passport.pdf",
        defaultReminderDays: 7,
        timeZone: "Asia/Kolkata",
    });

    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].due_date, "2027-03-31");
});

test("calculates pending, due-today, upcoming, overdue and completed summaries in the chosen timezone", () => {
    const records = [
        { status: "pending", due_date: "2026-10-20" },
        { status: "pending", due_date: "2026-10-21" },
        { status: "pending", due_date: "2026-11-20" },
        { status: "pending", due_date: "2026-11-21" },
        { status: "completed", due_date: "2026-10-21" },
        { status: "dismissed", due_date: "2026-10-21" },
    ];
    const summary = summarizeReminders(
        records,
        "Asia/Kolkata",
        new Date("2026-10-20T20:00:00.000Z")
    );

    assert.deepEqual(
        {
            pending: summary.pending,
            due_today: summary.due_today,
            upcoming: summary.upcoming,
            overdue: summary.overdue,
            completed: summary.completed,
            dismissed: summary.dismissed,
        },
        { pending: 4, due_today: 1, upcoming: 1, overdue: 1, completed: 1, dismissed: 1 }
    );
    assert.equal(summary.in_app_due, 2);
});

test("makes in-app reminders visible at their scheduled time rather than only on the due date", () => {
    const now = new Date("2026-10-21T03:30:00.000Z");
    const scheduledReminder = {
        status: "pending",
        due_date: "2026-10-28",
        remind_at: "2026-10-21T03:29:00.000Z",
    };
    const notYetScheduled = { ...scheduledReminder, remind_at: "2026-10-21T03:31:00.000Z" };
    const dueDateFallback = { status: "pending", due_date: "2026-10-21", remind_at: null };

    assert.equal(isReminderInAppDue(scheduledReminder, "Asia/Kolkata", now), true);
    assert.equal(isReminderInAppDue(notYetScheduled, "Asia/Kolkata", now), false);
    assert.equal(isReminderInAppDue(dueDateFallback, "Asia/Kolkata", now), true);
    assert.equal(
        summarizeReminders([scheduledReminder], "Asia/Kolkata", now).in_app_due,
        1
    );
});

test("validates reminder fields and rejects unsupported ownership input", () => {
    const valid = {
        title: "Renew passport",
        description: "",
        reminder_type: "expiry",
        due_date: "2027-03-31",
        remind_at: "2027-03-24T03:30:00.000Z",
        priority: "high",
        notification_enabled: true,
        document_id: null,
    };

    assert.deepEqual(validateReminderInput(valid).errors, []);
    assert.ok(validateReminderInput({ ...valid, title: " " }).errors.includes("Title is required."));
    assert.ok(validateReminderInput({ ...valid, due_date: "2027-02-30" }).errors.length > 0);
    assert.ok(validateReminderInput({ ...valid, user_id: "arbitrary-user" }).errors.length > 0);
});
