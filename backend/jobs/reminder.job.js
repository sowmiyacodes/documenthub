const cron = require("node-cron");
const supabase = require("../config/supabase");
const { getTransporter, sendReminderEmail } = require("../services/emailService");

let scheduledTask;
let running = false;
let smtpWarningLogged = false;

const deliverDueReminders = async () => {
    if (running) return;
    running = true;

    try {
        const now = new Date().toISOString();
        const staleClaimBefore = new Date(Date.now() - 30 * 60 * 1000).toISOString();
        const { data: staleClaims, error: staleClaimsError } = await supabase
            .from("reminders")
            .select("id, user_id, notification_sent_at")
            .eq("status", "pending")
            .eq("notification_enabled", true)
            .not("notification_sent_at", "is", null)
            .lt("notification_sent_at", staleClaimBefore);

        if (staleClaimsError) throw staleClaimsError;
        for (const staleClaim of staleClaims || []) {
            const { error } = await supabase
                .from("reminders")
                .update({ notification_sent_at: null, updated_at: now })
                .eq("id", staleClaim.id)
                .eq("user_id", staleClaim.user_id)
                .eq("notification_sent_at", staleClaim.notification_sent_at);
            if (error) console.error(`Could not recover stale reminder claim ${staleClaim.id}:`, error.message);
        }

        const { data: dueReminders, error: remindersError } = await supabase
            .from("reminders")
            .select("*")
            .eq("status", "pending")
            .eq("notification_enabled", true)
            .is("notification_sent_at", null)
            .not("remind_at", "is", null)
            .lte("remind_at", now)
            .order("remind_at", { ascending: true })
            .limit(200);

        if (remindersError) throw remindersError;
        if (!dueReminders?.length) return;

        const userIds = [...new Set(dueReminders.map((reminder) => reminder.user_id))];
        const [settingsResult, usersResult] = await Promise.all([
            supabase.from("user_settings").select("user_id, email_notifications").in("user_id", userIds),
            supabase.from("users").select("id, email").in("id", userIds),
        ]);
        if (settingsResult.error) throw settingsResult.error;
        if (usersResult.error) throw usersResult.error;

        const settingsByUser = new Map((settingsResult.data || []).map((item) => [item.user_id, item]));
        const emailByUser = new Map((usersResult.data || []).map((item) => [item.id, item.email]));
        const documentIds = [...new Set(dueReminders.map((item) => item.document_id).filter(Boolean))];
        const documentsResult = documentIds.length
            ? await supabase.from("documents").select("id, original_name").in("id", documentIds)
            : { data: [], error: null };
        if (documentsResult.error) throw documentsResult.error;
        const documentNames = new Map((documentsResult.data || []).map((item) => [item.id, item.original_name]));

        for (const reminder of dueReminders) {
            if (settingsByUser.get(reminder.user_id)?.email_notifications === false) continue;
            const email = emailByUser.get(reminder.user_id);
            if (!email) {
                console.error(`Cannot send reminder ${reminder.id}: account email is unavailable.`);
                continue;
            }

            const claimAt = new Date().toISOString();
            const { data: claimed, error: claimError } = await supabase
                .from("reminders")
                .update({ notification_sent_at: claimAt, updated_at: claimAt })
                .eq("id", reminder.id)
                .eq("user_id", reminder.user_id)
                .eq("status", "pending")
                .eq("notification_enabled", true)
                .is("notification_sent_at", null)
                .select("id")
                .maybeSingle();

            if (claimError) {
                console.error(`Could not claim reminder ${reminder.id}:`, claimError.message);
                continue;
            }
            if (!claimed) continue;

            try {
                await sendReminderEmail({
                    to: email,
                    reminder,
                    documentName: documentNames.get(reminder.document_id) || null,
                });
                console.info(`Reminder email sent for ${reminder.id}.`);
            } catch (error) {
                const { error: releaseError } = await supabase
                    .from("reminders")
                    .update({ notification_sent_at: null, updated_at: new Date().toISOString() })
                    .eq("id", reminder.id)
                    .eq("user_id", reminder.user_id)
                    .eq("notification_sent_at", claimAt);

                if (releaseError) {
                    console.error(`Could not release failed reminder claim ${reminder.id}:`, releaseError.message);
                }
                console.error(`Reminder email delivery failed for ${reminder.id}:`, error.message);
            }
        }
    } catch (error) {
        console.error("Reminder notification job failed:", error.message);
    } finally {
        running = false;
    }
};

const start = () => {
    if (scheduledTask) return;
    if (!getTransporter()) {
        if (!smtpWarningLogged) {
            console.warn("Reminder email scheduler is disabled: configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.");
            smtpWarningLogged = true;
        }
        return;
    }

    scheduledTask = cron.schedule("* * * * *", deliverDueReminders, { timezone: "UTC" });
    console.info("Reminder email scheduler started (runs once per minute).");
};

module.exports = { deliverDueReminders, start };
