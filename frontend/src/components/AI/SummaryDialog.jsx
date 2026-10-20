"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getSummary } from "../../services/ai";

export default function SummaryDialog({
  open,
  onClose,
  documentId,
}) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !documentId) return;

    const loadSummary = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getSummary(documentId);
        setSummary(response.document.summary || "");
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to generate summary for this document."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [open, documentId]);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: "1rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: "1px solid #e2e8f0",
          bgcolor: "#f8fafc",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "0.6rem",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
              Executive AI Summary
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.74rem" }}>
              Key insights extracted automatically
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {summary && (
            <Tooltip title={copied ? "Copied" : "Copy summary"}>
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{
                  color: copied ? "#2563eb" : "#64748b",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                }}
              >
                {copied ? <CheckRoundedIcon fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "#64748b",
              "&:hover": { bgcolor: "#f1f5f9", color: "#0f172a" },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 3.5 }}>
        {loading && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={6}
            gap={2}
          >
            <CircularProgress size={32} thickness={4} sx={{ color: "#2563eb" }} />
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Generating concise AI summary...
            </Typography>
          </Box>
        )}

        {!loading && error && (
          <Alert severity="error" sx={{ borderRadius: "0.75rem" }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <Box
            sx={{
              fontSize: "0.95rem",
              lineHeight: 1.8,
              color: "#1e293b",
              bgcolor: "#fcfdfe",
              p: 2.5,
              borderRadius: "0.75rem",
              border: "1px solid #f1f5f9",
              "& p": { my: 0.75 },
              "& ul, & ol": { pl: 2.5, my: 1 },
              "& li": { mb: 0.5 },
            }}
          >
            {summary ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {summary}
              </ReactMarkdown>
            ) : (
              <Typography color="text.secondary" variant="body2">
                No summary is available for this document yet.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.75, borderTop: "1px solid #f1f5f9", bgcolor: "#f8fafc" }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            textTransform: "none",
            borderRadius: "0.5rem",
            px: 3,
            fontWeight: 600,
            bgcolor: "#2563eb",
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}