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

    private readonly options:
        ManagedProcessOptions;

    private process:
        ChildProcess | null = null;

    private status:
        ProcessStatus = "stopped";

    private stopping = false;

    private starting = false;

    private operationId = 0;


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

        return (
            this.process !== null &&
            this.status === "running"
        );

    }


    public getPid(): number | null {

        return (
            this.process?.pid ??
            null
        );

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

        if (
            this.status === status
        ) {

            return;

        }

        this.status = status;

        this.emit(

            PROCESS_EVENT.STATUS,

            <ProcessStatusEvent>{

                service:
                    this.options.id,

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

                service:
                    this.options.id,

                timestamp:
                    new Date(),

                message,

                error,

            },

        );

    }


    //
    // Spawn
    //

    private createProcess(): ChildProcess {

        const options:
            SpawnOptions = {

            cwd:
                this.options.cwd,

            env: {

                ...process.env,

                ...this.options.env,

            },

            shell:
                this.options.shell ??
                false,

            windowsHide:
                true,

        };


        const child =
            spawn(

                this.options.command,

                this.options.args ??
                    [],

                options,

            );


        child.stdout?.setEncoding(
            "utf8",
        );

        child.stderr?.setEncoding(
            "utf8",
        );


        this.process =
            child;


        return child;

    }


    //
    // Event Binding
    //

    private bindProcess(
        child: ChildProcess,
        operationId: number,
    ): void {

        child.stdout?.on(

            "data",

            (chunk: Buffer | string) => {

                const message =
                    chunk
                        .toString()
                        .trim();

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
                    chunk
                        .toString()
                        .trim();

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

                /*
                 * Abaikan event dari proses
                 * lama apabila sudah ada
                 * operasi baru.
                 */

                if (
                    operationId !==
                    this.operationId
                ) {

                    return;

                }


                this.log(

                    `Process started (PID ${child.pid})`,

                );


                this.starting =
                    false;


                /*
                 * Jika proses sedang dihentikan
                 * ketika event spawn datang,
                 * jangan ubah status kembali
                 * menjadi running.
                 */

                if (
                    this.stopping
                ) {

                    return;

                }


                this.setStatus(
                    "running",
                );

            },

        );


        child.once(

            "error",

            (error: Error) => {

                /*
                 * Error spawn harus tetap
                 * dicatat walaupun operasi
                 * sudah berubah.
                 */

                this.log(

                    error.message,

                    true,

                );


                if (
                    this.process === child
                ) {

                    this.process =
                        null;

                }


                this.starting =
                    false;

                this.stopping =
                    false;


                /*
                 * Jika proses memang gagal
                 * dijalankan, status error.
                 */

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


                /*
                 * Exit code 0 tidak selalu
                 * berarti service seharusnya
                 * dianggap berhasil berjalan.
                 *
                 * Jika proses mati ketika
                 * status masih starting/running,
                 * tetap kita catat sebagai
                 * proses berhenti.
                 */

                this.log(

                    message,

                    code !== 0,

                );


                if (
                    this.process === child
                ) {

                    this.process =
                        null;

                }


                this.starting =
                    false;

                this.stopping =
                    false;


                /*
                 * Jangan mengubah status proses
                 * baru akibat event close dari
                 * proses lama.
                 */

                if (
                    operationId !==
                    this.operationId
                ) {

                    return;

                }


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

        /*
         * Jangan membuat proses kedua
         * jika proses sedang start/running.
         */

        if (
            this.process &&
            (
                this.starting ||
                this.status === "starting" ||
                this.status === "running"
            )
        ) {

            this.log(
                "Process already running or starting.",
            );

            return;

        }


        /*
         * Jika sedang stopping,
         * tunggu sampai proses lama
         * benar-benar selesai.
         */

        if (
            this.stopping
        ) {

            this.log(
                "Process is stopping. Waiting before start...",
            );

            await this.waitUntilStopped();

        }


        /*
         * Pastikan reference proses
         * sudah benar-benar bersih.
         */

        if (
            this.process
        ) {

            this.log(
                "Cleaning previous process reference.",
            );

            await this.kill();

        }


        this.operationId++;

        const currentOperation =
            this.operationId;


        this.stopping =
            false;

        this.starting =
            true;


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
                currentOperation,
            );


        } catch (error) {

            this.process =
                null;

            this.starting =
                false;

            this.stopping =
                false;


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
    // Wait Until Stopped
    //

    private async waitUntilStopped(
        timeout = 6000,
    ): Promise<void> {

        if (
            !this.process
        ) {

            return;

        }


        const startedAt =
            Date.now();


        while (
            this.process &&
            Date.now() - startedAt <
                timeout
        ) {

            await new Promise<void>(
                (resolve) => {

                    setTimeout(
                        resolve,
                        100,
                    );

                },
            );

        }


        /*
         * Jika masih ada proses setelah
         * timeout, lakukan force kill.
         */

        if (
            this.process
        ) {

            this.log(
                "Process did not stop in time. Force killing...",
                true,
            );

            await this.kill();

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

                        windowsHide:
                            true,

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

                        /*
                         * Process sudah mati.
                         */

                    }

                }

            }

        } catch {

            /*
             * taskkill dapat mengembalikan
             * error jika proses sudah mati.
             * Tidak perlu dianggap sebagai
             * error aplikasi.
             */

        }

    }


    //
    // STOP
    //

    public async stop(): Promise<void> {

        if (
            !this.process
        ) {

            this.starting =
                false;

            this.stopping =
                false;


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


        if (
            this.stopping
        ) {

            this.log(
                "Stop already in progress.",
            );

            return;

        }


        this.operationId++;

        this.starting =
            false;

        this.stopping =
            true;


        this.setStatus(
            "stopping",
        );


        this.log(
            "Stopping process...",
        );


        const child =
            this.process;


        /*
         * Hentikan seluruh process tree.
         */

        await this.terminateTree();


        /*
         * Tunggu event close dari child.
         */

        const startedAt =
            Date.now();


        while (
            this.process === child &&
            Date.now() - startedAt <
                5000
        ) {

            await new Promise<void>(
                (resolve) => {

                    setTimeout(
                        resolve,
                        100,
                    );

                },
            );

        }


        /*
         * Jika masih tercatat hidup,
         * bersihkan reference.
         */

        if (
            this.process === child
        ) {

            this.log(
                "Process did not report close. Cleaning process reference.",
                true,
            );

            this.process =
                null;

        }


        this.starting =
            false;

        this.stopping =
            false;


        this.setStatus(
            "stopped",
        );

    }


    //
    // RESTART
    //

    public async restart(): Promise<void> {

        this.log(
            "Restarting process...",
        );


        await this.stop();


        /*
         * Beri waktu singkat agar
         * process tree Windows benar-benar
         * dilepas sebelum spawn ulang.
         */

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

        if (
            !this.process
        ) {

            this.starting =
                false;

            this.stopping =
                false;

            this.setStatus(
                "stopped",
            );

            return;

        }


        this.operationId++;


        this.log(
            "Force killing process...",
        );


        this.starting =
            false;

        this.stopping =
            true;


        await this.terminateTree();


        /*
         * Tunggu sebentar agar event
         * close dapat membersihkan child.
         */

        const child =
            this.process;


        const startedAt =
            Date.now();


        while (
            this.process === child &&
            Date.now() - startedAt <
                2000
        ) {

            await new Promise<void>(
                (resolve) => {

                    setTimeout(
                        resolve,
                        50,
                    );

                },
            );

        }


        if (
            this.process === child
        ) {

            this.process =
                null;

        }


        this.starting =
            false;

        this.stopping =
            false;


        this.setStatus(
            "stopped",
        );

    }


    //
    // Dispose
    //

    public async dispose(): Promise<void> {

        try {

            await this.stop();

        } catch {

            /*
             * Jika stop gagal,
             * tetap coba force kill.
             */

            try {

                await this.kill();

            } catch {

                // Ignore.

            }

        }


        this.removeAllListeners();

    }

}