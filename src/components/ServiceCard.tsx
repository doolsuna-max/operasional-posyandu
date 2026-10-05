import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Stack,
    Typography,
} from "@mui/material";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StopIcon from "@mui/icons-material/Stop";

import type { ServiceState } from "../types/service";

interface Props {

    service: ServiceState;

    onStart(): void;

    onStop(): void;

    onRestart(): void;

}

export default function ServiceCard({

    service,

    onStart,

    onStop,

    onRestart,

}: Props) {

    const running =
        service.status === "running";

    const chipColor =
        running
            ? "success"
            : service.status === "starting" ||
              service.status === "stopping"
            ? "warning"
            : "error";

    return (

        <Card
            elevation={0}
            sx={{

                height: "100%",

                display: "flex",

                flexDirection: "column",

                bgcolor: "#1F2937",

                color: "#F9FAFB",

                border: "1px solid #374151",

                borderRadius: 2,

                transition: "0.2s",

                "&:hover": {

                    borderColor: "#4B5563",

                },

            }}
        >

            <CardContent
                sx={{

                    flex: 1,

                    display: "flex",

                    flexDirection: "column",

                    p: 2,

                    "&:last-child": {

                        pb: 2,

                    },

                }}
            >

                {/* Header */}

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >

                    <Typography
                        variant="h6"
                        fontWeight={700}
                    >
                        {service.name.toUpperCase()}
                    </Typography>

                    <Chip
                        size="small"
                        color={chipColor}
                        label={service.status.toUpperCase()}
                    />

                </Stack>

                <Divider
                    sx={{
                        my: 2,
                        borderColor: "#374151",
                    }}
                />

                {/* Information */}

                <Stack
                    spacing={1}
                >

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                    >

                        <Typography
                            color="#9CA3AF"
                            variant="body2"
                        >
                            Status
                        </Typography>

                        <Typography
                            fontWeight={600}
                        >
                            {service.status.toUpperCase()}
                        </Typography>

                    </Stack>

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                    >

                        <Typography
                            color="#9CA3AF"
                            variant="body2"
                        >
                            Process ID
                        </Typography>

                        <Typography
                            fontWeight={600}
                        >
                            {service.pid ?? "-"}
                        </Typography>

                    </Stack>

                </Stack>

                <Box
                    sx={{
                        flex: 1,
                    }}
                />

                <Divider
                    sx={{
                        my: 2,
                        borderColor: "#374151",
                    }}
                />

                {/* Buttons */}

                <Stack
                    direction="row"
                    spacing={1}
                >

                    <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<PlayArrowIcon />}
                        disabled={running}
                        onClick={onStart}
                    >
                        Start
                    </Button>

                    <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<StopIcon />}
                        disabled={!running}
                        onClick={onStop}
                    >
                        Stop
                    </Button>

                    <Button
                        fullWidth
                        variant="contained"
                        color="warning"
                        size="small"
                        startIcon={<RestartAltIcon />}
                        onClick={onRestart}
                    >
                        Restart
                    </Button>

                </Stack>

            </CardContent>

        </Card>

    );

}