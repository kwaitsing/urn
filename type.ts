import type { Context } from "elysia"
import type { FindOptions } from "mongodb"

export interface ignObj {
    listen?: string,
    port: number
}

export interface Result {
    status: string,
    data?: any
}

export interface RequestOPT extends Context {
    ip: {
        address: string
        family: string
        port: number
    }
};

export interface RuntimeRoute {
    method: string
    path: string
    isDirect: boolean
    handler: ((...args: any[]) => Promise<any>) | ((...args: any[]) => any) // Either a async function or a default one
    tags?: string[]
    addon?: object
    [key: string]: any
}

export interface ObjectAny {
    [key: string]: any
}

export interface MongoIntFind extends FindOptions {
    doSanitize: boolean
}