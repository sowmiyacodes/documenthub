"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
} from "@mui/material";

import {
  Description,
  OpenInNew,
  SearchOff,
  AutoAwesome,
} from "@mui/icons-material";

// Initial semantic relevance threshold.
const MIN_SIMILARITY = 0.10;

const getDocumentId = (result) =>
  result.document_id ??
  result.documentId ??
  null;

const getChunkText = (result) =>
  result.chunk_text ??
  result.content ??
  result.text ??
  result.chunk ??
  "";

const getSimilarity = (result) => {
  const value =
    result.similarity ??
    result.similarity_score ??
    result.score;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const score = Number(value);
  return Number.isFinite(score) ? score : null;
};

const normalize = (value) =>
  String(value ?? "").toLowerCase().replace(/[_-]+/g, " ");

const containsAny = (text, terms) =>
  terms.some((term) => text.includes(term));

const governmentTerms = [
  "government document",
  "government documents",
  "government id",
  "government identity",
  "govt document",
  "govt id",
  "official id",
  "national identity",
  "pan card",
  "pancard",
  "aadhaar",
  "aadhar",
  "voter id",
  "voter card",
  "passport",
  "driving licence",
  "driving license",
];

const governmentDocumentEvidence = [
  "pan card",
  "pancard",
  "permanent account number",
  "income tax department",
  "aadhaar",
  "aadhar",
  "unique identification authority of india",
  "uidai",
  "voter id",
  "election commission of india",
  "passport",
  "government of india",
  "driving licence",
  "driving license",
];

const resumeTerms = [
  "resume",
  "curriculum vitae",
  "cv",
  "professional experience",
  "work experience",
  "projects",
  "technical skills",
];

const educationTerms = [
  "education certificate",
  "educational certificate",
  "academic certificate",
  "degree certificate",
  "school certificate",
  "marksheet",
  "mark sheet",
  "transcript",
  "diploma certificate",
];

const isResumeDocument = (document) => {
  const name = normalize(document.original_name);
  return (
    /\bresume\b/.test(name) ||
    /\bcv\b/.test(name) ||
    name.includes("curriculum vitae")
  );
};

const matchesDocumentIntent = ({
  query,
  document,
  excerpt,
}) => {
  const q = normalize(query);
  const name = normalize(document.original_name);
  const category = normalize(document.ai_category);
  const manualCategory = normalize(document.category);
  const description = normalize(document.description);
  const content = normalize(excerpt);

  const combined = [
    name,
    category,
    manualCategory,
    description,
    content,
  ].join(" ");

  const asksForGovernmentDocument =
    containsAny(q, governmentTerms) ||
    (
      q.includes("government") &&
      q.includes("document")
    );

  if (asksForGovernmentDocument) {
    if (isResumeDocument(document)) {
      return false;
    }
    return containsAny(combined, governmentDocumentEvidence);
  }

  const asksForResume =
    /\bresume\b/.test(q) ||
    /\bcv\b/.test(q) ||
    q.includes("curriculum vitae");

  if (asksForResume) {
    return (
      isResumeDocument(document) ||
      containsAny(combined, [
        "resume analyser",
        "resume analysis",
        "curriculum vitae",
      ])
    );
  }

  const asksForEducationCertificate =
    containsAny(q, educationTerms);

  if (asksForEducationCertificate) {
    if (isResumeDocument(document)) {
      return false;
    }
    return (
      containsAny(combined, [
        "certificate",
        "degree",
        "marksheet",
        "mark sheet",
        "transcript",
        "diploma",
        "academic record",
      ]) ||
      category.includes("education") ||
      manualCategory.includes("education")
    );
  }

  return true;
};

