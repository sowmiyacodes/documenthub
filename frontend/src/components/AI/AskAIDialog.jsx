"use client";

import { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Box,
  Paper,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { askAI } from "../../services/ai";

export default function AskAIDialog({
  open,
  onClose,
  documentId,
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const samplePrompts = [
    "What are the key takeaways of this document?",
    "Find any deadlines or critical dates",
    "List the main entities or terms mentioned",
  ];

  const handleAsk = async (queryText) => {
    const textToQuery = (typeof queryText === "string" ? queryText : question).trim();
    if (!textToQuery) return;

    try {
      setLoading(true);
      if (typeof queryText === "string") {
        setQuestion(queryText);
      }

      const res = await askAI({
        question: textToQuery,
        documentId,
      });

      setAnswer(res.answer);
    } catch (err) {
      setAnswer(
        err.response?.data?.message ||
          "Unable to answer your question at this moment."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setQuestion("");
    setAnswer("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
              Ask Document AI
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.74rem" }}>
              RAG analysis focused on this specific document
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: "#64748b",
            "&:hover": { bgcolor: "#f1f5f9", color: "#0f172a" },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ p: 3 }}>
        {/* Sample Prompt Chips */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, display: "block", mb: 1 }}>
            Quick Prompts:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {samplePrompts.map((prompt) => (
              <Chip
                key={prompt}
                label={prompt}
                size="small"
                onClick={() => handleAsk(prompt)}
                disabled={loading}
                sx={{
                  bgcolor: "#f1f5f9",
                  color: "#334155",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "#eff6ff",
                    color: "#2563eb",
                    borderColor: "#bfdbfe",
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Input box */}
        <Box sx={{ position: "relative" }}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={4}
            placeholder="Type your question about this document..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "0.75rem",
                bgcolor: "#ffffff",
                fontSize: "0.925rem",
                "& fieldset": { borderColor: "#cbd5e1" },
                "&:hover fieldset": { borderColor: "#94a3b8" },
                "&.Mui-focused fieldset": { borderColor: "#2563eb" },
              },
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => handleAsk()}
              disabled={loading || !question.trim()}
              endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardRoundedIcon />}
              sx={{
                textTransform: "none",
                borderRadius: "0.6rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                px: 2.5,
                py: 0.8,
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              {loading ? "Analyzing..." : "Ask Question"}
            </Button>
          </Box>
        </Box>

        {/* Loading Spinner */}
        {loading && (
          <Box
            sx={{
              mt: 3,
              p: 3,
              borderRadius: "0.75rem",
              bgcolor: "#f8fafc",
              border: "1px solid #e2e8f0",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.25,
            }}
          >
            <CircularProgress size={26} thickness={4} />
            <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.85rem" }}>
              Synthesizing answer from document embeddings...
            </Typography>
          </Box>
        )}

        {/* AI Answer Panel */}
        {!loading && answer && (
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: "0.75rem",
              bgcolor: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                pb: 1.5,
                mb: 1.5,
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 17, color: "#2563eb" }} />
                <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>
                  AI Generated Answer
                </Typography>
              </Box>

              <Tooltip title={copied ? "Copied" : "Copy answer"}>
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  sx={{ color: copied ? "#2563eb" : "#64748b" }}
                >
                  {copied ? <CheckRoundedIcon fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>

            <Box
              sx={{
                fontSize: "0.925rem",
                lineHeight: 1.7,
                color: "#1e293b",
                "& p": { my: 0.5 },
                "& ul, & ol": { pl: 2.5, my: 1 },
                "& li": { mb: 0.5 },
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {answer}
              </ReactMarkdown>
            </Box>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.75, borderTop: "1px solid #f1f5f9", bgcolor: "#f8fafc" }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          size="small"
          sx={{
            textTransform: "none",
            borderRadius: "0.5rem",
            color: "#475569",
            borderColor: "#cbd5e1",
            "&:hover": { borderColor: "#94a3b8" },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}