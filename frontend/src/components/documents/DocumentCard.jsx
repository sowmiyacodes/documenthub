"use client";

import { useState } from "react";
import AskAIDialog from "../AI/AskAIDialog";
import SummaryDialog from "../AI/SummaryDialog";
import StatusBadge from "../AI/StatusBadge";

import {
  Visibility,
  Delete,
  Download,
  CalendarMonth,
  Storage,
  PictureAsPdf,
  Image as ImageIcon,
  InsertDriveFile,
} from "@mui/icons-material";

import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Divider,
} from "@mui/material";

export default function DocumentCard({
  document,
  onView,
  onDelete,
}) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);

  const formattedDate = document.uploaded_at
    ? new Date(document.uploaded_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "-";

  const fileSize = document.file_size
    ? (document.file_size / (1024 * 1024)).toFixed(2)
    : "0";

  const extension =
    document.original_name?.split(".").pop()?.toLowerCase() || "";

  const isPdf = extension === "pdf";
  const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(extension);

  const getFormatBadge = () => {
    if (isPdf) {
      return {
        icon: <PictureAsPdf sx={{ fontSize: 28, color: "#2563eb" }} />,
        ext: "PDF",
        badgeBg: "#eff6ff",
        badgeColor: "#1d4ed8",
        badgeBorder: "#bfdbfe",
      };
    }
    if (isImage) {
      return {
        icon: <ImageIcon sx={{ fontSize: 28, color: "#2563eb" }} />,
        ext: extension.toUpperCase(),
        badgeBg: "#eff6ff",
        badgeColor: "#1d4ed8",
        badgeBorder: "#bfdbfe",
      };
    }
    return {
      icon: <InsertDriveFile sx={{ fontSize: 28, color: "#2563eb" }} />,
      ext: extension ? extension.toUpperCase() : "DOC",
      badgeBg: "#eff6ff",
      badgeColor: "#1d4ed8",
      badgeBorder: "#bfdbfe",
    };
  };

  const badgeConfig = getFormatBadge();

  return (
    <>
      <Card
        className="vault-file-card"
        elevation={0}
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: "0.85rem",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
          transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            borderColor: "#cbd5e1",
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
          },
        }}
      >
        {/* Card Header Preview Area */}
        <Box
          className="vault-file-preview"
          sx={{
            height: 80,
            bgcolor: "#f8fafc",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <Box display="flex" alignItems="center" gap={1.25}>
            <Box className="vault-file-icon"
              sx={{
                width: 44,
                height: 44,
                borderRadius: "0.6rem",
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
              }}
            >
              {badgeConfig.icon}
            </Box>

            <Box
              component="span"
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                px: 0.8,
                py: 0.25,
                borderRadius: "0.35rem",
                bgcolor: badgeConfig.badgeBg,
                color: badgeConfig.badgeColor,
                border: `1px solid ${badgeConfig.badgeBorder}`,
              }}
            >
              {badgeConfig.ext}
            </Box>
          </Box>

          <StatusBadge status={document.processing_status} />
        </Box>

        {/* Card Body */}
        <CardContent className="vault-file-content" sx={{ p: 2.25, flex: "1 0 auto" }}>
          {/* File Name */}
          <Tooltip title={document.original_name}>
            <Typography
              sx={{
                fontSize: "0.925rem",
                fontWeight: 700,
                color: "#0f172a",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "pointer",
                "&:hover": { color: "#2563eb" },
              }}
              onClick={() => onView(document.id)}
            >
              {document.original_name}
            </Typography>
          </Tooltip>

          {/* Category Chip */}
          <Box sx={{ mt: 1, mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={document.ai_category || document.category || "General"}
              size="small"
              sx={{
                height: 22,
                fontSize: "0.72rem",
                fontWeight: 600,
                bgcolor: "#f1f5f9",
                color: "#334155",
                borderRadius: "0.35rem",
              }}
            />

            {document.ai_category && (
              <Typography variant="caption" sx={{ color: "#2563eb", fontSize: "0.68rem", fontWeight: 600 }}>
                AI Categorized
              </Typography>
            )}
          </Box>

          {/* Details Row */}
          <Box
            className="vault-file-actions"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 0.75,
              fontSize: "0.75rem",
              color: "#64748b",
            }}
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              <Storage sx={{ fontSize: 14 }} />
              <span>{fileSize} MB</span>
            </Box>

            <Box display="flex" alignItems="center" gap={0.5}>
              <CalendarMonth sx={{ fontSize: 14 }} />
              <span>{formattedDate}</span>
            </Box>
          </Box>
        </CardContent>

        <Divider sx={{ borderColor: "#f1f5f9" }} />

        {/* Actions Toolbar */}
        <Box
          sx={{
            p: 1.25,
            px: 2,
            bgcolor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" gap={0.75}>
            <Tooltip title="View Document">
              <IconButton
                size="small"
                onClick={() => onView(document.id)}
                sx={{
                  color: "#475569",
                  p: 0.7,
                  "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" },
                }}
              >
                <Visibility sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Download">
              <IconButton
                size="small"
                onClick={() => onView(document.id)}
                sx={{
                  color: "#475569",
                  p: 0.7,
                  "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" },
                }}
              >
                <Download sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="AI Summary">
              <IconButton
                size="small"
                onClick={() => setSummaryOpen(true)}
                sx={{
                  color: "#2563eb",
                  p: 0.7,
                  "&:hover": { bgcolor: "#eff6ff" },
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Ask AI about this Document">
              <IconButton
                size="small"
                onClick={() => setAskOpen(true)}
                sx={{
                  color: "#2563eb",
                  p: 0.7,
                  "&:hover": { bgcolor: "#eff6ff" },
                }}
              >
                <SmartToyRoundedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          </Box>

          <Tooltip title="Delete Document">
            <IconButton
              size="small"
              onClick={() => onDelete(document.id)}
              sx={{
                color: "#94a3b8",
                p: 0.7,
                "&:hover": { color: "#ef4444", bgcolor: "#fef2f2" },
              }}
            >
              <Delete sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>

      <SummaryDialog
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        documentId={document.id}
      />
      <AskAIDialog
        open={askOpen}
        onClose={() => setAskOpen(false)}
        documentId={document.id}
      />
    </>
  );
}