import { existsSync } from "node:fs";

import {
    ManagedProcess,
    PROCESS_EVENT,
    type ManagedProcessOptions,
    type ProcessStatus,
} from "./ManagedProcess";

import { LogManager } from "./LogManager";

import {
    POSYANDU_ROOT,
    BACKEND_ROOT,
    FRONTEND_ROOT,
} from "../config/worlspcae";

import type {
    LogEntry,
    ProcessLogEvent,
} from "../../src/types/log";

export class ProcessManager {
    private readonly logManager: LogManager;
    private readonly backend: ManagedProcess;
    private readonly frontend: ManagedProcess;

    private readonly projectRoot: string;

    constructor() {
        this.logManager = new LogManager();

        this.projectRoot = POSYANDU_ROOT;

        if (!existsSync(this.projectRoot)) {
            throw new Error(
                `PosyanduCare-main not found: ${this.projectRoot}`,
            );
        }

        if (!existsSync(BACKEND_ROOT)) {
            throw new Error(
                `Posyandu backend not found: ${BACKEND_ROOT}`,
            );
        }

        if (!existsSync(FRONTEND_ROOT)) {
            throw new Error(
                `Posyandu frontend not found: ${FRONTEND_ROOT}`,
            );
        }

        const backendConfig: ManagedProcessOptions = {
            id: "backend",
            command: "node",
            args: ["server.js"],
            cwd: BACKEND_ROOT,
            shell: false,
        };

        const frontendConfig: ManagedProcessOptions = {
            id: "frontend",
            command: "cmd",
            args: ["/c", "npm", "run", "dev"],
            cwd: FRONTEND_ROOT,
            shell: true,
        };

        this.backend = new ManagedProcess(
            backendConfig,
        );

        this.frontend = new ManagedProcess(
            frontendConfig,
        );

        this.bindEvents(this.backend);
        this.bindEvents(this.frontend);

        this.log(
            "system",
            "Posyandu Process Manager initialized.",
        );
    }

    private bindEvents(
        process: ManagedProcess,
    ): void {
        process.on(
            PROCESS_EVENT.LOG,
            (event: ProcessLogEvent) => {
                this.logManager.append(event);
            },
        );

        process.on(
            PROCESS_EVENT.STATUS,
            (event) => {
                this.log(
                    "system",
                    `${event.service} -> ${event.status}`,
                );
            },
        );
    }

    private log(
        service: string,
        message: string,
        error = false,
    ): void {
        this.logManager.append({
            service,
            timestamp: new Date(),
            message,
            error,
        });
    }

    public getProjectRoot(): string {
        return this.projectRoot;
    }

    public async startBackend(): Promise<void> {
        if (this.backend.isRunning()) {
            this.log(
                "backend",
                "Backend already running.",
            );
            return;
        }

        this.log(
            "backend",
            "Starting Posyandu backend...",
        );

        await this.backend.start();
    }

    public async stopBackend(): Promise<void> {
        if (!this.backend.isRunning()) {
            this.log(
                "backend",
                "Backend already stopped.",
            );
            return;
        }

        this.log(
            "backend",
            "Stopping Posyandu backend...",
        );

        await this.backend.stop();
    }

    public async restartBackend(): Promise<void> {
        this.log(
            "backend",
            "Restarting Posyandu backend...",
        );

        await this.backend.restart();
    }

    public async startFrontend(): Promise<void> {
        if (this.frontend.isRunning()) {
            this.log(
                "frontend",
                "Frontend already running.",
            );
            return;
        }

        this.log(
            "frontend",
            "Starting Posyandu frontend...",
        );

        await this.frontend.start();
    }

    public async stopFrontend(): Promise<void> {
        if (!this.frontend.isRunning()) {
            this.log(
                "frontend",
                "Frontend already stopped.",
            );
            return;
        }

        this.log(
            "frontend",
            "Stopping Posyandu frontend...",
        );

        await this.frontend.stop();
    }

    public async restartFrontend(): Promise<void> {
        this.log(
            "frontend",
            "Restarting Posyandu frontend...",
        );

        await this.frontend.restart();
    }

    public async startAll(): Promise<void> {
        this.log(
            "system",
            "Starting all Posyandu services...",
        );

        const result = await Promise.allSettled([
            this.startBackend(),
            this.startFrontend(),
        ]);

        const failed = result.filter(
            (item) => item.status === "rejected",
        );

        if (failed.length > 0) {
            this.log(
                "system",
                `${failed.length} service failed to start.`,
                true,
            );
        } else {
            this.log(
                "system",
                "All Posyandu services started.",
            );
        }
    }

    public async stopAll(): Promise<void> {
        this.log(
            "system",
            "Stopping all Posyandu services...",
        );

        const result = await Promise.allSettled([
            this.stopFrontend(),
            this.stopBackend(),
        ]);

        const failed = result.filter(
            (item) => item.status === "rejected",
        );

        if (failed.length > 0) {
            this.log(
                "system",
                `${failed.length} service failed to stop.`,
                true,
            );
        } else {
            this.log(
                "system",
                "All Posyandu services stopped.",
            );
        }
    }

    public async restartAll(): Promise<void> {
        this.log(
            "system",
            "Restarting all Posyandu services...",
        );

        await this.stopAll();

        await new Promise<void>((resolve) => {
            setTimeout(resolve, 500);
        });

        await this.startAll();
    }

    public getBackendStatus(): ProcessStatus {
        return this.backend.getStatus();
    }

    public getFrontendStatus(): ProcessStatus {
        return this.frontend.getStatus();
    }

    public isBackendRunning(): boolean {
        return this.backend.isRunning();
    }

    public isFrontendRunning(): boolean {
        return this.frontend.isRunning();
    }

    public getBackendPid(): number | null {
        return this.backend.getPid();
    }

    public getFrontendPid(): number | null {
        return this.frontend.getPid();
    }

    public getServiceStatus() {
        return {
            backend: {
                running: this.backend.isRunning(),
                status: this.backend.getStatus(),
                pid: this.backend.getPid(),
            },
            frontend: {
                running: this.frontend.isRunning(),
                status: this.frontend.getStatus(),
                pid: this.frontend.getPid(),
            },
        };
    }

    public appendExternalLog(
        service: string,
        message: string,
        error = false,
    ): void {
        this.logManager.append({
            service,
            timestamp: new Date(),
            message,
            error,
        });
    }

    public getLogs(): readonly LogEntry[] {
        return this.logManager.getLogs();
    }

    public getLastLog(): LogEntry | undefined {
        return this.logManager.getLast();
    }

    public getLogCount(): number {
        return this.logManager.size();
    }

    public clearLogs(): void {
        this.log(
            "system",
            "Log cleared.",
        );

        this.logManager.clear();
    }

    public async shutdown(): Promise<void> {
        this.log(
            "system",
            "Shutdown initiated.",
        );

        await this.stopAll();
        await this.dispose();
    }

    public async dispose(): Promise<void> {
        await Promise.allSettled([
            this.backend.dispose(),
            this.frontend.dispose(),
        ]);

        this.removeAllLogs();
    }

    private removeAllLogs(): void {
        this.logManager.dispose();
    }
}