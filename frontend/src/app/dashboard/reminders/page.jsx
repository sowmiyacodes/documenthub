import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  Autorenew,
  CheckCircle,
  Close,
  Delete,
  EditOutlined,
  EventAvailable,
  NotificationsActiveOutlined,
  Search,
  TaskAlt,
} from "@mui/icons-material";
import { getDocuments } from "@/services/document";
import {
  deleteReminder,
  getReminders,
  getReminderSummary,
  updateReminderStatus,
} from "@/services/reminders";
import { getSettings } from "@/services/settings";
import {
  formatDateOnly,
  formatDateTimeInTimeZone,
  getDateInTimeZone,
  getReminderTiming,
} from "@/services/dateTime";
import ReminderDialog from "@/components/reminders/ReminderDialog";

const PAGE_SIZE = 12;
const summaryCards = [
  { key: "pending", label: "Pending", icon: <NotificationsActiveOutlined /> },
  { key: "due_today", label: "Due today", icon: <EventAvailable /> },
  { key: "upcoming", label: "Upcoming · 30 days", icon: <Autorenew /> },
  { key: "overdue", label: "Overdue", icon: <Close /> },
  { key: "completed", label: "Completed", icon: <TaskAlt /> },
];
const typeLabels = {
  expiry: "Expiry",
  renewal: "Renewal",
  bill_due: "Bill due",
  subscription: "Subscription",
  custom: "Custom",
};

