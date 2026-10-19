
import { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";

import SendRoundedIcon from "@mui/icons-material/SendRounded";

export default function ChatInput({ onSend, loading, disabled = false }) {
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    const text = message.trim();

    if (!text || loading || disabled) return;

    setMessage("");
    await onSend(text);
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
          "&:focus-within": {
            borderColor: "#2563EB",
          },
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={6}
          placeholder="Ask anything about your documents..."
          value={message}
          disabled={loading || disabled}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          variant="standard"
          slotProps={{
            input: {
              disableUnderline: true,
              sx: {
                px: 1.5,
                py: 1,
                fontSize: 15,
                lineHeight: 1.6,
              },
            },
          }}
        />

        <IconButton
          aria-label="Send message"
          onClick={handleSubmit}
          disabled={!message.trim() || loading || disabled}
          sx={{
            width: 44,
            height: 44,
            borderRadius: 3,
            bgcolor: "#2563EB",
            color: "#fff",
            "&:hover": { bgcolor: "#1D4ED8" },
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
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        textAlign="center"
        display="block"
        sx={{ mt: 1.25 }}
      >
        AI-generated responses may be inaccurate. Verify important details against your documents.
      </Typography>
    </Box>
  );
}
