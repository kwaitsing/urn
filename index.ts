import swagger from "@elysiajs/swagger";
import Elysia from "elysia";
import type { ignObj, Result, RuntimeRoute } from "./type";
import { load_app } from "./utils/load_app";
import { connectCache, connectDatabase } from "databridge-pack";
import { Dbi, CDbi } from "./utils/interface";
import { load_route } from "./utils/load_route";

class URN {
    async loadRoute(route: RuntimeRoute[], app: Elysia, gateway: ((...args: any[]) => Promise<Result>) |  ((...args: any[]) => any)) {
        load_route(route, app, gateway)
    }
    async db(url: string, db: string) {
        const client = await connectDatabase(url)
        const dbi = new Dbi(db, client)
        return dbi
    }
    async cdb(url:string) {
        const client = await connectCache(url)
        const cdbi = new CDbi(client)
        return cdbi
    }
    async ignite(conf: ignObj): Promise<Elysia> {
        // Create Elysia Core Instance
        let server = new Elysia

        server.use(swagger())

        await load_app(server, conf.debug)

        server.onError(({ code }) => {
            if (code === 'VALIDATION') {
                return {
                    status: 'er',
                    data: {
                        msg: 'Invaild request'
                    }
                }
            }
        })

        server.listen({
            hostname: conf.listen,
            port: conf.port
        })
        return server
    }

}

export const urn = new URN