import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function StatusBadge({ status }) {
  const normalized = (status || "pending").toLowerCase();

  const configs = {
    completed: {
      label: "Completed",
      dotClass: "bg-blue-500",
      pillStyle: {
        bgcolor: "#eff6ff",
        color: "#1d4ed8",
        borderColor: "#bfdbfe",
      },
    },
    processing: {
      label: "Processing",
      dotClass: "bg-blue-500 animate-pulse",
      pillStyle: {
        bgcolor: "#eff6ff",
        color: "#1d4ed8",
        borderColor: "#bfdbfe",
      },
    },
    failed: {
      label: "Failed",
      dotClass: "bg-rose-500",
      pillStyle: {
        bgcolor: "#fef2f2",
        color: "#991b1b",
        borderColor: "#fecaca",
      },
    },
    pending: {
      label: "Pending",
      dotClass: "bg-slate-400",
      pillStyle: {
        bgcolor: "#f8fafc",
        color: "#475569",
        borderColor: "#e2e8f0",
      },
    },
  };

  const current = configs[normalized] || configs.pending;

  return (
    <Box
      className="workspace-status-badge"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.2,
        py: 0.35,
        borderRadius: "9999px",
        border: "1px solid",
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.01em",
        transition: "all 0.15s ease",
        ...current.pillStyle,
      }}
    >
      <Box
        component="span"
        className={current.dotClass}
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          display: "inline-block",
        }}
      />
      <Typography
        component="span"
        sx={{
          fontSize: "inherit",
          fontWeight: "inherit",
          lineHeight: 1,
        }}
      >
        {current.label}
      </Typography>
    </Box>
  );
}