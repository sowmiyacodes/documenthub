import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatMessage({
  message,
  onOpenDocument,
  onRetry,
}) {
  const [copied, setCopied] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});
  const isAssistant = message.role === "assistant";

  const sources = Array.isArray(message.sources) ? message.sources : [];

  const content =
    typeof message.content === "string"
      ? message.content
      : typeof message.answer === "string"
        ? message.answer
        : "";
  const citationContent = content.replace(/\[(\d+)\]/g, (marker, number) => (
    sources.some((source) => Number(source.citationNumber) === Number(number))
      ? `[${number}](#source-${number})`
      : marker
  ));
  const hasNoEvidence = content.startsWith(
    "I couldn't find enough relevant information in your uploaded documents to answer reliably."
  );

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      className={`assistant-message ${isAssistant ? "is-assistant" : "is-user"}`}
      sx={{
        display: "flex",
        gap: { xs: 1.5, sm: 2 },
        alignItems: "flex-start",
        flexDirection: isAssistant ? "row" : "row-reverse",
        mb: 3.5,
        minWidth: 0,
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          background: isAssistant
            ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
            : "linear-gradient(135deg, #475569 0%, #334155 100%)",
          color: "#fff",
          boxShadow: isAssistant
            ? "0 2px 8px rgba(37, 99, 235, 0.25)"
            : "0 2px 6px rgba(15, 23, 42, 0.15)",
          border: "1px solid",
          borderColor: isAssistant ? "#93c5fd" : "#64748b",
        }}
      >
        {isAssistant ? (
          <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
        ) : (
          <PersonRoundedIcon sx={{ fontSize: 20 }} />
        )}
      </Avatar>

      <Box
        sx={{
          maxWidth: { xs: "90%", sm: "82%", md: "78%" },
          minWidth: 0,
          flex: "0 1 auto",
        }}
      >
        {/* Name Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: isAssistant ? "flex-start" : "flex-end",
            gap: 1,
            mb: 0.5,
            px: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: isAssistant ? "#1e293b" : "#475569",
              letterSpacing: "0.01em",
            }}
          >
            {isAssistant ? "DocumentHub AI" : "You"}
          </Typography>

          {isAssistant && (
            <Box
              component="span"
              sx={{
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "#2563eb",
                bgcolor: "#eff6ff",
                px: 0.8,
                py: 0.15,
                borderRadius: "9999px",
                border: "1px solid #dbeafe",
              }}
            >
              Assistant
            </Box>
          )}
        </Box>

        {/* Message Bubble */}
        <Paper
          className="assistant-chat-bubble"
          elevation={0}
          sx={{
            p: isAssistant ? { xs: 2, sm: 2.5 } : { xs: 1.6, sm: 2 },
            borderRadius: isAssistant ? "1rem 1rem 1rem 0.25rem" : "1rem 1rem 0.25rem 1rem",
            bgcolor: isAssistant ? "#ffffff" : "#2563eb",
            color: isAssistant ? "#0f172a" : "#ffffff",
            border: isAssistant ? "1px solid #e2e8f0" : "none",
            boxShadow: isAssistant
              ? "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)"
              : "0 2px 8px 0 rgba(37, 99, 235, 0.25)",
            overflowWrap: "anywhere",
            minWidth: 0,
            position: "relative",
          }}
        >
          {isAssistant ? (
            <Box
              sx={{
                fontSize: "0.935rem",
                lineHeight: 1.75,
                color: "#1e293b",
                overflowWrap: "anywhere",

                "& > :first-child": { mt: 0 },
                "& > :last-child": { mb: 0 },

                "& p": {
                  mt: 0,
                  mb: 1.5,
                },

                "& h1, & h2, & h3, & h4": {
                  lineHeight: 1.4,
                  fontWeight: 700,
                  color: "#0f172a",
                  mt: 2.2,
                  mb: 1,
                },

                "& h1": { fontSize: "1.25rem" },
                "& h2": { fontSize: "1.15rem" },
                "& h3, & h4": { fontSize: "1.025rem" },

                "& ul, & ol": {
                  pl: 2.75,
                  my: 1.25,
                },

                "& li": {
                  mb: 0.5,
                },

                "& blockquote": {
                  ml: 0,
                  pl: 2,
                  my: 1.5,
                  borderLeft: "3px solid #3b82f6",
                  color: "#475569",
                  bgcolor: "#f8fafc",
                  py: 0.75,
                  borderRadius: "0 0.5rem 0.5rem 0",
                },

                "& a": {
                  color: "#2563eb",
                  fontWeight: 600,
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  "&:hover": { color: "#1d4ed8" },
                },

                "& pre": {
                  overflowX: "auto",
                  p: 1.75,
                  my: 1.5,
                  borderRadius: "0.75rem",
                  bgcolor: "#0f172a",
                  color: "#f8fafc",
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  maxWidth: "100%",
                  border: "1px solid #1e293b",
                },

                "& code": {
                  fontFamily: '"SFMono-Regular", Menlo, Monaco, Consolas, monospace',
                  fontSize: "0.86em",
                  overflowWrap: "anywhere",
                },

                "& :not(pre) > code": {
                  bgcolor: "#f1f5f9",
                  color: "#0f172a",
                  px: 0.65,
                  py: 0.2,
                  borderRadius: "0.375rem",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                },

                "& table": {
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  display: "block",
                  overflowX: "auto",
                  my: 2,
                  borderRadius: "0.5rem",
                  border: "1px solid #e2e8f0",
                },

                "& th, & td": {
                  borderBottom: "1px solid #e2e8f0",
                  borderRight: "1px solid #e2e8f0",
                  p: 1.2,
                  textAlign: "left",
                  fontSize: "0.875rem",
                  "&:last-child": { borderRight: "none" },
                },

                "& tr:last-child td": {
                  borderBottom: "none",
                },

                "& th": {
                  bgcolor: "#f8fafc",
                  fontWeight: 700,
                  color: "#0f172a",
                },

                "& hr": {
                  border: 0,
                  borderTop: "1px solid #e2e8f0",
                  my: 2,
                },
              }}
            >
              {content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children, ...props }) => {
                      const citation = /^#source-(\d+)$/.exec(href || "");
                      if (citation) {
                        const source = sources.find(
                          (item) => Number(item.citationNumber) === Number(citation[1])
                        );
                        const documentId =
                          source?.documentId ?? source?.document_id ?? source?.document?.id;
                        return (
                          <Button
                            component="button"
                            onClick={() => documentId && onOpenDocument?.(documentId, source?.pageNumber)}
                            disabled={!documentId}
                            sx={{
                              minWidth: 0,
                              p: 0,
                              verticalAlign: "baseline",
                              fontSize: "inherit",
                              fontWeight: 700,
                              lineHeight: "inherit",
                              textTransform: "none",
                            }}
                          >
                            [{citation[1]}]
                          </Button>
                        );
                      }
                      return <a href={href} target="_blank" rel="noreferrer" {...props}>{children}</a>;
                    },
                  }}
                >
                  {citationContent}
                </ReactMarkdown>
              ) : (
                <Typography color="text.secondary" variant="body2">
                  No response content was returned.
                </Typography>
              )}

              {/* Action Toolbar on Assistant Message */}
              {content && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    mt: 1.5,
                    pt: 1,
                    borderTop: "1px dashed #f1f5f9",
                  }}
                >
                  <Tooltip title={copied ? "Copied to clipboard" : "Copy response"}>
                    <Button
                      size="small"
                      onClick={handleCopy}
                      startIcon={
                        copied ? (
                          <CheckRoundedIcon sx={{ fontSize: 15, color: "#2563eb" }} />
                        ) : (
                          <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
                        )
                      }
                      sx={{
                        textTransform: "none",
                        fontSize: "0.75rem",
                        color: copied ? "#2563eb" : "#64748b",
                        py: 0.3,
                        px: 1,
                        borderRadius: "0.5rem",
                        "&:hover": {
                          bgcolor: "#f8fafc",
                          color: "#1e293b",
                        },
                      }}
                    >
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </Tooltip>
                </Box>
              )}
            </Box>
          ) : (
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
                fontSize: "0.935rem",
                overflowWrap: "anywhere",
              }}
            >
              {content}
            </Typography>
          )}
        </Paper>

        {/* Failed Message Alert */}
        {message.failed && (
          <Box
            sx={{
              mt: 1,
              p: 1.2,
              borderRadius: "0.5rem",
              bgcolor: "#fef2f2",
              border: "1px solid #fecaca",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ color: "#b91c1c", fontSize: "0.825rem" }}>
              Message failed to send. Check connection and retry.
            </Typography>

            {onRetry && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<RefreshRoundedIcon sx={{ fontSize: 15 }} />}
                onClick={onRetry}
                sx={{
                  textTransform: "none",
                  fontSize: "0.75rem",
                  py: 0.25,
                  px: 1,
                  borderRadius: "0.375rem",
                }}
              >
                Retry
              </Button>
            )}
          </Box>
        )}

        {/* Retrieved Sources Section */}
        {isAssistant && sources.length > 0 && (
          <Box sx={{ mt: 2, pl: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
              <DescriptionOutlinedIcon sx={{ fontSize: 15, color: "#2563eb" }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "#64748b",
                  letterSpacing: "0.05em",
                  fontSize: "0.72rem",
                }}
              >
                SOURCES ({sources.length})
              </Typography>
            </Box>

            <Stack spacing={1}>
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
                    ? `Document #${String(documentId).slice(0, 8)}`
                    : `Source ${index + 1}`);

                const similarity = Number(source.similarity);
                const citationNumber = Number(source.citationNumber) || index + 1;
                const expanded = Boolean(expandedSources[citationNumber]);

                return (
                  <Paper
                    key={`${documentId || documentName}-${index}`}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: "0.75rem",
                      bgcolor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.75,
                      transition: "border-color 0.15s ease",
                      "&:hover": {
                        borderColor: "#cbd5e1",
                        bgcolor: "#ffffff",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                        <DescriptionOutlinedIcon
                          sx={{
                            color: "#2563eb",
                            fontSize: 18,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#0f172a",
                            fontSize: "0.85rem",
                            overflowWrap: "anywhere",
                          }}
                        >
                          [{citationNumber}] {documentName}
                        </Typography>
                        {Number.isInteger(Number(source.pageNumber)) && Number(source.pageNumber) > 0 && (
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            Page {source.pageNumber}
                          </Typography>
                        )}
                      </Box>

                      {source.similarity != null && Number.isFinite(similarity) && (
                        <Box
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: similarity >= 0.7 ? "#166534" : "#1e40af",
                            bgcolor: similarity >= 0.7 ? "#dcfce7" : "#dbeafe",
                            px: 0.8,
                            py: 0.2,
                            borderRadius: "9999px",
                            flexShrink: 0,
                          }}
                        >
                          {Math.round(similarity * 100)}% Match
                        </Box>
                      )}
                      <Button
                        size="small"
                        onClick={() => setExpandedSources((current) => ({
                          ...current,
                          [citationNumber]: !current[citationNumber],
                        }))}
                        endIcon={
                          <ExpandMoreRoundedIcon
                            sx={{ transform: expanded ? "rotate(180deg)" : "none" }}
                          />
                        }
                        sx={{ textTransform: "none", minWidth: 0, whiteSpace: "nowrap" }}
                      >
                        {expanded ? "Hide" : "Evidence"}
                      </Button>
                    </Box>

                    <Collapse in={expanded}>
                      <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                      {source.excerpt ? (
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.8rem",
                          color: "#475569",
                          lineHeight: 1.55,
                          p: 1,
                          bgcolor: "#f1f5f9",
                          borderRadius: "0.5rem",
                          borderLeft: "2px solid #94a3b8",
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        “{source.excerpt}”
                      </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          Evidence excerpt is not available for this saved source.
                        </Typography>
                      )}

                    {documentId && onOpenDocument && (
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => onOpenDocument(documentId, source.pageNumber)}
                        endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 13 }} />}
                        sx={{
                          alignSelf: "flex-start",
                          textTransform: "none",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "#2563eb",
                          p: 0,
                          minWidth: 0,
                          "&:hover": {
                            bgcolor: "transparent",
                            textDecoration: "underline",
                          },
                        }}
                      >
                        Open source file
                      </Button>
                    )}
                      </Box>
                    </Collapse>
                  </Paper>
                );
              })}
            </Stack>
          </Box>
        )}
        {isAssistant && hasNoEvidence && (
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 1.5, pl: 0.5, color: "#64748b" }}
          >
            No relevant source documents were found for this answer.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
