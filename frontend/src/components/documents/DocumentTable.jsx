"use client";
import { useState } from "react";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";

import SummaryDialog from "../AI/SummaryDialog";
import AskAIDialog from "../AI/AskAIDialog";
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
  Image,
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
    const ext =
      name?.split(".").pop()?.toLowerCase() || "";

    if (ext === "pdf") {
      return (
        <PictureAsPdf
          sx={{
            color: "error.main",
            mr: 1,
          }}
        />
      );
    }

    if (
      ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
    ) {
      return (
        <Image
          sx={{
            color: "success.main",
            mr: 1,
          }}
        />
      );
    }

    return (
      <InsertDriveFile
        sx={{
          color: "primary.main",
          mr: 1,
        }}
      />
    );
  };

  return (
    <>
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
      <Table>

        <TableHead>

          <TableRow
            sx={{
              bgcolor: "#f8fafc",
            }}
          >
            <TableCell>
              <b>Name</b>
            </TableCell>

            <TableCell>
              <b>Category</b>
            </TableCell>

            <TableCell>
              <b>Size</b>
            </TableCell>

            <TableCell>
              <b>Uploaded</b>
            </TableCell>

            <TableCell align="center">
              <b>Actions</b>
            </TableCell>
          </TableRow>

        </TableHead>

        <TableBody>

          {documents.map((doc) => {

            const size = doc.file_size
              ? (
                  doc.file_size /
                  1024 /
                  1024
                ).toFixed(2)
              : "0";

            const date = doc.uploaded_at
              ? new Date(
                  doc.uploaded_at
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )
              : "-";

            return (
              <TableRow
                key={doc.id}
                hover
              >
                <TableCell>

                  <Box
                    display="flex"
                    alignItems="center"
                  >
                    {getIcon(doc.original_name)}

                    <Typography
                      fontWeight={600}
                    >
                      {doc.original_name}
                    </Typography>

                  </Box>

                </TableCell>

                <TableCell>

                  <Chip
                    label={doc.category}
                    size="small"
                    color="primary"
                  />

                </TableCell>

                <TableCell>

                  {size} MB

                </TableCell>

                <TableCell>

                  {date}

                </TableCell>

                <TableCell
                  align="center"
                >

                  <Tooltip title="View">

                    <IconButton
                      onClick={() =>
                        onView(doc.id)
                      }
                    >
                      <Visibility />
                    </IconButton>

                  </Tooltip>

                  <Tooltip title="Download">

                    <IconButton
                      onClick={() =>
                        onView(doc.id)
                      }
                    >
                      <Download />
                    </IconButton>

                  </Tooltip>
                  <Tooltip title="AI Summary">
                    <IconButton
                        color="warning"
                        onClick={() => {
                        setSelectedDocument(doc.id);
                        setSummaryOpen(true);
                        }}
                    >
                        <AutoAwesomeRoundedIcon />
                    </IconButton>
                    </Tooltip>
                    <Tooltip title="Ask AI">
                        <IconButton
                            color="secondary"
                            onClick={() => {
                            setSelectedDocument(doc.id);
                            setAskOpen(true);
                            }}
                        >
                            <SmartToyRoundedIcon />
                        </IconButton>
                        </Tooltip>
                  <Tooltip title="Delete">

                    <IconButton
                      color="error"
                      onClick={() =>
                        onDelete(doc.id)
                      }
                    >
                      <Delete />
                    </IconButton>

                  </Tooltip>

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