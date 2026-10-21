export const getDateInTimeZone = (date = new Date(), timeZone = "Asia/Kolkata") => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map(({ type, value }) => [type, value])
  );
  return `${values.year}-${values.month}-${values.day}`;
};

export const formatDateOnly = (date, options = {}) => {
  if (!date) return "Date unavailable";
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC", ...options }).format(parsed);
};

export const formatDateTimeInTimeZone = (timestamp, timeZone) => {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
};

export const getDateTimeFieldsInTimeZone = (timestamp, timeZone) => {
  if (!timestamp) return { date: "", time: "09:00" };
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map(({ type, value }) => [type, value])
  );
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
};

export const dateTimeInTimeZoneToIso = (date, time, timeZone) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return null;
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  if (
    calendarDate.getUTCFullYear() !== year
    || calendarDate.getUTCMonth() !== month - 1
    || calendarDate.getUTCDate() !== day
  ) {
    return null;
  }
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
    const values = Object.fromEntries(
      formatter.formatToParts(new Date(timestamp))
        .filter((part) => part.type !== "literal")
        .map(({ type, value }) => [type, Number(value)])
    );
    const displayed = Date.UTC(
      values.year,
      values.month - 1,
      values.day,
      values.hour,
      values.minute
    );
    const difference = desired - displayed;
    if (difference === 0) return new Date(timestamp).toISOString();
    timestamp += difference;
  }

  return null;
};

export const shiftDateOnly = (date, days) => {
  const [year, month, day] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
};

export const getReminderTiming = (reminder, timezone) => {
  if (reminder.status !== "pending") return reminder.status;
  const today = getDateInTimeZone(new Date(), timezone);
  if (reminder.due_date < today) return "overdue";
  if (reminder.due_date === today) return "due_today";
  return "upcoming";
};
