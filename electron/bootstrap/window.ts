import { BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

function resolvePreloadPath(): string {
    const preloadPath = path.resolve(
        __dirname,
        "preload.cjs",
    );

    console.log(
        "[Electron] Resolving preload:",
        preloadPath,
    );

    if (!existsSync(preloadPath)) {
        throw new Error(
            `Preload file not found: ${preloadPath}`,
        );
    }

    console.log(
        "[Electron] Preload found:",
        preloadPath,
    );

    return preloadPath;
}

export async function createMainWindow(): Promise<BrowserWindow> {
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }

        mainWindow.show();
        mainWindow.focus();

        return mainWindow;
    }

    const preloadPath = resolvePreloadPath();

    console.log(
        "[Electron] __dirname:",
        __dirname,
    );

    console.log(
        "[Electron] process.cwd():",
        process.cwd(),
    );

    console.log(
        "[Electron] Using preload:",
        preloadPath,
    );

    console.log(
        "[Electron] Preload exists:",
        existsSync(preloadPath),
    );

    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,

        minWidth: 1200,
        minHeight: 760,

        show: false,
        center: true,

        title: "Panel Posyandu",

        autoHideMenuBar: true,

        backgroundColor: "#0F172A",

        webPreferences: {
            preload: preloadPath,

            contextIsolation: true,
            nodeIntegration: false,

            sandbox: false,
            webSecurity: true,
        },
    });

    /*
    =====================================================
    PRELOAD ERROR
    =====================================================
    */

    mainWindow.webContents.on(
        "preload-error",
        (
            _event,
            failedPreloadPath,
            error,
        ) => {
            console.error(
                "====================================================",
            );

            console.error(
                "[Electron] PRELOAD ERROR",
            );

            console.error(
                "[Electron] Failed preload:",
                failedPreloadPath,
            );

            console.error(
                "[Electron] Error:",
                error,
            );

            console.error(
                "====================================================",
            );
        },
    );

    /*
    =====================================================
    RENDERER CONSOLE
    =====================================================
    */

    mainWindow.webContents.on(
        "console-message",
        (
            _event,
            level,
            message,
            line,
            sourceId,
        ) => {
            console.log(
                `[Renderer:${level}] ${message}`,
            );

            if (sourceId) {
                console.log(
                    `[Renderer] ${sourceId}:${line}`,
                );
            }
        },
    );

    /*
    =====================================================
    LOAD FAILURE
    =====================================================
    */

    mainWindow.webContents.on(
        "did-fail-load",
        (
            _event,
            errorCode,
            errorDescription,
            validatedURL,
            isMainFrame,
        ) => {
            console.error(
                "[Electron] Renderer failed to load.",
            );

            console.error(
                "[Electron] Error code:",
                errorCode,
            );

            console.error(
                "[Electron] Description:",
                errorDescription,
            );

            console.error(
                "[Electron] URL:",
                validatedURL,
            );

            console.error(
                "[Electron] Main frame:",
                isMainFrame,
            );
        },
    );

    /*
    =====================================================
    PAGE LOAD
    =====================================================
    */

    mainWindow.webContents.on(
        "did-start-loading",
        () => {
            console.log(
                "[Electron] Renderer started loading.",
            );
        },
    );

    mainWindow.webContents.on(
        "did-finish-load",
        async () => {
            console.log(
                "[Electron] Renderer finished loading.",
            );

            try {
                const result =
                    await mainWindow?.webContents.executeJavaScript(
                        `
                        (() => {
                            return {
                                hasWindowApi:
                                    typeof window.api !== "undefined",

                                hasServiceApi:
                                    typeof window.api?.service !== "undefined",

                                hasLogApi:
                                    typeof window.api?.log !== "undefined",

                                location:
                                    window.location.href
                            };
                        })();
                        `,
                        true,
                    );

                console.log(
                    "[Electron] Renderer API check:",
                    result,
                );
            } catch (error) {
                console.error(
                    "[Electron] Failed to inspect renderer:",
                    error,
                );
            }

            /*
            =================================================
            FORCE SHOW
            =================================================
            */

            if (mainWindow) {
                console.log(
                    "[Electron] Showing window after page load.",
                );

                mainWindow.show();
                mainWindow.focus();
            }
        },
    );

    /*
    =====================================================
    CREATE / LOAD
    =====================================================
    */

    if (process.env.VITE_DEV_SERVER_URL) {
        console.log(
            "[Electron] Loading Vite:",
            process.env.VITE_DEV_SERVER_URL,
        );

        await mainWindow.loadURL(
            process.env.VITE_DEV_SERVER_URL,
        );
    } else {
        const rendererPath = path.join(
            __dirname,
            "../dist/index.html",
        );

        console.log(
            "[Electron] Loading renderer:",
            rendererPath,
        );

        await mainWindow.loadFile(
            rendererPath,
        );
    }

    /*
    =====================================================
    READY TO SHOW
    =====================================================
    */

    mainWindow.once(
        "ready-to-show",
        () => {
            console.log(
                "[Electron] Window ready to show.",
            );

            if (mainWindow) {
                mainWindow.show();
                mainWindow.focus();
            }
        },
    );

    /*
    =====================================================
    CLOSED
    =====================================================
    */

    mainWindow.on(
        "closed",
        () => {
            console.log(
                "[Electron] Main window closed.",
            );

            mainWindow = null;
        },
    );

    /*
    =====================================================
    DEVTOOLS
    =====================================================
    */

    if (process.env.NODE_ENV === "development") {
        console.log(
            "[Electron] Development mode.",
        );
    }

    return mainWindow;
}

export function getMainWindow(): BrowserWindow | null {
    return mainWindow;
}