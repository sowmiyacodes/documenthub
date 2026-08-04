import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Typography,
} from "@mui/material";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import { getSummary } from "../../services/ai";

const SummaryCard = ({ documentId }) => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!documentId) return;

        const fetchSummary = async () => {
            try {
                setLoading(true);

                const response = await getSummary(documentId);

                setSummary(response.document.summary || "");

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load AI summary."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [documentId]);

    return (
        <Card
            elevation={3}
            sx={{
                borderRadius: 3,
            }}
        >
            <CardContent>

                <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    mb={2}
                >
                    <AutoAwesomeRoundedIcon color="primary" />

                    <Typography
                        variant="h6"
                        fontWeight={600}
                    >
                        AI Summary
                    </Typography>
                </Box>

                {loading && (
                    <Box
                        display="flex"
                        justifyContent="center"
                        py={2}
                    >
                        <CircularProgress />
                    </Box>
                )}

                {!loading && error && (
                    <Alert severity="error">
                        {error}
                    </Alert>
                )}

                {!loading && !error && (
                    <Typography
                        variant="body1"
                        sx={{
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.8,
                        }}
                    >
                        {summary || "Summary not available."}
                    </Typography>
                )}

            </CardContent>
        </Card>
    );
};

export default SummaryCard;