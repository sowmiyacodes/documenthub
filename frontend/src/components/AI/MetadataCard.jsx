import {
    Card,
    CardContent,
    Divider,
    Grid,
    Typography,
    Box,
} from "@mui/material";

import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";

const MetadataCard = ({ document }) => {

    const metadata = document?.metadata || {};

    return (
        <Card
            elevation={3}
            sx={{
                borderRadius: 3,
            }}
        >
            <CardContent>

                <Typography
                    variant="h6"
                    fontWeight={600}
                    mb={2}
                >
                    Document Information
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>

                    <Grid item xs={12} md={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <DescriptionRoundedIcon color="primary" />
                            <Typography fontWeight={600}>
                                File Type
                            </Typography>
                        </Box>

                        <Typography color="text.secondary">
                            {document.file_type || "-"}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <StorageRoundedIcon color="primary" />
                            <Typography fontWeight={600}>
                                File Size
                            </Typography>
                        </Box>

                        <Typography color="text.secondary">
                            {(
                                (document.file_size || 0) /
                                1024
                            ).toFixed(2)} KB
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <CategoryRoundedIcon color="primary" />
                            <Typography fontWeight={600}>
                                AI Category
                            </Typography>
                        </Box>

                        <Typography color="text.secondary">
                            {document.ai_category || "-"}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <CalendarTodayRoundedIcon color="primary" />
                            <Typography fontWeight={600}>
                                Uploaded
                            </Typography>
                        </Box>

                        <Typography color="text.secondary">
                            {new Date(
                                document.uploaded_at
                            ).toLocaleString()}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography fontWeight={600}>
                            Word Count
                        </Typography>

                        <Typography color="text.secondary">
                            {metadata.wordCount ?? "-"}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography fontWeight={600}>
                            Language
                        </Typography>

                        <Typography color="text.secondary">
                            {metadata.language ?? "-"}
                        </Typography>
                    </Grid>

                </Grid>

            </CardContent>
        </Card>
    );
};

export default MetadataCard;