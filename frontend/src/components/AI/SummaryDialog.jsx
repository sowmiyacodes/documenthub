"use client";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Box,
} from "@mui/material";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import { useEffect, useState } from "react";

import { getSummary } from "../../services/ai";

export default function SummaryDialog({
    open,
    onClose,
    documentId,
}) {

    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {

        if (!open || !documentId) return;

        const loadSummary = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await getSummary(documentId);

                setSummary(response.document.summary || "");

            } catch (err) {

                setError(
                    err.response?.data?.message ||
                    "Unable to load summary."
                );

            } finally {

                setLoading(false);

            }

        };

        loadSummary();

    }, [open, documentId]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
        >

            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontWeight: 700,
                }}
            >
                <AutoAwesomeRoundedIcon color="primary" />
                AI Summary
            </DialogTitle>

            <DialogContent dividers>

                {loading && (
                    <Box
                        display="flex"
                        justifyContent="center"
                        py={4}
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
                        sx={{
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.9,
                        }}
                    >
                        {summary || "Summary not available."}
                    </Typography>
                )}

            </DialogContent>

            <DialogActions>

                <Button
                    variant="contained"
                    onClick={onClose}
                >
                    Close
                </Button>

            </DialogActions>

        </Dialog>
    );
}