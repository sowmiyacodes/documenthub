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
} from "@mui/material";

import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";

import { askAI } from "../../services/ai";

export default function AskAIDialog({
  open,
  onClose,
  documentId,
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);

      const res = await askAI({
        question,
        documentId,
      });

      setAnswer(res.answer);
    } catch (err) {
      setAnswer(
        err.response?.data?.message ||
          "Unable to answer your question."
      );
    } finally {
      setLoading(false);
    }
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
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontWeight: 700,
        }}
      >
        <SmartToyRoundedIcon color="primary" />
        Ask AI
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Ask something about this document..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleAsk}
          disabled={loading}
        >
          Ask AI
        </Button>

        {loading && (
          <Box mt={3} textAlign="center">
            <CircularProgress />
          </Box>
        )}

        {!loading && answer && (
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 2,
              bgcolor: "#f8fafc",
            }}
          >
            <Typography fontWeight={700}>
              AI Answer
            </Typography>

            <Typography sx={{ mt: 1 }}>
              {answer}
            </Typography>
          </Paper>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}