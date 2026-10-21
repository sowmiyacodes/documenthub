import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { createReminder, updateReminder } from "@/services/reminders";
import {
  dateTimeInTimeZoneToIso,
  getDateInTimeZone,
  getDateTimeFieldsInTimeZone,
  shiftDateOnly,
} from "@/services/dateTime";

const initialForm = (timeZone, defaultDays) => {
  const dueDate = getDateInTimeZone(new Date(), timeZone);
  const remindDate = shiftDateOnly(dueDate, -defaultDays);
  return {
    title: "",
    description: "",
    reminder_type: "custom",
    due_date: dueDate,
    remind_date: remindDate,
    remind_time: "09:00",
    priority: "medium",
    notification_enabled: true,
    document_id: "",
  };
};

export default function ReminderDialog({
  open,
  reminder,
  documents,
  timezone,
  defaultReminderDays,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(() => initialForm(timezone, defaultReminderDays));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (!reminder) {
      setForm(initialForm(timezone, defaultReminderDays));
    } else {
      const notification = getDateTimeFieldsInTimeZone(reminder.remind_at, timezone);
      setForm({
        title: reminder.title || "",
        description: reminder.description || "",
        reminder_type: reminder.reminder_type || "custom",
        due_date: reminder.due_date || "",
        remind_date: notification.date || reminder.due_date || "",
        remind_time: notification.time || "09:00",
        priority: reminder.priority || "medium",
        notification_enabled: Boolean(reminder.notification_enabled),
        document_id: reminder.document_id || "",
      });
    }
    setError("");
  }, [open, reminder, timezone, defaultReminderDays]);

  const setField = (field) => (event) => {
    const value = field === "notification_enabled" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.title.trim()) return setError("Enter a title for this reminder.");
    if (!form.due_date) return setError("Choose a due date.");

    let remindAt = null;
    if (form.remind_date) {
      remindAt = dateTimeInTimeZoneToIso(form.remind_date, form.remind_time, timezone);
      if (!remindAt) return setError("Choose a valid notification time for your selected timezone.");
      if (form.remind_date > form.due_date) {
        return setError("The notification time must not be after the due date.");
      }
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      reminder_type: form.reminder_type,
      due_date: form.due_date,
      remind_at: remindAt,
      priority: form.priority,
      notification_enabled: form.notification_enabled,
      document_id: form.document_id || null,
    };

    setSaving(true);
    try {
      const response = reminder
        ? await updateReminder(reminder.id, payload)
        : await createReminder(payload);
      onSaved(response.reminder);
      onClose();
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Could not save the reminder. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      className="reminder-dialog"
    >
      <Box component="form" onSubmit={handleSave}>
        <DialogTitle className="reminder-dialog-title">
          <Typography component="span" className="reminder-eyebrow">
            PERSONAL REMINDER
          </Typography>
          <Typography component="h2">{reminder ? "Edit reminder" : "Create reminder"}</Typography>
        </DialogTitle>
        <DialogContent className="reminder-dialog-content">
          <Stack spacing={2.2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Title"
              value={form.title}
              onChange={setField("title")}
              required
              autoFocus
              inputProps={{ maxLength: 250 }}
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={setField("description")}
              multiline
              minRows={2}
              inputProps={{ maxLength: 5000 }}
            />
            <Box className="reminder-form-grid">
              <FormControl fullWidth>
                <InputLabel id="reminder-type-label">Reminder type</InputLabel>
                <Select
                  labelId="reminder-type-label"
                  label="Reminder type"
                  value={form.reminder_type}
                  onChange={setField("reminder_type")}
                >
                  <MenuItem value="expiry">Expiry</MenuItem>
                  <MenuItem value="renewal">Renewal</MenuItem>
                  <MenuItem value="bill_due">Bill due</MenuItem>
                  <MenuItem value="subscription">Subscription</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="reminder-priority-label">Priority</InputLabel>
                <Select
                  labelId="reminder-priority-label"
                  label="Priority"
                  value={form.priority}
                  onChange={setField("priority")}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box className="reminder-form-grid">
              <TextField
                label="Due date"
                type="date"
                value={form.due_date}
                onChange={setField("due_date")}
                required
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel id="reminder-document-label">Linked document</InputLabel>
                <Select
                  labelId="reminder-document-label"
                  label="Linked document"
                  value={form.document_id}
                  onChange={setField("document_id")}
                >
                  <MenuItem value="">No linked document</MenuItem>
                  {documents.map((document) => (
                    <MenuItem value={document.id} key={document.id}>
                      {document.original_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography className="reminder-field-label">Notification date and time</Typography>
              <Box className="reminder-form-grid">
                <TextField
                  type="date"
                  label="Notify on"
                  value={form.remind_date}
                  onChange={setField("remind_date")}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="time"
                  label={`Time (${timezone})`}
                  value={form.remind_time}
                  onChange={setField("remind_time")}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={form.notification_enabled}
                  onChange={setField("notification_enabled")}
                />
              }
              label="Allow email notification (also controlled by your global settings)"
            />
            <Typography className="reminder-form-note">
              Date-only due dates stay on the selected calendar day. Notification times use {timezone}.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions className="reminder-dialog-actions">
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving} variant="contained">
            {saving ? "Saving…" : reminder ? "Save changes" : "Create reminder"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
