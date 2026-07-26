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
} from "@mui/material";

import {
  Search,
  NotificationsNone,
  AccountCircle,
  Settings,
  Logout,
  LightMode,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

export default function TopNavbar() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
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
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "#fff",
        color: "#111827",
        borderBottom: "1px solid #E5E7EB",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "90px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 4,
        }}
      >
        {/* Left Section */}

        <Box display="flex" flexDirection="column">
          <Typography variant="h5" fontWeight={700}>
            Welcome Back 👋
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Manage your documents with AI.
          </Typography>

          {/* Search Bar */}

          <Paper
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              width: 420,
              px: 2,
              py: 0.8,
              borderRadius: 3,
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
            }}
          >
            <Search
              sx={{
                color: "#64748B",
                mr: 1,
              }}
            />

            <InputBase
              placeholder="Search documents..."
              fullWidth
            />
          </Paper>
        </Box>

        {/* Right Section */}

        <Box
          display="flex"
          alignItems="center"
          gap={2}
        >
          {/* Theme */}

          <IconButton
            sx={{
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
            }}
          >
            <LightMode />
          </IconButton>

          {/* Notifications */}

          <IconButton
            sx={{
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
            }}
          >
            <Badge
              badgeContent={2}
              color="error"
            >
              <NotificationsNone />
            </Badge>
          </IconButton>

          {/* Profile */}

          <Box
            onClick={openMenu}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: 2,
              py: 1,
              borderRadius: 3,
              cursor: "pointer",
              border: "1px solid #E2E8F0",
              transition: "0.2s",
              "&:hover": {
                bgcolor: "#F8FAFC",
              },
            }}
          >
            <Avatar sx={{ bgcolor: "#2563EB" }}>
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>

            <Box>
              <Typography
                fontWeight={600}
                fontSize={14}
              >
                {user?.full_name || "User"}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {user?.email || ""}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>

    {/* Profile Menu */}

    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={closeMenu}
    >
      <MenuItem onClick={closeMenu}>
        <AccountCircle sx={{ mr: 1 }} />
        Profile
      </MenuItem>

      <MenuItem onClick={closeMenu}>
        <Settings sx={{ mr: 1 }} />
        Settings
      </MenuItem>

      <Divider />

      <MenuItem
        onClick={logout}
        sx={{ color: "#DC2626" }}
      >
        <Logout sx={{ mr: 1 }} />
        Logout
      </MenuItem>
    </Menu>
  </>
);
}