export default function SemanticSearchResults({
  results = [],
  documents = [],
  onView,
  query = "",
}) {
  const groupedResults = new Map();

  for (const result of results) {
    const similarity = getSimilarity(result);
    if (similarity === null || similarity < MIN_SIMILARITY) {
      continue;
    }

    const documentId = getDocumentId(result);
    if (!documentId) continue;

    const key = String(documentId);
    const excerpt = getChunkText(result);
    const existing = groupedResults.get(key);

    if (!existing) {
      groupedResults.set(key, {
        documentId,
        similarity,
        excerpt,
      });
    } else if (similarity > existing.similarity) {
      existing.similarity = similarity;
      existing.excerpt = excerpt;
    } else if (!existing.excerpt && excerpt) {
      existing.excerpt = excerpt;
    }
  }

  const matches = Array.from(groupedResults.values())
    .map((result) => {
      const document = documents.find(
        (item) => String(item.id) === String(result.documentId)
      );
      return {
        ...result,
        document,
      };
    })
    .filter((result) => result.document)
    .filter((result) =>
      matchesDocumentIntent({
        query,
        document: result.document,
        excerpt: result.excerpt,
      })
    )
    .sort((a, b) => b.similarity - a.similarity);

  if (matches.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: "0.85rem",
          py: 6,
          px: 3,
          textAlign: "center",
          bgcolor: "#ffffff",
        }}
      >
        <SearchOff sx={{ fontSize: 44, color: "#94a3b8" }} />
        <Typography variant="h6" sx={{ fontWeight: 700, mt: 1.5, color: "#0f172a" }}>
          No vector matches for "{query}"
        </Typography>
        <Typography sx={{ color: "#64748b", mt: 0.5, fontSize: "0.875rem" }}>
          Try using different keywords, phrasing your question in full natural language, or searching for key identifiers.
        </Typography>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {matches.map((result) => {
        const document = result.document;
        const category =
          document.ai_category ||
          document.category ||
          "Uncategorized";

        const percent = Math.round(result.similarity * 100);

        return (
          <Card
            key={String(result.documentId)}
            elevation={0}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "0.85rem",
              bgcolor: "#ffffff",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
              transition: "all 0.15s ease",
              "&:hover": {
                borderColor: "#bfdbfe",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.08)",
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "0.5rem",
                      bgcolor: "#eff6ff",
                      color: "#2563eb",
                      display: "grid",
                      placeItems: "center",
                      border: "1px solid #dbeafe",
                      flexShrink: 0,
                    }}
                  >
                    <Description sx={{ fontSize: 22 }} />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "#0f172a",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {document.original_name || "Untitled document"}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                      <Chip
                        size="small"
                        label={category}
                        sx={{
                          height: 20,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          bgcolor: "#f1f5f9",
                        }}
                      />

                      <Chip
                        size="small"
                        icon={<AutoAwesome sx={{ fontSize: "13px !important", color: "#2563eb" }} />}
                        label={`${percent}% Relevance`}
                        sx={{
                          height: 20,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          bgcolor: "#eff6ff",
                          color: percent >= 70 ? "#166534" : "#1d4ed8",
                          border: "1px solid",
                          borderColor: "#bfdbfe",
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                  onClick={() => onView?.(document.id)}
                  sx={{
                    flexShrink: 0,
                    textTransform: "none",
                    borderRadius: "0.5rem",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    borderColor: "#cbd5e1",
                    color: "#0f172a",
                    "&:hover": { borderColor: "#2563eb", bgcolor: "#eff6ff" },
                  }}
                >
                  Open Document
                </Button>
              </Box>

              {result.excerpt && (
                <Box
                  sx={{
                    mt: 2,
                    p: 1.75,
                    bgcolor: "#f8fafc",
                    borderRadius: "0.6rem",
                    borderLeft: "3px solid #2563eb",
                    border: "1px solid #f1f5f9",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#64748b",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      fontSize: "0.7rem",
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    MATCHING CHUNK EVIDENCE
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "#334155",
                      fontSize: "0.85rem",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    "{result.excerpt.length > 400 ? `${result.excerpt.slice(0, 400)}…` : result.excerpt}"
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
}
