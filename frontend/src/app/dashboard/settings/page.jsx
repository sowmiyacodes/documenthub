import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  LanguageOutlined,
  NotificationsActiveOutlined,
  PaletteOutlined,
  PlayArrowOutlined,
  SaveOutlined,
} from "@mui/icons-material";
import { getSettings, updateSettings } from "@/services/settings";
import { applyThemePreference } from "@/services/theme";
import {
  playNotificationSound,
  prepareNotificationSound,
} from "@/services/notificationSound";

const DEFAULTS = {
  email_notifications: true,
  in_app_notifications: true,
  default_reminder_days: 7,
  theme: "light",
  timezone: "Asia/Kolkata",
};
const COMMON_TIMEZONES = [
  "Asia/Kolkata", "UTC", "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo",
  "Europe/London", "Europe/Paris", "America/New_York", "America/Chicago",
  "America/Denver", "America/Los_Angeles", "Australia/Sydney", "Pacific/Auckland",
];
const TIMEZONES = typeof Intl.supportedValuesOf === "function"
  ? [...new Set(["UTC", ...Intl.supportedValuesOf("timeZone")])]
  : COMMON_TIMEZONES;

const normalizeSettings = (settings) => ({
  email_notifications: Boolean(settings.email_notifications),
  in_app_notifications: Boolean(settings.in_app_notifications),
  default_reminder_days: Number(settings.default_reminder_days),
  theme: settings.theme,
  timezone: settings.timezone,
});

