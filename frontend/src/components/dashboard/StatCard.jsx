"use client";

import {
  Card,
  CardContent,
  Box,
  Typography,
} from "@mui/material";

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  subtitle,
}) {
  const colors = {
    blue: {
      bg: "#eff6ff",
      text: "#2563eb",
      border: "#bfdbfe",
    },
    green: {
      bg: "#eff6ff",
      text: "#2563eb",
      border: "#bfdbfe",
    },
    amber: {
      bg: "#eff6ff",
      text: "#2563eb",
      border: "#bfdbfe",
    },
    purple: {
      bg: "#eff6ff",
      text: "#2563eb",
      border: "#bfdbfe",
    },
  };

  const selectedColor = colors[color] || colors.blue;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "0.85rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
        transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(15, 23, 42, 0.06)",
          borderColor: "#cbd5e1",
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
              {title}
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: "#0f172a" }}>
              {value}
            </Typography>

            {subtitle && (
              <Typography variant="caption" sx={{ color: "#94a3b8", mt: 0.5, display: "block" }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "0.6rem",
              display: "grid",
              placeItems: "center",
              bgcolor: selectedColor.bg,
              color: selectedColor.text,
              border: `1px solid ${selectedColor.border}`,
            }}
          >
            {Icon && <Icon sx={{ fontSize: 22 }} />}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}