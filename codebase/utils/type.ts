import type { Serve } from "bun"
import { type Elysia, type Context, type HTTPMethod, type MaybePromise, type Static, type TSchema } from "elysia"
import type { FindOptions } from "mongodb"

// Runtime Dependency

export interface Result {
    status: string
    data?: any
}

export type RequestOPT = Context & Partial<Record<string, any>>
export type routeHook = Parameters<Elysia['route']>[3]
export interface RuntimeRoute {
    method: HTTPMethod
    path: string
    isDirect: boolean
    handler: ((...args: any[]) => MaybePromise<any>) // Either a async function or a default one
    tags?: string[]
    addon?: Partial<routeHook> & Partial<Record<string, any>>
    [key: string]: any
}

export interface MongoIntFind extends FindOptions {
    doSanitize?: boolean
}


export interface ObjectAny {
    [key: string]: any
}

export type Sch2Ts<T extends TSchema> = Static<T>

export type MRequestOPT<T> = RequestOPT & T

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

export type IgniteConf = Partial<Serve>