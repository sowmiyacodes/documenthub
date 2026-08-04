import Chip from "@mui/material/Chip";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

const StatusBadge = ({ status }) => {
    switch (status) {
        case "completed":
            return (
                <Chip
                    icon={<CheckCircleRoundedIcon />}
                    label="Completed"
                    color="success"
                    variant="filled"
                    size="small"
                />
            );

        case "processing":
            return (
                <Chip
                    icon={<AutorenewRoundedIcon />}
                    label="Processing"
                    color="warning"
                    variant="filled"
                    size="small"
                />
            );

        case "failed":
            return (
                <Chip
                    icon={<ErrorRoundedIcon />}
                    label="Failed"
                    color="error"
                    variant="filled"
                    size="small"
                />
            );

        default:
            return (
                <Chip
                    label="Pending"
                    color="default"
                    variant="outlined"
                    size="small"
                />
            );
    }
};

export default StatusBadge;