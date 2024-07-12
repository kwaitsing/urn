import Elysia, { t } from "elysia";
import type { Result, RuntimeRoute, Request } from "../type";
import { logger } from "toolbx";

export const load_route = (routes: RuntimeRoute[], app: Elysia, gateway: ((...args: any[]) => Promise<Result>) |  ((...args: any[]) => any) , debug: boolean = false) => {
  try {
    routes.forEach((obj) => {
      const index = app.routes.findIndex(route => route.path === obj.path);
      obj.addon = {
        ...obj.addon,
        response: t.Object({
          status: t.String(),
          data: t.Optional(t.Object(t.Any()))
        }),
        detail: {
          tags: obj.tags
        }
      }
      if (index == -1) {
        switch (obj.method) {
          case 'get':
            app.get(obj.path, async (contents) => {
              try {
                // log this api access to the console
                const date = Math.floor(new Date().getTime() / 1000);
                if (debug) logger(`audit> Unix Timestamp:${date} => ${JSON.stringify(contents)}`, 4);
                // load route depends on its details
                if (obj.isDirect) {
                  return await obj.handler(contents)
                } else {
                  throw new Error("Method GET is restricted to direct route only");
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
            break;
          case 'post':
            app.post(obj.path, async (contents) => {
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
            break;
          default:
            throw new Error(`Unknown METHOD => ${obj.method}`);
        }
      } else {
        logger(`[Route Loader] > Skip loading ${obj.path}, conflict detected`, 4)
      }
    })
  } catch (error) {
    throw new Error(`[Route Loader] > ${error}`)
  }
}