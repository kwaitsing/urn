import { type AnyElysia, type MaybePromise } from "elysia";
import type { RequestOPT, Result, routeHook, RuntimeRoute } from "./type";

export const load_route = (
  instance: AnyElysia,
  route: RuntimeRoute,
  routeDescs: string[],
  gateway: ((...args: any[]) => Promise<any>),
  module_name: string,
  verbose: boolean = false
) => {
  const hook: routeHook = {
    ...route.addon,
    detail: {
      tags: [module_name ? module_name : 'Uncataloged']
    }
  }
  const newInstance = instance.route(route.method, route.path, async (contents: RequestOPT) => {

    try {
      // log this api access to the console
      const date = new Date()
      const timestamp = Math.floor(date.getTime() / 1000);
      if (verbose) {
        const contentsForLog = JSON.parse(JSON.stringify(contents, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        ))
        contents.logestic.debug(`${date.toLocaleString()} ${JSON.stringify(contentsForLog)}`)
      }
      // load route depends on its details~
      if (route.isDirect) {
        return await route.handler(contents)
      } else {
        return await gateway(contents, route, async (...args: any[]) => await route.handler(contents))
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
  }, hook)
  // Push back check string
  routeDescs.push(`${module_name}|${route.path}|${route.method}`)
  return newInstance
}