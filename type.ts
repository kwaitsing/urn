import type { Cookie } from "elysia";

export interface ignObj {
    listen: string,
    port: number
}

export interface Result {
    status: string,
    data?: any
}

export interface Request {
    body: any;
    query: Record<string, string | undefined>;
    params: Record<string, string | undefined>;
    headers: Record<string, string | undefined>;
    cookie: Record<string, Cookie<any>>;
    set: any;
    path: string;
    request: Request;
    store: {};
    setCookie?: any;
    response?: any;
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