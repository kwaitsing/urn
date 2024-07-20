// This file is responsible for interact with the MongoDB and redis, you may call it a wrapper or an interface
import { Collection, type CollectionInfo, type DeleteResult, type InsertOneResult, MongoClient, ObjectId, type UpdateResult, type WithId } from 'mongodb'
import type { ObjectAny } from '../type'

const sanitize = (object: ObjectAny) => {
    if (object instanceof Object) {
        for (const key in object) {
            if (/^\$/.test(key)) {
                delete object[key];
            } else {
                sanitize(object[key]); // for nested
            }
        }
    }
    return object
}

export class Dbi {
    db: string
    client: MongoClient

    constructor(db: string, client: MongoClient) {
        this.db = db
        this.client = client
    }
    async add(collection: string, object: object): Promise<InsertOneResult> {
        const safeObj = sanitize(object)
        return await this.client.db(this.db).collection(collection).insertOne(safeObj)
    }
    async upd(collection: string, objectID: ObjectId, updateObject: object): Promise<UpdateResult> {
        if (!ObjectId.isValid(objectID)) {
            throw new Error('Invalid ObjectId');
        }
        const safeObj = sanitize(updateObject)
        return await this.client.db(this.db).collection(collection).updateOne({
            _id: objectID
        }, {
            $set: safeObj
        })
    }
    async del(collection: string, objectID: ObjectId): Promise<DeleteResult> {
        if (!ObjectId.isValid(objectID)) {
            throw new Error('Invalid ObjectId');
        }
        return await this.client.db(this.db).collection(collection).deleteOne({ _id: objectID })
    }
    async get(collection: string, queryObject: ObjectAny, quantity: number = 1, sort: boolean = false, skip: number = 0, doSanitize: boolean = true): Promise<WithId<object>[] | null[]> {

        const safeObj = doSanitize ? sanitize(queryObject) : queryObject

        let document: WithId<object>[] | null = [];
        let cursor = this.client.db(this.db).collection(collection).find(safeObj, {
            limit: (quantity === -1) ? undefined : quantity,
            sort: sort ? { _id: -1 } : undefined,
            skip: skip
        })
        for await (let docu of cursor) {
            document.push(docu)
        }
        return document
    }
    async createCollection(collection: string): Promise<Collection<Document>> {
        return await this.client.db(this.db).createCollection(collection)
    }
    async getCollection(): Promise<(CollectionInfo | Pick<CollectionInfo, "name" | "type">)[]> {
        return await this.client.db(this.db).listCollections().toArray()
    }
}

export class CDbi {
    cdb: any

    constructor(cdb: any) {
        this.cdb = cdb
    }
    async write(set: string, key: string, value: string | number) {
        return await this.cdb.hSet(set, key, value)
    }
    async get(set: string, key: string) {
        return await this.cdb.hGet(set, key)
    }
    async delete(set: string, key: string) {
        return await this.cdb.hDel(set, key)
    }
}