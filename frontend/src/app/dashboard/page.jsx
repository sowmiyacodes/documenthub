import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowForward,
  Category,
  Description,
  Storage,
  Upload,
  Visibility,
} from "@mui/icons-material";
import { getDocuments, viewDocument } from "@/services/document";
import StatusBadge from "@/components/AI/StatusBadge";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export default function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

  useEffect(() => {
    let active = true;

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await getDocuments();
        if (active && Array.isArray(response?.documents)) {
          setDocuments(response.documents);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDocuments();
    return () => {
      active = false;
    };
  }, []);

  const documentCount = documents.length;
  const storageUsed = (
    documents.reduce((total, document) => total + (document.file_size || 0), 0) /
    (1024 * 1024)
  ).toFixed(1);
  const categoryCount = new Set(
    documents.map((document) => document.ai_category || document.category || "Other")
  ).size;
  const recentDocuments = documents.slice(0, 5);

  const handleOpenDocument = async (id) => {
    try {
      const response = await viewDocument(id);
      if (response?.url) window.open(response.url, "_blank");
    } catch (error) {
      console.error(error);
    }
  };

  const metrics = [
    {
      label: "Documents",
      value: loading ? "—" : documentCount,
      icon: <Description />,
    },
    {
      label: "Categories",
      value: loading ? "—" : categoryCount,
      icon: <Category />,
    },
    {
      label: "Storage used",
      value: loading ? "—" : `${storageUsed} MB`,
      icon: <Storage />,
    },
  ];

  return (
    <Box className="dashboard-overview dashboard-overview-new">
      <Box className="overview-welcome">
        <Box className="overview-welcome-copy">
          <Typography className="overview-kicker">YOUR DOCUMENT SPACE</Typography>
          <Typography component="h1" className="overview-title">
            {getGreeting()}, {user?.full_name?.split(" ")[0] || "there"}.
          </Typography>
          <Typography className="overview-description">
            Everything you keep, ready when you need it.
          </Typography>
        </Box>

        <Button
          className="overview-upload-button"
          component={Link}
          to="/dashboard/documents"
          variant="contained"
          startIcon={<Upload />}
        >
          Add documents
          <ArrowForward className="overview-upload-arrow" />
        </Button>
        <Box className="overview-welcome-orbit" aria-hidden="true"><span /><span /></Box>
      </Box>

      <Grid container spacing={1.5} className="overview-metrics">
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={4} key={metric.label}>
            <Card className={`overview-metric overview-metric-${index + 1}`} elevation={0}>
              <Box className="overview-metric-icon">{metric.icon}</Box>
              <Box className="overview-metric-copy">
                <Typography className="overview-metric-label">{metric.label}</Typography>
                <Box className="overview-metric-value-row">
                  <Typography className="overview-metric-value">{metric.value}</Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card className="overview-files-panel" elevation={0}>
        <Box className="overview-files-heading">
          <Box>
            <Typography className="overview-files-kicker">YOUR LIBRARY</Typography>
            <Typography component="h2" className="overview-files-title">Recently added</Typography>
          </Box>
          <Button component={Link} to="/dashboard/documents" className="overview-vault-link">
            Open vault <ArrowForward />
          </Button>
        </Box>

        {recentDocuments.length === 0 && !loading ? (
          <Box className="overview-empty">
            <Box className="overview-empty-icon"><Description /></Box>
            <Typography component="h3">Your archive starts here.</Typography>
            <Typography>Add a document to keep it organized and easy to find.</Typography>
            <Button component={Link} to="/dashboard/documents" variant="contained" startIcon={<Upload />}>
              Add your first document
            </Button>
          </Box>
        ) : (
          <Box className="overview-document-list">
            {loading
              ? Array.from({ length: 3 }, (_, index) => (
                  <Box className="overview-document-row overview-document-loading" key={index}>
                    <span />
                    <span />
                    <span />
                  </Box>
                ))
              : recentDocuments.map((document, index) => (
                  <Box className="overview-document-row" key={document.id}>
                    <Box className="overview-document-index">
                      {String(index + 1).padStart(2, "0")}
                    </Box>
                    <Box className="overview-document-type"><Description /></Box>
                    <Box className="overview-document-main">
                      <Typography className="overview-document-name" noWrap>
                        {document.original_name}
                      </Typography>
                      <Typography className="overview-document-meta" noWrap>
                        {document.uploaded_at
                          ? new Date(document.uploaded_at).toLocaleDateString()
                          : "Date unavailable"}
                      </Typography>
                    </Box>
                    <Chip
                      className="overview-document-category"
                      label={document.ai_category || document.category || "General"}
                      size="small"
                    />
                    <StatusBadge status={document.processing_status} />
                    <Tooltip title="Open document">
                      <IconButton
                        className="overview-document-open"
                        aria-label={`Open ${document.original_name}`}
                        onClick={() => handleOpenDocument(document.id)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
          </Box>
        )}
      </Card>

    </Box>
  );
}
