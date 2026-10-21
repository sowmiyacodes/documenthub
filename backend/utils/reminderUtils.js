const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isValidDateOnly = (value) => {
    if (typeof value !== "string" || !DATE_ONLY_PATTERN.test(value)) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return date.getUTCFullYear() === year
        && date.getUTCMonth() === month - 1
        && date.getUTCDate() === day;
};

const isValidTimeZone = (value) => {
    if (typeof value !== "string" || !value.trim()) {
        return false;
    }

    try {
        new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
        return true;
    } catch {
        return false;
    }
};

const dateTimeInTimeZoneToIso = (dateOnly, time, timeZone) => {
    if (!isValidDateOnly(dateOnly) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) || !isValidTimeZone(timeZone)) {
        return null;
    }

    const [year, month, day] = dateOnly.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const desired = Date.UTC(year, month - 1, day, hour, minute);
    const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    });
    let timestamp = desired;

    for (let iteration = 0; iteration < 4; iteration += 1) {
        const parts = Object.fromEntries(
            formatter.formatToParts(new Date(timestamp))
                .filter((part) => part.type !== "literal")
                .map(({ type, value }) => [type, Number(value)])
        );
        const displayed = Date.UTC(
            parts.year,
            parts.month - 1,
            parts.day,
            parts.hour,
            parts.minute
        );
        const difference = desired - displayed;

        if (difference === 0) {
            return new Date(timestamp).toISOString();
        }

        timestamp += difference;
    }

    return null;
};

const getDateInTimeZone = (timestamp, timeZone) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date(timestamp));
    const dateParts = Object.fromEntries(
        parts.filter((part) => part.type !== "literal").map(({ type, value }) => [type, value])
    );

    return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
};

const shiftDateOnly = (dateOnly, days) => {
    if (!isValidDateOnly(dateOnly) || !Number.isInteger(days)) {
        return null;
    }

    const [year, month, day] = dateOnly.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days));

    return date.toISOString().slice(0, 10);
};

const isReminderInAppDue = (reminder, timeZone, now = new Date()) => {
    if (reminder.status !== "pending") return false;
    if (reminder.remind_at) {
        const remindAt = new Date(reminder.remind_at);
        return !Number.isNaN(remindAt.getTime()) && remindAt <= now;
    }
    return reminder.due_date <= getDateInTimeZone(now, timeZone);
};

const summarizeReminders = (records, timeZone, now = new Date(), inAppEnabled = true) => {
    const today = getDateInTimeZone(now, timeZone);
    const upcomingDate = new Date(`${today}T00:00:00.000Z`);
    upcomingDate.setUTCDate(upcomingDate.getUTCDate() + 30);
    const upcomingThrough = upcomingDate.toISOString().slice(0, 10);
    const pending = records.filter((item) => item.status === "pending");

    return {
        pending: pending.length,
        due_today: pending.filter((item) => item.due_date === today).length,
        upcoming: pending.filter((item) => item.due_date > today && item.due_date <= upcomingThrough).length,
        overdue: pending.filter((item) => item.due_date < today).length,
        completed: records.filter((item) => item.status === "completed").length,
        dismissed: records.filter((item) => item.status === "dismissed").length,
        in_app_due: inAppEnabled ? pending.filter((item) => isReminderInAppDue(item, timeZone, now)).length : 0,
        timezone: timeZone,
    };
};

module.exports = {
    dateTimeInTimeZoneToIso,
    getDateInTimeZone,
    isReminderInAppDue,
    isValidDateOnly,
    isValidTimeZone,
    shiftDateOnly,
    summarizeReminders,
};
