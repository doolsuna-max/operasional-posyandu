import {
    ChildProcess,
    SpawnOptions,
    execFile,
    spawn,
} from "node:child_process";

import { EventEmitter } from "node:events";

import { promisify } from "node:util";

const execFileAsync =
    promisify(execFile);

export type ProcessStatus =
    | "stopped"
    | "starting"
    | "running"
    | "stopping"
    | "error";

export interface ManagedProcessOptions {

    id: string;

    command: string;

    args?: string[];

    cwd: string;

    env?: NodeJS.ProcessEnv;

    shell?: boolean;

}

export interface ProcessLogEvent {

    service: string;

    timestamp: Date;

    message: string;

    error: boolean;

}

export interface ProcessStatusEvent {

    service: string;

    status: ProcessStatus;

}

export const PROCESS_EVENT = {

    LOG: "log",

    STATUS: "status",

} as const;

export class ManagedProcess extends EventEmitter {

    private readonly options: ManagedProcessOptions;

    private process: ChildProcess | null = null;

    private status: ProcessStatus = "stopped";

    private stopping = false;

    constructor(
        options: ManagedProcessOptions,
    ) {

        super();

        this.options = options;

    }

    //
    // Getter
    //

    public get id(): string {

        return this.options.id;

    }

    public getStatus(): ProcessStatus {

        return this.status;

    }

    public isRunning(): boolean {

        return this.process !== null;

    }

    public getPid(): number | null {

        return this.process?.pid ?? null;

    }

    public getProcess(): ChildProcess | null {

        return this.process;

    }

    //
    // Status
    //

    private setStatus(
        status: ProcessStatus,
    ): void {

        if (this.status === status) {

            return;

        }

        this.status = status;

        this.emit(

            PROCESS_EVENT.STATUS,

            <ProcessStatusEvent>{

                service: this.options.id,

                status,

            },

        );

    }

    //
    // Log
    //

    private log(
        message: string,
        error = false,
    ): void {

        this.emit(

            PROCESS_EVENT.LOG,

            <ProcessLogEvent>{

                service: this.options.id,

                timestamp: new Date(),

                message,

                error,

            },

        );

    }

    //
    // Spawn
    //

    private createProcess(): ChildProcess {

        const options: SpawnOptions = {

            cwd: this.options.cwd,

            env: {

                ...process.env,

                ...this.options.env,

            },

            shell:
                this.options.shell ?? false,

            windowsHide: true,

        };

        const child = spawn(

            this.options.command,

            this.options.args ?? [],

            options,

        );

        child.stdout?.setEncoding(
            "utf8",
        );

        child.stderr?.setEncoding(
            "utf8",
        );

        this.process = child;

        return child;

    }

    //
    // Event Binding
    //

    private bindProcess(
        child: ChildProcess,
    ): void {

        child.stdout?.on(

            "data",

            (chunk: Buffer | string) => {

                const message =
                    chunk.toString().trim();

                if (!message) {

                    return;

                }

                this.log(
                    message,
                );

            },

        );

        child.stderr?.on(

            "data",

            (chunk: Buffer | string) => {

                const message =
                    chunk.toString().trim();

                if (!message) {

                    return;

                }

                this.log(
                    message,
                    true,
                );

            },

        );

        child.once(

            "spawn",

            () => {

                this.log(

                    `Process started (PID ${child.pid})`,

                );

                this.setStatus(
                    "running",
                );

            },

        );

        child.once(

            "error",

            (error: Error) => {

                this.log(

                    error.message,

                    true,

                );

                this.process = null;

                this.stopping = false;

                this.setStatus(
                    "error",
                );

            },

        );

        child.once(

            "close",

            (
                code: number | null,
                signal: NodeJS.Signals | null,
            ) => {

                let message =
                    `Process exited (${code ?? "unknown"})`;

                if (signal) {

                    message +=
                        ` signal=${signal}`;

                }

                this.log(

                    message,

                    code !== 0,

                );

                this.process = null;

                this.stopping = false;

                this.setStatus(
                    "stopped",
                );

            },

        );

    }

    //
    // START
    //

    public async start(): Promise<void> {

        if (this.process) {

            this.log(
                "Process already running.",
            );

            return;

        }

        this.stopping = false;

        this.setStatus(
            "starting",
        );

        this.log(
            "Starting process...",
        );

        try {

            const child =
                this.createProcess();

            this.bindProcess(
                child,
            );

        } catch (error) {

            this.process = null;

            this.stopping = false;

            this.setStatus(
                "error",
            );

            this.log(

                error instanceof Error

                    ? error.message

                    : String(error),

                true,

            );

            throw error;

        }

    }

    //
    // Kill Process Tree
    //

    private async terminateTree(): Promise<void> {

        const pid =
            this.process?.pid;

        if (!pid) {

            return;

        }

        try {

            if (
                process.platform ===
                "win32"
            ) {

                await execFileAsync(

                    "taskkill",

                    [

                        "/PID",

                        String(pid),

                        "/T",

                        "/F",

                    ],

                    {

                        windowsHide: true,

                    },

                );

            } else {

                try {

                    process.kill(
                        -pid,
                        "SIGTERM",
                    );

                } catch {

                    try {

                        process.kill(
                            pid,
                            "SIGTERM",
                        );

                    } catch {

                        // Ignore process
                        // already terminated.

                    }

                }

            }

        } catch {

            // Process may already
            // have terminated.

        }

    }

    //
    // STOP
    //

    public async stop(): Promise<void> {

        if (!this.process) {

            this.stopping = false;

            if (
                this.status !==
                "stopped"
            ) {

                this.setStatus(
                    "stopped",
                );

            }

            return;

        }

        if (this.stopping) {

            return;

        }

        this.stopping = true;

        this.setStatus(
            "stopping",
        );

        this.log(
            "Stopping process...",
        );

        const child =
            this.process;

        await new Promise<void>(
            (resolve) => {

                let finished = false;

                const finish = () => {

                    if (finished) {

                        return;

                    }

                    finished = true;

                    resolve();

                };

                child.once(
                    "close",
                    finish,
                );

                void this
                    .terminateTree()
                    .catch(() => {
                        // Ignore.
                    });

                setTimeout(
                    finish,
                    5000,
                );

            },
        );

        /*
         * Jika proses masih tercatat hidup
         * setelah timeout, lakukan force
         * cleanup.
         */

        if (this.process === child) {

            this.process = null;

            this.stopping = false;

            this.setStatus(
                "stopped",
            );

        }

    }

    //
    // RESTART
    //

    public async restart(): Promise<void> {

        this.log(
            "Restarting process...",
        );

        await this.stop();

        await new Promise<void>(

            (resolve) => {

                setTimeout(

                    resolve,

                    500,

                );

            },

        );

        await this.start();

    }

    //
    // FORCE KILL
    //

    public async kill(): Promise<void> {

        if (!this.process) {

            return;

        }

        this.log(
            "Force killing process...",
        );

        await this.terminateTree();

        this.process = null;

        this.stopping = false;

        this.setStatus(
            "stopped",
        );

    }

    //
    // Dispose
    //

    public async dispose(): Promise<void> {

        await this.kill();

        this.removeAllListeners();

    }

}