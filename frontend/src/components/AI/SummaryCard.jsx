import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getSummary } from "../../services/ai";

export default function SummaryCard({ documentId }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!documentId) return;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await getSummary(documentId);
        setSummary(response.document.summary || "");
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load AI summary."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [documentId]);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          bgcolor: "#f8fafc",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: "#2563eb" }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0f172a" }}>
            AI Summary
          </Typography>
        </Box>

        {summary && (
          <Tooltip title={copied ? "Copied" : "Copy summary"}>
            <IconButton size="small" onClick={handleCopy} sx={{ color: copied ? "#2563eb" : "#64748b" }}>
              {copied ? <CheckRoundedIcon fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        {loading && (
          <Box display="flex" alignItems="center" justifyContent="center" py={3} gap={1.5}>
            <CircularProgress size={20} thickness={4} sx={{ color: "#2563eb" }} />
            <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.85rem" }}>
              Generating summary...
            </Typography>
          </Box>
        )}

        {!loading && error && (
          <Alert severity="error" sx={{ borderRadius: "0.5rem", fontSize: "0.85rem" }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <Box
            sx={{
              fontSize: "0.9rem",
              lineHeight: 1.7,
              color: "#334155",
              "& p": { my: 0.5 },
              "& ul, & ol": { pl: 2.5, my: 1 },
              "& li": { mb: 0.5 },
            }}
          >
            {summary ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {summary}
              </ReactMarkdown>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Summary not available for this document.
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}