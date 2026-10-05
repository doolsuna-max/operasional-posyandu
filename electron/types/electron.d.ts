import type {
    ServiceName,
    ServiceRuntimeState,
} from "./service";

import type {
    LogEntry,
} from "./log";

declare global {

    interface Window {

        api: {

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

                status(): Promise<{

                    backend:
                        ServiceRuntimeState;

                    frontend:
                        ServiceRuntimeState;

                }>;

            };

            log: {

                get(): Promise<LogEntry[]>;

                clear(): Promise<boolean>;

            };

        };

    }

}

export {};