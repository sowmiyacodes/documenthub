import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AppBar,
  Toolbar,
  Box,
  Typography,
  Paper,
  InputBase,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Button,
  Snackbar,
} from "@mui/material";

import {
  Search,
  NotificationsNone,
  AccountCircle,
  Settings,
  Logout,
  AutoAwesome,
} from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";
import { getReminderNotifications } from "@/services/reminders";
import { formatDateOnly, formatDateTimeInTimeZone } from "@/services/dateTime";
import { playNotificationSound, prepareNotificationSound } from "@/services/notificationSound";

export default function TopNavbar() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const knownNotificationIds = useRef(null);
  const nextNotificationTimer = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = location.pathname.startsWith("/dashboard/documents")
    ? "My documents"
    : location.pathname.startsWith("/dashboard/assistant")
      ? "AI workspace"
      : location.pathname.startsWith("/dashboard/reminders")
        ? "Reminders"
        : location.pathname.startsWith("/dashboard/settings")
          ? "Settings"
          : "Overview";

  const loadNotifications = useCallback(async () => {
    try {
      const response = await getReminderNotifications();
      const updatedNotifications = response.notifications || [];
      const newNotifications = knownNotificationIds.current
        ? updatedNotifications.filter((item) => !knownNotificationIds.current.has(item.id))
        : updatedNotifications.filter((item) => (
          item.remind_at
          && Date.now() - new Date(item.remind_at).getTime() < 90_000
        ));
      if (newNotifications.length) {
        const firstTitle = newNotifications[0].title;
        setNotificationMessage(
          newNotifications.length === 1
            ? `Reminder: ${firstTitle}`
            : `${newNotifications.length} reminders are due.`
        );
        if (localStorage.getItem("lifehub-notification-sound") !== "false") {
          await playNotificationSound();
        }
      }
      knownNotificationIds.current = new Set(updatedNotifications.map((item) => item.id));
      setNotifications(updatedNotifications);
      setNotificationCount(response.count || 0);
      setNotificationsError("");
      if (nextNotificationTimer.current) {
        window.clearTimeout(nextNotificationTimer.current);
      }
      if (response.next_notification_at) {
        const delay = Math.max(0, new Date(response.next_notification_at).getTime() - Date.now() + 150);
        nextNotificationTimer.current = window.setTimeout(
          loadNotifications,
          Math.min(delay, 2_147_000_000)
        );
      }
    } catch (error) {
      console.error("Could not load in-app reminder notifications:", error);
      setNotificationsError(error.response?.data?.message || "Could not load notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30_000);
    window.addEventListener("focus", loadNotifications);
    window.addEventListener("lifehub:reminders-changed", loadNotifications);
    return () => {
      window.clearInterval(interval);
      if (nextNotificationTimer.current) window.clearTimeout(nextNotificationTimer.current);
      window.removeEventListener("focus", loadNotifications);
      window.removeEventListener("lifehub:reminders-changed", loadNotifications);
    };
  }, [loadNotifications, location.pathname]);

  useEffect(() => {
    const unlockSound = () => {
      window.removeEventListener("pointerdown", unlockSound);
      window.removeEventListener("keydown", unlockSound);
      if (localStorage.getItem("lifehub-notification-sound") !== "false") {
        prepareNotificationSound();
      }
    };
    window.addEventListener("pointerdown", unlockSound, { once: true });
    window.addEventListener("keydown", unlockSound, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlockSound);
      window.removeEventListener("keydown", unlockSound);
    };
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser({});
      }
    }
  }, []);

  const openMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const closeNotifications = () => setNotificationAnchor(null);
  const openReminder = () => {
    closeNotifications();
    navigate("/dashboard/reminders");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    closeMenu();
  };

  return (
    <>
      <AppBar
        className="workspace-topbar"
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "#ffffff",
          color: "#0f172a",
          borderBottom: "1px solid #e2e8f0",
          zIndex: 1100,
        }}
      >
        <Toolbar
          className="workspace-topbar-inner"
          sx={{
            minHeight: "64px !important",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, md: 3.5 },
          }}
        >
          {/* Left Title / Workspace indicator */}
          <Box className="workspace-page-heading" display="flex" alignItems="center" gap={1.5}>
            <Box>
              <Typography className="workspace-page-title" sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", lineHeight: 1.2 }}>
                {pageTitle}
              </Typography>
              <Typography className="workspace-page-breadcrumb" variant="caption" sx={{ color: "#64748b", fontSize: "0.74rem" }}>
                Your workspace <span>/</span> {pageTitle}
              </Typography>
            </Box>
          </Box>

          {/* Center Search Bar */}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              flex: "0 1 420px",
              mx: 2,
            }}
          >
            <Paper
              className="workspace-global-search"
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                px: 1.5,
                py: 0.6,
                borderRadius: "0.65rem",
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                transition: "all 0.15s ease",
                "&:focus-within": {
                  borderColor: "#2563eb",
                  bgcolor: "#ffffff",
                  boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                },
              }}
            >
              <Search sx={{ color: "#94a3b8", fontSize: 18, mr: 1 }} />
              <InputBase
                placeholder="Search across all documents..."
                sx={{ fontSize: "0.85rem", width: "100%" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate("/dashboard/documents");
                  }
                }}
              />
              <Box
                sx={{
                  bgcolor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.35rem",
                  px: 0.65,
                  py: 0.1,
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: "#64748b",
                }}
              >
                ⌘K
              </Box>
            </Paper>
          </Box>

          {/* Right Actions */}
          <Box display="flex" alignItems="center" gap={1.25}>
            <Tooltip title="AI Status">
              <IconButton
                onClick={() => navigate("/dashboard/assistant")}
                size="small"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.55rem",
                  p: 0.8,
                  color: "#2563eb",
                  "&:hover": { bgcolor: "#eff6ff", borderColor: "#bfdbfe" },
                }}
              >
                <AutoAwesome sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton
                aria-label={`Open notifications${notificationCount ? `, ${notificationCount} due` : ""}`}
                onClick={(event) => setNotificationAnchor(event.currentTarget)}
                size="small"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.55rem",
                  p: 0.8,
                  color: "#64748b",
                  "&:hover": { bgcolor: "#f1f5f9" },
                }}
              >
                <Badge
                  badgeContent={notificationCount}
                  max={99}
                  invisible={!notificationCount}
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "#dbeafe",
                      color: "#174681",
                      border: "1px solid #a9c3e3",
                    },
                  }}
                >
                  <NotificationsNone sx={{ fontSize: 18 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Profile Pill */}
            <Box
              className="workspace-profile-trigger"
              onClick={openMenu}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                pl: 1,
                pr: 1.5,
                py: 0.5,
                borderRadius: "0.65rem",
                cursor: "pointer",
                border: "1px solid #e2e8f0",
                bgcolor: "#f8fafc",
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: "#f1f5f9",
                  borderColor: "#cbd5e1",
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#2563eb",
                  width: 28,
                  height: 28,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>

              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "0.825rem",
                  color: "#0f172a",
                  display: { xs: "none", md: "block" },
                }}
              >
                {user?.full_name || "Account"}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Popover
        open={Boolean(notificationAnchor)}
        anchorEl={notificationAnchor}
        onClose={closeNotifications}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { width: { xs: 320, sm: 380 }, mt: 1, border: "1px solid #dbeafe", borderRadius: 2, boxShadow: "0 16px 40px rgba(30, 64, 175, 0.16)" } } }}
      >
        <Box sx={{ px: 2, pt: 1.75, pb: 1.25, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography sx={{ fontWeight: 750, color: "#174681" }}>Notifications</Typography>
            <Typography variant="caption" sx={{ color: "#3b5990" }}>
              {notificationCount ? `${notificationCount} reminder${notificationCount === 1 ? "" : "s"} need attention` : "Your reminder alerts"}
            </Typography>
          </Box>
          {notificationCount > 0 && (
            <Typography variant="caption" sx={{ color: "#174681", fontWeight: 700 }}>
              {notificationCount} due
            </Typography>
          )}
        </Box>
        <Divider />
        {notificationsError ? (
          <Alert severity="error" sx={{ m: 1.5 }}>{notificationsError}</Alert>
        ) : notificationsLoading ? (
          <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={22} />
          </Box>
        ) : notifications.length ? (
          <List dense disablePadding sx={{ maxHeight: 360, overflowY: "auto" }}>
            {notifications.map((notification) => {
              const timeZone = localStorage.getItem("lifehub-timezone") || "Asia/Kolkata";
              const notifyTime = notification.remind_at
                ? formatDateTimeInTimeZone(notification.remind_at, timeZone)
                : `Due ${formatDateOnly(notification.due_date)}`;
              return (
                <ListItemButton
                  key={notification.id}
                  onClick={openReminder}
                  sx={{ px: 2, py: 1.25, borderBottom: "1px solid #eff6ff", alignItems: "flex-start" }}
                >
                  <ListItemText
                    primary={notification.title}
                    secondary={`${notifyTime}${notification.document_name ? ` · ${notification.document_name}` : ""}`}
                    primaryTypographyProps={{ sx: { color: "#174681", fontWeight: 700, fontSize: "0.88rem" } }}
                    secondaryTypographyProps={{ sx: { color: "#3b5990", fontSize: "0.77rem", mt: 0.25 } }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        ) : (
          <Typography sx={{ px: 2, py: 3, color: "#3b5990", fontSize: "0.86rem" }}>
            No reminders are due right now.
          </Typography>
        )}
        <Divider />
        <Box sx={{ p: 1, display: "flex", justifyContent: "flex-end" }}>
          <Button size="small" onClick={openReminder} sx={{ color: "#174681", fontWeight: 700 }}>
            View all reminders
          </Button>
        </Box>
      </Popover>
      <Snackbar
        open={Boolean(notificationMessage)}
        autoHideDuration={6000}
        onClose={() => setNotificationMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity="info"
          onClick={openReminder}
          onClose={() => setNotificationMessage("")}
          sx={{ cursor: "pointer", border: "1px solid #b9cde7", bgcolor: "#edf4fd", color: "#174681" }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: "0.75rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e2e8f0",
            minWidth: 190,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.25 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
            {user?.full_name || "User"}
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
            {user?.email || ""}
          </Typography>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={() => { closeMenu(); navigate("/dashboard"); }} sx={{ fontSize: "0.85rem", gap: 1 }}>
          <AccountCircle sx={{ fontSize: 18, color: "#64748b" }} />
          Dashboard
        </MenuItem>

        <MenuItem onClick={() => { closeMenu(); navigate("/dashboard/assistant"); }} sx={{ fontSize: "0.85rem", gap: 1 }}>
          <AutoAwesome sx={{ fontSize: 18, color: "#2563eb" }} />
          AI Assistant
        </MenuItem>

        <MenuItem onClick={() => { closeMenu(); navigate("/dashboard/settings"); }} sx={{ fontSize: "0.85rem", gap: 1 }}>
          <Settings sx={{ fontSize: 18, color: "#2563eb" }} />
          Settings
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={logout}
          sx={{ fontSize: "0.85rem", gap: 1, color: "#dc2626" }}
        >
          <Logout sx={{ fontSize: 18 }} />
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
}