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
    document.original_name?.split(".").pop()?.toLowerCase() || "";

  const getIcon = () => {
    if (extension === "pdf") {
      return (
        <PictureAsPdf
          sx={{
            fontSize: 42,
            color: "#ef4444",
          }}
        />
      );
    }

    if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension)) {
      return (
        <Image
          sx={{
            fontSize: 42,
            color: "#22c55e",
          }}
        />
      );
    }

    return (
      <InsertDriveFile
        sx={{
          fontSize: 42,
          color: "#2563eb",
        }}
      />
    );
  };

  return (
    <Card
      elevation={1}
      sx={{
        width: "100%",
        maxWidth: 280,
        borderRadius: 3,
        overflow: "hidden",
        transition: "all .25s ease",
        border: "1px solid",
        borderColor: "grey.200",

        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,.12)",
        },
      }}
    >
      {/* File Preview */}
      <Box
        sx={{
          height: 95,
          bgcolor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid",
          borderColor: "grey.200",
        }}
      >
        {getIcon()}
      </Box>

      <CardContent
        sx={{
          p: 1.8,
          "&:last-child": {
            pb: 1.8,
          },
        }}
      >
        {/* File Name */}
        <Typography
          fontSize={15}
          fontWeight={700}
          noWrap
          title={document.original_name}
        >
          {document.original_name}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            mb: 1.3,
            fontSize: 12.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 34,
          }}
        >
          {document.description || "No description available"}
        </Typography>

        {/* Category */}
        <Chip
          label={document.category || "Others"}
          color="primary"
          size="small"
          sx={{
            height: 24,
            fontSize: 11,
            fontWeight: 600,
            mb: 1.3,
          }}
        />

        {/* Details */}
        <Stack spacing={0.7} sx={{ mb: 1.5 }}>
          <Box display="flex" alignItems="center" gap={0.8}>
            <Storage sx={{ fontSize: 16, color: "text.secondary" }} />

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {fileSize} MB
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={0.8}>
            <CalendarMonth
              sx={{ fontSize: 16, color: "text.secondary" }}
            />

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {formattedDate}
            </Typography>
          </Box>

          <Typography
            variant="caption"
            sx={{
              color: "primary.main",
              fontWeight: 600,
            }}
          >
            {document.file_type}
          </Typography>
        </Stack>

        {/* Actions */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
        >
          <Tooltip title="View">
            <IconButton
              size="small"
              onClick={() => onView(document.id)}
              sx={{
                width: 36,
                height: 36,
                border: "1px solid",
                borderColor: "grey.300",

                "&:hover": {
                  bgcolor: "primary.light",
                  color: "white",
                  borderColor: "primary.main",
                },
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Download">
            <IconButton
              size="small"
              onClick={() => onView(document.id)}
              sx={{
                width: 36,
                height: 36,
                border: "1px solid",
                borderColor: "grey.300",

                "&:hover": {
                  bgcolor: "success.light",
                  color: "white",
                  borderColor: "success.main",
                },
              }}
            >
              <Download fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => onDelete(document.id)}
              sx={{
                width: 36,
                height: 36,
                border: "1px solid",
                borderColor: "error.main",
                color: "error.main",

                "&:hover": {
                  bgcolor: "error.main",
                  color: "white",
                },
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}