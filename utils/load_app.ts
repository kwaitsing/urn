import { logger } from "toolbx";
import { readdir } from "node:fs/promises";
import Elysia from "elysia";

export const load_app = async (app: Elysia, debug: boolean = false) => {
    try {
        // Load extensions first
        const externalModules = await readdir(`${import.meta.dir}/../../../src/app/external`)
        for (const module of externalModules) {
            try {
                const loader = await import(`${import.meta.dir}/../../../src/app/external/${module}/loader.ts`)
                if (typeof loader.loader === 'function') {
                    if (debug) logger(`[APP Loader] > Loading (external) ${module}`, 4)
                    await loader.loader(app)
                } else {
                    throw new Error(`(external) ${module} is corrupted with type of ${typeof loader}`);
                }
            } catch (error) {
                logger(`[APP Loader @app/${module}] > ${error}`, 2)
            }
        }
        // Load internal then
        const internalModules = await readdir(`${import.meta.dir}/../../../src/app/internal`)
        for (const module of internalModules) {
            try {
                const loader = await import(`${import.meta.dir}/../../../src/app/internal/${module}/loader.ts`)
                if (typeof loader.loader === 'function') {
                    if (debug) logger(`[APP Loader] > Loading (internal) ${module}`, 4)
                    await loader.loader(app)
                } else {
                    throw new Error(`(internal) ${module} is corrupted with type of ${typeof loader}`)
                }
            } catch (error) {
                logger(`[APP Loader @app/${module}] > ${error}`, 2)
            }
        }
    } catch (error) {
        logger(`[APP Loader] > ${error}`, 2)
    }
}