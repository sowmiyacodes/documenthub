import { useEffect, useState } from "react";
import {
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

export default function TopNavbar() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = location.pathname.startsWith("/dashboard/documents")
    ? "My documents"
    : location.pathname.startsWith("/dashboard/assistant")
      ? "AI workspace"
      : "Overview";

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
                  variant="dot"
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "#2563eb",
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