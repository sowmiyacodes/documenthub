const supabase = require("../config/supabase");
const { isValidTimeZone } = require("../utils/reminderUtils");

const SETTINGS_DEFAULTS = {
    email_notifications: true,
    in_app_notifications: true,
    default_reminder_days: 7,
    theme: "light",
    timezone: "Asia/Kolkata",
};
const SETTINGS_FIELDS = new Set(Object.keys(SETTINGS_DEFAULTS));

const getUserId = (req) => {
    const userId = req.user?.id;
    return typeof userId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)
        ? userId
        : null;
};

const getSettings = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "A valid authenticated user is required." });

    try {
        const { data, error } = await supabase
            .from("user_settings")
            .upsert({ user_id: userId, ...SETTINGS_DEFAULTS }, { onConflict: "user_id", ignoreDuplicates: true })
            .select("*")
            .maybeSingle();

        if (error) throw error;
        if (data) return res.json({ success: true, settings: data });

        const { data: existing, error: fetchError } = await supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", userId)
            .single();
        if (fetchError) throw fetchError;
        return res.json({ success: true, settings: existing });
    } catch (error) {
        console.error("Failed to load user settings:", error.message);
        return res.status(500).json({ success: false, message: "Unable to load settings." });
    }
};

const updateSettings = async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, message: "A valid authenticated user is required." });

    const updates = {};
    const errors = [];
    for (const key of Object.keys(req.body || {})) {
        if (!SETTINGS_FIELDS.has(key)) errors.push(`Unsupported setting: ${key}.`);
    }

    for (const key of ["email_notifications", "in_app_notifications"]) {
        if (Object.hasOwn(req.body || {}, key)) {
            if (typeof req.body[key] !== "boolean") errors.push(`${key} must be true or false.`);
            else updates[key] = req.body[key];
        }
    }

    if (Object.hasOwn(req.body || {}, "default_reminder_days")) {
        const days = req.body.default_reminder_days;
        if (!Number.isInteger(days) || days < 0 || days > 365) {
            errors.push("Default reminder days must be a whole number from 0 to 365.");
        } else {
            updates.default_reminder_days = days;
        }
    }

    if (Object.hasOwn(req.body || {}, "theme")) {
        if (!["light", "dark", "system"].includes(req.body.theme)) errors.push("Theme must be light, dark, or system.");
        else updates.theme = req.body.theme;
    }

    if (Object.hasOwn(req.body || {}, "timezone")) {
        if (!isValidTimeZone(req.body.timezone)) errors.push("Select a valid IANA timezone.");
        else updates.timezone = req.body.timezone;
    }

    if (errors.length) return res.status(400).json({ success: false, message: errors.join(" "), errors });
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: "Provide at least one setting to update." });

    try {
        const { data: existing, error: existingError } = await supabase
            .from("user_settings")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();
        if (existingError) throw existingError;

        const { data, error } = await supabase
            .from("user_settings")
            .upsert(
                {
                    user_id: userId,
                    ...SETTINGS_DEFAULTS,
                    ...(existing || {}),
                    ...updates,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
            )
            .select("*")
            .single();

        if (error) throw error;
        return res.json({ success: true, settings: data, message: "Settings saved." });
    } catch (error) {
        console.error("Failed to update user settings:", error.message);
        return res.status(500).json({ success: false, message: "Unable to save settings." });
    }
};

module.exports = { getSettings, updateSettings };
