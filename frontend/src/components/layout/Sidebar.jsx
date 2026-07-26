import {
  Drawer,
  Toolbar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  Divider,
  Button,
  LinearProgress,
  Chip,
} from "@mui/material";

import {
  Dashboard,
  Description,
  Psychology,
  Notifications,
  Settings,
  Logout,
  Storage,
  AutoAwesome,
} from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 280;

const menu = [
  {
    text: "Dashboard",
    icon: <Dashboard />,
    path: "/dashboard",
  },
  {
    text: "Documents",
    icon: <Description />,
    path: "/dashboard/documents",
  },
  {
    text: "AI Assistant",
    icon: <Psychology />,
    path: "#",
    disabled: true,
  },
  {
    text: "Reminders",
    icon: <Notifications />,
    path: "#",
    disabled: true,
  },
  {
    text: "Settings",
    icon: <Settings />,
    path: "#",
    disabled: true,
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,

        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: "1px solid #E5E7EB",
          background: "#FAFBFC",
        },
      }}
    >
      <Toolbar sx={{ py: 2 }}>
        <Avatar
          sx={{
            bgcolor: "#2563EB",
            width: 54,
            height: 54,
            mr: 2,
          }}
        >
          <AutoAwesome />
        </Avatar>

        <Box>
          <Typography fontWeight={700} fontSize={20}>
            LifeHub AI
          </Typography>

          <Typography color="text.secondary" fontSize={13}>
            Personal Workspace
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      <Box sx={{ p: 3 }}>
        <Typography
          variant="caption"
          sx={{
            color: "#94A3B8",
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          WORKSPACE
        </Typography>

        <List sx={{ mt: 2 }}>
          {menu.map((item) => {
            const active =
              item.path !== "#" &&
              location.pathname.startsWith(item.path);

            return (
              <ListItemButton
                key={item.text}
                disabled={item.disabled}
                onClick={() =>
                  !item.disabled && navigate(item.path)
                }
                sx={{
                  mb: 1,
                  borderRadius: 3,

                  bgcolor: active ? "#2563EB" : "transparent",

                  color: active ? "#fff" : "#334155",

                  "&:hover": {
                    bgcolor: active
                      ? "#1D4ED8"
                      : "#EEF2FF",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: active ? "#fff" : "#64748B",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText primary={item.text} />

                {item.disabled && (
                  <Chip
                    size="small"
                    label="Soon"
                    color="default"
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            bgcolor: "#2563EB",
            color: "white",
            p: 2.5,
            borderRadius: 3,
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            mb={2}
          >
            <Storage />
            <Typography fontWeight={600}>
              Cloud Storage
            </Typography>
          </Box>

          <Typography variant="body2">
            0 MB of 2 GB Used
          </Typography>

          <LinearProgress
            variant="determinate"
            value={5}
            sx={{
              mt: 2,
              height: 8,
              borderRadius: 5,
              bgcolor: "rgba(255,255,255,.25)",

              "& .MuiLinearProgress-bar": {
                backgroundColor: "#fff",
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar sx={{ bgcolor: "#2563EB" }}>S</Avatar>

          <Box>
            <Typography fontWeight={600}>
              Welcome
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              LifeHub User
            </Typography>
          </Box>
        </Box>

        <Button
          fullWidth
          color="error"
          variant="outlined"
          startIcon={<Logout />}
          onClick={logout}
          sx={{
            borderRadius: 3,
            py: 1.3,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
}