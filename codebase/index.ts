import Elysia, { type AnyElysia, type ElysiaConfig, type ListenCallback } from "elysia";
import type { InitOptType, Module, RuntimeRoute } from "./utils/type";
import { connectCache, connectDatabase } from "databridge-pack";
import { Dbi, CDbi } from "./utils/interface";
import { load_route } from "./utils/load_route";
import { ObjectId } from "mongodb";
import type { RedisClientType } from "redis";
import { Logestic } from "logestic";
import type { Serve } from "bun";

export class URN {
    private newOpts: InitOptType
    private routeDescs: string[] // 'ModuleName|Path|Method'
    private instance: AnyElysia | undefined

    /**
     * 
     * Creating an URN instance (not an URN server instance)
     * 
     * @param newOpts 
     */
    constructor(newOpts?: InitOptType) {
        this.newOpts = newOpts ? newOpts : {}
        this.routeDescs = []
    }
    /**
     * 
     * Fetch parameters
     * 
     * @returns An object contains all parameters
     */
    args() {
        return require('minimist')(Bun.argv)
    }
    /**
     * Fetch Environment variables
     * @returns An object contains all environment variables
     */
    env() {
        return process.env
    }
    /**
     * 
     * Connect to mongodb
     * 
     * @param url URL to your mongodb server
     * @param db Database you wish to operate on
     * @returns Built-in Mongodb Interface of URN.ts
     */
    async db(url: string, db: string) {
        const client = await connectDatabase(url)
        const dbi = new Dbi(db, client)
        return dbi
    }
    /**
     * 
     * Connect to redis
     * 
     * @param url URL to your redis server
     * @returns Built-in Redis Interface of URN.ts
     */
    async cdb(url: string) {
        const client = await connectCache(url)
        const cdbi = new CDbi(client as RedisClientType<any>)
        return cdbi
    }
    /**
     * 
     * Creating an URN server - Create Instance
     * 
     * [createInstance] => loadInstance => igniteInstance
     * 
     * You may chain your desired plugins
     * 
     * Example:
     * ```
     * const urn = new URN()
     * const instance = urn.createInstance().use(ip()) // pass instance or extract types
     * 
     * // Example of extracting types from the instance
     * type MRequestOPT = RequestOPT & typeof instance['decorator']
     * 
     * ```
     * 
     * @param InstanceConfigure Elysia Configuration, ref to https://elysiajs.com/patterns/configuration.html
     * @returns A prototype, loaded Elysia Instance
     */
    createInstance(InstanceConfigure?: ElysiaConfig<string, any>) {
        const instance = new Elysia(InstanceConfigure)
            .use(Logestic.preset('fancy'))
        this.instance = instance
        return instance
    }
    /**
     * 
     * Creating an URN server - Load Modules into the instance
     * 
     * createInstance => [loadInstance] => igniteInstance
     * 
     * @param modules An array of modules
     * @param conflictCheck You wanna check for conflicted routes?
     * @param instance the Instance you wish to operate on, could be undefined if you wanna use the pervious created instance stored inside this Instance of URN
     */
    async loadInstance(modules: Module[], conflictCheck: boolean = true, instance: AnyElysia | undefined = this.instance) {
        if (!instance) throw new Error("Please call createInstance first");
        for (const module of modules) {
            let conflict: string[] | undefined

            module.routes.forEach((route: RuntimeRoute) => {
                this.routeDescs.find(desc => desc.includes(`${route.path}|${route.method}`))?.split('|')
                if (!instance) throw new Error("Please call createInstance first");
                if (conflictCheck) {
                    if (conflict) {
                        console.warn(`> URN/@loadInstance\n  Module Conflict detected at\n  ${module.name} <=> ${conflict[0]}\n  ${route.path}\n  You may want to handle this manually\n  This route has been dropped from this session`);
                    } else {
                        load_route(instance, route, this.routeDescs, ((...args: any[]) => Promise<any>), module.name, this.newOpts.enableVerbose);
                    }
                }
                else {
                    load_route(instance, route, this.routeDescs, ((...args: any[]) => Promise<any>), module.name, this.newOpts.enableVerbose);
                }
            })
        }
    }
    /**
     * 
     * Creating an URN server - Ignite and spin-up the instance
     * 
     * createInstance => loadInstance => [igniteInstance]
     * 
     * @param conf Ignite Configuration
     * @param callback ListenCallback
     * @param instance the Instance you wish to operate on, could be undefined if you wanna use the pervious created instance stored inside this Instance of URN
     */
    igniteInstance(conf: Partial<Serve>, callback?: ListenCallback, instance: AnyElysia | undefined = this.instance) {
        if (!instance) throw new Error("Please call createInstance first");
        instance.listen(conf, callback);
    }

}

/**
 * 
 * Convert smth into ObjectId
 * 
 * @param input Any input works, as long as it can be used to create an ObjectId
 * @returns 
 */
export const toObjId = (input: any): ObjectId => {
    return new ObjectId(input)
}

export * from './utils/type'
export * from 'elysia'
export * from 'mongodb'
export * from 'redis'