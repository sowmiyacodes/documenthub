"use client";

import { useEffect, useMemo, useState } from "react";

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
} from "@mui/material";

import {
  Upload,
  Search,
  FolderOpen,
  FilterList,
  GridView,
  TableRows,
  Sort,
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

  const [isUploadModalOpen, setIsUploadModalOpen] =
    useState(false);

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

      window.open(response.url, "_blank");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this document?"))
      return;

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
      const matchSearch =
        doc.original_name
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchCategory =
        category === "All" ||
        doc.category === category;

      return matchSearch && matchCategory;
    });

    switch (sortBy) {

      case "oldest":
        docs.sort(
          (a, b) =>
            new Date(a.uploaded_at) -
            new Date(b.uploaded_at)
        );
        break;

      case "name":
        docs.sort((a, b) =>
          a.original_name.localeCompare(
            b.original_name
          )
        );
        break;

      case "size":
        docs.sort(
          (a, b) =>
            (b.file_size || 0) -
            (a.file_size || 0)
        );
        break;

      default:
        docs.sort(
          (a, b) =>
            new Date(b.uploaded_at) -
            new Date(a.uploaded_at)
        );
    }

    return docs;

  }, [
    documents,
    search,
    category,
    sortBy,
  ]);
  return (
  <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>

    {/* ================= HEADER ================= */}

    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "grey.200",
        bgcolor: "white",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        flexDirection={{ xs: "column", md: "row" }}
        gap={3}
      >
        <Box>
          <Typography
            variant="overline"
            color="primary"
            fontWeight={700}
          >
            AI DOCUMENT VAULT
          </Typography>

          <Typography
            variant="h4"
            fontWeight={800}
          >
            My Documents
          </Typography>

          <Typography
            color="text.secondary"
            mt={0.5}
          >
            {filteredDocuments.length} of {documents.length} Documents
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => setIsUploadModalOpen(true)}
          sx={{
            borderRadius: 3,
            px: 4,
            height: 48,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Upload Document
        </Button>
      </Box>
    </Paper>

    {/* ================= TOOLBAR ================= */}

    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 4,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
      <Grid
        container
        spacing={2}
        alignItems="center"
      >
        {/* Search */}

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search documents..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Category */}

        <Grid item xs={12} sm={6} md={2.5}>
          <FormControl fullWidth>

            <InputLabel>
              Category
            </InputLabel>

            <Select
              value={category}
              label="Category"
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Education">
                Education
              </MenuItem>
              <MenuItem value="Identity">
                Identity
              </MenuItem>
              <MenuItem value="Medical">
                Medical
              </MenuItem>
              <MenuItem value="Financial">
                Financial
              </MenuItem>
              <MenuItem value="Legal">
                Legal
              </MenuItem>
              <MenuItem value="Others">
                Others
              </MenuItem>
            </Select>

          </FormControl>
        </Grid>

        {/* Sort */}

        <Grid item xs={12} sm={6} md={2.5}>
          <FormControl fullWidth>

            <InputLabel>
              Sort
            </InputLabel>

            <Select
              value={sortBy}
              label="Sort"
              onChange={(e) =>
                setSortBy(e.target.value)
              }
              startAdornment={
                <Sort sx={{ mr: 1 }} />
              }
            >
              <MenuItem value="newest">
                Newest
              </MenuItem>

              <MenuItem value="oldest">
                Oldest
              </MenuItem>

              <MenuItem value="name">
                Name
              </MenuItem>

              <MenuItem value="size">
                File Size
              </MenuItem>
            </Select>

          </FormControl>
        </Grid>

        {/* Grid/Table */}

        <Grid item xs={12} md={3}>
          <Box
            display="flex"
            justifyContent={{
              xs: "flex-start",
              md: "flex-end",
            }}
          >
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, value) => {
                if (value) {
                  setViewMode(value);
                }
              }}
            >
              <ToggleButton value="grid">
                <GridView sx={{ mr: 1 }} />
                Grid
              </ToggleButton>

              <ToggleButton value="table">
                <TableRows sx={{ mr: 1 }} />
                Table
              </ToggleButton>

            </ToggleButtonGroup>
          </Box>
        </Grid>

      </Grid>
    </Paper>

    {/* ================= LOADING ================= */}

    {loading && (
      <Box
        display="flex"
        justifyContent="center"
        py={8}
      >
        <CircularProgress />
      </Box>
    )}

    {/* ================= EMPTY ================= */}

    {!loading &&
      filteredDocuments.length === 0 && (

        <Card
          sx={{
            borderRadius: 4,
            py: 8,
            textAlign: "center",
          }}
        >
          <FolderOpen
            sx={{
              fontSize: 70,
              color: "primary.main",
            }}
          />

          <Typography
            variant="h5"
            fontWeight={700}
            mt={2}
          >
            No Documents Found
          </Typography>

          <Typography
            color="text.secondary"
            mt={1}
            mb={3}
          >
            Upload your first document to
            get started.
          </Typography>

          <Button
            variant="contained"
            startIcon={<Upload />}
            onClick={() =>
              setIsUploadModalOpen(true)
            }
          >
            Upload Document
          </Button>
        </Card>
      )}

    {/* ================= DOCUMENTS ================= */}

{
  !loading &&
  filteredDocuments.length > 0 &&
  (
    viewMode === "grid" ? (

      <Grid container spacing={2}>

        {filteredDocuments.map((document) => (

          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            xl={2.4}
            key={document.id}
            display="flex"
            justifyContent="center"
          >

            <DocumentCard
              document={document}
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
  )
}

{/* ================= UPLOAD MODAL ================= */}

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

