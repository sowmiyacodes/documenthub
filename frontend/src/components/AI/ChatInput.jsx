import { useRef, useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
} from "@mui/material";

import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

export default function ChatInput({
  onSend,
  loading = false,
  disabled = false,
}) {
  const [message, setMessage] = useState("");
  const submittingRef = useRef(false);

  const isDisabled = loading || disabled;
  const canSend = Boolean(message.trim()) && !isDisabled;

  const handleSubmit = async () => {
    const text = message.trim();

    if (!text || isDisabled || submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setMessage("");

    try {
      await onSend(text);
    } catch {
      setMessage((current) => current || text);
    } finally {
      submittingRef.current = false;
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box className="assistant-chat-input" sx={{ width: "100%", maxWidth: 860, mx: "auto" }}>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          gap: 1,
          p: 1.2,
          border: "1px solid",
          borderColor: "#cbd5e1",
          borderRadius: "1.25rem",
          bgcolor: "#ffffff",
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03)",
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          "&:focus-within": {
            borderColor: "#2563eb",
            boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.12), 0 4px 14px rgba(15, 23, 42, 0.06)",
          },
        }}
      >
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={6}
          placeholder="Ask anything about your documents..."
          value={message}
          disabled={isDisabled}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          variant="standard"
          slotProps={{
            input: {
              disableUnderline: true,
              sx: {
                px: 1.75,
                py: 1.1,
                fontSize: "0.935rem",
                lineHeight: 1.6,
                color: "#0f172a",
                overflowWrap: "anywhere",
                "&::placeholder": {
                  color: "#64748b",
                  opacity: 1,
                },
              },
            },
          }}
        />

        <Tooltip title={loading ? "Generating response..." : canSend ? "Send message (Enter)" : "Type a message"}>
          <span>
            <IconButton
              aria-label="Send message"
              onClick={handleSubmit}
              disabled={!canSend}
              sx={{
                width: 42,
                height: 42,
                flexShrink: 0,
                borderRadius: "0.85rem",
                bgcolor: "#2563eb",
                color: "#ffffff",
                boxShadow: canSend ? "0 2px 8px rgba(37, 99, 235, 0.35)" : "none",
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: "#1d4ed8",
                  transform: "translateY(-1px)",
                },
                "&.Mui-disabled": {
                  bgcolor: "#f1f5f9",
                  color: "#94a3b8",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={19} color="inherit" thickness={4} />
              ) : (
                <ArrowUpwardRoundedIcon sx={{ fontSize: 22 }} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* Helpful footnote */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          px: 1.5,
          mt: 1.2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: "#2563eb" }} />
          <Typography
            variant="caption"
            sx={{
              color: "#64748b",
              fontSize: "0.74rem",
              fontWeight: 500,
            }}
          >
            Answers grounded in your documents
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: "#475569",
            fontSize: "0.72rem",
          }}
        >
          Enter ↵ to send • Shift + Enter for new line
        </Typography>
      </Box>
    </Box>
  );
}
