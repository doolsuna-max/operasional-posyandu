import { useEffect, useRef } from "react";

import {
    Box,
    Button,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

import type { LogEntry } from "../types/log";

interface Props {

    logs: LogEntry[];

    onClear(): void;

}

export default function LogViewer({

    logs,

    onClear,

}: Props) {

    const bottomRef =
        useRef<HTMLDivElement>(null);

    useEffect(() => {

        bottomRef.current?.scrollIntoView({

            behavior: "smooth",

            block: "end",

        });

    }, [logs]);

    return (

        <Paper
            elevation={0}
            sx={{

                flex: 1,

                display: "flex",

                flexDirection: "column",

                overflow: "hidden",

                bgcolor: "#1F2937",

                border: "1px solid #374151",

                borderRadius: 2,

            }}
        >

            {/* Header */}

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{

                    px: 2,

                    py: 1,

                    borderBottom: "1px solid #374151",

                    flexShrink: 0,

                }}
            >

                <Stack>

                    <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color="white"
                    >
                        Process Log
                    </Typography>

                    <Typography
                        variant="caption"
                        color="#9CA3AF"
                    >
                        {logs.length} log entries
                    </Typography>

                </Stack>

                <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteSweepIcon />}
                    onClick={onClear}
                >
                    Clear
                </Button>

            </Stack>

            {/* Log Area */}

            <Box
                sx={{

                    flex: 1,

                    minHeight: 0,

                    overflow: "auto",

                    bgcolor: "#111827",

                    px: 2,

                    py: 1.5,

                    fontFamily:
                        "Consolas, 'JetBrains Mono', monospace",

                    fontSize: 13,

                }}
            >

                {

                    logs.length === 0 && (

                        <Box
                            sx={{

                                height: "100%",

                                display: "flex",

                                justifyContent: "center",

                                alignItems: "center",

                            }}
                        >

                            <Typography
                                color="#6B7280"
                            >
                                Waiting for process log...
                            </Typography>

                        </Box>

                    )

                }

                {

                    logs.map((log) => (

                        <Typography
                            key={log.id}
                            component="pre"
                            sx={{

                                m: 0,

                                mb: .5,

                                fontFamily: "inherit",

                                fontSize: "inherit",

                                lineHeight: 1.5,

                                whiteSpace: "pre-wrap",

                                wordBreak: "break-word",

                                color:

                                    log.error

                                        ? "#EF4444"

                                        : "#E5E7EB",

                            }}
                        >

                            [

                            {

                                log.timestamp instanceof Date

                                    ? log.timestamp.toLocaleTimeString()

                                    : new Date(
                                        log.timestamp,
                                    ).toLocaleTimeString()

                            }

                            ]

                            {"  "}

                            {

                                log.service.toUpperCase()

                            }

                            {" | "}

                            {

                                log.message

                            }

                        </Typography>

                    ))

                }

                <div ref={bottomRef} />

            </Box>

        </Paper>

    );

}