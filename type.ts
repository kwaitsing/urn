export interface ignObj {
    listen: string,
    port: number,
    debug: boolean
}

export interface Result {
    status: string,
    data?: any
}

export interface Request {
    body: any
    query: Record<string, string | undefined>
    params: Record<string, string | undefined>
    headers: Record<string, string | undefined>
    response: Result
    path: string
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
    handler: ((...args: any[]) => Promise<Result>) |  ((...args: any[]) => any) // Either a async function or a default one
    tags?: string[]
    addon?: object
}