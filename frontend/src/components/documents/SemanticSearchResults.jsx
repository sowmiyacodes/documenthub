
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
} from "@mui/icons-material";

// Initial semantic relevance threshold.
// Document-type filtering below handles cases where
// similarity scores alone rank the wrong document first.
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

  // A government-document query should not return a resume
  // just because its embedding happens to score highly.
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

    // Require evidence that the document is actually
    // a government-issued ID or related official record.
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

  // For ordinary queries, don't enforce a document type.
  return true;
};

export default function SemanticSearchResults({
  results = [],
  documents = [],
  onView,
  query = "",
}) {
  const groupedResults = new Map();

  // Filter weak chunks and group the remaining chunks
  // by their parent document.
  for (const result of results) {
    const similarity = getSimilarity(result);

    if (
      similarity === null ||
      similarity < MIN_SIMILARITY
    ) {
      continue;
    }

    const documentId = getDocumentId(result);

    if (!documentId) {
      continue;
    }

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

  // Match each result to its document metadata.
  const matches = Array.from(groupedResults.values())
    .map((result) => {
      const document = documents.find(
        (item) =>
          String(item.id) === String(result.documentId)
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
          border: "1px solid",
          borderColor: "grey.200",
          borderRadius: 4,
          py: 6,
          px: 2,
          textAlign: "center",
        }}
      >
        <SearchOff
          sx={{
            fontSize: 52,
            color: "text.secondary",
          }}
        />

        <Typography variant="h6" fontWeight={700} mt={2}>
          No relevant documents found
        </Typography>

        <Typography color="text.secondary" mt={1}>
          Try a different query or a more specific document type.
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

        return (
          <Card
            key={String(result.documentId)}
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: 3,
              transition: "border-color 0.2s",
              "&:hover": {
                borderColor: "primary.main",
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="flex-start"
                  sx={{ minWidth: 0, flex: 1 }}
                >
                  <Description
                    color="primary"
                    sx={{ fontSize: 32, mt: 0.25 }}
                  />

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{ overflowWrap: "anywhere" }}
                    >
                      {document.original_name ||
                        "Untitled document"}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                      mt={1}
                    >
                      <Chip
                        size="small"
                        label={category}
                        variant="outlined"
                      />

                      <Chip
                        size="small"
                        label={`Similarity: ${result.similarity.toFixed(3)}`}
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                </Stack>

                <Button
                  variant="outlined"
                  startIcon={<OpenInNew />}
                  onClick={() => onView?.(document.id)}
                  sx={{
                    flexShrink: 0,
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  Open document
                </Button>
              </Stack>

              {result.excerpt && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    MATCHING EXCERPT
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {result.excerpt.length > 500
                      ? `${result.excerpt.slice(0, 500)}…`
                      : result.excerpt}
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
