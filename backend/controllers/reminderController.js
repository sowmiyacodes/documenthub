const supabase = require("../config/supabase");
const {
    dateTimeInTimeZoneToIso,
    getDateInTimeZone,
    isValidDateOnly,
    isValidTimeZone,
    summarizeReminders,
} = require("../utils/reminderUtils");

const REMINDER_TYPES = new Set(["expiry", "renewal", "bill_due", "subscription", "custom"]);
const PRIORITIES = new Set(["low", "medium", "high"]);
const STATUSES = new Set(["pending", "completed", "dismissed"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REMINDER_FIELDS = new Set([
    "title", "description", "reminder_type", "due_date", "remind_at",
    "priority", "notification_enabled", "document_id",
]);

const sendError = (res, status, message) => res.status(status).json({ success: false, message });

const getUserId = (req) => {
    const userId = req.user?.id;
    return typeof userId === "string" && UUID_PATTERN.test(userId) ? userId : null;
};

const fetchAllReminders = async (userId) => {
    const records = [];
    const pageSize = 1000;

    for (let start = 0; ; start += pageSize) {
        const { data, error } = await supabase
            .from("reminders")
            .select("*")
            .eq("user_id", userId)
            .order("due_date", { ascending: true })
            .range(start, start + pageSize - 1);

        if (error) throw error;
        records.push(...(data || []));
        if (!data || data.length < pageSize) return records;
    }
};

const withDocumentNames = async (reminders, userId) => {
    const documentIds = [...new Set(reminders.map((item) => item.document_id).filter(Boolean))];
    if (!documentIds.length) return reminders.map((item) => ({ ...item, document_name: null }));

    const { data, error } = await supabase
        .from("documents")
        .select("id, original_name")
        .eq("user_id", userId)
        .in("id", documentIds);

    if (error) throw error;
    const names = new Map((data || []).map((document) => [document.id, document.original_name]));
    return reminders.map((item) => ({
        ...item,
        document_name: item.document_id ? names.get(item.document_id) || null : null,
    }));
};

const validateReminderInput = (body, { partial = false } = {}) => {
    const input = {};
    const errors = [];

    for (const key of Object.keys(body || {})) {
        if (!REMINDER_FIELDS.has(key)) errors.push(`Unsupported field: ${key}.`);
    }

    if (!partial || Object.hasOwn(body, "title")) {
        if (typeof body.title !== "string" || !body.title.trim()) errors.push("Title is required.");
        else if (body.title.trim().length > 250) errors.push("Title must be 250 characters or fewer.");
        else input.title = body.title.trim();
    }

    if (!partial || Object.hasOwn(body, "description")) {
        if (body.description !== undefined && body.description !== null && typeof body.description !== "string") {
            errors.push("Description must be text.");
        } else if ((body.description || "").length > 5000) {
            errors.push("Description must be 5000 characters or fewer.");
        } else {
            input.description = body.description?.trim() || null;
        }
    }

    if (!partial || Object.hasOwn(body, "reminder_type")) {
        if (!REMINDER_TYPES.has(body.reminder_type)) errors.push("Select a valid reminder type.");
        else input.reminder_type = body.reminder_type;
    }

    if (!partial || Object.hasOwn(body, "due_date")) {
        if (!isValidDateOnly(body.due_date)) errors.push("Due date must be a valid YYYY-MM-DD date.");
        else input.due_date = body.due_date;
    }

    if (!partial || Object.hasOwn(body, "remind_at")) {
        if (body.remind_at === null || body.remind_at === "") {
            input.remind_at = null;
        } else if (body.remind_at !== undefined) {
            const instant = new Date(body.remind_at);
            if (
                typeof body.remind_at !== "string"
                || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(body.remind_at)
                || Number.isNaN(instant.getTime())
            ) {
                errors.push("Notification time must be a valid timestamp.");
            } else {
                input.remind_at = instant.toISOString();
            }
        } else if (!partial) {
            input.remind_at = null;
        }
    }

    if (!partial || Object.hasOwn(body, "priority")) {
        if (body.priority === undefined && !partial) input.priority = "medium";
        else if (!PRIORITIES.has(body.priority)) errors.push("Select a valid priority.");
        else input.priority = body.priority;
    }

    if (!partial || Object.hasOwn(body, "notification_enabled")) {
        if (body.notification_enabled === undefined && !partial) input.notification_enabled = true;
        else if (typeof body.notification_enabled !== "boolean") errors.push("Email notification must be enabled or disabled.");
        else input.notification_enabled = body.notification_enabled;
    }

    if (Object.hasOwn(body, "document_id")) {
        if (body.document_id === null || body.document_id === "") input.document_id = null;
        else if (typeof body.document_id !== "string" || !UUID_PATTERN.test(body.document_id)) {
            errors.push("Select a valid linked document.");
        } else {
            input.document_id = body.document_id;
        }
    } else if (!partial) {
        input.document_id = null;
    }

    return { input, errors };
};

const validateOwnedDocument = async (documentId, userId) => {
    if (!documentId) return true;

    const { data, error } = await supabase
        .from("documents")
        .select("id")
        .eq("id", documentId)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) throw error;
    return Boolean(data);
};

const listReminders = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return sendError(res, 401, "A valid authenticated user is required.");

    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
        const search = String(req.query.search || "").trim().toLocaleLowerCase();
        if (req.query.from && !isValidDateOnly(req.query.from)) {
            return sendError(res, 400, "Start date must use YYYY-MM-DD.");
        }
        if (req.query.to && !isValidDateOnly(req.query.to)) {
            return sendError(res, 400, "End date must use YYYY-MM-DD.");
        }
        if (req.query.from && req.query.to && req.query.from > req.query.to) {
            return sendError(res, 400, "Start date must be on or before end date.");
        }
        if (req.query.status && req.query.status !== "all" && !STATUSES.has(req.query.status)) {
            return sendError(res, 400, "Select a valid reminder status.");
        }
        if (req.query.type && req.query.type !== "all" && !REMINDER_TYPES.has(req.query.type)) {
            return sendError(res, 400, "Select a valid reminder type.");
        }
        if (req.query.priority && req.query.priority !== "all" && !PRIORITIES.has(req.query.priority)) {
            return sendError(res, 400, "Select a valid priority.");
        }

        let reminders;
        let count;
        if (search || req.query.sort === "priority") {
            reminders = await fetchAllReminders(userId);
            if (STATUSES.has(req.query.status)) reminders = reminders.filter((item) => item.status === req.query.status);
            if (REMINDER_TYPES.has(req.query.type)) reminders = reminders.filter((item) => item.reminder_type === req.query.type);
            if (PRIORITIES.has(req.query.priority)) reminders = reminders.filter((item) => item.priority === req.query.priority);
            if (req.query.from) reminders = reminders.filter((item) => item.due_date >= req.query.from);
            if (req.query.to) reminders = reminders.filter((item) => item.due_date <= req.query.to);
            reminders = await withDocumentNames(reminders, userId);
            if (search) {
                reminders = reminders.filter((item) => [item.title, item.description, item.document_name]
                    .some((value) => String(value || "").toLocaleLowerCase().includes(search)));
            }
            count = reminders.length;
        } else {
            let query = supabase
                .from("reminders")
                .select("*", { count: "exact" })
                .eq("user_id", userId);

            if (STATUSES.has(req.query.status)) query = query.eq("status", req.query.status);
            if (REMINDER_TYPES.has(req.query.type)) query = query.eq("reminder_type", req.query.type);
            if (PRIORITIES.has(req.query.priority)) query = query.eq("priority", req.query.priority);
            if (req.query.from) query = query.gte("due_date", req.query.from);
            if (req.query.to) query = query.lte("due_date", req.query.to);

            const order = req.query.sort === "due_desc"
                ? { column: "due_date", ascending: false }
                : req.query.sort === "newest"
                    ? { column: "created_at", ascending: false }
                    : { column: "due_date", ascending: true };
            query = query.order(order.column, { ascending: order.ascending });
            const { data, error, count: resultCount } = await query
                .range((page - 1) * limit, page * limit - 1);
            if (error) throw error;
            reminders = await withDocumentNames(data || [], userId);
            count = resultCount || 0;
        }

        if (req.query.sort === "priority") {
            const ranks = { high: 0, medium: 1, low: 2 };
            reminders.sort((a, b) => ranks[a.priority] - ranks[b.priority] || a.due_date.localeCompare(b.due_date));
        } else if (req.query.sort === "due_desc") {
            reminders.sort((a, b) => b.due_date.localeCompare(a.due_date));
        } else if (req.query.sort === "newest") {
            reminders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
            reminders.sort((a, b) => a.due_date.localeCompare(b.due_date));
        }

        if (search || req.query.sort === "priority") {
            reminders = reminders.slice((page - 1) * limit, page * limit);
        }

        return res.json({
            success: true,
            reminders,
            pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
        });
    } catch (error) {
        console.error("Failed to list reminders:", error.message);
        return sendError(res, 500, "Unable to load reminders.");
    }
};

