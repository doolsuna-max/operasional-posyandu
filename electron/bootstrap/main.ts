import {
    app,
    BrowserWindow,
} from "electron";

import {
    createMainWindow,
} from "./window";

import {
    ProcessManager,
} from "../core/ProcessManager";

import {
    registerIpc,
} from "../ipc";

let processManager:
    ProcessManager | null = null;

let shuttingDown = false;

export async function bootstrap(): Promise<void> {

    //
    // Electron Ready
    //

    await app.whenReady();

    console.log(
        "[Electron] Application ready.",
    );

    //
    // Process Manager
    //

    processManager =
        new ProcessManager();

    console.log(
        "[Electron] Posyandu Process Manager initialized.",
    );

    //
    // IPC
    //

    registerIpc(
        processManager,
    );

    console.log(
        "[Electron] IPC registered.",
    );

    //
    // Main Window
    //

    await createMainWindow();

    console.log(
        "[Electron] Main window created.",
    );

    //
    // Activate
    //

    app.on(
        "activate",
        async () => {

            if (
                BrowserWindow
                    .getAllWindows()
                    .length === 0
            ) {

                await createMainWindow();

            }

        },
    );

    //
    // Before Quit
    //

    app.on(
        "before-quit",
        async (event) => {

            if (shuttingDown) {
                return;
            }

            event.preventDefault();

            shuttingDown = true;

            console.log(
                "[Electron] Application shutdown requested.",
            );

            try {

                if (processManager) {

                    await processManager.shutdown();

                }

                console.log(
                    "[Electron] Posyandu services stopped.",
                );

            } catch (error) {

                console.error(
                    "[Electron] Failed to shutdown Posyandu services:",
                    error,
                );

            } finally {

                processManager = null;

                console.log(
                    "[Electron] Exiting application.",
                );

                app.exit(0);

            }

        },
    );

    //
    // Window All Closed
    //

    app.on(
        "window-all-closed",
        () => {

            if (
                process.platform !== "darwin"
            ) {

                app.quit();

            }

        },
    );

}