import { defineConfig } from "vite";
import path from "node:path";

import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        react(),

        electron({
            main: {
                entry: "electron/index.ts",
            },

            preload: {
                input: path.join(
                    __dirname,
                    "electron/preload.ts",
                ),

                /*
                 * Electron preload akan dijalankan sebagai
                 * CommonJS agar kompatibel dengan Electron.
                 */
                vite: {
                    build: {
                        rollupOptions: {
                            output: {
                                format: "cjs",
                                entryFileNames:
                                    "preload.cjs",
                            },
                        },
                    },
                },
            },

            renderer:
                process.env.NODE_ENV === "test"
                    ? undefined
                    : {},
        }),
    ],

    server: {
        host: "127.0.0.1",
        port: 5180,
        strictPort: true,
    },

    preview: {
        host: "127.0.0.1",
        port: 5180,
        strictPort: true,
    },
});