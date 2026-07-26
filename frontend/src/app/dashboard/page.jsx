import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Stack,
  Chip,
} from "@mui/material";

import {
  Description,
  Storage,
  Category,
  AutoAwesome,
  Upload,
  ArrowForward,
} from "@mui/icons-material";

export default function DashboardPage() {
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

  const greeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const stats = [
    {
      title: "Documents",
      value: "0",
      icon: <Description />,
      color: "#2563EB",
      bg: "#EEF4FF",
    },
    {
      title: "Storage Used",
      value: "0 MB",
      icon: <Storage />,
      color: "#059669",
      bg: "#ECFDF5",
    },
    {
      title: "Categories",
      value: "0",
      icon: <Category />,
      color: "#EA580C",
      bg: "#FFF7ED",
    },
    {
      title: "AI Features",
      value: "Coming Soon",
      icon: <AutoAwesome />,
      color: "#7C3AED",
      bg: "#F5F3FF",
    },
  ];

  return (
    <Box sx={{ p: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: "#2563EB",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>

          <Box>
            <Typography variant="h4" fontWeight={700}>
              {greeting()}, {user?.full_name || "User"} 👋
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Manage your personal documents, organize important files,
              and let AI help you find information instantly.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((item) => (
          <Grid item xs={12} sm={6} lg={3} key={item.title}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 4,
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: item.bg,
                    color: item.color,
                    width: 52,
                    height: 52,
                    mb: 2,
                  }}
                >
                  {item.icon}
                </Avatar>

                <Typography color="text.secondary" variant="body2">
                  {item.title}
                </Typography>

                <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                  {item.value}
                </Typography>

                {item.title === "AI Features" && (
                  <Chip
                    label="Preview"
                    size="small"
                    color="secondary"
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Documents */}
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid #E5E7EB",
              boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
            }}
          >
            <Box
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #F1F5F9",
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Recent Documents
              </Typography>

              <Button
                component={Link}
                to="/dashboard/documents"
                endIcon={<ArrowForward />}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                View All
              </Button>
            </Box>

            <Box
              sx={{
                py: 10,
                px: 3,
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  width: 88,
                  height: 88,
                  mx: "auto",
                  bgcolor: "#EEF2FF",
                  color: "#2563EB",
                }}
              >
                <Description sx={{ fontSize: 42 }} />
              </Avatar>

              <Typography variant="h5" fontWeight={700} sx={{ mt: 3 }}>
                No Documents Uploaded
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 1, mb: 4 }}>
                Upload your first document to start building your secure AI workspace.
              </Typography>

              <Button
                component={Link}
                to="/dashboard/documents"
                variant="contained"
                size="large"
                startIcon={<Upload />}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.3,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "none",
                }}
              >
                Upload Document
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            <Card
              sx={{
                borderRadius: 4,
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Quick Actions
                </Typography>

                <Button
                  component={Link}
                  to="/dashboard/documents"
                  variant="contained"
                  fullWidth
                  startIcon={<Upload />}
                  sx={{
                    justifyContent: "space-between",
                    borderRadius: 3,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                  }}
                >
                  Upload Document
                </Button>
              </CardContent>
            </Card>
                        <Card
              sx={{
                borderRadius: 4,
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ mb: 3 }}
                >
                  AI Features
                </Typography>

                <Stack spacing={2}>
                  <Chip
                    label="🤖 AI Categorization"
                    variant="outlined"
                    sx={{
                      justifyContent: "flex-start",
                      borderRadius: 2,
                      py: 2.5,
                    }}
                  />

                  <Chip
                    label="📄 OCR Text Extraction"
                    variant="outlined"
                    sx={{
                      justifyContent: "flex-start",
                      borderRadius: 2,
                      py: 2.5,
                    }}
                  />

                  <Chip
                    label="🔍 Semantic Search"
                    variant="outlined"
                    sx={{
                      justifyContent: "flex-start",
                      borderRadius: 2,
                      py: 2.5,
                    }}
                  />

                  <Chip
                    label="📝 AI Summaries"
                    variant="outlined"
                    sx={{
                      justifyContent: "flex-start",
                      borderRadius: 2,
                      py: 2.5,
                    }}
                  />

                  <Chip
                    label="⏰ Smart Reminders"
                    variant="outlined"
                    sx={{
                      justifyContent: "flex-start",
                      borderRadius: 2,
                      py: 2.5,
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card
              sx={{
                borderRadius: 4,
                background:
                  "linear-gradient(135deg,#2563EB,#7C3AED)",
                color: "white",
                boxShadow: "0 10px 25px rgba(37,99,235,.25)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  LifeHub AI Assistant
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    opacity: .9,
                    lineHeight: 1.7,
                  }}
                >
                  Your intelligent assistant will soon help
                  organize documents, answer questions, generate
                  summaries, extract text, and remind you of
                  important dates.
                </Typography>

                <Button
                  variant="contained"
                  disabled
                  sx={{
                    mt: 3,
                    bgcolor: "white",
                    color: "#2563EB",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 3,
                    "&.Mui-disabled": {
                      bgcolor: "rgba(255,255,255,.85)",
                      color: "#2563EB",
                    },
                  }}
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}