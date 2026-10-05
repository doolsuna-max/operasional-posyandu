import {
    Button,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import StopIcon from "@mui/icons-material/Stop";

interface ControlBarProps {

    onStartAll(): void;

    onStopAll(): void;

    onRestartAll(): void;

}

export default function ControlBar({

    onStartAll,

    onStopAll,

    onRestartAll,

}: ControlBarProps) {

    return (

        <Paper
            elevation={0}
            sx={{

                px: 2,

                py: 1.5,

                borderRadius: 2,

                bgcolor: "#1F2937",

                border: "1px solid #374151",

                flexShrink: 0,

            }}
        >

            <Stack
                direction={{
                    xs: "column",
                    lg: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: "stretch",
                    lg: "center",
                }}
                spacing={2}
            >

                <Stack
                    direction="row"
                    spacing={1.5}
                    flexWrap="wrap"
                >

                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<PlayArrowIcon />}
                        onClick={onStartAll}
                        sx={{

                            minWidth: 150,

                            height: 40,

                        }}
                    >
                        START ALL
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<StopIcon />}
                        onClick={onStopAll}
                        sx={{

                            minWidth: 150,

                            height: 40,

                        }}
                    >
                        STOP ALL
                    </Button>

                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={<RestartAltIcon />}
                        onClick={onRestartAll}
                        sx={{

                            minWidth: 150,

                            height: 40,

                        }}
                    >
                        RESTART ALL
                    </Button>

                </Stack>

                <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                        display: {
                            xs: "none",
                            lg: "block",
                        },
                        borderColor: "#374151",
                    }}
                />

                <Typography
                    variant="body2"
                    color="#9CA3AF"
                    sx={{
                        textAlign: {
                            xs: "left",
                            lg: "right",
                        },
                    }}
                >
                    Global Service Control
                </Typography>

            </Stack>

        </Paper>

    );

}