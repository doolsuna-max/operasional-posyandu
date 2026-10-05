import path from "node:path";
import { app } from "electron";

/**
 * Root folder aplikasi Operasional Posyandu.
 *
 * Saat development:
 *   D:\Project\operasional_posyandu
 *
 * Saat aplikasi sudah dibuild:
 *   folder tempat executable/aplikasi berada
 */
export const APP_ROOT = app.isPackaged
    ? path.dirname(app.getPath("exe"))
    : path.resolve(process.cwd());

/**
 * Folder PosyanduCare yang berada
 * satu folder dengan aplikasi Operasional Posyandu.
 *
 * Contoh:
 *
 * Desktop/
 * └── Operasional Posyandu/
 *     ├── Operasional Posyandu.exe
 *     └── PosyanduCare-main/
 */
export const POSYANDU_ROOT =
    path.join(
        APP_ROOT,
        "PosyanduCare-main",
    );

export const BACKEND_ROOT =
    path.join(
        POSYANDU_ROOT,
        "backend",
    );

export const FRONTEND_ROOT =
    POSYANDU_ROOT;