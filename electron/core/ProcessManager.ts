import fs from "node:fs";
import path from "node:path";

import {
    POSYANDU_ROOT,
} from "../config/worlspcae";

import {
    ManagedProcess,
} from "./ManagedProcess";

import {
    LogManager,
} from "./LogManager";

import type {
    ServiceStatus,
} from "../../src/types/service";


export class ProcessManager {

    private projectRoot: string;

    private backend: ManagedProcess | null = null;

    private frontend: ManagedProcess | null = null;

    private readonly logManager: LogManager;


    constructor(
        projectRoot: string = POSYANDU_ROOT,
    ) {

        this.logManager =
            new LogManager();

        this.projectRoot =
            path.resolve(projectRoot);

        this.validateProjectRoot();

        this.createProcesses();

        this.log(
            "system",
            `PosyanduCare root: ${this.projectRoot}`,
        );

    }


    /**
     * =====================================================
     * PROJECT ROOT
     * =====================================================
     */

    public getProjectRoot(): string {

        return this.projectRoot;

    }


    public async setProjectRoot(
        projectRoot: string,
    ): Promise<void> {

        const resolvedRoot =
            path.resolve(projectRoot);

        if (
            resolvedRoot ===
            this.projectRoot
        ) {

            return;

        }

        this.validateProjectRoot(
            resolvedRoot,
        );

        await this.stopAll();

        await this.disposeProcesses();

        this.projectRoot =
            resolvedRoot;

        this.createProcesses();

        this.log(
            "system",
            `PosyanduCare root changed to: ${this.projectRoot}`,
        );

    }


    /**
     * =====================================================
     * VALIDATION
     * =====================================================
     */

    private validateProjectRoot(
        root: string = this.projectRoot,
    ): void {

        const backendRoot =
            path.join(
                root,
                "backend",
            );

        const packageJson =
            path.join(
                root,
                "package.json",
            );

        const backendServer =
            path.join(
                backendRoot,
                "server.js",
            );

        if (
            !fs.existsSync(root)
        ) {

            throw new Error(
                `Folder PosyanduCare tidak ditemukan: ${root}`,
            );

        }

        if (
            !fs.existsSync(packageJson)
        ) {

            throw new Error(
                `package.json tidak ditemukan: ${packageJson}`,
            );

        }

        if (
            !fs.existsSync(backendRoot)
        ) {

            throw new Error(
                `Folder backend tidak ditemukan: ${backendRoot}`,
            );

        }

        if (
            !fs.existsSync(backendServer)
        ) {

            throw new Error(
                `server.js backend tidak ditemukan: ${backendServer}`,
            );

        }

    }


    /**
     * =====================================================
     * PROCESS CREATION
     * =====================================================
     */

    private createProcesses(): void {

        const backendRoot =
            path.join(
                this.projectRoot,
                "backend",
            );

        const frontendRoot =
            this.projectRoot;


        this.backend =
            new ManagedProcess({

                id: "backend",

                command: "node",

                args: [
                    "server.js",
                ],

                cwd: backendRoot,

                shell: false,

            });


        this.frontend =
            new ManagedProcess({

                id: "frontend",

                command: "cmd",

                args: [
                    "/c",
                    "npm",
                    "run",
                    "dev",
                ],

                cwd: frontendRoot,

                shell: false,

            });


        this.bindProcessLogs(
            this.backend,
        );

        this.bindProcessLogs(
            this.frontend,
        );

    }


    /**
     * =====================================================
     * LOG BINDING
     * =====================================================
     */

    private bindProcessLogs(
        process: ManagedProcess,
    ): void {

        process.on(
            "log",
            (event) => {

                this.log(
                    event.service,
                    event.message,
                    event.error,
                );

            },
        );

        process.on(
            "status",
            (event) => {

                this.log(
                    event.service,
                    `Status: ${event.status}`,
                );

            },
        );

    }


    /**
     * =====================================================
     * BACKEND
     * =====================================================
     */

    public async startBackend(): Promise<void> {

        this.ensureBackend();

        this.log(
            "backend",
            "Starting backend...",
        );

        await this.backend!.start();

    }


    public async stopBackend(): Promise<void> {

        if (!this.backend) {

            return;

        }

        this.log(
            "backend",
            "Stopping backend...",
        );

        await this.backend.stop();

    }


