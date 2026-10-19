
import { useRef, useState } from "react";

import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip,
} from "@mui/material";

import SendRoundedIcon from "@mui/icons-material/SendRounded";

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
    <Box sx={{ width: "100%", maxWidth: 850, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: 1,
          p: 1,
          border: "1px solid #CBD5E1",
          borderRadius: 4,
          bgcolor: "#fff",
          boxShadow: "0 4px 20px rgba(15,23,42,0.05)",
          transition: "border-color 0.2s ease",
          "&:focus-within": {
            borderColor: "#2563EB",
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
                px: 1.5,
                py: 1,
                fontSize: 15,
                lineHeight: 1.6,
                overflowWrap: "anywhere",
              },
            },
          }}
        />

        <Tooltip title={loading ? "Sending..." : "Send message"}>
          <span>
            <IconButton
              aria-label="Send message"
              onClick={handleSubmit}
              disabled={!canSend}
              sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: 3,
                bgcolor: "#2563EB",
                color: "#fff",
                "&:hover": {
                  bgcolor: "#1D4ED8",
                },
                "&.Mui-disabled": {
                  bgcolor: "#E2E8F0",
                  color: "#94A3B8",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={21} color="inherit" />
              ) : (
                <SendRoundedIcon />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        textAlign="center"
        display="block"
        sx={{ mt: 1.25 }}
      >
        AI-generated responses may be inaccurate. Verify important details
        against your documents.
      </Typography>
    </Box>
  );
}
