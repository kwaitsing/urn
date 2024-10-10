import { Elysia, type Context, type HTTPMethod, type MaybePromise } from "elysia"
import type { FindOptions } from "mongodb"

// Runtime Dependency

export interface Result {
    status: string
    data?: any
}

export type RequestOPT = Context & Partial<Record<string, any>>
export type routeHook = Partial<Parameters<Elysia['route']>[3]> & Partial<Record<string, any>>
export interface RuntimeRoute {
    method: HTTPMethod
    path: string
    isDirect: boolean
    handler: ((...args: any[]) => MaybePromise<any>) // Either a async function or a default one
    tags?: string[]
    addon?: routeHook
    [key: string]: any
}
export interface ObjectAny {
    [key: string]: any
}

export interface MongoIntFind extends FindOptions {
    doSanitize?: boolean
}

// URN Dependency

export interface InitOptType {
    enableVerbose?: boolean,
    extensions?: {
        swagger?: boolean
    }
}

export interface Module {
    name: string
    prefix?: string
    routes: RuntimeRoute[]
}