const getReminder = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return sendError(res, 401, "A valid authenticated user is required.");

    try {
        const { data, error } = await supabase
            .from("reminders")
            .select("*")
            .eq("id", req.params.id)
            .eq("user_id", userId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return sendError(res, 404, "Reminder not found.");
        const [reminder] = await withDocumentNames([data], userId);
        return res.json({ success: true, reminder });
    } catch (error) {
        console.error("Failed to fetch reminder:", error.message);
        return sendError(res, 500, "Unable to load this reminder.");
    }
};

const createReminder = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return sendError(res, 401, "A valid authenticated user is required.");
    const { input, errors } = validateReminderInput(req.body);
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(" "), errors });

    try {
        if (input.document_id && !(await validateOwnedDocument(input.document_id, userId))) {
            return sendError(res, 400, "The linked document was not found in your account.");
        }

        const { data, error } = await supabase
            .from("reminders")
            .insert({ ...input, user_id: userId, status: "pending", source: "manual" })
            .select("*")
            .single();

        if (error) throw error;
        const [reminder] = await withDocumentNames([data], userId);
        return res.status(201).json({ success: true, reminder, message: "Reminder created." });
    } catch (error) {
        console.error("Failed to create reminder:", error.message);
        return sendError(res, 500, "Unable to create reminder.");
    }
};