export default function SettingsPage() {
  const [form, setForm] = useState(DEFAULTS);
  const [saved, setSaved] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem("lifehub-notification-sound") !== "false"
  );

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);

  useEffect(() => {
    let active = true;
    getSettings()
      .then((response) => {
        if (!active) return;
        const settings = normalizeSettings(response.settings);
        setForm(settings);
        setSaved(settings);
        localStorage.setItem("lifehub-timezone", settings.timezone);
        applyThemePreference(settings.theme);
      })
      .catch((loadError) => {
        console.error("Failed to load settings:", loadError);
        if (active) setError(loadError.response?.data?.message || "Could not load your saved settings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateTheme = (theme) => {
    updateField("theme", theme);
    applyThemePreference(theme);
  };

  const updateSound = (enabled) => {
    setSoundEnabled(enabled);
    localStorage.setItem("lifehub-notification-sound", String(enabled));
    if (enabled) prepareNotificationSound();
  };

  const testSound = async () => {
    if (await playNotificationSound()) setToast("Reminder sound is working.");
    else setError("This browser could not play the reminder sound. Check that audio is allowed.");
  };

  const save = async (event) => {
    event.preventDefault();
    if (form.default_reminder_days === ""
      || !Number.isInteger(Number(form.default_reminder_days))
      || Number(form.default_reminder_days) < 0
      || Number(form.default_reminder_days) > 365) {
      setError("Default reminder days must be a whole number from 0 to 365.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await updateSettings({
        ...form,
        default_reminder_days: Number(form.default_reminder_days),
      });
      const settings = normalizeSettings(response.settings);
      setForm(settings);
      setSaved(settings);
      localStorage.setItem("lifehub-timezone", settings.timezone);
      applyThemePreference(settings.theme);
      window.dispatchEvent(new Event("lifehub:reminders-changed"));
      setToast("Your preferences are saved.");
    } catch (saveError) {
      console.error("Failed to save settings:", saveError);
      applyThemePreference(saved.theme);
      setError(saveError.response?.data?.message || "Could not save your settings. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box className="settings-page">
      <Box className="settings-hero">
        <Box>
          <Typography className="settings-eyebrow">YOUR PREFERENCES</Typography>
          <Typography component="h1" className="settings-title">Settings</Typography>
          <Typography className="settings-subtitle">Make LifeHub work the way you do.</Typography>
        </Box>
        <Button
          type="submit"
          form="user-settings-form"
          variant="contained"
          startIcon={saving ? <CircularProgress size={17} /> : <SaveOutlined />}
          disabled={loading || saving || !dirty}
          className="settings-save-button"
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </Box>

      {error && <Alert severity="error" onClose={() => setError("")} className="settings-error">{error}</Alert>}

      {loading ? (
        <Box className="settings-loading"><CircularProgress /><Typography>Loading your preferences…</Typography></Box>
      ) : (
        <Box component="form" id="user-settings-form" onSubmit={save} className="settings-sections">
          <Box className="settings-section">
            <Box className="settings-section-icon"><NotificationsActiveOutlined /></Box>
            <Box className="settings-section-body">
              <Typography component="h2">Notifications</Typography>
              <Typography className="settings-section-description">
                Choose how and when LifeHub lets you know about important dates.
              </Typography>
              <Stack className="settings-preference-list">
                <Box className="settings-preference-row">
                  <Box>
                    <Typography>Email notifications</Typography>
                    <Typography variant="body2">A global switch. Each reminder can also opt out of email.</Typography>
                  </Box>
                  <Switch checked={form.email_notifications} onChange={(event) => updateField("email_notifications", event.target.checked)} />
                </Box>
                <Box className="settings-preference-row">
                  <Box>
                    <Typography>In-app reminders</Typography>
                    <Typography variant="body2">Show due and overdue reminders in the workspace.</Typography>
                  </Box>
                  <Switch checked={form.in_app_notifications} onChange={(event) => updateField("in_app_notifications", event.target.checked)} />
                </Box>
                <Box className="settings-preference-row">
                  <Box>
                    <Typography>Sound alerts</Typography>
                    <Typography variant="body2">Play a short sound when a reminder becomes due in this browser.</Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Switch
                      checked={soundEnabled}
                      onChange={(event) => updateSound(event.target.checked)}
                      inputProps={{ "aria-label": "Enable reminder sound" }}
                    />
                    <Button
                      size="small"
                      startIcon={<PlayArrowOutlined />}
                      onClick={testSound}
                      sx={{ color: "#174681", whiteSpace: "nowrap" }}
                    >
                      Test sound
                    </Button>
                  </Stack>
                </Box>
                <Box className="settings-preference-row settings-days-row">
                  <Box>
                    <Typography>Default advance notice</Typography>
                    <Typography variant="body2">Used when creating a reminder and when an AI date is detected.</Typography>
                  </Box>
                  <TextField
                    type="number"
                    size="small"
                    label="Days before"
                    value={form.default_reminder_days}
                    onChange={(event) => updateField("default_reminder_days", event.target.value === "" ? "" : Number(event.target.value))}
                    inputProps={{ min: 0, max: 365, step: 1 }}
                    error={form.default_reminder_days === "" || form.default_reminder_days < 0 || form.default_reminder_days > 365}
                  />
                </Box>
              </Stack>
            </Box>
          </Box>

          <Box className="settings-section">
            <Box className="settings-section-icon"><PaletteOutlined /></Box>
            <Box className="settings-section-body">
              <Typography component="h2">Appearance</Typography>
              <Typography className="settings-section-description">
                Switch to dark mode or follow your device preference.
              </Typography>
              <Box className="settings-preference-row settings-dark-mode-row">
                <Box>
                  <Typography>Dark mode</Typography>
                  <Typography variant="body2">Preview the darker blue workspace immediately; save to keep it.</Typography>
                </Box>
                <Switch
                  checked={form.theme === "dark"}
                  onChange={(event) => updateTheme(event.target.checked ? "dark" : "light")}
                  inputProps={{ "aria-label": "Enable dark mode" }}
                />
              </Box>
              <FormControl fullWidth className="settings-theme-select">
                <TextField
                  select
                  label="Color theme"
                  value={form.theme}
                  onChange={(event) => updateTheme(event.target.value)}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </TextField>
              </FormControl>
              <Typography className="settings-inline-note">
                Theme changes preview immediately. Save changes to keep your selection.
              </Typography>
            </Box>
          </Box>

          <Box className="settings-section">
            <Box className="settings-section-icon"><LanguageOutlined /></Box>
            <Box className="settings-section-body">
              <Typography component="h2">Regional preferences</Typography>
              <Typography className="settings-section-description">
                Date-only deadlines keep their calendar date; notification times use your selected timezone.
              </Typography>
              <Autocomplete
                options={TIMEZONES}
                value={form.timezone}
                onChange={(_, value) => value && updateField("timezone", value)}
                renderInput={(params) => <TextField {...params} label="Timezone" />}
                className="settings-timezone"
              />
              <Typography className="settings-inline-note">
                Default: Asia/Kolkata. Stored notification times are timezone-safe timestamps.
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      <Snackbar open={Boolean(toast)} autoHideDuration={3500} onClose={() => setToast("")}>
        <Alert severity="success" onClose={() => setToast("")}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
