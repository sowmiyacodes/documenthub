
import { Box, Typography, Avatar, Paper, Link, Stack } from "@mui/material";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

export default function ChatMessage({ message, onOpenDocument }) {
  const isAssistant = message.role === "assistant";
  const sources = Array.isArray(message.sources) ? message.sources : [];

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        alignItems: "flex-start",
        flexDirection: isAssistant ? "row" : "row-reverse",
        mb: 3,
      }}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
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
          }}
        >
          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.8,
              overflowWrap: "anywhere",
            }}
          >
            {message.content || ""}
          </Typography>
        </Paper>

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
                  source.documentId || source.document_id;

                return (
                  <Paper
                    key={`${documentId || "source"}-${index}`}
                    variant="outlined"
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      bgcolor: "#fff",
                    }}
                  >
                    <DescriptionOutlinedIcon
                      sx={{ color: "#2563EB", fontSize: 20 }}
                    />

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {source.documentName ||
                          source.original_name ||
                          (documentId
                            ? `Document ${String(documentId).slice(0, 8)}`
                            : `Source ${index + 1}`)}
                      </Typography>

                      {source.similarity != null && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Similarity: {Number(source.similarity).toFixed(3)}
                        </Typography>
                      )}

                      {source.excerpt && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
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