const updateReminder = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return sendError(res, 401, "A valid authenticated user is required.");
    const { input, errors } = validateReminderInput(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ success: false, message: errors.join(" "), errors });
    if (!Object.keys(input).length) return sendError(res, 400, "Provide at least one field to update.");

    try {
        if (input.document_id && !(await validateOwnedDocument(input.document_id, userId))) {
            return sendError(res, 400, "The linked document was not found in your account.");
        }

        const { data, error } = await supabase
            .from("reminders")
            .update({ ...input, updated_at: new Date().toISOString() })
            .eq("id", req.params.id)
            .eq("user_id", userId)
            .select("*")
            .maybeSingle();

        if (error) throw error;
        if (!data) return sendError(res, 404, "Reminder not found.");
        const [reminder] = await withDocumentNames([data], userId);
        return res.json({ success: true, reminder, message: "Reminder updated." });
    } catch (error) {
        console.error("Failed to update reminder:", error.message);
        return sendError(res, 500, "Unable to update reminder.");
    }
};

const updateReminderStatus = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return sendError(res, 401, "A valid authenticated user is required.");
    const { status } = req.body || {};
    if (!STATUSES.has(status)) return sendError(res, 400, "Select pending, completed, or dismissed.");

    try {
        const { data, error } = await supabase
            .from("reminders")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", req.params.id)
            .eq("user_id", userId)
            .select("*")
            .maybeSingle();

        if (error) throw error;
        if (!data) return sendError(res, 404, "Reminder not found.");
        const [reminder] = await withDocumentNames([data], userId);
        return res.json({ success: true, reminder, message: "Reminder status updated." });
    } catch (error) {
        console.error("Failed to change reminder status:", error.message);
        return sendError(res, 500, "Unable to update reminder status.");
    }
};

const deleteReminder = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return sendError(res, 401, "A valid authenticated user is required.");

    try {
        const { data, error } = await supabase
            .from("reminders")
            .delete()
            .eq("id", req.params.id)
            .eq("user_id", userId)
            .select("id")
            .maybeSingle();

        if (error) throw error;
        if (!data) return sendError(res, 404, "Reminder not found.");
        return res.json({ success: true, message: "Reminder deleted." });
    } catch (error) {
        console.error("Failed to delete reminder:", error.message);
        return sendError(res, 500, "Unable to delete reminder.");
    }
};

