import { useCallback, useEffect, useState } from "react";

import {
    Box,
    Grid,
} from "@mui/material";

import Header from "./components/Header";
import ServiceCard from "./components/ServiceCard";
import ControlBar from "./components/ControlBar";
import LogViewer from "./components/LogViewer";

import type { ServiceState } from "./types/service";
import type { LogEntry } from "./types/log";

type ServiceName =
    "backend" | "frontend";

export default function App() {

    // ======================================================
    // STATE
    // ======================================================

    const [backend, setBackend] =
        useState<ServiceState>({
            name: "backend",
            status: "stopped",
            pid: null,
        });

    const [frontend, setFrontend] =
        useState<ServiceState>({
            name: "frontend",
            status: "stopped",
            pid: null,
        });

    const [logs, setLogs] =
        useState<LogEntry[]>([]);

    // ======================================================
    // LOAD STATUS
    // ======================================================

    const loadStatus =
        useCallback(async (): Promise<void> => {

            try {

                const result =
                    await window.api.service.status();

                setBackend({

                    name: "backend",

                    status:
                        result.backend.status,

                    pid:
                        result.backend.pid,

                });

                setFrontend({

                    name: "frontend",

                    status:
                        result.frontend.status,

                    pid:
                        result.frontend.pid,

                });

            } catch (error) {

                console.error(
                    "Failed to load service status",
                    error,
                );

            }

        }, []);

    // ======================================================
    // LOAD LOG
    // ======================================================

    const loadLogs =
        useCallback(async (): Promise<void> => {

            try {

                const result =
                    await window.api.log.get();

                setLogs(result);

            } catch (error) {

                console.error(
                    "Failed to load logs",
                    error,
                );

            }

        }, []);

    // ======================================================
    // REFRESH
    // ======================================================

    const refresh =
        useCallback(async (): Promise<void> => {

            await Promise.all([

                loadStatus(),

                loadLogs(),

            ]);

        }, [

            loadStatus,

            loadLogs,

        ]);

    // ======================================================
    // SERVICE ACTION
    // ======================================================

    const serviceAction =
        useCallback(

            async (

                action:
                    "start"
                    | "stop"
                    | "restart",

                service:
                    ServiceName,

            ): Promise<void> => {

                try {

                    switch (action) {

                        case "start":

                            await window.api
                                .service
                                .start(
                                    service,
                                );

                            break;

                        case "stop":

                            await window.api
                                .service
                                .stop(
                                    service,
                                );

                            break;

                        case "restart":

                            await window.api
                                .service
                                .restart(
                                    service,
                                );

                            break;

                    }

                    await refresh();

                } catch (error) {

                    console.error(

                        `${action} ${service} failed`,

                        error,

                    );

                }

            },

            [refresh],

        );

    // ======================================================
    // GLOBAL ACTION
    // ======================================================

    const startAll =
        async (): Promise<void> => {

            await window.api
                .service
                .startAll();

            await refresh();

        };

    const stopAll =
        async (): Promise<void> => {

            await window.api
                .service
                .stopAll();

            await refresh();

        };

    const restartAll =
        async (): Promise<void> => {

            await window.api
                .service
                .restartAll();

            await refresh();

        };

    // ======================================================
    // LOG
    // ======================================================

    const clearLog =
        async (): Promise<void> => {

            await window.api
                .log
                .clear();

            setLogs([]);

        };

    // ======================================================
    // INITIALIZE
    // ======================================================

    useEffect(() => {

        void refresh();

        const timer =
            window.setInterval(

                () => {

                    void refresh();

                },

                1000,

            );

        return () => {

            window.clearInterval(
                timer,
            );

        };

    }, [

        refresh,

    ]);

    // ======================================================
    // RENDER
    // ======================================================
    return (

    <Box
        sx={{

            width: "100%",

            height: "100dvh",

            minWidth: 720,

            bgcolor: "#111827",

            display: "flex",

            flexDirection: "column",

            overflow: "hidden",

            boxSizing: "border-box",

            transition: "all .2s ease",

            p: {

                xs: 1,

                md: 2,

                lg: 3,

            },

            gap: 2,

        }}
    >

        {/* ====================================================== */}
        {/* HEADER */}
        {/* ====================================================== */}

        <Box
            sx={{

                flexShrink: 0,

                width: "100%",

            }}
        >

            <Header />

        </Box>

        {/* ====================================================== */}
        {/* SERVICE */}
        {/* ====================================================== */}

        <Grid
            container
            spacing={2}
            alignItems="stretch"
            sx={{

                flexShrink: 0,

            }}
        >

            <Grid
                size={{
                    xs: 12,
                    lg: 6,
                }}
                sx={{
                    display: "flex",
                    minWidth: 0,
                }}
            >

                <ServiceCard

                    service={backend}

                    onStart={() =>
                        serviceAction(
                            "start",
                            "backend",
                        )
                    }

                    onStop={() =>
                        serviceAction(
                            "stop",
                            "backend",
                        )
                    }

                    onRestart={() =>
                        serviceAction(
                            "restart",
                            "backend",
                        )
                    }

                />

            </Grid>

            <Grid
                size={{
                    xs: 12,
                    lg: 6,
                }}
                sx={{
                    display: "flex",
                    minWidth: 0,
                }}
            >

                <ServiceCard

                    service={frontend}

                    onStart={() =>
                        serviceAction(
                            "start",
                            "frontend",
                        )
                    }

                    onStop={() =>
                        serviceAction(
                            "stop",
                            "frontend",
                        )
                    }

                    onRestart={() =>
                        serviceAction(
                            "restart",
                            "frontend",
                        )
                    }

                />

            </Grid>

        </Grid>

        {/* ====================================================== */}
        {/* CONTROL */}
        {/* ====================================================== */}

        <Box
            sx={{

                flexShrink: 0,

                width: "100%",

            }}
        >

            <ControlBar

                onStartAll={startAll}

                onStopAll={stopAll}

                onRestartAll={restartAll}

            />

        </Box>

        {/* ====================================================== */}
        {/* LOG */}
        {/* ====================================================== */}

        <Box
            sx={{

                flex: 1,

                minHeight: 0,

                minWidth: 0,

                display: "flex",

                overflow: "hidden",

                borderRadius: 2,

            }}
        >

            <LogViewer

                logs={logs}

                onClear={clearLog}

            />

        </Box>

    </Box>

);

}