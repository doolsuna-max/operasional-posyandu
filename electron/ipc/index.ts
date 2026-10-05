import { ipcMain } from "electron";

import { IPC_CHANNEL } from "./channels";

import { ProcessManager } from "../core/ProcessManager";

import type { ServiceName } from "../types/service";

export function registerIpc(
    manager: ProcessManager,
): void {

    //
    // Remove existing handlers
    // (important for Electron + Vite HMR)
    //

    ipcMain.removeHandler(
        IPC_CHANNEL.SERVICE_START,
    );

    ipcMain.removeHandler(
        IPC_CHANNEL.SERVICE_STOP,
    );

    ipcMain.removeHandler(
        IPC_CHANNEL.SERVICE_RESTART,
    );

    ipcMain.removeHandler(
        IPC_CHANNEL.SERVICE_START_ALL,
    );

    ipcMain.removeHandler(
        IPC_CHANNEL.SERVICE_STOP_ALL,
    );

    ipcMain.removeHandler(
        IPC_CHANNEL.SERVICE_RESTART_ALL,
    );

    ipcMain.removeHandler(
        IPC_CHANNEL.SERVICE_STATUS,
    );

    ipcMain.removeHandler(
        IPC_CHANNEL.LOG_GET,
    );

    ipcMain.removeHandler(
        IPC_CHANNEL.LOG_CLEAR,
    );

    //
    // Start Service
    //

    ipcMain.handle(

        IPC_CHANNEL.SERVICE_START,

        async (
            _event,
            service: ServiceName,
        ) => {

            try {

                if (service === "backend") {

                    await manager.startBackend();

                } else {

                    await manager.startFrontend();

                }

                return true;

            } catch (error) {

                console.error(
                    "Failed to start service:",
                    error,
                );

                throw error;

            }

        },

    );

    //
    // Stop Service
    //

    ipcMain.handle(

        IPC_CHANNEL.SERVICE_STOP,

        async (
            _event,
            service: ServiceName,
        ) => {

            try {

                if (service === "backend") {

                    await manager.stopBackend();

                } else {

                    await manager.stopFrontend();

                }

                return true;

            } catch (error) {

                console.error(
                    "Failed to stop service:",
                    error,
                );

                throw error;

            }

        },

    );

    //
    // Restart Service
    //

    ipcMain.handle(

        IPC_CHANNEL.SERVICE_RESTART,

        async (
            _event,
            service: ServiceName,
        ) => {

            try {

                if (service === "backend") {

                    await manager.restartBackend();

                } else {

                    await manager.restartFrontend();

                }

                return true;

            } catch (error) {

                console.error(
                    "Failed to restart service:",
                    error,
                );

                throw error;

            }

        },

    );

    //
    // Start All
    //

    ipcMain.handle(

        IPC_CHANNEL.SERVICE_START_ALL,

        async () => {

            await manager.startAll();

            return true;

        },

    );

    //
    // Stop All
    //

    ipcMain.handle(

        IPC_CHANNEL.SERVICE_STOP_ALL,

        async () => {

            await manager.stopAll();

            return true;

        },

    );

    //
    // Restart All
    //

    ipcMain.handle(

        IPC_CHANNEL.SERVICE_RESTART_ALL,

        async () => {

            await manager.restartAll();

            return true;

        },

    );

    //
    // Status
    //

    ipcMain.handle(

        IPC_CHANNEL.SERVICE_STATUS,

        async () => {

            return {

                backend: {

                    running:
                        manager.isBackendRunning(),

                    status:
                        manager.getBackendStatus(),

                    pid:
                        manager.getBackendPid(),

                },

                frontend: {

                    running:
                        manager.isFrontendRunning(),

                    status:
                        manager.getFrontendStatus(),

                    pid:
                        manager.getFrontendPid(),

                },

            };

        },

    );

    //
    // Logs
    //

    ipcMain.handle(

        IPC_CHANNEL.LOG_GET,

        async () => {

            return manager.getLogs();

        },

    );

    ipcMain.handle(

        IPC_CHANNEL.LOG_CLEAR,

        async () => {

            manager.clearLogs();

            return true;

        },

    );

}