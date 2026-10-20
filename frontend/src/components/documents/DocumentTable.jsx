"use client";

import { useState } from "react";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";

import SummaryDialog from "../AI/SummaryDialog";
import AskAIDialog from "../AI/AskAIDialog";
import StatusBadge from "../AI/StatusBadge";

import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";

import {
  Visibility,
  Delete,
  Download,
  PictureAsPdf,
  Image as ImageIcon,
  InsertDriveFile,
} from "@mui/icons-material";

export default function DocumentTable({
  documents,
  onView,
  onDelete,
}) {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const getIcon = (name) => {
    const ext = name?.split(".").pop()?.toLowerCase() || "";

    if (ext === "pdf") {
      return <PictureAsPdf sx={{ color: "#2563eb", fontSize: 20, mr: 1.5, flexShrink: 0 }} />;
    }
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return <ImageIcon sx={{ color: "#2563eb", fontSize: 20, mr: 1.5, flexShrink: 0 }} />;
    }
    return <InsertDriveFile sx={{ color: "#2563eb", fontSize: 20, mr: 1.5, flexShrink: 0 }} />;
  };

  return (
    <>
      <Paper
        className="vault-table-wrap"
        elevation={0}
        sx={{
          borderRadius: "0.85rem",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.78rem", py: 1.5 }}>
                DOCUMENT NAME
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.78rem", py: 1.5 }}>
                CATEGORY
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.78rem", py: 1.5 }}>
                STATUS
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.78rem", py: 1.5 }}>
                FILE SIZE
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.78rem", py: 1.5 }}>
                UPLOAD DATE
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: "#475569", fontSize: "0.78rem", py: 1.5, pr: 3 }}>
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {documents.map((doc) => {
              const size = doc.file_size
                ? (doc.file_size / (1024 * 1024)).toFixed(2)
                : "0";

              const date = doc.uploaded_at
                ? new Date(doc.uploaded_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "-";

              return (
                <TableRow
                  key={doc.id}
                  hover
                  sx={{
                    transition: "bgcolor 0.15s ease",
                    "&:hover": { bgcolor: "#f8fafc" },
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <TableCell sx={{ py: 1.75 }}>
                    <Box display="flex" alignItems="center">
                      {getIcon(doc.original_name)}
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "#0f172a",
                          cursor: "pointer",
                          "&:hover": { color: "#2563eb" },
                        }}
                        onClick={() => onView(doc.id)}
                      >
                        {doc.original_name}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ py: 1.75 }}>
                    <Chip
                      label={doc.ai_category || doc.category || "General"}
                      size="small"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        bgcolor: "#f1f5f9",
                        color: "#334155",
                        borderRadius: "0.35rem",
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ py: 1.75 }}>
                    <StatusBadge status={doc.processing_status} />
                  </TableCell>

                  <TableCell sx={{ py: 1.75, color: "#64748b", fontSize: "0.85rem" }}>
                    {size} MB
                  </TableCell>

                  <TableCell sx={{ py: 1.75, color: "#64748b", fontSize: "0.85rem" }}>
                    {date}
                  </TableCell>

                  <TableCell align="right" sx={{ py: 1.75, pr: 2 }}>
                    <Box display="inline-flex" alignItems="center" gap={0.5}>
                      <Tooltip title="View Document">
                        <IconButton
                          size="small"
                          onClick={() => onView(doc.id)}
                          sx={{ color: "#475569", "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" } }}
                        >
                          <Visibility sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          onClick={() => onView(doc.id)}
                          sx={{ color: "#475569", "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" } }}
                        >
                          <Download sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="AI Summary">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedDocument(doc.id);
                            setSummaryOpen(true);
                          }}
                          sx={{ color: "#2563eb", "&:hover": { bgcolor: "#eff6ff" } }}
                        >
                          <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Ask AI">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedDocument(doc.id);
                            setAskOpen(true);
                          }}
                          sx={{ color: "#2563eb", "&:hover": { bgcolor: "#eff6ff" } }}
                        >
                          <SmartToyRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(doc.id)}
                          sx={{ color: "#94a3b8", "&:hover": { color: "#dc2626", bgcolor: "#fef2f2" } }}
                        >
                          <Delete sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <SummaryDialog
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        documentId={selectedDocument}
      />

      <AskAIDialog
        open={askOpen}
        onClose={() => setAskOpen(false)}
        documentId={selectedDocument}
      />
    </>
  );
}