const daysUntil = (dueDate, timezone) => {
  const today = getDateInTimeZone(new Date(), timezone);
  return Math.round((Date.parse(`${dueDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
};

export default function RemindersPage() {
  const [summary, setSummary] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [defaultReminderDays, setDefaultReminderDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [priority, setPriority] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState("due_asc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    Promise.all([getSettings(), getDocuments()])
      .then(([settingsResponse, documentsResponse]) => {
        const settings = settingsResponse.settings;
        setTimezone(settings?.timezone || "Asia/Kolkata");
        setDefaultReminderDays(settings?.default_reminder_days ?? 7);
        setDocuments(documentsResponse.documents || []);
      })
      .catch((loadError) => {
        console.error("Failed to load reminder setup:", loadError);
        setError(loadError.response?.data?.message || "Some reminder preferences or documents could not be loaded.");
      });
  }, []);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const response = await getReminderSummary(timezone);
      setSummary(response.summary);
    } catch (summaryError) {
      console.error("Failed to load reminder summary:", summaryError);
      setError(summaryError.response?.data?.message || "Could not load reminder summary.");
    } finally {
      setSummaryLoading(false);
    }
  }, [timezone]);

  const loadReminders = useCallback(async () => {
    if (from && to && from > to) {
      setError("The start date must be on or before the end date.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        sort,
        search: debouncedSearch || undefined,
        status: status === "all" ? undefined : status,
        type: type === "all" ? undefined : type,
        priority: priority === "all" ? undefined : priority,
        from: from || undefined,
        to: to || undefined,
      };
      const response = await getReminders(params);
      setReminders(response.reminders || []);
      setTotal(response.pagination?.total || 0);
      setPages(Math.max(1, response.pagination?.pages || 1));
    } catch (loadError) {
      console.error("Failed to load reminders:", loadError);
      setError(loadError.response?.data?.message || "Could not load reminders.");
    } finally {
      setLoading(false);
    }
  }, [page, sort, debouncedSearch, status, type, priority, from, to]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (reminder) => {
    setEditing(reminder);
    setDialogOpen(true);
  };

  const refreshAfterChange = () => {
    setToast("Reminder saved.");
    window.dispatchEvent(new Event("lifehub:reminders-changed"));
    loadSummary();
    loadReminders();
  };

  const changeStatus = async (reminder, nextStatus) => {
    try {
      await updateReminderStatus(reminder.id, nextStatus);
      window.dispatchEvent(new Event("lifehub:reminders-changed"));
      setToast(nextStatus === "completed" ? "Reminder completed." : nextStatus === "dismissed" ? "Reminder dismissed." : "Reminder restored.");
      await Promise.all([loadSummary(), loadReminders()]);
    } catch (actionError) {
      console.error("Failed to update reminder:", actionError);
      setError(actionError.response?.data?.message || "Could not update this reminder.");
    }
  };

  const removeReminder = async (reminder) => {
    if (!window.confirm(`Delete "${reminder.title}"? This cannot be undone.`)) return;
    try {
      await deleteReminder(reminder.id);
      window.dispatchEvent(new Event("lifehub:reminders-changed"));
      setToast("Reminder deleted.");
      await Promise.all([loadSummary(), loadReminders()]);
    } catch (actionError) {
      console.error("Failed to delete reminder:", actionError);
      setError(actionError.response?.data?.message || "Could not delete this reminder.");
    }
  };

  const filters = useMemo(() => [
    ["Status", status, setStatus, [
      ["all", "All statuses"], ["pending", "Pending"], ["completed", "Completed"], ["dismissed", "Dismissed"],
    ]],
    ["Type", type, setType, [
      ["all", "All types"], ...Object.entries(typeLabels),
    ]],
    ["Priority", priority, setPriority, [
      ["all", "All priorities"], ["high", "High"], ["medium", "Medium"], ["low", "Low"],
    ]],
  ], [status, type, priority]);

  return (
    <Box className="reminders-page">
      <Box className="reminders-hero">
        <Box>
          <Typography className="reminders-eyebrow">STAY A STEP AHEAD</Typography>
          <Typography component="h1" className="reminders-title">Reminders</Typography>
          <Typography className="reminders-subtitle">
            Important dates from your documents and the things you add yourself.
          </Typography>
        </Box>
        <Button className="reminders-create-button" variant="contained" startIcon={<Add />} onClick={openCreate}>
          New reminder
        </Button>
      </Box>

      {error && (
        <Alert severity="error" className="reminders-error" onClose={() => setError("")} action={
          <Button color="inherit" size="small" onClick={() => { loadReminders(); loadSummary(); }}>Retry</Button>
        }>
          {error}
        </Alert>
      )}

      <Box className="reminders-summary-grid">
        {summaryCards.map((item) => (
          <Box className={`reminders-summary-card summary-${item.key}`} key={item.key}>
            <Box className="reminders-summary-icon">{item.icon}</Box>
            <Typography className="reminders-summary-label">{item.label}</Typography>
            <Typography className="reminders-summary-value">
              {summaryLoading ? "—" : summary?.[item.key] ?? 0}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box className="reminders-list-panel">
        <Box className="reminders-list-heading">
          <Box>
            <Typography className="reminders-section-kicker">YOUR SCHEDULE</Typography>
            <Typography component="h2">All reminders</Typography>
          </Box>
          <Typography className="reminders-result-count">{total} {total === 1 ? "reminder" : "reminders"}</Typography>
        </Box>

        <Box className="reminders-filters">
          <TextField
            size="small"
            placeholder="Search reminders..."
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            className="reminders-search"
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />
          {filters.map(([label, value, setter, options]) => (
            <FormControl size="small" key={label} className="reminders-filter-select">
              <InputLabel>{label}</InputLabel>
              <Select
                label={label}
                value={value}
                onChange={(event) => { setter(event.target.value); setPage(1); }}
              >
                {options.map(([optionValue, optionLabel]) => (
                  <MenuItem key={optionValue} value={optionValue}>{optionLabel}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
          <FormControl size="small" className="reminders-filter-select">
            <InputLabel>Sort</InputLabel>
            <Select label="Sort" value={sort} onChange={(event) => setSort(event.target.value)}>
              <MenuItem value="due_asc">Due date · earliest</MenuItem>
              <MenuItem value="due_desc">Due date · latest</MenuItem>
              <MenuItem value="newest">Recently created</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Due from"
            type="date"
            size="small"
            value={from}
            onChange={(event) => { setFrom(event.target.value); setPage(1); }}
            InputLabelProps={{ shrink: true }}
            className="reminders-date-filter"
          />
          <TextField
            label="Due through"
            type="date"
            size="small"
            value={to}
            onChange={(event) => { setTo(event.target.value); setPage(1); }}
            InputLabelProps={{ shrink: true }}
            className="reminders-date-filter"
          />
        </Box>

        {loading ? (
          <Box className="reminders-loading"><CircularProgress /><Typography>Loading your reminders…</Typography></Box>
        ) : reminders.length === 0 ? (
          <Box className="reminders-empty">
            <Box className="reminders-empty-icon"><EventAvailable /></Box>
            <Typography component="h3">{total ? "No reminders match these filters." : "Nothing on your schedule yet."}</Typography>
            <Typography>
              {total ? "Try changing the search or filters." : "Add a reminder or upload a document with a clearly stated expiry or due date."}
            </Typography>
            {!total && <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Create your first reminder</Button>}
          </Box>
        ) : (
          <Stack className="reminder-list" spacing={1.25}>
            {reminders.map((reminder) => {
              const timing = getReminderTiming(reminder, timezone);
              const delta = daysUntil(reminder.due_date, timezone);
              const statusLabel = timing === "due_today"
                ? "Due today"
                : timing === "overdue"
                  ? `${Math.abs(delta)} ${Math.abs(delta) === 1 ? "day" : "days"} overdue`
                  : timing === "upcoming"
                    ? `${delta} ${delta === 1 ? "day" : "days"} left`
                    : reminder.status;

              return (
                <Box className={`reminder-row reminder-${timing}`} key={reminder.id}>
                  <Box className="reminder-date-tile">
                    <span>{new Date(`${reminder.due_date}T00:00:00.000Z`).toLocaleDateString(undefined, { month: "short", timeZone: "UTC" })}</span>
                    <strong>{reminder.due_date.slice(8, 10)}</strong>
                  </Box>
                  <Box className="reminder-content">
                    <Box className="reminder-title-line">
                      <Typography className="reminder-title">{reminder.title}</Typography>
                      {reminder.source === "ai" && <span className="reminder-source-badge">AI detected · review</span>}
                    </Box>
                    {reminder.description && <Typography className="reminder-description">{reminder.description}</Typography>}
                    <Box className="reminder-meta">
                      <span>{typeLabels[reminder.reminder_type] || "Custom"}</span>
                      <span>{formatDateOnly(reminder.due_date)}</span>
                      <span className={`reminder-priority priority-${reminder.priority}`}>{reminder.priority} priority</span>
                      {reminder.document_name && <span>Document: {reminder.document_name}</span>}
                      {reminder.remind_at && <span>Notify: {formatDateTimeInTimeZone(reminder.remind_at, timezone)}</span>}
                      <span>{reminder.notification_enabled ? "Email allowed" : "Email off"}</span>
                      {reminder.notification_sent_at && <span>Email sent</span>}
                    </Box>
                  </Box>
                  <Box className={`reminder-status-pill status-${timing}`}>
                    {statusLabel}
                  </Box>
                  <Box className="reminder-actions">
                    {reminder.status !== "completed" && (
                      <Tooltip title="Mark complete">
                        <IconButton aria-label={`Complete ${reminder.title}`} onClick={() => changeStatus(reminder, "completed")}>
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                    )}
                    {reminder.status === "dismissed" ? (
                      <Tooltip title="Restore reminder">
                        <IconButton aria-label={`Restore ${reminder.title}`} onClick={() => changeStatus(reminder, "pending")}>
                          <Autorenew />
                        </IconButton>
                      </Tooltip>
                    ) : reminder.status === "pending" ? (
                      <Tooltip title="Dismiss reminder">
                        <IconButton aria-label={`Dismiss ${reminder.title}`} onClick={() => changeStatus(reminder, "dismissed")}>
                          <Close />
                        </IconButton>
                      </Tooltip>
                    ) : null}
                    <Tooltip title="Edit reminder">
                      <IconButton aria-label={`Edit ${reminder.title}`} onClick={() => openEdit(reminder)}><EditOutlined /></IconButton>
                    </Tooltip>
                    <Tooltip title="Delete reminder">
                      <IconButton aria-label={`Delete ${reminder.title}`} onClick={() => removeReminder(reminder)}><Delete /></IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}

        {!loading && pages > 1 && (
          <Box className="reminders-pagination">
            <Pagination count={pages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
          </Box>
        )}
      </Box>

      <ReminderDialog
        open={dialogOpen}
        reminder={editing}
        documents={documents}
        timezone={timezone}
        defaultReminderDays={defaultReminderDays}
        onClose={() => setDialogOpen(false)}
        onSaved={refreshAfterChange}
      />
      <Snackbar open={Boolean(toast)} autoHideDuration={3500} onClose={() => setToast("")}>
        <Alert severity="success" onClose={() => setToast("")}>{toast}</Alert>
      </Snackbar>
    </Box>
  );
}