const getReminderSummary = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return sendError(res, 401, "A valid authenticated user is required.");

    try {
        let timeZone = typeof req.query.timezone === "string" ? req.query.timezone : "Asia/Kolkata";
        if (!isValidTimeZone(timeZone)) timeZone = "Asia/Kolkata";
        const [records, { data: settings, error: settingsError }] = await Promise.all([
            fetchAllReminders(userId),
            supabase.from("user_settings").select("in_app_notifications").eq("user_id", userId).maybeSingle(),
        ]);
        if (settingsError) throw settingsError;

        return res.json({
            success: true,
            summary: summarizeReminders(
                records,
                timeZone,
                new Date(),
                settings?.in_app_notifications !== false
            ),
        });
    } catch (error) {
        console.error("Failed to calculate reminder summary:", error.message);
        return sendError(res, 500, "Unable to load reminder summary.");
    }
};

const getReminderNotifications = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return sendError(res, 401, "A valid authenticated user is required.");

    try {
        const { data: settings, error: settingsError } = await supabase
            .from("user_settings")
            .select("in_app_notifications, timezone")
            .eq("user_id", userId)
            .maybeSingle();
        if (settingsError) throw settingsError;
        if (settings?.in_app_notifications === false) {
            return res.json({ success: true, notifications: [], count: 0 });
        }

        const timeZone = isValidTimeZone(settings?.timezone) ? settings.timezone : "Asia/Kolkata";
        const now = new Date();
        const today = getDateInTimeZone(now, timeZone);
        const [
            scheduledResult,
            dateOnlyResult,
            nextScheduledResult,
            nextDateOnlyResult,
        ] = await Promise.all([
            supabase
                .from("reminders")
                .select("*", { count: "exact" })
                .eq("user_id", userId)
                .eq("status", "pending")
                .not("remind_at", "is", null)
                .lte("remind_at", now.toISOString())
                .order("remind_at", { ascending: true })
                .limit(25),
            supabase
                .from("reminders")
                .select("*", { count: "exact" })
                .eq("user_id", userId)
                .eq("status", "pending")
                .is("remind_at", null)
                .lte("due_date", today)
                .order("due_date", { ascending: true })
                .limit(25),
            supabase
                .from("reminders")
                .select("remind_at")
                .eq("user_id", userId)
                .eq("status", "pending")
                .not("remind_at", "is", null)
                .gt("remind_at", now.toISOString())
                .order("remind_at", { ascending: true })
                .limit(1),
            supabase
                .from("reminders")
                .select("due_date")
                .eq("user_id", userId)
                .eq("status", "pending")
                .is("remind_at", null)
                .gt("due_date", today)
                .order("due_date", { ascending: true })
                .limit(1),
        ]);
        for (const result of [scheduledResult, dateOnlyResult, nextScheduledResult, nextDateOnlyResult]) {
            if (result.error) throw result.error;
        }

        const notifications = [
            ...(scheduledResult.data || []),
            ...(dateOnlyResult.data || []),
        ].sort((first, second) => {
            const firstAt = first.remind_at || `${first.due_date}T00:00:00.000Z`;
            const secondAt = second.remind_at || `${second.due_date}T00:00:00.000Z`;
            return new Date(firstAt) - new Date(secondAt);
        }).slice(0, 20);
        const nextNotificationTimes = [
            nextScheduledResult.data?.[0]?.remind_at,
            nextDateOnlyResult.data?.[0]
                ? dateTimeInTimeZoneToIso(nextDateOnlyResult.data[0].due_date, "00:00", timeZone)
                : null,
        ].filter((value) => value && new Date(value) > now).sort();

        return res.json({
            success: true,
            notifications: await withDocumentNames(notifications, userId),
            count: (scheduledResult.count || 0) + (dateOnlyResult.count || 0),
            next_notification_at: nextNotificationTimes[0] || null,
        });
    } catch (error) {
        console.error("Failed to load in-app reminder notifications:", error.message);
        return sendError(res, 500, "Unable to load in-app notifications.");
    }
};

module.exports = {
    createReminder,
    deleteReminder,
    getReminder,
    getReminderNotifications,
    getReminderSummary,
    listReminders,
    updateReminder,
    updateReminderStatus,
    validateReminderInput,
};
