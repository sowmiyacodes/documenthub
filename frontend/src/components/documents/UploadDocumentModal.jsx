"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import {
  Upload,
  Close,
  Description,
  Delete,
  CheckCircle,
} from "@mui/icons-material";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  MenuItem,
  CircularProgress,
  Paper,
  IconButton,
} from "@mui/material";

import { uploadDocument } from "@/services/document";

export default function UploadDocumentModal({
  isOpen,
  onClose,
  onUploadSuccess,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState("Others");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const resetForm = () => {
    setSelectedFile(null);
    setCategory("Others");
    setDescription("");
    setUploading(false);
    setIsDragOver(false);
  };

  const handleClose = () => {
    if (uploading) return;
    resetForm();
    onClose();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a document to upload.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("category", category);
      formData.append("description", description);

      await uploadDocument(formData);

      toast.success("Document uploaded successfully! AI processing started.");

      resetForm();
      onClose();

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
        "Failed to upload document. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: "1rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2.2,
          borderBottom: "1px solid #f1f5f9",
          bgcolor: "#f8fafc",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.1rem" }}>
            Upload Document
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
            PDF, PNG, JPG files are automatically parsed via OCR and indexed for AI
          </Typography>
        </Box>

        <IconButton
          onClick={handleClose}
          disabled={uploading}
          size="small"
          sx={{ color: "#64748b", "&:hover": { bgcolor: "#f1f5f9" } }}
        >
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      {/* Body */}
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          {/* Dropzone */}
          {!selectedFile ? (
            <Box
              component="label"
              htmlFor="document-upload"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              sx={{
                border: "2px dashed",
                borderColor: isDragOver ? "#2563eb" : "#cbd5e1",
                backgroundColor: isDragOver ? "#eff6ff" : "#f8fafc",
                borderRadius: "0.85rem",
                p: 4.5,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "block",
                "&:hover": {
                  borderColor: "#2563eb",
                  backgroundColor: "#eff6ff",
                },
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "1rem",
                  bgcolor: "#eff6ff",
                  color: "#2563eb",
                  display: "grid",
                  placeItems: "center",
                  mx: "auto",
                  mb: 2,
                  border: "1px solid #dbeafe",
                }}
              >
                <Upload sx={{ fontSize: 28 }} />
              </Box>

              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                Click to browse or drag and drop
              </Typography>

              <Typography variant="caption" sx={{ color: "#64748b", display: "block", mt: 0.5 }}>
                Supports PDF, PNG, JPG, JPEG (Up to 25 MB)
              </Typography>

              <input
                id="document-upload"
                type="file"
                hidden
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
              />
            </Box>
          ) : (
            /* Selected File Card */
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: "0.75rem",
                bgcolor: "#eff6ff",
                borderColor: "#bfdbfe",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                <CheckCircle sx={{ fontSize: 24, color: "#2563eb", flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      color: "#0f172a",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for processing
                  </Typography>
                </Box>
              </Box>

              <IconButton
                size="small"
                onClick={() => setSelectedFile(null)}
                disabled={uploading}
                sx={{ color: "#ef4444", "&:hover": { bgcolor: "#fee2e2" } }}
              >
                <Delete sx={{ fontSize: 20 }} />
              </IconButton>
            </Paper>
          )}

          {/* Category Picker */}
          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "0.6rem",
                bgcolor: "#ffffff",
              },
            }}
          >
            <MenuItem value="Identity">Identity (Passports, IDs, Licenses)</MenuItem>
            <MenuItem value="Education">Education (Degrees, Transcripts, Certs)</MenuItem>
            <MenuItem value="Medical">Medical (Prescriptions, Reports)</MenuItem>
            <MenuItem value="Financial">Financial (Statements, Tax, Bills)</MenuItem>
            <MenuItem value="Legal">Legal (Contracts, Agreements, Deeds)</MenuItem>
            <MenuItem value="Others">Others / General</MenuItem>
          </TextField>

          {/* Description */}
          <TextField
            label="Description (Optional)"
            placeholder="Add relevant notes or keywords..."
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "0.6rem",
                bgcolor: "#ffffff",
                fontSize: "0.875rem",
              },
            }}
          />
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #f1f5f9", bgcolor: "#f8fafc", gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={uploading}
          sx={{
            borderRadius: "0.5rem",
            px: 2.5,
            textTransform: "none",
            color: "#475569",
            borderColor: "#cbd5e1",
            "&:hover": { borderColor: "#94a3b8" },
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          startIcon={
            uploading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Upload sx={{ fontSize: 18 }} />
            )
          }
          sx={{
            borderRadius: "0.5rem",
            px: 3.5,
            textTransform: "none",
            fontWeight: 600,
            bgcolor: "#2563eb",
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          {uploading ? "Indexing & Uploading..." : "Upload File"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}