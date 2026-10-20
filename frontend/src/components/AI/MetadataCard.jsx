import {
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  Box,
} from "@mui/material";

import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import NumbersRoundedIcon from "@mui/icons-material/NumbersRounded";

export default function MetadataCard({ document }) {
  const metadata = document?.metadata || {};

  const items = [
    {
      label: "File Type",
      value: document?.file_type || "-",
      icon: <DescriptionRoundedIcon sx={{ fontSize: 18, color: "#2563eb" }} />,
    },
    {
      label: "File Size",
      value: document?.file_size ? `${((document.file_size || 0) / 1024).toFixed(1)} KB` : "-",
      icon: <StorageRoundedIcon sx={{ fontSize: 18, color: "#2563eb" }} />,
    },
    {
      label: "AI Category",
      value: document?.ai_category || document?.category || "-",
      icon: <CategoryRoundedIcon sx={{ fontSize: 18, color: "#2563eb" }} />,
    },
    {
      label: "Uploaded",
      value: document?.uploaded_at ? new Date(document.uploaded_at).toLocaleDateString() : "-",
      icon: <CalendarTodayRoundedIcon sx={{ fontSize: 18, color: "#2563eb" }} />,
    },
    {
      label: "Word Count",
      value: metadata.wordCount ?? "-",
      icon: <NumbersRoundedIcon sx={{ fontSize: 18, color: "#0284c7" }} />,
    },
    {
      label: "Language",
      value: metadata.language ?? "English",
      icon: <TranslateRoundedIcon sx={{ fontSize: 18, color: "#475569" }} />,
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "1rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px 0 rgba(15, 23, 42, 0.05)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 2.5, py: 1.75, bgcolor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a" }}>
          Document Specifications
        </Typography>
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        <Grid container spacing={2.5}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} key={item.label}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                {item.icon}
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                  {item.label}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#0f172a", pl: 3.25 }}>
                {item.value}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}