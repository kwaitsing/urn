import { logger } from "toolbx";
import { readdir } from "node:fs/promises";
import Elysia from "elysia";

export const load_app = async (app: Elysia, debug: boolean = false) => {
    // Load extensions first
    const externalModules = await readdir(`${import.meta.dir}/../../../app/external`)
    for (const module of externalModules) {
        const loader = await import(`${import.meta.dir}/../../../app/external/${module}/loader.ts`)
        if (typeof loader.loader === 'function') {
            if (debug) logger(`[APP Loader] > Loading (external) ${module}`, 4)
            await loader.loader(app)
        } else {
            logger(`[APP Loader] > (external) ${module} is corrupted with type of ${typeof loader}`, 2)
            process.exit(1)
        }
    }
    // Load internal then
    const internalModules = await readdir(`${import.meta.dir}/../../../app/internal`)
    for (const module of internalModules) {
        const loader = await import(`${import.meta.dir}/../../../app/internal/${module}/loader.ts`)
        if (typeof loader.loader === 'function') {
            if (debug) logger(`[APP Loader] > Loading (internal) ${module}`, 4)
            await loader.loader(app)
        } else {
            logger(`[APP Loader] > (internal) ${module} is corrupted with type of ${typeof loader}`, 2)
            process.exit(1)
        }
    }
}