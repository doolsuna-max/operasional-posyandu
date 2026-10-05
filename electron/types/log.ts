export interface LogEntry {
    id: number;
    service: string;
    timestamp: Date;
    message: string;
    error: boolean;
}

export interface ProcessLogEvent {
    service: string;
    timestamp: Date;
    message: string;
    error: boolean;
}