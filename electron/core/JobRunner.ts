import { spawn } from "node:child_process";
import path from "node:path";
import { existsSync } from "node:fs";

export class JobRunner {

    // =====================================================
    // PATH
    // =====================================================

    private static getBackendPath(): string {

        const workspaceRoot = path.resolve(
            process.cwd(),
            "..",
        );

        const projectRoot = path.join(
            workspaceRoot,
            "AI-Predict-Enterprise",
        );

        const backendPath = path.join(
            projectRoot,
            "backend",
        );

        if (!existsSync(backendPath)) {

            throw new Error(
                `Backend not found : ${backendPath}`,
            );

        }

        return backendPath;

    }

    private static getPythonPath(): string {

        const python = path.join(

            this.getBackendPath(),

            "venv",

            "Scripts",

            "python.exe",

        );

        if (!existsSync(python)) {

            throw new Error(

                `Python not found : ${python}`,

            );

        }

        return python;

    }

    // =====================================================
    // GENERIC RUNNER
    // =====================================================

    private static run(

        module: string,

        onData?: (text: string) => void,

    ): Promise<number> {

        return new Promise((resolve, reject) => {

            const backendPath =
                this.getBackendPath();

            const python =
                this.getPythonPath();

            const child = spawn(

                python,

                [

                    "-m",

                    module,

                ],

                {

                    cwd: backendPath,

                    shell: false,

                },

            );

            const emit = (
                buffer: Buffer,
            ) => {

                const lines = buffer

                    .toString()

                    .split(/\r?\n/);

                for (const line of lines) {

                    const text = line.trim();

                    if (!text) {

                        continue;

                    }

                    onData?.(text);

                }

            };

            child.stdout.on(

                "data",

                emit,

            );

            child.stderr.on(

                "data",

                emit,

            );

            child.on(

                "close",

                (code) => {

                    resolve(code ?? 0);

                },

            );

            child.on(

                "error",

                reject,

            );

        });

    }

    // =====================================================
    // MARKET
    // =====================================================

    static runMarketJob(
        onData?: (text: string) => void,
    ): Promise<number> {

        return this.run(

            "app.scheduler.market_job",

            onData,

        );

    }

    // =====================================================
    // INDICATOR
    // =====================================================

    static runIndicatorJob(
        onData?: (text: string) => void,
    ): Promise<number> {

        return this.run(

            "app.scheduler.indicator_job",

            onData,

        );

    }

    // =====================================================
    // FEATURE
    // =====================================================

    static runFeatureJob(
        onData?: (text: string) => void,
    ): Promise<number> {

        return this.run(

            "app.scheduler.feature_job",

            onData,

        );

    }

    // =====================================================
    // PREDICTION
    // =====================================================

    static runPredictionJob(
        onData?: (text: string) => void,
    ): Promise<number> {

        return this.run(

            "app.scheduler.prediction_job",

            onData,

        );

    }

    // =====================================================
    // TRAINING
    // =====================================================

    static runTrainingJob(
        onData?: (text: string) => void,
    ): Promise<number> {

        return this.run(

            "app.scheduler.training_job",

            onData,

        );

    }

}