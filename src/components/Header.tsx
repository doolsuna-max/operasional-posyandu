import {
    Chip,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import ComputerIcon from "@mui/icons-material/Computer";

export default function Header() {

    const now = new Date();

    const date = now.toLocaleDateString(
        "id-ID",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        },
    );

    return (

        <Paper
            elevation={0}
            sx={{

                px: 3,

                py: 1.5,

                borderRadius: 2,

                bgcolor: "#1F2937",

                border: "1px solid #374151",

            }}
        >

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >

                {/* Left */}

                <Stack spacing={0.2}>

                    <Typography
                        variant="h5"
                        fontWeight={700}
                        color="white"
                    >
                        PosyanduCare
                    </Typography>

                    <Typography
                        variant="body2"
                        color="#9CA3AF"
                    >
                        Desktop Operational Manager
                    </Typography>

                </Stack>

                {/* Right */}

                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                >

                    <Typography
                        variant="body2"
                        color="#D1D5DB"
                    >
                        {date}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="#6B7280"
                    >
                        Version 1.0.0
                    </Typography>

                    <Chip
                        size="small"
                        icon={<ComputerIcon />}
                        label="READY"
                        color="success"
                    />

                </Stack>

            </Stack>

        </Paper>

    );

}