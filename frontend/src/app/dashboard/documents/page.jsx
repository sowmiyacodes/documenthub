"use client";

import { useEffect, useMemo, useState } from "react";
import { semanticSearch } from "@/services/search";
import SemanticSearchResults from "@/components/documents/SemanticSearchResults";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Card,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  Upload,
  Search,
  FolderOpen,
  GridView,
  TableRows,
  Sort,
  AutoAwesome,
  Clear,
} from "@mui/icons-material";

import UploadDocumentModal from "@/components/documents/UploadDocumentModal";
import DocumentCard from "@/components/documents/DocumentCard";
import DocumentTable from "@/components/documents/DocumentTable";

import {
  getDocuments,
  deleteDocument,
  viewDocument,
} from "@/services/document";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  const [semanticResults, setSemanticResults] = useState([]);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticError, setSemanticError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await getDocuments();
      setDocuments(response.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleView = async (id) => {
    try {
      const response = await viewDocument(id);
      if (response?.url) {
        window.open(response.url, "_blank");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      await deleteDocument(id);
      loadDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDocuments = useMemo(() => {
    let docs = [...documents];

    docs = docs.filter((doc) => {
      const matchSearch = doc.original_name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchCategory =
        category === "All" ||
        doc.category === category ||
        doc.ai_category === category;

      return matchSearch && matchCategory;
    });

    switch (sortBy) {
      case "oldest":
        docs.sort(
          (a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at)
        );
        break;

      case "name":
        docs.sort((a, b) =>
          a.original_name.localeCompare(b.original_name)
        );
        break;

      case "size":
        docs.sort((a, b) => (b.file_size || 0) - (a.file_size || 0));
        break;

      default:
        docs.sort(
          (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
        );
    }

    return docs;
  }, [documents, search, category, sortBy]);

  const handleSemanticSearch = async () => {
    const query = search.trim();

    if (!query) {
      setHasSearched(false);
      setSemanticResults([]);
      setSemanticError("");
      return;
    }

    setSemanticLoading(true);
    setSemanticError("");
    setHasSearched(true);

    try {
      const response = await semanticSearch(query);

      if (!response.success) {
        throw new Error("Semantic search failed.");
      }

      setSemanticResults(response.results || []);
    } catch (error) {
      console.error("Semantic search error:", error);
      setSemanticResults([]);
      setSemanticError(
        error.response?.data?.message ||
          error.message ||
          "Unable to search documents. Please try again."
      );
    } finally {
      setSemanticLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setHasSearched(false);
    setSemanticResults([]);
    setSemanticError("");
  };

  return (
    <Box className="dashboard-documents" sx={{ pb: 6 }}>
      {/* Header Bar */}
      <Box
        className="vault-page-heading"
        sx={{
          mb: 3.5,
          p: { xs: 2.5, md: 3 },
          borderRadius: "0.85rem",
          bgcolor: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
        }}
      >
        <Box className="vault-heading-copy">
          <Typography className="vault-heading-eyebrow">THE ARCHIVE</Typography>
          <Box display="flex" alignItems="center" gap={1.25}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>
              Your documents
            </Typography>
            <Chip
              label={`${filteredDocuments.length} files`}
              size="small"
              sx={{
                bgcolor: "#eff6ff",
                color: "#2563eb",
                fontWeight: 700,
                fontSize: "0.75rem",
                borderRadius: "9999px",
                border: "1px solid #bfdbfe",
              }}
            />
          </Box>

          <Typography sx={{ color: "#64748b", fontSize: "0.875rem", mt: 0.5 }}>
            A clear home for the files you need to keep.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => setIsUploadModalOpen(true)}
          sx={{
            borderRadius: "0.65rem",
            px: 3,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            bgcolor: "#2563eb",
            boxShadow: "0 1px 2px rgba(37, 99, 235, 0.2)",
            "&:hover": {
              bgcolor: "#1d4ed8",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
            },
          }}
        >
          Upload Document
        </Button>
      </Box>

      {/* Filter and Toolbar Bar */}
      <Paper
        className="vault-toolbar"
        elevation={0}
        sx={{
          p: 2,
          mb: 3.5,
          borderRadius: "0.85rem",
          bgcolor: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        }}
      >
        <Box className="vault-toolbar-heading">
          <Typography>Find a document</Typography>
          <span>Search by name or by meaning</span>
        </Box>
        <Grid className="vault-toolbar-grid" container spacing={2} alignItems="center">
          {/* Search + AI Search Trigger */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search your documents..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!e.target.value) {
                  setHasSearched(false);
                  setSemanticResults([]);
                  setSemanticError("");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSemanticSearch();
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "0.6rem",
                  bgcolor: "#f8fafc",
                  fontSize: "0.875rem",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 19, color: "#64748b" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {search && (
                      <IconButton size="small" onClick={handleClearSearch} sx={{ mr: 0.5 }}>
                        <Clear sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleSemanticSearch}
                      disabled={semanticLoading || !search.trim()}
                      startIcon={<AutoAwesome sx={{ fontSize: 15 }} />}
                      sx={{
                        textTransform: "none",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        borderRadius: "0.5rem",
                        py: 0.4,
                        px: 1.25,
                        bgcolor: "#2563eb",
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
                      }}
                    >
                      {semanticLoading ? "Searching..." : "AI Search"}
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Category Filter */}
          <Grid item xs={6} sm={4} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
                sx={{ borderRadius: "0.6rem", bgcolor: "#f8fafc", fontSize: "0.875rem" }}
              >
                <MenuItem value="All">All Categories</MenuItem>
                <MenuItem value="Identity">Identity</MenuItem>
                <MenuItem value="Education">Education</MenuItem>
                <MenuItem value="Medical">Medical</MenuItem>
                <MenuItem value="Financial">Financial</MenuItem>
                <MenuItem value="Legal">Legal</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort By */}
          <Grid item xs={6} sm={4} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-label">Sort By</InputLabel>
              <Select
                labelId="sort-label"
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ borderRadius: "0.6rem", bgcolor: "#f8fafc", fontSize: "0.875rem" }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="name">File Name</MenuItem>
                <MenuItem value="size">File Size</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* View Toggle */}
          <Grid item xs={12} sm={4} md={2}>
            <Box display="flex" justifyContent={{ xs: "flex-start", sm: "flex-end" }}>
              <ToggleButtonGroup
                size="small"
                value={viewMode}
                exclusive
                onChange={(e, value) => {
                  if (value) setViewMode(value);
                }}
                sx={{
                  bgcolor: "#f8fafc",
                  borderRadius: "0.6rem",
                  "& .MuiToggleButton-root": {
                    borderRadius: "0.6rem",
                    border: "1px solid #e2e8f0",
                    px: 1.5,
                    py: 0.5,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    "&.Mui-selected": {
                      bgcolor: "#2563eb",
                      color: "#ffffff",
                      "&:hover": { bgcolor: "#1d4ed8" },
                    },
                  },
                }}
              >
                <ToggleButton value="grid">
                  <GridView sx={{ fontSize: 16, mr: 0.5 }} />
                  Grid
                </ToggleButton>
                <ToggleButton value="table">
                  <TableRows sx={{ fontSize: 16, mr: 0.5 }} />
                  Table
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Semantic Search Results (if triggered) */}
      {hasSearched && (
        <Box className="vault-search-results" sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <AutoAwesome sx={{ color: "#2563eb", fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                AI Semantic Matches
              </Typography>
            </Box>

            <Button
              size="small"
              onClick={handleClearSearch}
              sx={{ textTransform: "none", fontSize: "0.8rem", color: "#64748b" }}
            >
              Clear semantic view
            </Button>
          </Box>

          {semanticLoading && (
            <Box display="flex" flexDirection="column" alignItems="center" py={6} gap={1.5}>
              <CircularProgress size={28} thickness={4} />
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Querying pgvector vector similarity...
              </Typography>
            </Box>
          )}

          {!semanticLoading && semanticError && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "0.75rem",
                bgcolor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
              }}
            >
              <Typography variant="body2">{semanticError}</Typography>
            </Paper>
          )}

          {!semanticLoading && !semanticError && (
            <SemanticSearchResults
              results={semanticResults}
              documents={documents}
              onView={handleView}
              query={search}
            />
          )}
        </Box>
      )}

      {/* Loading state */}
      {loading && (
        <Box display="flex" flexDirection="column" alignItems="center" py={10} gap={2}>
          <CircularProgress size={32} thickness={4} />
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Loading vault documents...
          </Typography>
        </Box>
      )}

      {/* Empty State */}
      {!loading && !hasSearched && filteredDocuments.length === 0 && (
        <Card
          elevation={0}
          sx={{
            borderRadius: "0.85rem",
            border: "1px solid #e2e8f0",
            py: 10,
            px: 3,
            textAlign: "center",
            bgcolor: "#ffffff",
          }}
        >
          <Box
            sx={{
              width: 68,
              height: 68,
              borderRadius: "1.25rem",
              bgcolor: "#eff6ff",
              color: "#2563eb",
              display: "grid",
              placeItems: "center",
              mx: "auto",
              border: "1px solid #dbeafe",
            }}
          >
            <FolderOpen sx={{ fontSize: 34 }} />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 800, mt: 2.5, color: "#0f172a" }}>
            No documents found
          </Typography>

          <Typography sx={{ color: "#64748b", mt: 0.75, mb: 3.5, maxWidth: 440, mx: "auto", fontSize: "0.875rem" }}>
            {search || category !== "All"
              ? "No files match your current filters. Try resetting search or selecting All Categories."
              : "Your vault is currently empty. Upload your first document to extract text and enable AI questions."}
          </Typography>

          <Button
            variant="contained"
            startIcon={<Upload />}
            onClick={() => setIsUploadModalOpen(true)}
            sx={{
              borderRadius: "0.6rem",
              px: 3.5,
              py: 1,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#2563eb",
            }}
          >
            Upload Document
          </Button>
        </Card>
      )}

      {/* Documents Grid / Table View */}
      {!loading && filteredDocuments.length > 0 && (
        viewMode === "grid" ? (
          <Grid className="vault-document-grid" container spacing={2.5}>
            {filteredDocuments.map((doc) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={doc.id}
                display="flex"
              >
                <DocumentCard
                  document={doc}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <DocumentTable
            documents={filteredDocuments}
            onView={handleView}
            onDelete={handleDelete}
          />
        )
      )}

      {/* Upload Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {
          setIsUploadModalOpen(false);
          loadDocuments();
        }}
      />
    </Box>
  );
}
