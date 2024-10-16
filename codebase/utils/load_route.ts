import type { AnyElysia } from "elysia";
import type { RequestOPT, Result, routeHook, RuntimeRoute } from "./type";

export const load_route = (
  instance: AnyElysia,
  route: RuntimeRoute,
  routeDescs: string[],
  gateway: ((...args: any[]) => Promise<any>),
  module_name: string,
  verbose: boolean = false,
  prefix?: string
) => {
  if (prefix && prefix.endsWith('/')) {
    prefix = prefix.slice(0, -1); 
  }
  const hook: Partial<routeHook> & Partial<Record<string, any>> = {
    ...route.addon,
    detail: {
      tags: [module_name ? module_name : 'Uncataloged']
    }
  }
  const newInstance = instance.route(route.method, prefix ? prefix + route.path : route.path, async (contents: RequestOPT) => {

    try {
      // log this api access to the console
      const date = new Date()
      if (verbose) {
        const contentsForLog = JSON.parse(JSON.stringify(contents, (_key, value) =>
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
  }, hook as routeHook)
  // Push back check string
  routeDescs.push(`${module_name}|${route.path}|${route.method}`)
  return newInstance
}