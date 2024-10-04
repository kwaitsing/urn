import { logger } from "toolbx";
import { readdir } from "node:fs/promises";
import Elysia from "elysia";
import { existsSync, lstatSync, stat } from "node:fs";

export const load_app = async (app: Elysia, debug: boolean = false) => {

    const ModulePaths = {
        external: `${import.meta.dir}/../../../src/app/external`,
        internal: `${import.meta.dir}/../../../src/app/internal`
    }

    try {
        // Load extensions first
        if (existsSync(ModulePaths.external)) {
            if (lstatSync(ModulePaths.external).isDirectory()) {
                const externalModules = await readdir(ModulePaths.external)
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
            } else {
                logger(`[APP Loader] > Skip loading external modules> not a dir`, 2)
            }
        } else {
            logger(`[APP Loader] > Skip loading external modules> DIR not found`, 2)
        }

        // Load internal then
        if (existsSync(ModulePaths.internal)) {
            if (lstatSync(ModulePaths.internal).isDirectory()) {
                const internalModules = await readdir(ModulePaths.internal)
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
            } else {
                logger(`[APP Loader] > Skip loading internal modules> not a dir`, 2)
            }
        } else {
            logger(`[APP Loader] > Skip loading internal modules> DIR not found`, 2)
        }
    } catch (error) {
        logger(`[APP Loader] > ${error}`, 2)
    }
}