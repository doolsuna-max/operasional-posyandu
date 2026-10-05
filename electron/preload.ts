import {
    contextBridge,
    ipcRenderer,
} from "electron";

import { IPC_CHANNEL } from "./ipc/channels";

import type {
    ServiceName,
    ServiceRuntimeState,
} from "../src/types/service";

import type {
    LogEntry,
} from "../src/types/log";

console.log(
    "[Preload] Posyandu preload started.",
);

interface ServiceStatusResponse {
    backend: ServiceRuntimeState;
    frontend: ServiceRuntimeState;
}

interface DesktopApi {
    service: {
        start(
            service: ServiceName,
        ): Promise<boolean>;

        stop(
            service: ServiceName,
        ): Promise<boolean>;

        restart(
            service: ServiceName,
        ): Promise<boolean>;

        startAll(): Promise<boolean>;

        stopAll(): Promise<boolean>;

        restartAll(): Promise<boolean>;

        status(): Promise<ServiceStatusResponse>;
    };

    log: {
        get(): Promise<LogEntry[]>;

        clear(): Promise<boolean>;
    };
}

const api: DesktopApi = {
    service: {
        start: (service) =>
            ipcRenderer.invoke(
                IPC_CHANNEL.SERVICE_START,
                service,
            ),

        stop: (service) =>
            ipcRenderer.invoke(
                IPC_CHANNEL.SERVICE_STOP,
                service,
            ),

        restart: (service) =>
            ipcRenderer.invoke(
                IPC_CHANNEL.SERVICE_RESTART,
                service,
            ),

        startAll: () =>
            ipcRenderer.invoke(
                IPC_CHANNEL.SERVICE_START_ALL,
            ),

        stopAll: () =>
            ipcRenderer.invoke(
                IPC_CHANNEL.SERVICE_STOP_ALL,
            ),

        restartAll: () =>
            ipcRenderer.invoke(
                IPC_CHANNEL.SERVICE_RESTART_ALL,
            ),

        status: () =>
            ipcRenderer.invoke(
                IPC_CHANNEL.SERVICE_STATUS,
            ),
    },

    log: {
        get: () =>
            ipcRenderer.invoke(
                IPC_CHANNEL.LOG_GET,
            ),

        clear: () =>
            ipcRenderer.invoke(
                IPC_CHANNEL.LOG_CLEAR,
            ),
    },
};

contextBridge.exposeInMainWorld(
    "api",
    api,
);

console.log(
    "[Preload] window.api exposed successfully.",
);