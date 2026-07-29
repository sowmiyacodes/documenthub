"use client";

import {
  Visibility,
  Delete,
  Download,
  CalendarMonth,
  Storage,
  PictureAsPdf,
  Image,
  InsertDriveFile,
} from "@mui/icons-material";

import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";

export default function DocumentCard({
  document,
  onView,
  onDelete,
}) {

  const formattedDate = document.uploaded_at
    ? new Date(document.uploaded_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

  const fileSize = document.file_size
    ? (document.file_size / 1024 / 1024).toFixed(2)
    : "0";

  const extension =
    document.original_name
      ?.split(".")
      .pop()
      ?.toLowerCase() || "";

  const getIcon = () => {

    if (extension === "pdf") {
      return (
        <PictureAsPdf
          sx={{
            fontSize: 55,
            color: "error.main",
          }}
        />
      );
    }

    if (
      ["png", "jpg", "jpeg", "gif", "webp"].includes(extension)
    ) {
      return (
        <Image
          sx={{
            fontSize: 55,
            color: "success.main",
          }}
        />
      );
    }

    return (
      <InsertDriveFile
        sx={{
          fontSize: 55,
          color: "primary.main",
        }}
      />
    );
  };

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        transition: "0.25s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 10px 30px rgba(0,0,0,.15)",
        },
      }}
    >
      <Box
        sx={{
          height: 180,
          bgcolor: "grey.100",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {getIcon()}
      </Box>

      <CardContent>

        <Typography
          variant="h6"
          fontWeight={700}
          noWrap
          title={document.original_name}
        >
          {document.original_name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            wordBreak: "break-all",
          }}
        >
          {document.description || "No description"}
        </Typography>

        <Chip
          label={document.category}
          color="primary"
          size="small"
          sx={{ mb: 2 }}
        />

        <Stack spacing={1} sx={{ mb: 3 }}>

          <Box display="flex" alignItems="center" gap={1}>
            <Storage fontSize="small" />
            <Typography variant="body2">
              {fileSize} MB
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <CalendarMonth fontSize="small" />
            <Typography variant="body2">
              {formattedDate}
            </Typography>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            {document.file_type}
          </Typography>

        </Stack>

        <Stack direction="row" spacing={1}>

          <Tooltip title="View">

            <IconButton
              onClick={() => onView(document.id)}
              sx={{
                flex: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Visibility />
            </IconButton>

          </Tooltip>

          <Tooltip title="Download">

            <IconButton
              onClick={() => onView(document.id)}
              sx={{
                flex: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Download />
            </IconButton>

          </Tooltip>

          <Tooltip title="Delete">

            <IconButton
              onClick={() => onDelete(document.id)}
              sx={{
                flex: 1,
                border: "1px solid",
                borderColor: "error.main",
                color: "error.main",
              }}
            >
              <Delete />
            </IconButton>

          </Tooltip>

        </Stack>

      </CardContent>

    </Card>
  );
}