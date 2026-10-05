export const IPC_CHANNEL = {

    SERVICE_START: "service:start",

    SERVICE_STOP: "service:stop",

    SERVICE_RESTART: "service:restart",

    SERVICE_START_ALL: "service:start-all",

    SERVICE_STOP_ALL: "service:stop-all",

    SERVICE_RESTART_ALL: "service:restart-all",

    SERVICE_STATUS: "service:status",

    LOG_GET: "log:get",

    LOG_CLEAR: "log:clear",

} as const;