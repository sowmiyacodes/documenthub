import {
  Box,
  Typography,
  Avatar,
  Button,
  LinearProgress,
  Tooltip,
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
  ArrowForward,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

const menu = [
  {
    text: "Overview",
    icon: <Dashboard sx={{ fontSize: 19 }} />,
    path: "/dashboard",
  },
  {
    text: "My documents",
    icon: <Description sx={{ fontSize: 19 }} />,
    path: "/dashboard/documents",
  },
  {
    text: "AI workspace",
    icon: <Psychology sx={{ fontSize: 19 }} />,
    path: "/dashboard/assistant",
    badge: "AI",
  },
  {
    text: "Reminders",
    icon: <Notifications sx={{ fontSize: 19 }} />,
    path: "/dashboard/reminders",
  },
  {
    text: "Settings",
    icon: <Settings sx={{ fontSize: 19 }} />,
    path: "/dashboard/settings",
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (item) => {
    if (item.disabled) return false;

    if (item.path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return (
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`)
    );
  };

  return (
    <Box
      component="aside"
      className="workspace-sidebar"
      sx={{
        width: 270,
        flex: "0 0 270px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
        borderRight: "1px solid #dce6f2",
      }}
    >
      <Box className="workspace-brand">
        <Box className="workspace-brand-mark"><AutoAwesome sx={{ fontSize: 21 }} /></Box>
        <Box>
          <Typography className="workspace-brand-name">
            document<span>hub</span>
          </Typography>
          <Typography className="workspace-brand-caption">YOUR PERSONAL ARCHIVE</Typography>
        </Box>
      </Box>

      <Box className="workspace-switcher">
        <Box className="workspace-switcher-icon"><Storage sx={{ fontSize: 17 }} /></Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography className="workspace-switcher-label">CURRENT SPACE</Typography>
          <Typography className="workspace-switcher-value">My workspace</Typography>
        </Box>
        <span className="workspace-switcher-dot" />
      </Box>

      <Box className="workspace-nav">
        <Typography className="workspace-nav-caption">YOUR SPACE</Typography>
        {menu.map((item) => {
          const active = isActive(item);
          return (
            <Tooltip key={item.text} title={item.disabled ? "Coming soon" : ""} placement="right">
              <span>
                <button
                  type="button"
                  disabled={item.disabled}
                  aria-current={active ? "page" : undefined}
                  className={`workspace-nav-item${active ? " is-active" : ""}`}
                  onClick={() => {
                    if (!item.disabled) navigate(item.path);
                  }}
                >
                  <span className="workspace-nav-icon">{item.icon}</span>
                  <span className="workspace-nav-text">{item.text}</span>
                  {item.badge && <span className="workspace-nav-badge">{item.badge}</span>}
                  {active && <span className="workspace-nav-active-mark" />}
                </button>
              </span>
            </Tooltip>
          );
        })}
      </Box>

      <Box className="workspace-sidebar-spacer" />

      <Box className="workspace-ai-promo">
        <span className="workspace-ai-promo-icon"><AutoAwesome sx={{ fontSize: 17 }} /></span>
        <Typography className="workspace-ai-promo-title">Your files have answers.</Typography>
        <Typography className="workspace-ai-promo-copy">
          Ask across your archive and get answers linked to their sources.
        </Typography>
        <Button
          onClick={() => navigate("/dashboard/assistant")}
          endIcon={<ArrowForward sx={{ fontSize: 15 }} />}
          className="workspace-ai-promo-link"
        >
          Ask your documents
        </Button>
      </Box>

      <Box className="workspace-storage">
        <Box className="workspace-storage-heading">
          <span><Storage sx={{ fontSize: 15 }} /> Storage</span>
          <span className="workspace-storage-plan">FREE</span>
        </Box>
        <LinearProgress variant="determinate" value={8} className="workspace-storage-progress" />
        <Typography className="workspace-storage-caption">Your private document vault</Typography>
      </Box>

      <Box className="workspace-account">
        <Avatar className="workspace-account-avatar">
          {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography className="workspace-account-name" noWrap>
            {user?.full_name || "Account User"}
          </Typography>
          <Typography className="workspace-account-email" noWrap>
            {user?.email || "user@documenthub.ai"}
          </Typography>
        </Box>
        <Tooltip title="Sign out">
          <button type="button" className="workspace-logout" onClick={logout} aria-label="Sign out">
            <Logout sx={{ fontSize: 17 }} />
          </button>
        </Tooltip>
      </Box>
    </Box>
  );
}
