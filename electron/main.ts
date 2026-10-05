import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { ProcessManager } from "./core/ProcessManager";
import { registerIpc } from "./ipc";

const __dirname = path.dirname(
    fileURLToPath(import.meta.url),
);

process.env.APP_ROOT = path.join(
    __dirname,
    "..",
);

export const VITE_DEV_SERVER_URL =
    process.env.VITE_DEV_SERVER_URL;

export const MAIN_DIST = path.join(
    process.env.APP_ROOT,
    "dist-electron",
);

export const RENDERER_DIST = path.join(
    process.env.APP_ROOT,
    "dist",
);

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
    ? path.join(
          process.env.APP_ROOT,
          "public",
      )
    : RENDERER_DIST;

let mainWindow: BrowserWindow | null =
    null;

/**
 * =========================================================
 * PROCESS MANAGER
 * =========================================================
 */

const manager =
    new ProcessManager();

/**
 * =========================================================
 * CREATE WINDOW
 * =========================================================
 */

function createWindow(): void {

    mainWindow =
        new BrowserWindow({

            width: 1440,

            height: 900,

            minWidth: 1200,

            minHeight: 760,

            show: false,

            autoHideMenuBar: true,

            title: "Panel Posyandu",

            webPreferences: {

                preload: path.join(
                    __dirname,
                    "preload.mjs",
                ),

                contextIsolation: true,

                nodeIntegration: false,

            },

        });

    /**
     * Development
     */

    if (VITE_DEV_SERVER_URL) {

        void mainWindow.loadURL(
            VITE_DEV_SERVER_URL,
        );

    }

    /**
     * Production
     */

    else {

        void mainWindow.loadFile(

            path.join(
                RENDERER_DIST,
                "index.html",
            ),

        );

    }

    /**
     * Show window after renderer ready
     */

    mainWindow.once(

        "ready-to-show",

        () => {

            mainWindow?.show();

        },

    );

    /**
     * Clear reference
     */

    mainWindow.on(

        "closed",

        () => {

            mainWindow = null;

        },

    );

}

/**
 * =========================================================
 * APP READY
 * =========================================================
 */

app.whenReady().then(() => {

    /**
     * Register IPC
     */

    registerIpc(manager);

    /**
     * Create main window
     */

    createWindow();

    /**
     * macOS activate
     */

    app.on(

        "activate",

        () => {

            if (
                BrowserWindow
                    .getAllWindows()
                    .length === 0
            ) {

                createWindow();

            }

        },

    );

});

/**
 * =========================================================
 * BEFORE QUIT
 * =========================================================
 *
 * Ketika Panel Posyandu ditutup:
 *
 * 1. Backend dihentikan
 * 2. Frontend dihentikan
 * 3. ProcessManager dibersihkan
 * 4. Electron ditutup
 *
 * =========================================================
 */

app.on(

    "before-quit",

    async (event) => {

        event.preventDefault();

        try {

            await manager.shutdown();

        }

        catch (error) {

            console.error(
                "Panel Posyandu shutdown error:",
                error,
            );

        }

        finally {

            try {

                await manager.dispose();

            }

            catch (error) {

                console.error(
                    "ProcessManager dispose error:",
                    error,
                );

            }

            app.exit(0);

        }

    },

);

/**
 * =========================================================
 * ALL WINDOWS CLOSED
 * =========================================================
 */

app.on(

    "window-all-closed",

    () => {

        if (
            process.platform !==
            "darwin"
        ) {

            app.quit();

        }

    },

);