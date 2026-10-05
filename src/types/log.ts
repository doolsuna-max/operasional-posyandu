export interface ProcessLogEvent {

    service: string;

    timestamp: Date;

    message: string;

    error: boolean;

}

export interface LogEntry {

    id: number;

    service: string;

    timestamp: Date;

    message: string;

    error: boolean;

}

export type LogLevel =
    | "info"
    | "warning"
    | "error";