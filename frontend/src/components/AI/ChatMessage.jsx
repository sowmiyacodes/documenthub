
import {
  Avatar,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatMessage({
  message,
  onOpenDocument,
  onRetry,
}) {
  const isAssistant = message.role === "assistant";

  const sources = Array.isArray(message.sources)
    ? message.sources
    : [];

  const content =
    typeof message.content === "string"
      ? message.content
      : typeof message.answer === "string"
        ? message.answer
        : "";

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
        flexDirection: isAssistant ? "row" : "row-reverse",
        mb: 3,
        minWidth: 0,
      }}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          bgcolor: isAssistant ? "#2563EB" : "#E2E8F0",
          color: isAssistant ? "#fff" : "#334155",
        }}
      >
        {isAssistant ? (
          <SmartToyRoundedIcon fontSize="small" />
        ) : (
          <PersonRoundedIcon fontSize="small" />
        )}
      </Avatar>

      <Box
        sx={{
          maxWidth: { xs: "88%", md: "78%" },
          minWidth: 0,
          flex: "0 1 auto",
        }}
      >
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
        >
          {isAssistant ? "LifeHub AI" : "You"}
        </Typography>

        <Paper
          elevation={0}
          sx={{
            mt: 0.5,
            px: 2,
            py: 1.6,
            borderRadius: 3,
            bgcolor: isAssistant ? "#F1F5F9" : "#2563EB",
            color: isAssistant ? "#1E293B" : "#fff",
            overflowWrap: "anywhere",
            minWidth: 0,
          }}
        >
          {isAssistant ? (
            <Box
              sx={{
                fontSize: 15,
                lineHeight: 1.8,
                overflowWrap: "anywhere",

                "& > :first-of-type": { mt: 0 },
                "& > :last-child": { mb: 0 },

                "& p": {
                  mt: 0,
                  mb: 1.5,
                },

                "& h1, & h2, & h3, & h4": {
                  lineHeight: 1.4,
                  fontWeight: 800,
                  mt: 2,
                  mb: 1,
                },

                "& h1": { fontSize: "1.35rem" },
                "& h2": { fontSize: "1.2rem" },
                "& h3, & h4": { fontSize: "1.05rem" },

                "& ul, & ol": {
                  pl: 3,
                  my: 1,
                },

                "& li": { mb: 0.5 },

                "& blockquote": {
                  ml: 0,
                  pl: 2,
                  borderLeft: "3px solid #93C5FD",
                  color: "#475569",
                },

                "& a": {
                  color: "#1D4ED8",
                  textDecoration: "underline",
                  overflowWrap: "anywhere",
                },

                "& pre": {
                  overflowX: "auto",
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "#0F172A",
                  color: "#F8FAFC",
                  fontSize: 13,
                  lineHeight: 1.6,
                  maxWidth: "100%",
                },

                "& code": {
                  fontFamily:
                    '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
                  fontSize: "0.88em",
                  overflowWrap: "anywhere",
                },

                "& :not(pre) > code": {
                  bgcolor: "#E2E8F0",
                  px: 0.5,
                  py: 0.2,
                  borderRadius: 1,
                },

                "& table": {
                  width: "100%",
                  borderCollapse: "collapse",
                  display: "block",
                  overflowX: "auto",
                  my: 1.5,
                },

                "& th, & td": {
                  border: "1px solid #CBD5E1",
                  p: 1,
                  textAlign: "left",
                  verticalAlign: "top",
                },

                "& th": {
                  bgcolor: "#E2E8F0",
                  fontWeight: 700,
                },

                "& hr": {
                  border: 0,
                  borderTop: "1px solid #CBD5E1",
                  my: 2,
                },

                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                },
              }}
            >
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              ) : (
                <Typography color="text.secondary" variant="body2">
                  No response content was returned.
                </Typography>
              )}
            </Box>
          ) : (
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.8,
                overflowWrap: "anywhere",
              }}
            >
              {content}
            </Typography>
          )}
        </Paper>

        {message.failed && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="error">
              This message could not be sent.
            </Typography>

            {onRetry && (
              <Button
                size="small"
                startIcon={<RefreshRoundedIcon />}
                onClick={onRetry}
                sx={{ mt: 0.5, textTransform: "none" }}
              >
                Retry
              </Button>
            )}
          </Box>
        )}

        {isAssistant && sources.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              SOURCES
            </Typography>

            <Stack spacing={1} mt={1}>
              {sources.map((source, index) => {
                const documentId =
                  source.documentId ??
                  source.document_id ??
                  source.document?.id;

                const documentName =
                  source.documentName ||
                  source.original_name ||
                  source.document?.original_name ||
                  source.document?.name ||
                  (documentId
                    ? `Document ${String(documentId).slice(0, 8)}`
                    : `Source ${index + 1}`);

                const similarity = Number(source.similarity);

                return (
                  <Paper
                    key={`${documentId || documentName}-${index}`}
                    variant="outlined"
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      display: "flex",
                      gap: 1,
                      alignItems: "flex-start",
                      bgcolor: "#fff",
                      minWidth: 0,
                    }}
                  >
                    <DescriptionOutlinedIcon
                      sx={{
                        color: "#2563EB",
                        fontSize: 20,
                        mt: 0.2,
                        flexShrink: 0,
                      }}
                    />

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        {documentName}
                      </Typography>

                      {source.similarity != null &&
                        Number.isFinite(similarity) && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Similarity: {similarity.toFixed(3)}
                          </Typography>
                        )}

                      {source.excerpt && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {source.excerpt}
                        </Typography>
                      )}

                      {documentId && onOpenDocument && (
                        <Link
                          component="button"
                          type="button"
                          underline="hover"
                          onClick={() => onOpenDocument(documentId)}
                          sx={{
                            display: "block",
                            mt: 0.5,
                            fontSize: 12,
                            textAlign: "left",
                          }}
                        >
                          Open document
                        </Link>
                      )}
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
