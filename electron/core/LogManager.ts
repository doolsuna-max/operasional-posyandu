import { EventEmitter } from "node:events";

import type {
    LogEntry,
    ProcessLogEvent,
} from "../../src/types/log";

export const LOG_EVENT = {

    APPEND: "append",

    CLEAR: "clear",

} as const;

export class LogManager extends EventEmitter {

    private readonly maxEntries: number;

    private readonly logs: LogEntry[] = [];

    private sequence = 0;

    constructor(maxEntries = 1000) {

        super();

        this.maxEntries = maxEntries;

    }

    public append(event: ProcessLogEvent): LogEntry {

        const entry: LogEntry = {

            id: ++this.sequence,

            timestamp: event.timestamp,

            service: event.service,

            message: event.message,

            error: event.error,

        };

        if (this.logs.length >= this.maxEntries) {

            this.logs.shift();

        }

        this.logs.push(entry);

        this.emit(LOG_EVENT.APPEND, entry);

        return entry;

    }

    public clear(): void {

        this.logs.length = 0;

        this.emit(LOG_EVENT.CLEAR);

    }

    public getLogs(): readonly LogEntry[] {

        return [...this.logs];

    }

    public getLast(): LogEntry | undefined {

        return this.logs.at(-1);

    }

    public getById(id: number): LogEntry | undefined {

        return this.logs.find(
            (log) => log.id === id,
        );

    }

    public remove(id: number): boolean {

        const index = this.logs.findIndex(
            (log) => log.id === id,
        );

        if (index === -1) {
            return false;
        }

        this.logs.splice(index, 1);

        return true;

    }

    public size(): number {

        return this.logs.length;

    }

    public isEmpty(): boolean {

        return this.logs.length === 0;

    }

    public dispose(): void {

        this.clear();

        this.removeAllListeners();

    }

}