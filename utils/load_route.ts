import Elysia, { t } from "elysia";
import type { Result, RuntimeRoute } from "../type";
import { logger } from "toolbx";

export const load_route = (routes: RuntimeRoute[], app: Elysia, gateway: ((...args: any[]) => Promise<Result>) | ((...args: any[]) => any), debug: boolean = false) => {
  try {
    routes.forEach((obj) => {
      const index = app.routes.findIndex(route => route.path === obj.path);
      obj.addon = {
        ...obj.addon,
        response: t.Object({
          status: t.String(),
          data: t.Optional(t.Any())
        }),
        detail: {
          tags: obj.tags
        }
      }
      if (index == -1) {
        const allowMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'connect', 'trace', 'all']
        if (!allowMethods.includes(obj.method)) throw new Error("Unknown methods " + obj.method);
        // @ts-ignore
        app[obj.method](obj.path, async (contents) => {
          try {
            // log this api access to the console
            const date = Math.floor(new Date().getTime() / 1000);
            if (debug) logger(`audit> Unix Timestamp:${date} => ${JSON.stringify(contents)}`, 4);
            // load route depends on its details
            if (obj.isDirect) {
              return await obj.handler(contents)
            } else {
              return await gateway(contents, (contents: any) => obj.handler(contents))
            }
          } catch (error) {
            let errMsg = String(error);
            if (error instanceof Error) {
              errMsg = error.message;
            }
            const result: Result = {
              status: 'er',
              data: {
                msg: errMsg
              }
            }
            return JSON.stringify(result)
          }
        }, obj.addon)
      } else {
        logger(`[Route Loader] > Skip loading ${obj.path}, conflict detected`, 4)
      }
    })
  } catch (error) {
    throw new Error(`[Route Loader] > ${error}`)
  }
}