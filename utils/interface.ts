// This file is responsible for interact with the MongoDB and redis, you may call it a wrapper or an interface
import { Collection, type CollectionInfo, type DeleteResult, type InsertOneResult, MongoClient, ObjectId, type UpdateResult, type WithId } from 'mongodb'
import type { ObjectAny } from '../type'

export class Dbi {
    db: string
    client: MongoClient

    constructor(db: string, client: MongoClient) {
        this.db = db
        this.client = client
    }
    async add(collection: string, object: object): Promise<InsertOneResult> {
        return await this.client.db(this.db).collection(collection).insertOne(object)
    }
    async upd(collection: string, objectID: ObjectId, updateObject: object): Promise<UpdateResult> {
        return await this.client.db(this.db).collection(collection).updateOne({
            _id: objectID
        }, {
            $set: updateObject
        })
    }
    async del(collection: string, objectID: ObjectId): Promise<DeleteResult> {
        return await this.client.db(this.db).collection(collection).deleteOne({ _id: objectID })
    }
    async get(collection: string, queryObject: ObjectAny , quantity: number = 1, sort: boolean = false, skip: number = 0): Promise<WithId<object>[] | null[]> {
        let document: WithId<object>[] | null = [];
        let cursor = this.client.db(this.db).collection(collection).find(queryObject, {
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