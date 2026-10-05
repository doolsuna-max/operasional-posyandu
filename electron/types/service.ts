export type ServiceName =
    | "backend"
    | "frontend";

export type ServiceStatus =
    | "stopped"
    | "starting"
    | "running"
    | "stopping"
    | "error";

export interface ServiceState {

    name: ServiceName;

    status: ServiceStatus;

    pid: number | null;

}

export interface ServiceRuntimeState {

    running: boolean;

    status: ServiceStatus;

    pid: number | null;

}