import swagger from "@elysiajs/swagger";
import Elysia from "elysia";
import type { ignObj, RuntimeRoute } from "./type";
import { load_app } from "./utils/load_app";
import { connectCache, connectDatabase } from "databridge-pack";
import { Dbi, CDbi } from "./utils/interface";
import { load_route } from "./utils/load_route";
import { ip } from "elysia-ip";

export class URN {
    debug: boolean
    constructor(debug: boolean = false) {
        this.debug = debug
    }
    loadRoute(route: RuntimeRoute[], app: Elysia, gateway: ((...args: any[]) => Promise<any>) | ((...args: any[]) => any)) {
        load_route(route, app, gateway, this.debug)
    }
    args() {
        return require('minimist')(Bun.argv)
    }
    env() {
        return process.env
    }
    async db(url: string, db: string) {
        const client = await connectDatabase(url)
        const dbi = new Dbi(db, client)
        return dbi
    }
    async cdb(url: string) {
        const client = await connectCache(url)
        const cdbi = new CDbi(client)
        return cdbi
    }
    async ignite(conf: ignObj, loader?: (server: Elysia) => any): Promise<Elysia> {
        // Create Elysia Core Instance
        let server = new Elysia

        server.use(swagger())
        server.use(ip())

        if (loader) await loader(server)

        await load_app(server, this.debug)

        server.listen({
            hostname: conf.listen,
            port: conf.port
        })
        return server
    }

}
export * from './type'
export * from 'elysia'
export * from 'mongodb'
export * from 'redis'
export * from 'toolbx'