    public async restartBackend(): Promise<void> {

        this.ensureBackend();

        this.log(
            "backend",
            "Restarting backend...",
        );

        await this.backend!.restart();

    }


    public isBackendRunning(): boolean {

        return (
            this.backend?.isRunning() ??
            false
        );

    }


    public getBackendStatus(): ServiceStatus {

        return (
            this.backend?.getStatus() ??
            "stopped"
        ) as ServiceStatus;

    }


    public getBackendPid(): number | null {

        return (
            this.backend?.getPid() ??
            null
        );

    }


    /**
     * =====================================================
     * FRONTEND
     * =====================================================
     */

    public async startFrontend(): Promise<void> {

        this.ensureFrontend();

        this.log(
            "frontend",
            "Starting frontend...",
        );

        await this.frontend!.start();

    }


    public async stopFrontend(): Promise<void> {

        if (!this.frontend) {

            return;

        }

        this.log(
            "frontend",
            "Stopping frontend...",
        );

        await this.frontend.stop();

    }


    public async restartFrontend(): Promise<void> {

        this.ensureFrontend();

        this.log(
            "frontend",
            "Restarting frontend...",
        );

        await this.frontend!.restart();

    }


    public isFrontendRunning(): boolean {

        return (
            this.frontend?.isRunning() ??
            false
        );

    }


    public getFrontendStatus(): ServiceStatus {

        return (
            this.frontend?.getStatus() ??
            "stopped"
        ) as ServiceStatus;

    }


    public getFrontendPid(): number | null {

        return (
            this.frontend?.getPid() ??
            null
        );

    }


    /**
     * =====================================================
     * ALL SERVICES
     * =====================================================
     */

    public async startAll(): Promise<void> {

        this.log(
            "system",
            "Starting all Posyandu services...",
        );

        await this.startBackend();

        await this.startFrontend();

        this.log(
            "system",
            "All Posyandu services started.",
        );

    }


    public async stopAll(): Promise<void> {

        this.log(
            "system",
            "Stopping all Posyandu services...",
        );

        await Promise.all([
            this.stopBackend(),
            this.stopFrontend(),
        ]);

        this.log(
            "system",
            "All Posyandu services stopped.",
        );

    }


    public async restartAll(): Promise<void> {

        this.log(
            "system",
            "Restarting all Posyandu services...",
        );

        await this.stopAll();

        await new Promise<void>(
            (resolve) => {

                setTimeout(
                    resolve,
                    500,
                );

            },
        );

        await this.startAll();

    }


    /**
     * =====================================================
     * STATUS
     * =====================================================
     */

    public getStatus(): {
        backend: {
            running: boolean;
            status: ServiceStatus;
            pid: number | null;
        };

        frontend: {
            running: boolean;
            status: ServiceStatus;
            pid: number | null;
        };
    } {

        return {

            backend: {

                running:
                    this.isBackendRunning(),

                status:
                    this.getBackendStatus(),

                pid:
                    this.getBackendPid(),

            },

            frontend: {

                running:
                    this.isFrontendRunning(),

                status:
                    this.getFrontendStatus(),

                pid:
                    this.getFrontendPid(),

            },

        };

    }


    /**
     * =====================================================
     * LOG
     * =====================================================
     */

    private log(
        service: string,
        message: string,
        error = false,
    ): void {

        this.logManager.append({

            service,

            timestamp:
                new Date(),

            message,

            error,

        });

    }


    public getLogs() {

        return [
            ...this.logManager.getLogs(),
        ];

    }


    public clearLogs(): void {

        this.logManager.clear();

    }


    /**
     * =====================================================
     * HELPERS
     * =====================================================
     */

    private ensureBackend(): void {

        if (!this.backend) {

            this.createProcesses();

        }

    }


    private ensureFrontend(): void {

        if (!this.frontend) {

            this.createProcesses();

        }

    }


    private async disposeProcesses(): Promise<void> {

        if (this.backend) {

            await this.backend.dispose();

        }

        if (this.frontend) {

            await this.frontend.dispose();

        }

        this.backend = null;

        this.frontend = null;

    }


    /**
     * =====================================================
     * SHUTDOWN
     * =====================================================
     */

    public async shutdown(): Promise<void> {

        this.log(
            "system",
            "Shutting down Posyandu services...",
        );

        try {

            await this.stopAll();

        } finally {

            await this.disposeProcesses();

            this.logManager.dispose();

        }

    }

}