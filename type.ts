import type { Context } from "elysia"

export interface ignObj {
    listen: string,
    port: number
}

export interface Result {
    status: string,
    data?: any
}

export interface Request extends Context {
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
    handler: ((...args: any[]) => Promise<Result>) | ((...args: any[]) => any) // Either a async function or a default one
    tags?: string[]
    addon?: object
}